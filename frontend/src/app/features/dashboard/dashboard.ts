import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DashboardService } from '../../services/dashboard.service';
import { HabitService } from '../../services/habit.service';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state';
import { LoadingComponent } from '../../shared/components/loading/loading';
import { DashboardSummary, Dua, Goal, HabitWithStatus, TenDayCycle } from '../../models/new.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, EmptyStateComponent, LoadingComponent],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard implements OnInit {
  private dashboardService = inject(DashboardService);
  private habitService = inject(HabitService);

  loading = true;
  error = '';
  data: DashboardSummary | null = null;
  activeOOG: Goal | null = null;
  todayHabits: HabitWithStatus[] = [];
  habitsCount = 0;
  habitsComplete = 0;
  totalStars = 0;
  activeCycle: { day: number; totalDays: number; percentage: number; focus: string } | null = null;
  recentDua: Dua | null = null;
  todayDateFormatted = '';
  stars: { date: string; earned: boolean; isToday: boolean }[] = [];
  greeting = '';
  quote = 'Every day is a chance to become better.';

  ngOnInit() {
    this.loadAll();
    const h = new Date().getHours();
    this.greeting = h < 12 ? 'Good Morning' : h < 18 ? 'Good Afternoon' : 'Good Evening';
    this.todayDateFormatted = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
  }

  loadAll() {
    this.error = '';
    this.dashboardService.getSummary().subscribe({
      next: (d) => {
        this.data = d;
        this.activeOOG = d.activeGoal;
        this.todayHabits = d.todayHabits || [];
        this.habitsCount = this.todayHabits.length;
        this.habitsComplete = this.todayHabits.filter(h => h.completed).length;
        this.totalStars = d.stars || 0;
        this.activeCycle = d.cycleProgress;
        this.recentDua = d.duaOfTheDay;
        this.stars = d.weekStrip || [];
        this.loading = false;
      },
      error: (e) => { this.error = e.message || 'Failed to load dashboard'; this.loading = false; }
    });
  }

  refreshData() {
    this.dashboardService.getSummary().subscribe({
      next: (d) => {
        this.data = d;
        this.activeOOG = d.activeGoal;
        this.todayHabits = d.todayHabits || [];
        this.habitsCount = this.todayHabits.length;
        this.habitsComplete = this.todayHabits.filter(h => h.completed).length;
        this.totalStars = d.stars || 0;
        this.activeCycle = d.cycleProgress;
        this.recentDua = d.duaOfTheDay;
        this.stars = d.weekStrip || [];
      },
      error: () => {}
    });
  }

  toggleHabit(id: string) {
    // Optimistic update
    const habit = this.todayHabits.find(h => h._id === id);
    if (habit) {
      habit.completed = !habit.completed;
      this.habitsComplete = this.todayHabits.filter(h => h.completed).length;
    }
    this.habitService.toggleComplete(id).subscribe({
      next: () => this.refreshData(),
      error: () => this.refreshData()
    });
  }

  formatDate(d: string) {
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  getDayName(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short' });
  }

  getDayNum(dateStr: string) {
    return new Date(dateStr).getDate();
  }
}
