# Product Service — ShopFlow E-Commerce

## What is this?
The **Product Service** manages all products, categories, and inventory.
It is the catalog brain of the store.

## Tech Stack
- **Language:** Python 3.11+
- **Framework:** FastAPI
- **Database:** MySQL via SQLAlchemy + PyMySQL
- **Validation:** Pydantic v2
- **Port:** 8002

## Folder Structure
```
product-service/
├── main.py                    ← Entry point. Starts the server
├── requirements.txt           ← Python dependencies
├── .env                       ← Config (DB credentials, Auth Service URL)
├── config/
│   ├── database.py            ← MySQL connection + session factory
│   └── auth.py                ← Token verification (calls Auth Service)
├── models/
│   └── product.py             ← Product + Category SQLAlchemy models (tables)
├── schemas/
│   └── product.py             ← Pydantic schemas for request/response validation
├── handlers/
│   ├── product.py             ← All product CRUD logic
│   └── category.py            ← All category CRUD logic
└── routes/
    └── product_routes.py      ← URL → handler mapping
```

## Setup & Run

### 1. Create MySQL database
```sql
CREATE DATABASE product_db;
```

### 2. Configure .env
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=product_db
PORT=8002
AUTH_SERVICE_URL=http://localhost:8001
```

### 3. Install dependencies
```bash
pip install -r requirements.txt
```

### 4. Run
```bash
python main.py
# OR
uvicorn main:app --host 0.0.0.0 --port 8002 --reload
```

### 5. Open Swagger UI
Visit: http://localhost:8002/docs

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /api/products | None | List all products (paginated) |
| GET | /api/products/{id} | None | Get single product |
| POST | /api/products | Admin | Create product |
| PUT | /api/products/{id} | Admin | Update product |
| PUT | /api/products/{id}/stock | Any token | Update stock |
| DELETE | /api/products/{id} | Admin | Soft delete product |
| GET | /api/categories | None | List all categories |
| POST | /api/categories | Admin | Create category |
| DELETE | /api/categories/{id} | Admin | Delete category |
| GET | /health | None | Health check |

## Query Parameters for GET /api/products
- `page` — page number (default: 1)
- `per_page` — items per page (default: 10)
- `category_id` — filter by category
- `search` — search by name or description

## Port
Product Service runs on **port 8002**
Auth Service must be running on **port 8001**
