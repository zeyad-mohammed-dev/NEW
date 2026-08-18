import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private nextId = 0;
  private timer: any;

  toasts = signal<Toast[]>([]);

  show(message: string, type: 'success' | 'error' | 'info' = 'success') {
    clearTimeout(this.timer);
    const id = ++this.nextId;
    this.toasts.set([{ id, message, type }]);
    this.timer = setTimeout(() => this.clear(), 3500);
  }

  clear() {
    this.toasts.set([]);
  }

  dismiss(id: number) {
    this.toasts.update(list => list.filter(t => t.id !== id));
  }
}
