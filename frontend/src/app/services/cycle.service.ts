import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';
import { ApiRes, TenDayCycle, TenDayTask } from '../models/new.model';

@Injectable({ providedIn: 'root' })
export class CycleService {
  private baseUrl = '/api/cycles';

  constructor(private http: HttpClient) {}

  getActive() {
    return this.http.get<ApiRes<{ cycle: TenDayCycle | null }>>(`${this.baseUrl}/active`).pipe(map(r => r.data.cycle));
  }

  getHistory() {
    return this.http.get<ApiRes<{ cycles: TenDayCycle[] }>>(`${this.baseUrl}/history`).pipe(map(r => r.data.cycles));
  }

  create(startDate: string, endDate?: string) {
    const body: any = { startDate };
    if (endDate) body.endDate = endDate;
    return this.http.post<ApiRes<{ cycle: TenDayCycle }>>(this.baseUrl, body).pipe(map(r => r.data.cycle));
  }

  getTasks(cycleId: string) {
    return this.http.get<ApiRes<{ tasks: TenDayTask[] }>>(`${this.baseUrl}/${cycleId}/tasks`).pipe(map(r => r.data.tasks));
  }

  createTask(cycleId: string, data: { name: string; priority: string }) {
    return this.http.post<ApiRes<{ task: TenDayTask }>>(`${this.baseUrl}/${cycleId}/tasks`, data).pipe(map(r => r.data.task));
  }

  updateTask(cycleId: string, taskId: string, data: { name?: string; priority?: string }) {
    return this.http.patch<ApiRes<{ task: TenDayTask }>>(`${this.baseUrl}/${cycleId}/tasks/${taskId}`, data).pipe(map(r => r.data.task));
  }

  toggleTask(cycleId: string, taskId: string) {
    return this.http.patch<ApiRes<{ task: TenDayTask }>>(`${this.baseUrl}/${cycleId}/tasks/${taskId}/complete`, {}).pipe(map(r => r.data.task));
  }

  deleteTask(cycleId: string, taskId: string) {
    return this.http.delete<ApiRes<void>>(`${this.baseUrl}/${cycleId}/tasks/${taskId}`);
  }

  complete(cycleId: string) {
    return this.http.patch<ApiRes<{ cycle: TenDayCycle }>>(`${this.baseUrl}/${cycleId}/complete`, {}).pipe(map(r => r.data.cycle));
  }

  end(cycleId: string) {
    return this.http.patch<ApiRes<{ cycle: TenDayCycle }>>(`${this.baseUrl}/${cycleId}/end`, {}).pipe(map(r => r.data.cycle));
  }

  update(cycleId: string, data: { startDate?: string; endDate?: string; status?: string }) {
    return this.http.patch<ApiRes<{ cycle: TenDayCycle }>>(`${this.baseUrl}/${cycleId}`, data).pipe(map(r => r.data.cycle));
  }

  delete(cycleId: string) {
    return this.http.delete<ApiRes<void>>(`${this.baseUrl}/${cycleId}`);
  }
}
