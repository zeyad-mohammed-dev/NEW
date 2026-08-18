import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  templateUrl: './empty-state.html',
  styleUrl: './empty-state.scss'
})
export class EmptyStateComponent {
  @Input() message = '';
  @Input() actionLabel = '';
  @Input() actionDisabled = false;
  @Output() action = new EventEmitter<void>();
}
