# Order Service — ShopFlow E-Commerce

## What is this?
The **Order Service** manages everything about customer orders — placing them,
tracking status, cancelling, and notifying customers.

## Tech Stack
- **Language:** Node.js
- **Framework:** Express.js
- **Database:** MySQL via Sequelize ORM
- **Port:** 8003

## Talks To
- **Auth Service** (port 8001) — verify every token
- **Product Service** (port 8002) — get product price + update stock
- **Notification Service** (port 8005) — send confirmation emails

## Folder Structure
```
order-service/
├── package.json
├── .env
└── src/
    ├── index.js                  ← Entry point
    ├── config/
    │   └── database.js           ← MySQL connection (Sequelize)
    ├── models/
    │   └── order.js              ← Order + OrderItem tables
    ├── middleware/
    │   └── auth.js               ← Token verification via Auth Service
    ├── handlers/
    │   └── orderHandler.js       ← All order business logic
    └── routes/
        └── orderRoutes.js        ← URL → handler mapping
```

## Setup & Run

### 1. Create MySQL database
```sql
CREATE DATABASE order_db;
```

### 2. Configure .env
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=order_db
PORT=8003
AUTH_SERVICE_URL=http://localhost:8001
PRODUCT_SERVICE_URL=http://localhost:8002
NOTIFICATION_SERVICE_URL=http://localhost:8005
```

### 3. Install & Run
```bash
npm install
npm start
# or for development:
npm run dev
```

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /api/orders | Customer | Place a new order |
| GET | /api/orders/my-orders | Customer | My order history |
| GET | /api/orders/:id | Customer/Admin | Single order detail |
| PUT | /api/orders/:id/cancel | Customer | Cancel PENDING order |
| GET | /api/orders | Admin | All orders (paginated) |
| PUT | /api/orders/:id/status | Admin | Update order status |
| GET | /health | Public | Health check |

## Order Status Flow
```
PENDING → CONFIRMED → SHIPPED → DELIVERED
       ↘ CANCELLED
CONFIRMED → REFUNDED
```

## Port
Order Service runs on **port 8003**
