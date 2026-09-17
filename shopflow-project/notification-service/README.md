# Notification Service — ShopFlow E-Commerce

## What is this?
The **Notification Service** sends emails to customers when things happen —
order placed, payment confirmed, order shipped, refund processed etc.

## Tech Stack
- **Language:** Node.js
- **Framework:** Express.js
- **Database:** MySQL via Sequelize
- **Email:** Nodemailer (mock in dev, real SMTP in production)
- **Port:** 8005

## Folder Structure
```
notification-service/
├── package.json
├── .env
└── src/
    ├── index.js                          ← Entry point
    ├── config/
    │   ├── database.js                   ← MySQL connection
    │   ├── mailer.js                     ← Nodemailer SMTP / mock setup
    ├── models/
    │   └── notification.js               ← Notification + Template tables
    ├── templates/
    │   └── emailTemplates.js             ← HTML email templates per type
    ├── middleware/
    │   └── auth.js                       ← Token verification
    ├── handlers/
    │   └── notificationHandler.js        ← All notification logic
    └── routes/
        └── notificationRoutes.js         ← URL → handler mapping
```

## Setup & Run

### 1. Create MySQL database
```sql
CREATE DATABASE notification_db;
```

### 2. Configure .env
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=notification_db
PORT=8005
AUTH_SERVICE_URL=http://localhost:8001
EMAIL_ENABLED=false
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your@gmail.com
EMAIL_PASS=your-app-password
```

### 3. Install & Run
```bash
npm install
npm start
```

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /api/notify/email | Any token | Send a notification email |
| GET | /api/notifications/my | Customer | My notification history |
| GET | /api/notifications | Admin | All logs (paginated) |
| GET | /api/notifications/types | Any token | List all notification types |
| GET | /health | Public | Health check |

## Notification Types
`ORDER_CONFIRMATION` `ORDER_STATUS_UPDATE` `PAYMENT_SUCCESS`
`PAYMENT_FAILED` `ORDER_CANCELLED` `REFUND_PROCESSED` `WELCOME`

## Email Mode
- `EMAIL_ENABLED=false` → emails printed to console (dev mode)
- `EMAIL_ENABLED=true` → real emails sent via SMTP

## Port
Notification Service runs on **port 8005**
