import { Injectable, signal, computed, inject, OnDestroy, NgZone } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export type TimerPhase = 'idle' | 'focus' | 'break' | 'focus_done';

@Injectable({ providedIn: 'root' })
export class PomodoroStateService implements OnDestroy {
  private http = inject(HttpClient);
  private zone = inject(NgZone);

  phase = signal<TimerPhase>('idle');
  remainingSeconds = signal(25 * 60);
  totalSeconds = signal(25 * 60);
  focusMinutes = signal(25);
  breakMinutes = signal(5);
  showFloating = signal<boolean>(localStorage.getItem('new_floating_timer') !== 'false');
  floatingOpacity = signal(85);
  floatingMinimized = signal(false);
  selectedTaskName = signal('');
  selectedTaskId = signal('');
  timerInterval: any = null;
  private _timerEndTime: number | null = null;
  sessionsToday = signal(0);

  isPaused = signal(false);
  private _isRunning = signal(false);
  readonly isRunning = computed(() => this._isRunning());

  private electronTimerCleanup: (() => void) | null = null;
  private _electronSyncInterval: any = null;
  private _visibilityCleanup: (() => void) | null = null;
  private _onVisibilityChange: () => void = () => {};

  /** Direct callback — set by the component before starting a timer */
  onTimerDone: ((completedPhase: TimerPhase) => void) | null = null;

  readonly displayMinutes = computed(() => Math.floor(this.remainingSeconds() / 60));
  readonly displaySeconds = computed(() => this.remainingSeconds() % 60);
  readonly progressPercent = computed(() =>
    this.totalSeconds() > 0 ? ((this.totalSeconds() - this.remainingSeconds()) / this.totalSeconds()) * 100 : 0
  );
  readonly circumference = 2 * Math.PI * 88;
  readonly dashOffset = computed(() => this.circumference * (1 - this.progressPercent() / 100));
  readonly phaseLabel = computed(() => {
    if (this.isPaused()) return this.phase() === 'focus' ? 'Focus Paused' : 'Break Paused';
    if (this.phase() === 'focus') return 'Focus Time';
    if (this.phase() === 'break') return 'Break Time';
    if (this.phase() === 'focus_done') return 'Focus Complete!';
    return 'Ready';
  });

