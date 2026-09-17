// src/app/core/interceptors/auth.interceptor.ts
//
// What this file does:
// The Angular equivalent of our axios interceptor in React.
// Automatically attaches the JWT token to every outgoing HTTP request,
// and automatically logs out on 401 responses.
//
// Feynman version: same smart ID badge concept from the React app —
// just written in Angular's "functional interceptor" style (Angular 15+).

import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const token  = localStorage.getItem('shopflow_admin_token');

  // Clone the request and add the Authorization header
  // (HttpRequest objects are immutable in Angular — we can't modify req directly)
  const authReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq).pipe(
    catchError((error) => {
      if (error.status === 401) {
        localStorage.removeItem('shopflow_admin_token');
        localStorage.removeItem('shopflow_admin_user');
        router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
};
