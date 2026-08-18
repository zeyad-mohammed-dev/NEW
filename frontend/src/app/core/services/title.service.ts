import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class TitleService {
  private _title = signal('Home');
  title = this._title.asReadonly();

  setTitle(title: string) {
    this._title.set(title);
  }
}