  constructor() {
    this.setupElectronTimerListener();
    this.loadTodaySessions();
    // When page becomes visible again (e.g. restored from minimize/tray), resync timer
    this._visibilityCleanup = () => {
      document.removeEventListener('visibilitychange', this._onVisibilityChange);
    };
    this._onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        this.onWindowVisible();
      }
    };
    document.addEventListener('visibilitychange', this._onVisibilityChange);
  }

  ngOnDestroy() {
    this.clearInterval();
    this.stopElectronSync();
    if (this.electronTimerCleanup) this.electronTimerCleanup();
    if (this._visibilityCleanup) this._visibilityCleanup();
  }

  loadTodaySessions() {
    const d = new Date();
    const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    this.http.get<any>(`/api/study/sessions/daily?date=${today}`).subscribe({
      next: (res: any) => {
        this.sessionsToday.set(res.data?.count || 0);
      },
      error: () => {}
    });
  }

  startFocus(taskName?: string, taskId?: string) {
    this.phase.set('focus');
    this.isPaused.set(false);
    this.totalSeconds.set(this.focusMinutes() * 60);
    this.remainingSeconds.set(this.totalSeconds());
    if (taskName) this.selectedTaskName.set(taskName);
    if (taskId) this.selectedTaskId.set(taskId);
    if (this.showFloating()) {
      this.floatingMinimized.set(false);
    }
    this._isRunning.set(true);
    this._timerEndTime = Date.now() + this.totalSeconds() * 1000;
    this.startCountdown();
    this.openElectronTimerWindow();
    this.startElectronSync();
  }

  startBreak() {
    this.phase.set('break');
    this.isPaused.set(false);
    this.totalSeconds.set(this.breakMinutes() * 60);
    this.remainingSeconds.set(this.totalSeconds());
    if (this.showFloating()) {
      this.floatingMinimized.set(false);
    }
    this._isRunning.set(true);
    this._timerEndTime = Date.now() + this.totalSeconds() * 1000;
    this.startCountdown();
    this.openElectronTimerWindow();
    this.startElectronSync();
  }

  /** Called when user clicks "Close" after focus completes — session already counted */
  closeAfterFocus() {
    this.clearInterval();
    this.stopElectronSync();
    this._isRunning.set(false);
    this.isPaused.set(false);
    this._timerEndTime = null;
    this.phase.set('idle');
    this.remainingSeconds.set(this.focusMinutes() * 60);
    this.totalSeconds.set(this.focusMinutes() * 60);
    this.closeElectronTimerWindow();
  }

  pause() {
    this.clearInterval();
    this._isRunning.set(false);
    this.isPaused.set(true);
  }

  /** Called when window regains visibility — recalculate timer from absolute time */
  onWindowVisible() {
    this.loadTodaySessions();
    if (this.isPaused()) return;
    if (this._isRunning() && this._timerEndTime) {
      const rem = Math.max(0, Math.ceil((this._timerEndTime - Date.now()) / 1000));
      this.remainingSeconds.set(rem);
      if (rem <= 0) {
        this.resyncTimer();
      } else if (!this.timerInterval) {
        this.startCountdown();
      }
    }
  }

  resume() {
    if (!this.isPaused()) return;
    this.isPaused.set(false);
    this._isRunning.set(true);
    // Recalculate end-time based on current remaining (pause may have lasted a while)
    this._timerEndTime = Date.now() + this.remainingSeconds() * 1000;
    this.startCountdown();
  }

  end() {
    this.clearInterval();
    this.stopElectronSync();
    this._isRunning.set(false);
    this.isPaused.set(false);
    this._timerEndTime = null;
    this.phase.set('idle');
    this.remainingSeconds.set(this.focusMinutes() * 60);
    this.totalSeconds.set(this.focusMinutes() * 60);
    this.closeElectronTimerWindow();
  }

  setFocusMinutes(m: number) {
    this.focusMinutes.set(m);
    if (this.phase() === 'idle' || this.phase() === 'focus_done') {
      this.remainingSeconds.set(m * 60);
      this.totalSeconds.set(m * 60);
    }
  }

  setBreakMinutes(m: number) { this.breakMinutes.set(m); }

  /** Handle the completed timer — called directly from startCountdown via callback */
  onTimerComplete(completedPhase: TimerPhase, notifyFn: (title: string, body: string) => void, toastFn: (msg: string, type: string) => void) {
    this.stopElectronSync();

    const wasFocus = completedPhase === 'focus';
    const durationMinutes = wasFocus ? this.focusMinutes() : this.breakMinutes();

    // Wrap HTTP call in NgZone for Electron compatibility
    this.zone.run(() => {
      this.http.post('/api/study/sessions', {
        taskId: this.selectedTaskId() || undefined,
        taskName: this.selectedTaskName() || '',
        type: wasFocus ? 'focus' : 'break',
        durationMinutes,
      }).subscribe({
        next: () => {
          if (wasFocus) {
            this.sessionsToday.update(n => n + 1);
          }
        },
        error: (e) => {
          console.error('[Pomodoro] Session save error:', e?.error?.message || e?.message || e);
        }
      });
    });

    // Phase transition FIRST — guarantee the UI never gets stuck
    if (wasFocus) {
      this.phase.set('focus_done');
      this.remainingSeconds.set(this.breakMinutes() * 60);
      this.totalSeconds.set(this.breakMinutes() * 60);
    } else {
      this.phase.set('idle');
      this.remainingSeconds.set(this.focusMinutes() * 60);
      this.totalSeconds.set(this.focusMinutes() * 60);
    }

    this.isPaused.set(false);
    this.closeElectronTimerWindow();

    // Notifications AFTER phase is set — errors here won't block the transition
    try {
      if (wasFocus) {
        notifyFn('Focus Complete!', `Great work! Time for a ${this.breakMinutes()} min break.`);
        toastFn(`Focus session done! Take a ${this.breakMinutes()} min break.`, 'success');
      } else {
        notifyFn('Break Over!', 'Ready for another focus session?');
        toastFn('Break is over. Ready to focus again!', 'info');
      }
    } catch (e) {
      console.error('[Pomodoro] Notification/toast error (non-blocking):', e);
    }
  }

  private startCountdown() {
    this.clearInterval();
    this.timerInterval = setInterval(() => {
      // Use absolute end-time so throttled intervals still show correct time
      if (this._timerEndTime) {
        const rem = Math.max(0, Math.ceil((this._timerEndTime - Date.now()) / 1000));
        this.remainingSeconds.set(rem);
      } else {
        this.remainingSeconds.set(this.remainingSeconds() - 1);
      }
      if (this.remainingSeconds() <= 0) {
        this.clearInterval();
        this._timerEndTime = null;
        const completedPhase = this.phase();
        this._isRunning.set(false);
        // Direct callback — no effect() needed
        if (this.onTimerDone) {
          const cb = this.onTimerDone;
          this.onTimerDone = null; // Clear immediately to prevent double-invocation
          this.zone.run(() => {
            try {
              cb(completedPhase);
            } catch (e) {
              console.error('[Pomodoro] onTimerDone callback error:', e);
              this.phase.set('idle');
              this.remainingSeconds.set(this.focusMinutes() * 60);
              this.totalSeconds.set(this.focusMinutes() * 60);
              this.closeElectronTimerWindow();
            }
          });
        } else {
          this.phase.set('idle');
          this.remainingSeconds.set(this.focusMinutes() * 60);
          this.totalSeconds.set(this.focusMinutes() * 60);
        }
      }
    }, 1000);
  }

  private clearInterval() {
    if (this.timerInterval) { clearInterval(this.timerInterval); this.timerInterval = null; }
  }

  /** Recalculate remaining from absolute end-time (e.g. after app regains focus) */
  private resyncTimer() {
    if (this._timerEndTime && this._isRunning() && !this.isPaused()) {
      const rem = Math.max(0, Math.ceil((this._timerEndTime - Date.now()) / 1000));
      this.remainingSeconds.set(rem);
      if (rem <= 0) {
        this.clearInterval();
        this._timerEndTime = null;
        const completedPhase = this.phase();
        this._isRunning.set(false);
        if (this.onTimerDone) {
          const cb = this.onTimerDone;
          this.onTimerDone = null;
          this.zone.run(() => { try { cb(completedPhase); } catch (e) { console.error('[Pomodoro] onTimerDone resync error:', e); } });
        }
      }
    }
  }

  // Electron always-on-top timer window helpers
  isElectron(): boolean {
    return !!(window as any).electronAPI;
  }

  private openElectronTimerWindow() {
    if (!this.isElectron() || !this.showFloating()) return;
    (window as any).electronAPI?.showTimerWindow();
  }

  private closeElectronTimerWindow() {
    if (!this.isElectron()) return;
    (window as any).electronAPI?.closeTimerWindow();
  }

  /** IPC sync — sends state + endTime so floating timer can count down independently */
  private startElectronSync() {
    this.stopElectronSync();
    if (!this.isElectron()) return;
    // Send initial state immediately (with endTime so timer window can self-count)
    this._sendTimerState();
    // Also send periodic updates for phase/pause changes (not for countdown — timer window handles that)
    this._electronSyncInterval = setInterval(() => {
      const p = this.phase();
      if (p !== 'idle' && p !== 'focus_done') {
        this._sendTimerState();
      }
    }, 1000);
  }

  private _sendTimerState() {
    const w = window as any;
    if (w.electronAPI?.updateTimerState) {
      w.electronAPI.updateTimerState({
        phase: this.phase(),
        remainingSeconds: this.remainingSeconds(),
        isPaused: this.isPaused(),
        taskName: this.selectedTaskName(),
        endTime: this._timerEndTime,
      });
    }
  }

  private stopElectronSync() {
    if (this._electronSyncInterval) {
      clearInterval(this._electronSyncInterval);
      this._electronSyncInterval = null;
    }
  }

  private setupElectronTimerListener() {
    if (!this.isElectron()) return;
    const w = window as any;
    if (w.electronAPI?.onTimerAction) {
      w.electronAPI.onTimerAction((action: string) => {
        if (action === 'pause-resume') {
          if (this.isPaused()) this.resume();
          else this.pause();
        } else if (action === 'end') {
          this.end();
        }
      });
      this.electronTimerCleanup = () => {};
    }
  }

  // Browser / Electron notification helper
  sendNotification(title: string, body: string) {
    const w = window as any;
    if (w.electronAPI?.sendNotification) {
      w.electronAPI.sendNotification(title, body);
      return;
    }
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body });
    } else if ('Notification' in window && Notification.permission !== 'denied') {
      Notification.requestPermission().then(p => {
        if (p === 'granted') new Notification(title, { body });
      });
    }
  }
}
