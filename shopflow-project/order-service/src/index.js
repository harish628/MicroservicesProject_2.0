// src/index.js
//
// What this file does:
// The entry point of the Order Service.
// Creates the Express app, connects to MySQL, registers routes, starts the server.
//
// Feynman version:
// This is the "opening checklist" of the Order Desk:
//  1. Load config (.env)
//  2. Connect to MySQL (open the filing cabinet)
//  3. Set up the signboards (routes)
//  4. Open the counter (start server)
//
// Run with: node src/index.js
// Dev mode: nodemon src/index.js (auto-restarts on file changes)

const express = require('express');
const cors    = require('cors');
require('dotenv').config();

const { connectDB }  = require('./config/database');
const orderRoutes    = require('./routes/orderRoutes');

const app  = express();
const PORT = process.env.PORT || 8003;

// ── Middleware ────────────────────────────────────────────────────────────────
// cors() allows the React frontend (different port) to call this service
app.use(cors());

// express.json() parses incoming JSON request bodies
// Without this, req.body would be undefined
app.use(express.json());

// ── Health Check ──────────────────────────────────────────────────────────────
// Simple endpoint — API Gateway and Kubernetes ping this to know we're alive
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'order-service', port: PORT });
});

// ── Routes ────────────────────────────────────────────────────────────────────
// All order routes are prefixed with /api/orders
app.use('/api/orders', orderRoutes);

// ── 404 Handler ───────────────────────────────────────────────────────────────
// If no route matched, return a clean 404 instead of Express default HTML error
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
});

// ── Global Error Handler ──────────────────────────────────────────────────────
// Catches any unhandled errors thrown in handlers
// Feynman: Like a safety net below a trapeze artist — catches falls
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// ── Start ─────────────────────────────────────────────────────────────────────
const start = async () => {
  await connectDB(); // connect to MySQL first, then start server

  app.listen(PORT, () => {
    console.log(`🚀 Order Service running on port ${PORT}`);
    console.log(`📋 Routes:`);
    console.log(`   POST   /api/orders              [customer] Place new order`);
    console.log(`   GET    /api/orders/my-orders     [customer] My order history`);
    console.log(`   GET    /api/orders/:id           [customer] Single order`);
    console.log(`   PUT    /api/orders/:id/cancel    [customer] Cancel order`);
    console.log(`   GET    /api/orders               [admin]    All orders`);
    console.log(`   PUT    /api/orders/:id/status    [admin]    Update status`);
    console.log(`   GET    /health`);
  });
};

start();
