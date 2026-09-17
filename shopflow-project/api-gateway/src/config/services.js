// src/config/services.js
//
// What this file does:
// A single source of truth for WHERE every microservice lives.
// Instead of scattering URLs across the codebase, we keep them all here.
//
// Feynman version:
// Think of this like the directory board in a shopping mall:
//   "Auth Office     → Floor 1, Room 8001"
//   "Product Office  → Floor 1, Room 8002"
//   "Order Office    → Floor 1, Room 8003"
// When the receptionist (Gateway) gets a visitor, they check this board
// to know which room to send them to.
//
// In Kubernetes later, these URLs become service names like
// "http://auth-service:8001" instead of "http://localhost:8001" —
// but the CONCEPT stays exactly the same.

require('dotenv').config();

const SERVICES = {
  auth: {
    url:    process.env.AUTH_SERVICE_URL || 'http://localhost:8001',
    name:   'Auth Service',
  },
  products: {
    url:    process.env.PRODUCT_SERVICE_URL || 'http://localhost:8002',
    name:   'Product Service',
  },
  orders: {
    url:    process.env.ORDER_SERVICE_URL || 'http://localhost:8003',
    name:   'Order Service',
  },
  payments: {
    url:    process.env.PAYMENT_SERVICE_URL || 'http://localhost:8004',
    name:   'Payment Service',
  },
  notifications: {
    url:    process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:8005',
    name:   'Notification Service',
  },
};

module.exports = SERVICES;
