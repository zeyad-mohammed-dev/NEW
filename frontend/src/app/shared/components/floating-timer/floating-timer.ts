import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { PomodoroStateService } from '../../../core/services/pomodoro-state.service';

@Component({
  selector: 'app-floating-timer',
  standalone: true,
  imports: [FormsModule, DecimalPipe],
  templateUrl: './floating-timer.html',
  styleUrl: './floating-timer.scss'
})
export class FloatingTimerComponent implements OnInit, OnDestroy {
  pomodoro = inject(PomodoroStateService);
  isDragging = false;
  private dragOffset = { x: 0, y: 0 };

  ngOnInit() {
    document.addEventListener('mousemove', this.onMouseMove);
    document.addEventListener('mouseup', this.onMouseUp);
  }

  ngOnDestroy() {
    document.removeEventListener('mousemove', this.onMouseMove);
    document.removeEventListener('mouseup', this.onMouseUp);
  }

  toggleMinimize() {
    this.pomodoro.floatingMinimized.update(v => !v);
  }

  onDragStart(e: MouseEvent) {
    if (this.pomodoro.floatingMinimized()) return;
    this.isDragging = true;
    const el = document.querySelector('.floating-timer') as HTMLElement;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    this.dragOffset.x = e.clientX - rect.left;
    this.dragOffset.y = e.clientY - rect.top;
    e.preventDefault();
  }

  private onMouseMove = (e: MouseEvent) => {
    if (!this.isDragging) return;
    const el = document.querySelector('.floating-timer') as HTMLElement;
    if (!el) return;
    el.style.left = (e.clientX - this.dragOffset.x) + 'px';
    el.style.top = (e.clientY - this.dragOffset.y) + 'px';
    el.style.right = 'auto';
    el.style.bottom = 'auto';
  };

  private onMouseUp = () => { this.isDragging = false; };
}
