# Payment Service — ShopFlow E-Commerce

## What is this?
The **Payment Service** handles all money transactions — processing payments,
storing transaction records, and processing refunds.

## Tech Stack
- **Language:** Python 3.11+
- **Framework:** Flask
- **Database:** MySQL via Flask-SQLAlchemy
- **Port:** 8004

## Folder Structure
```
payment-service/
├── app.py                        ← Entry point
├── requirements.txt
├── .env
├── config/
│   ├── database.py               ← Flask-SQLAlchemy setup
│   └── auth.py                   ← @require_auth and @require_admin decorators
├── models/
│   └── payment.py                ← Payment + Refund tables
├── handlers/
│   └── payment_handler.py        ← All payment business logic
└── routes/
    └── payment_routes.py         ← URL → handler mapping
```

## Setup & Run

### 1. Create MySQL database
```sql
CREATE DATABASE payment_db;
```

### 2. Configure .env
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=payment_db
PORT=8004
AUTH_SERVICE_URL=http://localhost:8001
ORDER_SERVICE_URL=http://localhost:8003
PAYMENT_SUCCESS_RATE=0.95
```

### 3. Install & Run
```bash
pip install -r requirements.txt
python app.py
```

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /api/payments | Customer | Process a payment |
| GET | /api/payments/:id | Customer | Get payment by ID |
| GET | /api/payments/order/:order_id | Customer | Get payment for an order |
| GET | /api/payments/admin/all | Admin | All payments (paginated) |
| POST | /api/payments/:id/refund | Admin | Process a refund |
| GET | /health | Public | Health check |

## Payment Methods
`CARD` | `UPI` | `NETBANKING` | `WALLET` | `COD`

## Mock Payment
Set `PAYMENT_SUCCESS_RATE=1.0` to always succeed, `0.0` to always fail.
In production, replace mock logic with Razorpay or Stripe SDK.

## Port
Payment Service runs on **port 8004**
