import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { StudyService } from '../../services/study.service';
import { ToastService } from '../../core/services/toast.service';
import { PomodoroStateService } from '../../core/services/pomodoro-state.service';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog';
import { LoadingComponent } from '../../shared/components/loading/loading';
import { StudyTask } from '../../models/new.model';

@Component({
  selector: 'app-study',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, DecimalPipe, RouterLink, RouterLinkActive, ConfirmDialogComponent, LoadingComponent],
  templateUrl: './study.html',
  styleUrl: './study.scss'
})
export class Study implements OnInit, OnDestroy {
  private studyService = inject(StudyService);
  private toast = inject(ToastService);
  pomodoro = inject(PomodoroStateService);

  loading = true;
  tasks: StudyTask[] = [];
  selectedTask: StudyTask | null = null;

  showTaskForm = false;
  editingTask: StudyTask | null = null;
  taskForm = new FormGroup({ name: new FormControl(''), subject: new FormControl('') });
  showDeleteConfirm = false;
  deleteMessage = '';

  showSettings = false;
  settingsForm = new FormGroup({
    focusMinutes: new FormControl(25),
    breakMinutes: new FormControl(5)
  });

  ngOnInit() {
    this.loadTasks();
    this.settingsForm.patchValue({
      focusMinutes: this.pomodoro.focusMinutes(),
      breakMinutes: this.pomodoro.breakMinutes()
    });
  }

  ngOnDestroy() {
    // Clear callback to prevent memory leaks
    this.pomodoro.onTimerDone = null;
  }

  loadTasks() {
    this.loading = true;
    this.studyService.getTasks().subscribe({
      next: (t) => { this.tasks = t; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

selectTask(t: StudyTask) {
  const isDeselecting = this.selectedTask?._id === t._id;
  this.selectedTask = isDeselecting ? null : t;
  if (isDeselecting) {
    this.pomodoro.selectedTaskName.set('');
    this.pomodoro.selectedTaskId.set('');
  }
}
  openCreate() { this.editingTask = null; this.taskForm.reset({ name: '', subject: '' }); this.showTaskForm = true; }
  openEdit(t: StudyTask) { this.editingTask = t; this.taskForm.patchValue({ name: t.name, subject: t.subject || '' }); this.showTaskForm = true; }
  cancelForm() { this.showTaskForm = false; this.editingTask = null; }

  submitTask() {
    const val = this.taskForm.value;
    const name = (val.name || '').trim();
    if (!name) { this.toast.show('Task name is required', 'error'); return; }

    const payload: any = { name };
    const rawSubject = val.subject;
    payload.subject = (rawSubject !== null && rawSubject !== undefined) ? String(rawSubject) : '';

    if (this.editingTask) {
      this.studyService.updateTask(this.editingTask._id, payload).subscribe({
        next: (updated) => {
          const idx = this.tasks.findIndex(t => t._id === this.editingTask!._id);
          if (idx >= 0) this.tasks[idx] = updated;
          this.cancelForm();
          this.toast.show('Task updated', 'success');
        },
        error: (e) => { this.toast.show(e.error?.message || e.message || 'Failed to update task', 'error'); }
      });
    } else {
      this.studyService.createTask(payload).subscribe({
        next: (created) => { this.tasks.unshift(created); this.cancelForm(); this.toast.show('Task added', 'success'); },
        error: (e) => { this.toast.show(e.error?.message || e.message || 'Failed to add task', 'error'); }
      });
    }
  }

  toggleComplete(t: StudyTask) {
    const idx = this.tasks.findIndex(x => x._id === t._id);
    if (idx >= 0) this.tasks[idx] = { ...t, completed: !t.completed };
    this.studyService.updateTask(t._id, { completed: !t.completed }).subscribe({
      next: (updated) => { const i = this.tasks.findIndex(x => x._id === t._id); if (i >= 0) this.tasks[i] = updated; },
      error: () => this.loadTasks()
    });
  }

  confirmDelete(t: StudyTask) { this.selectedTask = t; this.deleteMessage = `Delete "${t.name}"?`; this.showDeleteConfirm = true; }
  cancelDelete() { this.showDeleteConfirm = false; }
  doDelete() {
    if (!this.selectedTask) return;
    this.studyService.deleteTask(this.selectedTask._id).subscribe({
      next: () => { this.cancelDelete(); this.tasks = this.tasks.filter(t => t._id !== this.selectedTask!._id); this.selectedTask = null; this.toast.show('Task deleted', 'success'); },
      error: (e) => { this.cancelDelete(); this.toast.show(e.error?.message || e.message || 'Failed to delete task', 'error'); }
    });
  }

  /** Register the callback BEFORE starting, then start the timer */
  startFocus() {
    this.pomodoro.onTimerDone = (completedPhase) => {
      this.pomodoro.onTimerComplete(
        completedPhase,
        (title, body) => this.pomodoro.sendNotification(title, body),
        (msg, type) => this.toast.show(msg, type as 'success' | 'error' | 'info')
      );
      this.loadTasks();
    };
    this.pomodoro.startFocus(this.selectedTask?.name, this.selectedTask?._id);
  }

  startBreak() {
    this.pomodoro.onTimerDone = (completedPhase) => {
      this.pomodoro.onTimerComplete(
        completedPhase,
        (title, body) => this.pomodoro.sendNotification(title, body),
        (msg, type) => this.toast.show(msg, type as 'success' | 'error' | 'info')
      );
      this.loadTasks();
    };
    this.pomodoro.startBreak();
  }

  pauseTimer() { this.pomodoro.pause(); }
  resumeTimer() { this.pomodoro.resume(); }
  endTimer() { this.pomodoro.onTimerDone = null; this.pomodoro.end(); }

  openTimerSettings() {
    this.settingsForm.patchValue({
      focusMinutes: this.pomodoro.focusMinutes(),
      breakMinutes: this.pomodoro.breakMinutes()
    });
    this.showSettings = true;
  }

  saveTimerSettings() {
    const val = this.settingsForm.value;
    const f = Math.max(1, Math.min(120, Number(val.focusMinutes) || 25));
    const b = Math.max(1, Math.min(60, Number(val.breakMinutes) || 5));
    this.pomodoro.setFocusMinutes(f);
    this.pomodoro.setBreakMinutes(b);
    this.showSettings = false;
    this.toast.show(`Timer updated: ${f}min focus / ${b}min break`, 'success');
  }
}
