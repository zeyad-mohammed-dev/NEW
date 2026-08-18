import { Routes } from '@angular/router';
import { BaseLayoutComponent } from './layout/base-layout/base-layout';

export const routes: Routes = [
  {
    path: '',
    component: BaseLayoutComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () => import('./features/dashboard/dashboard').then(m => m.Dashboard)
      },
      {
        path: 'habits',
        loadComponent: () => import('./features/habits/today/today').then(m => m.Today)
      },
      {
        path: 'habits/history',
        loadComponent: () => import('./features/habits/history/history').then(m => m.History)
      },
      {
        path: 'habits/history/:date',
        loadComponent: () => import('./features/habits/day-detail/day-detail').then(m => m.DayDetail)
      },
      {
        path: 'oog',
        loadComponent: () => import('./features/oog/oog').then(m => m.Oog)
      },
      {
        path: 'big-goals',
        loadComponent: () => import('./features/big-goals/big-goals').then(m => m.BigGoals)
      },
      {
        path: 'goals',
        loadComponent: () => import('./features/goals/goals').then(m => m.Goals)
      },
      {
        path: 'study',
        loadComponent: () => import('./features/study/study').then(m => m.Study)
      },
      {
        path: 'study/sessions',
        loadComponent: () => import('./features/study/sessions/sessions').then(m => m.Sessions)
      },
      {
        path: 'dua-azkar',
        loadComponent: () => import('./features/dua-azkar/dua-azkar').then(m => m.DuaAzkar)
      },
      {
        path: 'life-rules',
        loadComponent: () => import('./features/rules/rules').then(m => m.Rules)
      },
      {
        path: 'links',
        loadComponent: () => import('./features/links/links').then(m => m.Links)
      },
      {
        path: 'settings',
        loadComponent: () => import('./features/settings/settings').then(m => m.Settings)
      },
    ]
  }
];
