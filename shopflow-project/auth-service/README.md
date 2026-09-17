# Auth Service — ShopFlow E-Commerce

## What is this?
This is the **Auth Service** for our e-commerce microservices project.
It handles: **Register → Login → Token → Verify**

## Tech Stack
- **Language:** Go 1.21
- **Framework:** Gin (HTTP router)
- **Database:** MySQL via GORM
- **Auth:** JWT (JSON Web Tokens)
- **Password:** bcrypt hashing

## Folder Structure
```
auth-service/
├── main.go              ← Entry point. Starts the server
├── go.mod               ← Go dependencies
├── .env                 ← Config (DB credentials, JWT secret)
├── config/
│   └── db.go            ← MySQL connection + auto migration
├── models/
│   └── user.go          ← User struct + request/response types
├── handlers/
│   ├── register.go      ← POST /api/auth/register
│   ├── login.go         ← POST /api/auth/login
│   ├── verify.go        ← GET  /api/auth/verify-token
│   └── profile.go       ← GET/PUT /api/auth/profile
└── middleware/
    └── jwt.go           ← JWT generation + AuthMiddleware bouncer
```

## Setup & Run

### 1. Create MySQL database
```sql
CREATE DATABASE auth_db;
```

### 2. Configure .env
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=auth_db
PORT=8001
JWT_SECRET=your-secret-key
JWT_EXPIRY_HOURS=24
```

### 3. Install dependencies & run
```bash
go mod tidy
go run main.go
```

## API Endpoints

### POST /api/auth/register
```json
// Request
{ "name": "John", "email": "john@example.com", "password": "secret123" }

// Response 201
{ "token": "eyJ...", "user": { "id": 1, "name": "John", "email": "john@example.com", "role": "customer" } }
```

### POST /api/auth/login
```json
// Request
{ "email": "john@example.com", "password": "secret123" }

// Response 200
{ "token": "eyJ...", "user": { ... } }
```

### GET /api/auth/verify-token
```
// Header: Authorization: Bearer <token>
// Response 200
{ "valid": true, "user_id": 1, "email": "john@example.com", "role": "customer" }
```

### GET /api/auth/profile  *(protected)*
```
// Header: Authorization: Bearer <token>
// Response 200
{ "user": { "id": 1, "name": "John", ... } }
```

### GET /health
```json
{ "status": "ok", "service": "auth-service" }
```

## Port
Auth Service runs on **port 8001**
