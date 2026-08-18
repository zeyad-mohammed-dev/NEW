import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';
import { ApiRes, Link } from '../models/new.model';

export interface LinkCategory {
  _id: string;
  name: string;
  color: string;
  createdAt?: string;
  updatedAt?: string;
}

@Injectable({ providedIn: 'root' })
export class LinkService {
  private baseUrl = '/api/links';

  constructor(private http: HttpClient) {}

  getAll(search = '', category = '', type = '') {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (category) params.set('category', category);
    if (type) params.set('type', type);
    const qs = params.toString();
    const url = qs ? `${this.baseUrl}?${qs}` : this.baseUrl;
    return this.http.get<ApiRes<{ links: Link[] }>>(url).pipe(map(r => r.data.links));
  }

  create(data: { title: string; url: string; description: string; category: string; categoryColor?: string; type: string }) {
    return this.http.post<ApiRes<{ link: Link }>>(this.baseUrl, data).pipe(map(r => r.data.link));
  }

  update(id: string, data: { title?: string; url?: string; description?: string; category?: string; categoryColor?: string; type?: string }) {
    return this.http.patch<ApiRes<{ link: Link }>>(`${this.baseUrl}/${id}`, data).pipe(map(r => r.data.link));
  }

  delete(id: string) {
    return this.http.delete<ApiRes<void>>(`${this.baseUrl}/${id}`);
  }

  // Categories
  getCategories() {
    return this.http.get<ApiRes<{ categories: LinkCategory[] }>>(`${this.baseUrl}/categories`).pipe(map(r => r.data.categories));
  }

  createCategory(data: { name: string; color: string }) {
    return this.http.post<ApiRes<{ category: LinkCategory }>>(`${this.baseUrl}/categories`, data).pipe(map(r => r.data.category));
  }

  updateCategory(id: string, data: { name?: string; color?: string }) {
    return this.http.patch<ApiRes<{ category: LinkCategory }>>(`${this.baseUrl}/categories/${id}`, data).pipe(map(r => r.data.category));
  }

  deleteCategory(id: string) {
    return this.http.delete<ApiRes<void>>(`${this.baseUrl}/categories/${id}`);
  }
}
