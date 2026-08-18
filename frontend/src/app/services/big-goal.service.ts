import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map } from 'rxjs';
import { ApiRes, BigGoal } from '../models/new.model';

@Injectable({ providedIn: 'root' })
export class BigGoalService {
  private baseUrl = '/api/big-goals';

  constructor(private http: HttpClient) {}

  getAll(status?: string) {
    let params = new HttpParams();
    if (status && status !== 'all') params = params.set('status', status);
    return this.http.get<ApiRes<{ goals: BigGoal[] }>>(this.baseUrl, { params }).pipe(map(r => r.data.goals));
  }

  create(data: { title: string; description?: string; targetDate?: string }) {
    return this.http.post<ApiRes<{ goal: BigGoal }>>(this.baseUrl, data).pipe(map(r => r.data.goal));
  }

  update(id: string, data: { title?: string; description?: string; status?: string; targetDate?: string }) {
    return this.http.patch<ApiRes<{ goal: BigGoal }>>(`${this.baseUrl}/${id}`, data).pipe(map(r => r.data.goal));
  }

  delete(id: string) {
    return this.http.delete<ApiRes<void>>(`${this.baseUrl}/${id}`);
  }
}