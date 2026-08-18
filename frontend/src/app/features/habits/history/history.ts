import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HabitService } from '../../../services/habit.service';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state';
import { LoadingComponent } from '../../../shared/components/loading/loading';
import { HistoryDay } from '../../../models/new.model';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [RouterLink, EmptyStateComponent, LoadingComponent],
  templateUrl: './history.html',
  styleUrl: './history.scss'
})
export class History implements OnInit {
  private habitService = inject(HabitService);
  loading = true;
  error = '';
  days: HistoryDay[] = [];

  ngOnInit() { this.load(); }

  load() {
    this.loading = true;
    this.habitService.getHistory().subscribe({
      next: (d) => { this.days = d; this.loading = false; },
      error: (e) => { this.error = e.message; this.loading = false; }
    });
  }

  formatDay(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  }

  formatPct(d: HistoryDay) {
    return d.totalHabits > 0 ? Math.round((d.completedCount / d.totalHabits) * 100) : 0;
  }
}
