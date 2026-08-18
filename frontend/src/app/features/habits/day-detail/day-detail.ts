import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HabitService } from '../../../services/habit.service';
import { LoadingComponent } from '../../../shared/components/loading/loading';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state';
import { HabitWithStatus } from '../../../models/new.model';

@Component({
  selector: 'app-day-detail',
  standalone: true,
  imports: [RouterLink, LoadingComponent, EmptyStateComponent],
  templateUrl: './day-detail.html',
  styleUrl: './day-detail.scss'
})
export class DayDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private habitService = inject(HabitService);

  loading = true;
  error = '';
  habits: HabitWithStatus[] = [];
  date = '';
  earned = false;
  completedCount = 0;

  ngOnInit() {
    const dateParam = this.route.snapshot.paramMap.get('date');
    if (!dateParam) {
      this.error = 'Invalid date parameter';
      this.loading = false;
      return;
    }
    this.date = dateParam;
    this.load();
  }

  load() {
    this.loading = true;
    this.habitService.getDayDetail(this.date).subscribe({
      next: (d) => {
        this.habits = d.habits;
        this.earned = d.earned;
        this.completedCount = d.habits.filter(h => h.completed).length;
        this.loading = false;
      },
      error: (e) => { this.error = e.message; this.loading = false; }
    });
  }

  formatDate() {
    return new Date(this.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  }
}