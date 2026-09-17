// src/app/core/services/order.service.ts — All HTTP calls related to orders

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Order, OrderListResponse, OrderStatus } from '../models/models';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private baseUrl = `${environment.apiUrl}/api/orders`;

  constructor(private http: HttpClient) {}

  // Admin: get ALL orders, with optional status filter and pagination
  getAll(params: { status?: string; page?: number; per_page?: number } = {}): Observable<OrderListResponse> {
    let query = Object.entries(params)
      .filter(([, v]) => v !== undefined && v !== '')
      .map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`)
      .join('&');

    return this.http.get<OrderListResponse>(`${this.baseUrl}?${query}`);
  }

  getById(id: number): Observable<{ order: Order }> {
    return this.http.get<{ order: Order }>(`${this.baseUrl}/${id}`);
  }

  // Admin: update order status — e.g. mark as SHIPPED
  updateStatus(id: number, status: OrderStatus): Observable<unknown> {
    return this.http.put(`${this.baseUrl}/${id}/status`, { status });
  }
}
