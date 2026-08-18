import { Component, inject, OnInit, OnDestroy, effect } from '@angular/core';
import { RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { DashboardService } from '../../services/dashboard.service';
import { HabitService } from '../../services/habit.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss'
})
export class SidebarComponent implements OnInit, OnDestroy {
  private dashboardService = inject(DashboardService);
  private habitService = inject(HabitService);
  private router = inject(Router);

  totalHabits = 0;
  completedHabits = 0;
  progressPct = 0;

  navItems = [
    { label: 'Home', route: '/', icon: 'home' },
    { label: 'Habits', route: '/habits', icon: 'habits' },
    { label: 'Dua & Azkar', route: '/dua-azkar', icon: 'azkar' },
    { label: 'OOG', route: '/oog', icon: 'oog' },
    { label: 'Big Goals', route: '/big-goals', icon: 'biggoals' },
    { label: '10 Days Goals', route: '/goals', icon: 'goals' },
    { label: 'Study', route: '/study', icon: 'study' },
    { label: 'Life Rules', route: '/life-rules', icon: 'rules' },
    { label: 'Links', route: '/links', icon: 'links' },
    { label: 'Settings', route: '/settings', icon: 'settings' },
  ];

  private routerSub: any;

  constructor() {
    // React to habit toggles anywhere in the app
    effect(() => {
      this.habitService.progressVersion();
      this.loadProgress();
    });
  }

  ngOnInit() {
    this.loadProgress();
    // Also refresh on navigation
    this.routerSub = this.router.events.subscribe((e) => {
      if (e instanceof NavigationEnd) {
        this.loadProgress();
      }
    });
  }

  ngOnDestroy() {
    if (this.routerSub) this.routerSub.unsubscribe();
  }

  loadProgress() {
    this.dashboardService.getSummary().subscribe({
      next: (d) => {
        const habits = d.todayHabits || [];
        this.totalHabits = habits.length;
        this.completedHabits = habits.filter((h: any) => h.completed).length;
        this.progressPct = this.totalHabits > 0 ? Math.round((this.completedHabits / this.totalHabits) * 100) : 0;
      },
      error: () => {}
    });
  }
}
