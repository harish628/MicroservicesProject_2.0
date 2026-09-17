// src/routes/proxyRoutes.js
//
// What this file does:
// THE HEART OF THE API GATEWAY.
// Takes every incoming request and forwards ("proxies") it to the correct
// backend microservice based on the URL path.
//
// Feynman version:
// Imagine a hotel receptionist. A guest walks up and says "I need housekeeping."
// The receptionist doesn't clean rooms themselves — they pick up the phone
// and connect the guest to the housekeeping department.
// The guest never sees a phone number for housekeeping; they just talk to
// the receptionist who handles the connection.
//
// That's exactly what proxying does:
//   Browser → API Gateway (receptionist) → Real Service (department)
//   Browser never knows or cares that Product Service lives on port 8002.
//   It only knows the Gateway's address.
//
// Why is this valuable?
//   1. Single entry point — frontend only needs ONE URL to remember
//   2. Hides internal architecture — services can move/scale without frontend changes
//   3. Central place for auth, rate limiting, logging — applied once, not per-service
//   4. CORS only needs to be configured once, here

const express      = require('express');
const proxy        = require('express-http-proxy');
const router       = express.Router();
const SERVICES     = require('../config/services');

// ── Helper: create a proxy middleware for a given service ───────────────────
// This wraps express-http-proxy with sensible defaults and logging
const createServiceProxy = (serviceKey) => {
  const service = SERVICES[serviceKey];

  return proxy(service.url, {
    // proxyReqPathResolver decides what path to forward to the target service
    // Example: Gateway receives /api/products/5
    //          Forwards to:    http://localhost:8002/api/products/5
    // We keep the path EXACTLY the same — just change the host
    proxyReqPathResolver: (req) => req.originalUrl,

    // Forward the original request body for POST/PUT requests
    // express-http-proxy needs this for body-parser compatibility
    parseReqBody: true,

    // If the target service is down, return a clean error instead of crashing
    proxyErrorHandler: (err, res, next) => {
      console.error(`❌ ${service.name} is unreachable:`, err.message);
      res.status(503).json({
        error:   `${service.name} is currently unavailable`,
        service: serviceKey,
      });
    },

    // Add a custom timeout — don't wait forever for a slow/dead service
    timeout: 10000, // 10 seconds
  });
};

// ── Route Mapping ─────────────────────────────────────────────────────────────
// Every request starting with these paths gets forwarded to the matching service.
// ORDER MATTERS — Express checks routes top to bottom, first match wins.

// /api/auth/*          → Auth Service (8001)
router.use('/api/auth',          createServiceProxy('auth'));

// /api/products/*      → Product Service (8002)
// /api/categories/*    → also Product Service (categories live there)
router.use('/api/products',      createServiceProxy('products'));
router.use('/api/categories',    createServiceProxy('products'));

// /api/orders/*        → Order Service (8003)
router.use('/api/orders',        createServiceProxy('orders'));

// /api/payments/*      → Payment Service (8004)
router.use('/api/payments',      createServiceProxy('payments'));

// /api/notify/*        → Notification Service (8005)
// /api/notifications/* → also Notification Service
router.use('/api/notify',        createServiceProxy('notifications'));
router.use('/api/notifications', createServiceProxy('notifications'));

module.exports = router;
