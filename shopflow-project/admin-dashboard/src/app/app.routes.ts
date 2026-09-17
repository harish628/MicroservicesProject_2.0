// src/app/app.routes.ts
//
// What this file does:
// Defines every URL in our admin app and which component renders for it.
// Equivalent to <Routes>/<Route> in our React Router setup, just declared
// as a plain array of objects instead of JSX.

import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { LoginComponent } from './features/login/login.component';
import { LayoutComponent } from './shared/components/layout.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { ProductsComponent } from './features/products/products.component';
import { OrdersComponent } from './features/orders/orders.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },

  {
    path: '',
    component: LayoutComponent,   // sidebar shell wraps all these child routes
    canActivate: [authGuard],     // must be logged in AND admin to see any of them
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'products',  component: ProductsComponent },
      { path: 'orders',    component: OrdersComponent },
      { path: '',          redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },

  { path: '**', redirectTo: 'dashboard' }, // catch-all for unknown URLs
];
