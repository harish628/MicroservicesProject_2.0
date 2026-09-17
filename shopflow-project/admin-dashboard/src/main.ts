// src/main.ts
//
// Angular's entry point — bootstraps the root AppComponent using the
// new "standalone components" style (Angular 17 default — no NgModules needed).

import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
