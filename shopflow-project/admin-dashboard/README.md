# Admin Dashboard — ShopFlow E-Commerce

## What is this?
The **admin control panel** — where the shop owner manages products,
watches orders come in, and checks system health. Built in Angular,
talks ONLY to the API Gateway, just like the React storefront.

## Design Concept: "Ops Console"
While the customer storefront feels like warm paper and receipts, the
admin panel is the deliberate opposite — a dark, focused control room.
Think mission control or a trading floor: a persistent sidebar, a
stat "ticker row" up top, monospace numbers everywhere data matters.
The person here is managing a business, not browsing for pleasure —
the UI should get out of the way and show clear numbers fast.

## Tech Stack
- **Framework:** Angular 17 (standalone components — no NgModules)
- **Routing:** Angular Router with route guards
- **HTTP:** HttpClient with a functional interceptor (auto-attaches JWT)
- **State:** Services + RxJS BehaviorSubject (Angular's answer to React Context)
- **Styling:** Plain CSS, separate design system from the storefront

## Folder Structure
```
admin-dashboard/
├── angular.json
├── package.json
├── tsconfig.json
└── src/
    ├── main.ts                      ← Entry point
    ├── styles.css                   ← The "Ops Console" design system
    ├── environments/                ← apiUrl config (dev/prod)
    └── app/
        ├── app.component.ts         ← Root shell (just a router-outlet)
        ├── app.config.ts            ← Providers: router + http + interceptor
        ├── app.routes.ts            ← URL → component mapping
        ├── core/
        │   ├── models/models.ts     ← TypeScript interfaces
        │   ├── services/            ← AuthService, ProductService, OrderService, HealthService
        │   ├── guards/auth.guard.ts ← Blocks non-admins from protected routes
        │   └── interceptors/        ← Auto-attaches JWT to every request
        ├── shared/components/
        │   └── layout.component.ts ← Sidebar + content shell
        └── features/
            ├── login/               ← Admin login page
            ├── dashboard/           ← Stats ticker + system health grid
            ├── products/            ← Full product CRUD
            └── orders/              ← Order list + status management
```

## Setup & Run

### 1. Make sure the API Gateway and all backend services are running

### 2. Configure environment
`src/environments/environment.ts`:
```ts
export const environment = {
  production: false,
  apiUrl: '',
};
```

### 3. Install & Run
```bash
npm install
npm start
```

The development proxy forwards `/api` and `/health` to the URL in `API_URL`.

### 4. Login
You need a user with `role: admin` in the Auth Service database.
Register normally, then manually update that user's role to `admin`
in MySQL (`UPDATE users SET role='admin' WHERE email='you@example.com';`).

## Key Flows

| Flow | What Happens |
|---|---|
| Login | AuthService → POST /api/auth/login → checks role === 'admin' |
| Dashboard stats | Calls Product Service + Order Service (via Gateway) for counts |
| System health | Calls GET /health/all on the Gateway — checks all 6 services |
| Product CRUD | ProductService → POST/PUT/DELETE /api/products |
| Order status update | OrderService → PUT /api/orders/:id/status — triggers customer email |

## Port
Admin Dashboard runs on **port 4200**
