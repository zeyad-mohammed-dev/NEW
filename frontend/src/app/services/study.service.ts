import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';
import { ApiRes, StudyTask, PomodoroSession } from '../models/new.model';

@Injectable({ providedIn: 'root' })
export class StudyService {
  private baseUrl = '/api/study';

  constructor(private http: HttpClient) {}

  getTasks() {
    return this.http.get<ApiRes<StudyTask[]>>(`${this.baseUrl}/tasks`).pipe(map(r => r.data));
  }

  createTask(data: { name: string; subject?: string }) {
    return this.http.post<ApiRes<StudyTask>>(`${this.baseUrl}/tasks`, data).pipe(map(r => r.data));
  }

  updateTask(id: string, data: Partial<StudyTask>) {
    return this.http.patch<ApiRes<StudyTask>>(`${this.baseUrl}/tasks/${id}`, data).pipe(map(r => r.data));
  }

  deleteTask(id: string) {
    return this.http.delete<ApiRes<void>>(`${this.baseUrl}/tasks/${id}`);
  }

  logSession(data: { taskId?: string; taskName?: string; type: 'focus' | 'break'; durationMinutes: number }) {
    return this.http.post<ApiRes<PomodoroSession>>(`${this.baseUrl}/sessions`, data).pipe(map(r => r.data));
  }

  getStats() {
    return this.http.get<ApiRes<any>>(`${this.baseUrl}/stats`).pipe(map(r => r.data));
  }

  getDailySessionCount(date: string) {
    return this.http.get<ApiRes<{ count: number }>>(`${this.baseUrl}/sessions/daily?date=${date}`).pipe(map(r => r.data));
  }

  getSessionHistory(days: number = 30) {
    return this.http.get<ApiRes<SessionDay[]>>(`${this.baseUrl}/sessions/history?days=${days}`).pipe(map(r => r.data));
  }
}

export interface SessionDay {
  date: string;
  sessions: number;
  totalMinutes: number;
}
