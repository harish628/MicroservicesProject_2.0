// src/app/shared/components/layout.component.ts
//
// The persistent shell — sidebar + content area — wrapping every
// authenticated page. The <router-outlet> is where Angular injects
// whichever page component matches the current URL.

import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, AsyncPipe],
  template: `
    <div class="shell">
      <aside class="sidebar">
        <div class="sidebar-brand">
          <span class="pulse"></span> ShopFlow Admin
        </div>

        <nav class="sidebar-nav">
          <a routerLink="/dashboard" routerLinkActive="active" class="nav-item">
            <span class="icon">📊</span> Dashboard
          </a>
          <a routerLink="/products" routerLinkActive="active" class="nav-item">
            <span class="icon">📦</span> Products
          </a>
          <a routerLink="/orders" routerLinkActive="active" class="nav-item">
            <span class="icon">📋</span> Orders
          </a>
        </nav>

        <div class="sidebar-footer">
          @if (authService.currentUser$ | async; as user) {
            <div class="sidebar-user">{{ user.name }}</div>
            <div class="sidebar-role">{{ user.role }}</div>
          }
          <button class="logout-btn" (click)="authService.logout()">Sign Out</button>
        </div>
      </aside>

      <main class="main">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
})
export class LayoutComponent {
  constructor(public authService: AuthService) {}
}
