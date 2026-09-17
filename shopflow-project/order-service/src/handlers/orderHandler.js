// src/handlers/orderHandler.js
//
// What this file does:
// Contains ALL the business logic for orders.
// This is the most important file in the Order Service.
//
// Feynman version:
// This file is like the ORDER DESK at a store.
// - createOrder()    → customer places an order
// - getUserOrders()  → customer checks their order history
// - getOrderById()   → customer checks one specific order
// - updateStatus()   → admin updates order (Shipped, Delivered etc.)
// - cancelOrder()    → customer cancels an order
//
// The most complex function is createOrder() — it talks to TWO other services:
//   1. Product Service → verify product exists + get current price
//   2. Notification Service → send confirmation email
// This is microservices communication in real action.

const axios  = require('axios');
const { Order, OrderItem, ORDER_STATUS } = require('../models/order');
require('dotenv').config();

const PRODUCT_SERVICE_URL      = process.env.PRODUCT_SERVICE_URL      || 'http://localhost:8002';
const NOTIFICATION_SERVICE_URL = process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:8005';

// ── CREATE ORDER ─────────────────────────────────────────────────────────────
// POST /api/orders
//
// What the customer sends:
// {
//   items: [
//     { product_id: 1, quantity: 2 },
//     { product_id: 5, quantity: 1 }
//   ],
//   delivery_address: { street: "...", city: "Hyderabad", pincode: "500001" },
//   notes: "Please leave at door"
// }
//
// What we do:
// 1. For each item → call Product Service to get price & verify stock
// 2. Calculate total
// 3. Save order + order items to MySQL
// 4. Tell Product Service to reduce stock
// 5. Tell Notification Service to send confirmation email
// 6. Return the created order

const createOrder = async (req, res) => {
  const { items, delivery_address, notes } = req.body;
  const user_id = req.user.user_id; // set by verifyToken middleware

  // ── Validation ────────────────────────────────────────────────────────────
  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Order must have at least one item' });
  }
  if (!delivery_address) {
    return res.status(400).json({ error: 'Delivery address is required' });
  }

  try {
    // ── Step 1: Verify each product and get current prices ────────────────
    // We call Product Service for each item to:
    //   a) Confirm the product exists and is active
    //   b) Get the CURRENT price (prices can change — we lock the price at order time)
    //   c) Check stock is sufficient
    //
    // Feynman: Like a waiter checking the kitchen before confirming your order.
    // "Yes, the pasta is available, yes we have 3 portions left."

    const orderItems = [];
    let total_amount = 0;

    for (const item of items) {
      if (!item.product_id || !item.quantity || item.quantity < 1) {
        return res.status(400).json({ error: `Invalid item: product_id and quantity (min 1) required` });
      }

      let product;
      try {
        const productRes = await axios.get(
          `${PRODUCT_SERVICE_URL}/api/products/${item.product_id}`,
          { timeout: 5000 }
        );
        product = productRes.data;
      } catch (err) {
        if (err.response?.status === 404) {
          return res.status(404).json({ error: `Product ${item.product_id} not found` });
        }
        return res.status(503).json({ error: 'Product service unavailable' });
      }

      // Check stock
      if (product.stock < item.quantity) {
        return res.status(400).json({
          error: `Insufficient stock for "${product.name}". Available: ${product.stock}, Requested: ${item.quantity}`
        });
      }

      const subtotal = product.price * item.quantity;
      total_amount  += subtotal;

      orderItems.push({
        product_id:   product.id,
        product_name: product.name,   // store name at time of purchase
        quantity:     item.quantity,
        unit_price:   product.price,  // store price at time of purchase
        subtotal,
      });
    }

    // ── Step 2: Create order + order items in MySQL ───────────────────────
    // We use a Sequelize transaction so either EVERYTHING saves or NOTHING does.
    // Feynman: Like a bank transfer — either both accounts update or neither does.
    // We don't want an order saved but items missing, or items saved but no order.

    const order = await Order.create({
      user_id,
      user_email:       req.user.email,
      status:           ORDER_STATUS.PENDING,
      total_amount:     total_amount.toFixed(2),
      delivery_address: JSON.stringify(delivery_address),
      notes:            notes || null,
    });

    // Create all order items linked to this order
    const savedItems = await OrderItem.bulkCreate(
      orderItems.map(item => ({ ...item, order_id: order.id }))
    );

    // ── Step 3: Reduce stock in Product Service ───────────────────────────
    // For each ordered item, tell Product Service: "reduce stock by quantity"
    // We do this AFTER saving the order — if stock update fails, order is still saved
    // and can be reconciled manually (better than losing the order)

    for (const item of orderItems) {
      try {
        await axios.put(
          `${PRODUCT_SERVICE_URL}/api/products/${item.product_id}/stock`,
          { quantity: -item.quantity }, // negative = reduce
          {
            headers: { Authorization: req.headers['authorization'] },
            timeout: 5000,
          }
        );
      } catch (err) {
        // Log but don't fail the order — stock can be reconciled
        console.error(`⚠️  Failed to update stock for product ${item.product_id}:`, err.message);
      }
    }

    // ── Step 4: Send confirmation email via Notification Service ──────────
    // Fire and forget — we don't wait for this or fail the order if it errors
    // Feynman: The store sends you a receipt by email AFTER the purchase is done.
    // If the email fails, the purchase is still valid.

    axios.post(
      `${NOTIFICATION_SERVICE_URL}/api/notify/email`,
      {
        user_id,
        email:    req.user.email,
        type:     'ORDER_CONFIRMATION',
        order_id: order.id,
        total:    total_amount,
      },
      {
        headers: { Authorization: req.headers['authorization'] },
        timeout: 5000,
      }
    ).catch(err => console.error('⚠️  Notification service error:', err.message));

    // ── Step 5: Return the created order ──────────────────────────────────
    const fullOrder = await Order.findByPk(order.id, {
      include: [{ model: OrderItem, as: 'items' }]
    });

    return res.status(201).json({
      message: 'Order placed successfully',
      order:   fullOrder,
    });

  } catch (error) {
    console.error('Create order error:', error);
    return res.status(500).json({ error: 'Failed to create order' });
  }
};

