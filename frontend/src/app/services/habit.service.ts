import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';
import { ApiRes, Habit, HabitWithStatus, HabitLog, StarsData, HistoryDay } from '../models/new.model';

@Injectable({ providedIn: 'root' })
export class HabitService {
  private baseUrl = '/api/habits';

  /** Incremented on every habit toggle so sidebar rocket auto-updates */
  progressVersion = signal(0);

  constructor(private http: HttpClient) {}

  getAll() {
    return this.http.get<ApiRes<{ habits: Habit[] }>>(this.baseUrl).pipe(map(r => r.data.habits));
  }

  create(data: { name: string; time?: string; icon?: string }) {
    return this.http.post<ApiRes<{ habit: Habit }>>(this.baseUrl, data).pipe(map(r => r.data.habit));
  }

  update(id: string, data: { name?: string; time?: string; icon?: string }) {
    return this.http.patch<ApiRes<{ habit: Habit }>>(`${this.baseUrl}/${id}`, data).pipe(map(r => r.data.habit));
  }

  delete(id: string) {
    return this.http.delete<ApiRes<void>>(`${this.baseUrl}/${id}`);
  }

  getToday() {
    return this.http.get<ApiRes<{ date: string; habits: HabitWithStatus[] }>>(`${this.baseUrl}/today`).pipe(map(r => r.data));
  }

  toggleComplete(habitId: string) {
    return this.http.patch<ApiRes<{ log: HabitLog }>>(`${this.baseUrl}/${habitId}/complete`, {}).pipe(
      map(r => r.data.log),
      map(log => {
        this.progressVersion.update(v => v + 1);
        return log;
      })
    );
  }

  getStars() {
    return this.http.get<ApiRes<StarsData>>(`${this.baseUrl}/stars`).pipe(map(r => r.data));
  }

  getHistory() {
    return this.http.get<ApiRes<{ history: HistoryDay[] }>>(`${this.baseUrl}/history`).pipe(map(r => r.data.history));
  }

  getDayDetail(date: string) {
    return this.http.get<ApiRes<{ date: string; habits: HabitWithStatus[]; earned: boolean }>>(`${this.baseUrl}/day/${date}`).pipe(map(r => r.data));
  }

  reorder(reorder: { id: string; order: number }[]) {
    return this.http.patch<ApiRes<{ habits: HabitWithStatus[] }>>(`${this.baseUrl}/reorder`, { reorder }).pipe(map(r => r.data.habits));
  }
}
