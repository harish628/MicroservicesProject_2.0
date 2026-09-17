# API Gateway — ShopFlow E-Commerce

## What is this?
The **API Gateway** is the single front door to our entire microservices system.
React and Angular ONLY talk to this service — never directly to Auth, Product,
Order, Payment, or Notification services.

## Tech Stack
- **Language:** Node.js
- **Framework:** Express.js
- **Proxy:** express-http-proxy
- **Security:** Helmet + CORS + Rate Limiting
- **Port:** 8000

## Folder Structure
```
api-gateway/
├── package.json
├── .env
└── src/
    ├── index.js                  ← Entry point — wires everything together
    ├── config/
    │   └── services.js           ← Registry of all microservice URLs
    ├── middleware/
    │   ├── rateLimiter.js        ← Limits requests per IP
    │   └── logger.js             ← Logs every request with timing
    └── routes/
        ├── proxyRoutes.js        ← THE CORE — forwards requests to services
        └── healthRoutes.js       ← Health checks for gateway + all services
```

## Setup & Run

### 1. Configure .env
```env
PORT=8000
AUTH_SERVICE_URL=http://localhost:8001
PRODUCT_SERVICE_URL=http://localhost:8002
ORDER_SERVICE_URL=http://localhost:8003
PAYMENT_SERVICE_URL=http://localhost:8004
NOTIFICATION_SERVICE_URL=http://localhost:8005
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:4200
```

### 2. Install & Run
```bash
npm install
npm start
```

### 3. Make sure ALL other services are running first!
This gateway proxies to all 5 backend services — start them before testing.

## Routing Map

| Gateway Path | Forwards To | Port |
|---|---|---|
| /api/auth/* | Auth Service | 8001 |
| /api/products/* | Product Service | 8002 |
| /api/categories/* | Product Service | 8002 |
| /api/orders/* | Order Service | 8003 |
| /api/payments/* | Payment Service | 8004 |
| /api/notify/* | Notification Service | 8005 |
| /api/notifications/* | Notification Service | 8005 |

## Health Checks

| Endpoint | Description |
|---|---|
| GET /health | Gateway's own health |
| GET /health/all | Pings ALL services and reports status |

## Test It
```bash
# Check all services at once
curl http://localhost:8000/health/all

# Register through the gateway (forwards to Auth Service)
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","password":"secret123"}'

# Browse products through the gateway (forwards to Product Service)
curl http://localhost:8000/api/products
```

## Port
API Gateway runs on **port 8000** — this is the ONLY port the frontend needs to know.
