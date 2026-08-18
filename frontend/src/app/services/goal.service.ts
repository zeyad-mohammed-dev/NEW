import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';
import { ApiRes, Goal } from '../models/new.model';

@Injectable({ providedIn: 'root' })
export class GoalService {
  private baseUrl = '/api/goals';

  constructor(private http: HttpClient) {}

  getActive() {
    return this.http.get<ApiRes<{ goal: Goal | null }>>(`${this.baseUrl}/active`).pipe(map(r => r.data.goal));
  }

  create(data: { title: string; description?: string }) {
    return this.http.post<ApiRes<{ goal: Goal }>>(this.baseUrl, data).pipe(map(r => r.data.goal));
  }

  update(id: string, data: { title?: string; description?: string }) {
    return this.http.patch<ApiRes<{ goal: Goal }>>(`${this.baseUrl}/${id}`, data).pipe(map(r => r.data.goal));
  }

  complete(id: string) {
    return this.http.patch<ApiRes<{ goal: Goal }>>(`${this.baseUrl}/${id}/complete`, {}).pipe(map(r => r.data.goal));
  }

  delete(id: string) {
    return this.http.delete<ApiRes<void>>(`${this.baseUrl}/${id}`);
  }

  getHistory() {
    return this.http.get<ApiRes<{ goals: Goal[] }>>(`${this.baseUrl}/history`).pipe(map(r => r.data.goals));
  }
}