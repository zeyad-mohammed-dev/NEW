import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet, NavigationEnd } from '@angular/router';
import { Router } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar';
import { HeaderComponent } from '../header/header';
import { TitleService } from '../../core/services/title.service';
import { ToastComponent } from '../../shared/components/toast/toast';
import { FloatingTimerComponent } from '../../shared/components/floating-timer/floating-timer';

@Component({
  selector: 'app-base-layout',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, HeaderComponent, ToastComponent, FloatingTimerComponent],
  templateUrl: './base-layout.html',
  styleUrl: './base-layout.scss'
})
export class BaseLayoutComponent implements OnInit {
  private router = inject(Router);
  private titleService = inject(TitleService);

  private routeTitles: Record<string, string> = {
    '/': 'Home',
    '/habits': 'Habit Tracker',
    '/habits/history': 'Habit History',
    '/oog': 'OOG',
    '/big-goals': 'Big Goals',
    '/goals': '10 Days Goals',
    '/study': 'Study & Focus',
    '/dua-azkar': 'Dua & Azkar',
    '/life-rules': 'Life Rules',
    '/links': 'Links',
    '/settings': 'Settings',
  };

  ngOnInit() {
    this.router.events.subscribe((e) => {
      if (e instanceof NavigationEnd) {
        const path = e.urlAfterRedirects || e.url;
        const base = path.split('/')[1] ? '/' + path.split('/')[1] : '/';
        const title = this.routeTitles[path] || this.routeTitles[base] || 'Home';
        this.titleService.setTitle(title);
      }
    });
    // Set initial
    const path = this.router.url;
    const base = path.split('/')[1] ? '/' + path.split('/')[1] : '/';
    this.titleService.setTitle(this.routeTitles[path] || this.routeTitles[base] || 'Home');
  }
}
