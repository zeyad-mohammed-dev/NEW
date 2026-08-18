import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';
import { ApiRes, DashboardSummary } from '../models/new.model';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private baseUrl = '/api/dashboard';

  constructor(private http: HttpClient) {}

  getSummary() {
    return this.http.get<ApiRes<DashboardSummary>>(`${this.baseUrl}/summary`).pipe(map(r => r.data));
  }

  getDashboard() {
    return this.http.get<ApiRes<DashboardSummary>>(`${this.baseUrl}/summary`);
  }
}
