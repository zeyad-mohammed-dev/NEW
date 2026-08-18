import { Component, inject } from '@angular/core';
import { TitleService } from '../../core/services/title.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [],
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class HeaderComponent {
  titleService = inject(TitleService);
}
