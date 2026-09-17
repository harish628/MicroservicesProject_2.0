// src/app/app.component.ts
//
// The root component. In Angular's standalone style, this is intentionally
// tiny — it just hosts the <router-outlet> where every page gets rendered
// based on the current URL. All real layout (sidebar etc.) lives in
// LayoutComponent, which is itself rendered INSIDE this root outlet.

import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `<router-outlet></router-outlet>`,
})
export class AppComponent {}
