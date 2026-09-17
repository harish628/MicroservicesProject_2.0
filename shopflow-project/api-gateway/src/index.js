// src/index.js
//
// What this file does:
// The entry point of the API Gateway — the FRONT DOOR of our entire application.
// Sets up security, logging, rate limiting, then wires in the proxy routes.
//
// Feynman version:
// This is the hotel lobby's opening checklist:
//  1. Install security cameras (helmet)
//  2. Set up the visitor logbook (morgan + custom logger)
//  3. Put up the "max 100 guests per hour" sign (rate limiter)
//  4. Allow guests from approved travel agencies (CORS)
//  5. Connect the reception phone lines to every department (proxy routes)
//  6. Open the doors (start server)
//
// THIS IS THE ONLY SERVICE THE FRONTEND EVER TALKS TO.
// React and Angular both point to THIS service's URL, nothing else.

const express = require('express');
const cors    = require('cors');
const helmet  = require('helmet');
const morgan  = require('morgan');
require('dotenv').config();

const requestLogger = require('./middleware/logger');
const rateLimiter    = require('./middleware/rateLimiter');
const proxyRoutes    = require('./routes/proxyRoutes');
const healthRoutes   = require('./routes/healthRoutes');

const app  = express();
const PORT = process.env.PORT || 8000;

// AWS Load Balancer adds X-Forwarded-For header.
// Required for express-rate-limit to identify real client IP.
app.set('trust proxy', 1);

// ── Security Headers ─────────────────────────────────────────────────────────
// helmet() sets various HTTP headers to protect against common attacks
// (XSS, clickjacking, MIME sniffing etc.)
// Feynman: like installing reinforced doors and CCTV before opening for business
app.use(helmet());

// ── CORS Configuration ────────────────────────────────────────────────────────
// Only allow requests from our own frontend apps (React on 3000, Angular on 4200)
// Without this, browsers would block our frontend from calling this Gateway
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000').split(',');

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like Postman, curl, mobile apps)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

// ── Logging ───────────────────────────────────────────────────────────────────
// morgan = battle-tested HTTP request logger (industry standard)
// our custom requestLogger = simpler, color-coded version for quick scanning
app.use(morgan('combined'));
app.use(requestLogger);

// ── Rate Limiting ─────────────────────────────────────────────────────────────
// Applied to ALL routes — protects every downstream service at once
app.use(rateLimiter);

// ── Body Parsing ──────────────────────────────────────────────────────────────
// NOTE: We do NOT use express.json() globally here!
// Why? Because express-http-proxy needs the RAW body to forward it correctly.
// If we parse JSON here, the proxy would receive an already-consumed stream.
// Individual services parse the body themselves once it reaches them.

// ── Health Check Routes ───────────────────────────────────────────────────────
// /health and /health/all — NOT prefixed with /api, these are Gateway-specific
app.use('/', healthRoutes);

// ── Welcome Route ─────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    message: 'ShopFlow API Gateway',
    version: '1.0.0',
    docs:    'See /health/all for service status',
  });
});

// ── Proxy Routes — THE MAIN EVENT ─────────────────────────────────────────────
// Everything starting with /api/* gets forwarded to the right microservice
app.use('/', proxyRoutes);

// ── 404 Handler ───────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
});

// ── Global Error Handler ──────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Gateway error:', err.message);
  res.status(500).json({ error: 'Internal gateway error' });
});

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚪 ShopFlow API Gateway running on port ${PORT}`);
  console.log(`\n📋 Proxying requests to:`);
  console.log(`   /api/auth/*          → Auth Service          (8001)`);
  console.log(`   /api/products/*      → Product Service       (8002)`);
  console.log(`   /api/categories/*    → Product Service       (8002)`);
  console.log(`   /api/orders/*        → Order Service         (8003)`);
  console.log(`   /api/payments/*      → Payment Service       (8004)`);
  console.log(`   /api/notify/*        → Notification Service  (8005)`);
  console.log(`   /api/notifications/* → Notification Service  (8005)`);
  console.log(`\n🩺 Health checks:`);
  console.log(`   GET /health           → Gateway's own health`);
  console.log(`   GET /health/all       → Status of ALL services\n`);
});
