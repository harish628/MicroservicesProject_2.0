// src/routes/orderRoutes.js
//
// What this file does:
// Maps every URL to the right handler function.
// Also applies the right middleware (verifyToken or adminOnly) to each route.
//
// Feynman version:
// Think of this as the traffic signals in a city.
// Each road (URL) has rules:
//   - Some roads are open to everyone (public)
//   - Some roads need a valid ID (verifyToken)
//   - Some roads are restricted to officials only (adminOnly)
// This file sets those rules.

const express    = require('express');
const router     = express.Router();
const { verifyToken, adminOnly } = require('../middleware/auth');
const {
  createOrder,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
  getAllOrders,
} = require('../handlers/orderHandler');

// ── Customer Routes (any logged-in user) ─────────────────────────────────────

// POST /api/orders → place a new order
router.post('/',                verifyToken, createOrder);

// GET /api/orders/my-orders → get MY orders only
// NOTE: this route must come BEFORE /:id — otherwise Express reads "my-orders" as an ID
router.get('/my-orders',        verifyToken, getUserOrders);

// GET /api/orders/:id → get one specific order (owner or admin)
router.get('/:id',              verifyToken, getOrderById);

// PUT /api/orders/:id/cancel → cancel a PENDING order (owner only)
router.put('/:id/cancel',       verifyToken, cancelOrder);

// ── Admin Routes ─────────────────────────────────────────────────────────────

// GET /api/orders → get ALL orders (admin only, with pagination + status filter)
router.get('/',                 adminOnly,   getAllOrders);

// PUT /api/orders/:id/status → update order status (admin only)
router.put('/:id/status',       adminOnly,   updateOrderStatus);

module.exports = router;
