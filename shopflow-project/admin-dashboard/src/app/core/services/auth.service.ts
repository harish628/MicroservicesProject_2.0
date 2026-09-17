// src/app/core/services/auth.service.ts
//
// What this file does:
// Manages admin login state. Equivalent to AuthContext in our React app,
// but written the Angular way using a SERVICE + RxJS Observable instead
// of React Context.
//
// Feynman version:
// In React, "Context" is like a building-wide loudspeaker — any room can tune in.
// In Angular, a "Service" combined with "Dependency Injection" works similarly,
// but the mechanism is different: Angular creates ONE single instance of
// AuthService and silently hands the SAME instance to every component that
// asks for it (via the constructor). Every component sees the same data
// because they're all holding the same object — not because of a broadcast.
//
// BehaviorSubject is an RxJS concept: think of it as a "mailbox with memory".
// Anyone can check it any time and get the LATEST value, even if they
// started watching after the value was first set. Compare to a plain
// Subject, which is more like a live radio broadcast — if you tune in late,
// you missed everything before that.

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { User } from '../models/models';

@Injectable({ providedIn: 'root' }) // 'root' = ONE instance shared across the whole app
export class AuthService {
  // BehaviorSubject always remembers its latest value
  // Components subscribe to currentUser$ to react whenever the user changes
  private currentUserSubject = new BehaviorSubject<User | null>(this.getStoredUser());
  public  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  private getStoredUser(): User | null {
    const stored = localStorage.getItem('shopflow_admin_user');
    return stored ? JSON.parse(stored) : null;
  }

  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  get isLoggedIn(): boolean {
    return !!this.currentUserSubject.value;
  }

  get isAdmin(): boolean {
    return this.currentUserSubject.value?.role === 'admin';
  }

  get token(): string | null {
    return localStorage.getItem('shopflow_admin_token');
  }

  // login() calls Auth Service (via Gateway), then saves token + user
  login(email: string, password: string): Observable<{ token: string; user: User }> {
    return this.http
      .post<{ token: string; user: User }>(`${environment.apiUrl}/api/auth/login`, { email, password })
      .pipe(
        tap((res) => {
          localStorage.setItem('shopflow_admin_token', res.token);
          localStorage.setItem('shopflow_admin_user', JSON.stringify(res.user));
          this.currentUserSubject.next(res.user);
        })
      );
  }

  logout(): void {
    localStorage.removeItem('shopflow_admin_token');
    localStorage.removeItem('shopflow_admin_user');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }
}
