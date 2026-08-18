import { Component, inject, computed } from '@angular/core';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [],
  templateUrl: './toast.html',
  styleUrl: './toast.scss'
})
export class ToastComponent {
  private toastService = inject(ToastService);

  toasts = this.toastService.toasts;

  latest = computed(() => {
    const list = this.toasts();
    return list.length > 0 ? list[list.length - 1] : null;
  });

  dismiss(id: number) {
    this.toastService.dismiss(id);
  }
}
