import { Component, OnInit, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { LoadingComponent } from '../../shared/components/loading/loading';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog';
import { ToastService } from '../../core/services/toast.service';
import { PomodoroStateService } from '../../core/services/pomodoro-state.service';

interface DataStats {
  habits: number;
  habitLogs: number;
  goals: number;
  cycles: number;
  cycleTasks: number;
  duas: number;
  rules: number;
  bigGoals: number;
  totalStars: number;
}

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [LoadingComponent, ConfirmDialogComponent],
  templateUrl: './settings.html',
  styleUrl: './settings.scss'
})
export class Settings implements OnInit {
  private http = inject(HttpClient);
  private toast = inject(ToastService);
  private pomodoro = inject(PomodoroStateService);

  appVersion = '1.0.0';
  dbStatus: 'connected' | 'disconnected' | 'checking' = 'checking';
  floatingTimerEnabled = true;

  // Stats
  stats: DataStats | null = null;
  statsLoading = false;

  // Expandable sections
  openSection: string | null = null;

  // Reset
  resetting = false;
  showResetConfirm = false;

  // Import/Export
  exporting = false;
  importing = false;
  showImportConfirm = false;
  importFile: File | null = null;

  ngOnInit() {
    this.checkDb();
    this.loadStats();
    this.floatingTimerEnabled = this.pomodoro.showFloating();
  }

  checkDb() {
    this.http.get<any>('/api/dashboard/summary').subscribe({
      next: () => { this.dbStatus = 'connected'; },
      error: () => { this.dbStatus = 'disconnected'; }
    });
  }

  loadStats() {
    this.statsLoading = true;
    this.http.get<{ success: boolean; data: DataStats }>('/api/dashboard/stats').subscribe({
      next: (res) => { this.stats = res.data; this.statsLoading = false; },
      error: () => { this.statsLoading = false; }
    });
  }

  toggleSection(name: string) {
    if (name === 'others') {
      this.toast.show('Coming soon in a future update', 'info');
      return;
    }
    this.openSection = this.openSection === name ? null : name;
  }

  toggleFloatingTimer(e: Event) {
    const val = (e.target as HTMLInputElement).checked;
    this.floatingTimerEnabled = val;
    this.pomodoro.showFloating.set(val);
    localStorage.setItem('new_floating_timer', val ? 'true' : 'false');
    this.toast.show(val ? 'Floating timer enabled' : 'Floating timer disabled', 'success');
  }

  // Export
  exportData() {
    this.exporting = true;
    this.http.get<{ success: boolean; data: any }>('/api/dashboard/export').subscribe({
      next: (res) => {
        const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const d = new Date();
        const date = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        a.download = `NEW-backup-${date}.json`;
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        this.exporting = false;
        this.toast.show('Backup downloaded successfully', 'success');
      },
      error: () => { this.exporting = false; this.toast.show('Failed to export data', 'error'); }
    });
  }

  // Import
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.importFile = input.files[0];
    }
  }

  startImport() {
    if (!this.importFile) {
      this.toast.show('Please select a backup file first', 'info');
      return;
    }
    this.showImportConfirm = true;
  }

  cancelImport() {
    this.showImportConfirm = false;
    this.importFile = null;
  }

  doImport() {
    if (!this.importFile) return;
    this.importing = true;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string);
        this.http.post('/api/dashboard/import', data).subscribe({
          next: () => {
            this.importing = false;
            this.showImportConfirm = false;
            this.importFile = null;
            this.loadStats();
            this.toast.show('Data restored successfully', 'success');
          },
          error: () => {
            this.importing = false;
            this.showImportConfirm = false;
            this.toast.show('Failed to import data. Make sure the file is a valid NEW backup.', 'error');
          }
        });
      } catch {
        this.importing = false;
        this.showImportConfirm = false;
        this.toast.show('Invalid file format', 'error');
      }
    };
    reader.readAsText(this.importFile);
  }

  // Reset
  showResetDialog() { this.showResetConfirm = true; }
  cancelReset() { this.showResetConfirm = false; }
  doReset() {
    this.resetting = true;
    this.http.post('/api/dashboard/reset', {}).subscribe({
      next: () => {
        this.resetting = false;
        this.cancelReset();
        this.loadStats();
        this.pomodoro.sessionsToday.set(0);
        this.toast.show('All data has been reset', 'success');
      },
      error: () => { this.resetting = false; this.cancelReset(); this.toast.show('Failed to reset data', 'error'); }
    });
  }

}
