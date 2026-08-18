import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { StudyService, SessionDay } from '../../../services/study.service';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state';
import { LoadingComponent } from '../../../shared/components/loading/loading';

@Component({
  selector: 'app-sessions',
  standalone: true,
  imports: [RouterLink, EmptyStateComponent, LoadingComponent],
  templateUrl: './sessions.html',
  styleUrl: './sessions.scss'
})
export class Sessions implements OnInit {
  private studyService = inject(StudyService);
  loading = true;
  error = '';
  days: SessionDay[] = [];
  totalSessions = 0;
  totalMinutes = 0;

  ngOnInit() { this.load(); }

  load() {
    this.loading = true;
    this.studyService.getSessionHistory(30).subscribe({
      next: (d) => {
        this.days = d;
        this.totalSessions = this.days.reduce((sum, day) => sum + day.sessions, 0);
        this.totalMinutes = this.days.reduce((sum, day) => sum + day.totalMinutes, 0);
        this.loading = false;
      },
      error: (e) => { this.error = e.message; this.loading = false; }
    });
  }

  formatDay(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  }

  formatHours(m: number): string {
    if (m < 60) return `${m}m`;
    const h = Math.floor(m / 60);
    const mins = m % 60;
    return mins > 0 ? `${h}h ${mins}m` : `${h}h`;
  }

  getMaxSessions(): number {
    if (this.days.length === 0) return 1;
    return Math.max(...this.days.map(d => d.sessions), 1);
  }
}