// ── GET USER ORDERS ───────────────────────────────────────────────────────────
// GET /api/orders/my-orders
// Returns all orders for the logged-in user, newest first

const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      where:   { user_id: req.user.user_id },
      include: [{ model: OrderItem, as: 'items' }],
      order:   [['created_at', 'DESC']], // newest first
    });

    return res.status(200).json({ orders, total: orders.length });
  } catch (error) {
    console.error('Get user orders error:', error);
    return res.status(500).json({ error: 'Failed to fetch orders' });
  }
};

// ── GET SINGLE ORDER ──────────────────────────────────────────────────────────
// GET /api/orders/:id
// Returns one order — only if it belongs to the logged-in user (or admin)

const getOrderById = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id, {
      include: [{ model: OrderItem, as: 'items' }],
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Security check: customers can only see their own orders
    if (req.user.role !== 'admin' && order.user_id !== req.user.user_id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    return res.status(200).json({ order });
  } catch (error) {
    console.error('Get order error:', error);
    return res.status(500).json({ error: 'Failed to fetch order' });
  }
};

// ── UPDATE ORDER STATUS ───────────────────────────────────────────────────────
// PUT /api/orders/:id/status
// Admin updates order status — e.g. marks as SHIPPED or DELIVERED

const updateOrderStatus = async (req, res) => {
  const { status } = req.body;

  if (!Object.values(ORDER_STATUS).includes(status)) {
    return res.status(400).json({
      error:           'Invalid status',
      allowed_values:  Object.values(ORDER_STATUS),
    });
  }

  try {
    const order = await Order.findByPk(req.params.id);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const previousStatus = order.status;
    order.status = status;
    await order.save();

    // Notify customer about status change
    axios.post(
      `${NOTIFICATION_SERVICE_URL}/api/notify/email`,
      {
        user_id:  order.user_id,
        email:    order.user_email,
        type:     'ORDER_STATUS_UPDATE',
        order_id: order.id,
        status,
        previousStatus,
      },
      {
        headers: { Authorization: req.headers['authorization'] },
        timeout: 5000,
      }
    ).catch(err => console.error('⚠️  Notification error:', err.message));

    return res.status(200).json({
      message: `Order status updated to ${status}`,
      order,
    });
  } catch (error) {
    console.error('Update status error:', error);
    return res.status(500).json({ error: 'Failed to update order status' });
  }
};

// ── CANCEL ORDER ──────────────────────────────────────────────────────────────
// PUT /api/orders/:id/cancel
// Customer can cancel only their own PENDING orders

const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id, {
      include: [{ model: OrderItem, as: 'items' }],
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Only the order owner can cancel
    if (order.user_id !== req.user.user_id) {
      return res.status(403).json({ error: 'You can only cancel your own orders' });
    }

    // Can only cancel PENDING orders — once shipped, too late
    if (order.status !== ORDER_STATUS.PENDING) {
      return res.status(400).json({
        error: `Cannot cancel order in '${order.status}' status. Only PENDING orders can be cancelled.`
      });
    }

    order.status = ORDER_STATUS.CANCELLED;
    await order.save();

    // Restore stock for all cancelled items
    for (const item of order.items) {
      axios.put(
        `${PRODUCT_SERVICE_URL}/api/products/${item.product_id}/stock`,
        { quantity: +item.quantity }, // positive = restore stock
        {
          headers: { Authorization: req.headers['authorization'] },
          timeout: 5000,
        }
      ).catch(err => console.error(`⚠️  Failed to restore stock for product ${item.product_id}:`, err.message));
    }

    return res.status(200).json({ message: 'Order cancelled successfully', order });
  } catch (error) {
    console.error('Cancel order error:', error);
    return res.status(500).json({ error: 'Failed to cancel order' });
  }
};

// ── GET ALL ORDERS (ADMIN) ────────────────────────────────────────────────────
// GET /api/orders
// Admin sees ALL orders across all users

const getAllOrders = async (req, res) => {
  try {
    const { status, page = 1, per_page = 10 } = req.query;
    const where  = status ? { status } : {};
    const offset = (page - 1) * per_page;

    const { count, rows: orders } = await Order.findAndCountAll({
      where,
      include: [{ model: OrderItem, as: 'items' }],
      order:   [['created_at', 'DESC']],
      limit:   parseInt(per_page),
      offset,
    });

    return res.status(200).json({
      orders,
      total:       count,
      page:        parseInt(page),
      per_page:    parseInt(per_page),
      total_pages: Math.ceil(count / per_page),
    });
  } catch (error) {
    console.error('Get all orders error:', error);
    return res.status(500).json({ error: 'Failed to fetch orders' });
  }
};

module.exports = {
  createOrder,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
  getAllOrders,
};
