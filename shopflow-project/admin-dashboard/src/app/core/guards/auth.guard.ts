// src/core/guards/auth.guard.ts
//
// What this file does:
// The Angular equivalent of our ProtectedRoute component in React.
// Runs BEFORE a route is allowed to load. If not logged in (or not admin),
// redirect to login instead.
//
// Feynman version: same ticket-checking usher from the React app,
// just implemented as a Angular "CanActivate" function instead of
// a wrapper component.

import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router       = inject(Router);

  if (authService.isLoggedIn && authService.isAdmin) {
    return true; // allow access
  }

  router.navigate(['/login']);
  return false; // block access
};
