// src/app/app.config.ts
//
// What this file does:
// The Angular 17 "standalone" replacement for the old NgModule setup.
// Configures providers that the whole app needs: routing and HTTP client
// (with our auth interceptor attached).
//
// Feynman version: this is like the building's utility room — where
// electricity (HttpClient) and the mail routing system (Router) get
// wired in ONCE, then every floor (component) can use them freely.

import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
  ],
};
