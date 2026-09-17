// src/app/features/orders/orders.component.ts
//
// Admin order management — view all orders, filter by status,
// update status with a dropdown (triggers Notification Service automatically
// via the Order Service's status update logic).

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../../core/services/order.service';
import { Order, OrderStatus } from '../../core/models/models';

const STATUS_OPTIONS: OrderStatus[] = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'];

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-header">
      <div>
        <h1>Orders</h1>
        <div class="page-sub">{{ total }} total orders</div>
      </div>
    </div>

    <div class="panel">
      <div style="display:flex; gap:10px; margin-bottom:18px;">
        <button
          class="btn btn-sm"
          [class.btn-primary]="!statusFilter"
          (click)="setFilter('')"
        >All</button>
        @for (s of statusOptions; track s) {
          <button
            class="btn btn-sm"
            [class.btn-primary]="statusFilter === s"
            (click)="setFilter(s)"
          >{{ s }}</button>
        }
      </div>

      @if (loading) {
        <p class="loading-text">Loading orders...</p>
      } @else {
        <table>
          <thead>
            <tr>
              <th>Order</th>
              <th>Customer ID</th>
              <th>Items</th>
              <th>Total</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            @for (order of orders; track order.id) {
              <tr>
                <td class="cell-mono"><strong>#{{ order.id }}</strong></td>
                <td class="cell-mono cell-muted">USR-{{ order.user_id }}</td>
                <td class="cell-muted">{{ order.items?.length || 0 }} item(s)</td>
                <td class="cell-mono">₹{{ order.total_amount | number }}</td>
                <td>
                  <select
                    class="status-select"
                    [ngModel]="order.status"
                    (ngModelChange)="updateStatus(order, $event)"
                  >
                    @for (s of statusOptions; track s) {
                      <option [value]="s">{{ s }}</option>
                    }
                  </select>
                </td>
                <td class="cell-muted">{{ order.created_at | date:'MMM d, y' }}</td>
              </tr>
            } @empty {
              <tr class="empty-row"><td colspan="6">No orders found.</td></tr>
            }
          </tbody>
        </table>
      }
    </div>
  `,
})
export class OrdersComponent implements OnInit {
  orders: Order[] = [];
  total = 0;
  loading = true;
  statusFilter = '';
  statusOptions = STATUS_OPTIONS;

  constructor(private orderService: OrderService) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading = true;
    this.orderService.getAll({ status: this.statusFilter || undefined, per_page: 50 }).subscribe({
      next: (res) => {
        this.orders = res.orders;
        this.total = res.total;
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }

  setFilter(status: string): void {
    this.statusFilter = status;
    this.loadOrders();
  }

  updateStatus(order: Order, newStatus: OrderStatus): void {
    const previous = order.status;
    order.status = newStatus; // optimistic update — update UI immediately

    this.orderService.updateStatus(order.id, newStatus).subscribe({
      error: () => {
        order.status = previous; // roll back if the API call fails
        alert('Failed to update order status.');
      },
    });
  }
}
