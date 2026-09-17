# ShopFlow Frontend — React Customer Storefront

## What is this?
The customer-facing storefront for ShopFlow. Browse products, manage cart,
checkout, and track orders — all through the API Gateway.

## Design Identity: "Paper Commerce"
Instead of generic glossy e-commerce templates, this UI leans into the
tactile, physical feeling of real shopping — receipts, price tags, stamps.
Warm paper background, a serif display face (Fraunces) for headlines,
and monospace (JetBrains Mono) for anything resembling data: prices,
SKUs, order numbers — just like a real receipt.

## Tech Stack
- **Library:** React 18
- **Routing:** React Router v6
- **HTTP:** Axios with interceptors
- **State:** React Context (Auth + Cart)
- **Backend:** Talks ONLY to the API Gateway (port 8000)

## Folder Structure
```
frontend/
├── package.json
├── .env
├── public/index.html
└── src/
    ├── index.js
    ├── App.js
    ├── api/
    │   ├── client.js
    │   ├── auth.js
    │   ├── products.js
    │   └── orders.js
    ├── context/
    │   ├── AuthContext.js
    │   └── CartContext.js
    ├── components/
    │   ├── Header.js
    │   ├── CartDrawer.js
    │   ├── ProductCard.js
    │   └── ProtectedRoute.js
    ├── pages/
    │   ├── HomePage.js
    │   ├── ProductDetailPage.js
    │   ├── LoginPage.js
    │   ├── RegisterPage.js
    │   ├── CheckoutPage.js
    │   └── OrdersPage.js
    └── styles/global.css
```

## Setup & Run

### 1. Make sure the API Gateway (and all backend services) are running
The frontend ONLY talks to http://localhost:8000 (the Gateway).

### 2. Configure .env
```
REACT_APP_API_URL=http://localhost:8000
```

### 3. Install & Run
```
npm install
npm start
```
Opens at http://localhost:3000

## User Flow
Browse products -> Add to cart -> Login/Register -> Checkout
-> Order Service creates order -> Payment Service charges
-> Redirected to My Orders with confirmation

## Port
Frontend runs on port 3000
