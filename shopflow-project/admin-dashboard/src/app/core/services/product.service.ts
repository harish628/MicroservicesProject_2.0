// src/app/core/services/product.service.ts
//
// All HTTP calls related to products and categories.
// Every Angular service follows the same pattern: inject HttpClient,
// build the URL using environment.apiUrl, return an Observable.
//
// Feynman version: Observables are like a subscription to a newspaper —
// you don't get the data immediately when you call the method; you get
// a PROMISE of future delivery. You "subscribe" to actually receive it.
// This is different from a plain Promise (used in our React/axios code)
// but conceptually similar — both represent "a value that arrives later."

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Product, ProductListResponse, Category } from '../models/models';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private baseUrl = `${environment.apiUrl}/api`;

  constructor(private http: HttpClient) {}

  getAll(params: { page?: number; per_page?: number; search?: string; category_id?: number } = {}): Observable<ProductListResponse> {
    let query = Object.entries(params)
      .filter(([, v]) => v !== undefined && v !== null && v !== '')
      .map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`)
      .join('&');

    return this.http.get<ProductListResponse>(`${this.baseUrl}/products?${query}`);
  }

  getById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.baseUrl}/products/${id}`);
  }

  create(product: Partial<Product>): Observable<Product> {
    return this.http.post<Product>(`${this.baseUrl}/products`, product);
  }

  update(id: number, product: Partial<Product>): Observable<Product> {
    return this.http.put<Product>(`${this.baseUrl}/products/${id}`, product);
  }

  updateStock(id: number, quantity: number): Observable<unknown> {
    return this.http.put(`${this.baseUrl}/products/${id}/stock`, { quantity });
  }

  delete(id: number): Observable<unknown> {
    return this.http.delete(`${this.baseUrl}/products/${id}`);
  }

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.baseUrl}/categories`);
  }

  createCategory(category: Partial<Category>): Observable<Category> {
    return this.http.post<Category>(`${this.baseUrl}/categories`, category);
  }
}
