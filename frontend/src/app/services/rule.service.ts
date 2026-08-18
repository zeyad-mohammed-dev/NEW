import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';
import { ApiRes, Rule } from '../models/new.model';

@Injectable({ providedIn: 'root' })
export class RuleService {
  private baseUrl = '/api/rules';

  constructor(private http: HttpClient) {}

  getAll(search = '') {
    const url = search ? `${this.baseUrl}?search=${encodeURIComponent(search)}` : this.baseUrl;
    return this.http.get<ApiRes<{ rules: Rule[] }>>(url).pipe(map(r => r.data.rules));
  }

  create(data: { title: string; content: string }) {
    return this.http.post<ApiRes<{ rule: Rule }>>(this.baseUrl, data).pipe(map(r => r.data.rule));
  }

  update(id: string, data: { title?: string; content?: string }) {
    return this.http.patch<ApiRes<{ rule: Rule }>>(`${this.baseUrl}/${id}`, data).pipe(map(r => r.data.rule));
  }

  delete(id: string) {
    return this.http.delete<ApiRes<void>>(`${this.baseUrl}/${id}`);
  }
}