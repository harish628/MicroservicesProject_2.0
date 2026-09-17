// src/app/core/services/health.service.ts
//
// Calls the API Gateway's /health/all endpoint — used on the Dashboard
// page to show a live status strip of all 6 backend services.

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { HealthAllResponse } from '../models/models';

@Injectable({ providedIn: 'root' })
export class HealthService {
  constructor(private http: HttpClient) {}

  checkAll(): Observable<HealthAllResponse> {
    // NOTE: /health/all is NOT under /api — it's a Gateway-only route
    return this.http.get<HealthAllResponse>(`${environment.apiUrl}/health/all`);
  }
}
