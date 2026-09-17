// src/app/features/login/login.component.ts
//
// Admin login page. Notice the [(ngModel)] syntax — this is Angular's
// "two-way data binding". Compare to React, where you manually wire
// value={state} and onChange={setState} separately. Angular bundles
// both directions into one syntax: [(ngModel)]="email" keeps the
// input AND the variable perfectly in sync, automatically, both ways.

import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="login-shell">
      <div class="login-card">
        <div class="login-brand">
          <span>🛠️</span> ShopFlow Admin
        </div>
        <p class="login-sub">Sign in to manage the store</p>

        @if (error) {
          <div class="error-banner">{{ error }}</div>
        }

        <form (ngSubmit)="handleSubmit()">
          <div class="field">
            <label for="email">Email</label>
            <input
              id="email"
              type="email"
              [(ngModel)]="email"
              name="email"
              placeholder="admin@shopflow.com"
              required
            />
          </div>

          <div class="field">
            <label for="password">Password</label>
            <input
              id="password"
              type="password"
              [(ngModel)]="password"
              name="password"
              placeholder="••••••••"
              required
            />
          </div>

          <button type="submit" class="btn btn-primary" style="width:100%; justify-content:center; padding: 11px;" [disabled]="loading">
            {{ loading ? 'Signing in...' : 'Sign In' }}
          </button>
        </form>

        <p style="text-align:center; font-size:12px; color:var(--muted); margin-top:20px;">
          Only accounts with role = admin can access this panel.
        </p>
      </div>
    </div>
  `,
})
export class LoginComponent {
  email    = '';
  password = '';
  error    = '';
  loading  = false;

  constructor(private authService: AuthService, private router: Router) {}

  handleSubmit(): void {
    this.error = '';
    this.loading = true;

    this.authService.login(this.email, this.password).subscribe({
      next: (res) => {
        if (res.user.role !== 'admin') {
          this.error = 'This account does not have admin access.';
          this.authService.logout();
          this.loading = false;
          return;
        }
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.error = err.error?.error || 'Login failed. Please check your credentials.';
        this.loading = false;
      },
    });
  }
}
