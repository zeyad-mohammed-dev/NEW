import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';
import { ApiRes, Dua } from '../models/new.model';

@Injectable({ providedIn: 'root' })
export class DuaService {
  private baseUrl = '/api/duas';

  constructor(private http: HttpClient) {}

  getAll(search = '', type = '') {
    let url = this.baseUrl;
    const params: string[] = [];
    if (search) params.push(`search=${encodeURIComponent(search)}`);
    if (type) params.push(`type=${type}`);
    if (params.length) url += '?' + params.join('&');
    return this.http.get<ApiRes<{ duas: Dua[] }>>(url).pipe(map(r => r.data.duas));
  }

  create(data: { name: string; content: string; type: string }) {
    return this.http.post<ApiRes<{ dua: Dua }>>(this.baseUrl, data).pipe(map(r => r.data.dua));
  }

  update(id: string, data: { name?: string; content?: string; type?: string }) {
    return this.http.patch<ApiRes<{ dua: Dua }>>(`${this.baseUrl}/${id}`, data).pipe(map(r => r.data.dua));
  }


  delete(id: string) {
    return this.http.delete<ApiRes<void>>(`${this.baseUrl}/${id}`);
  }
}