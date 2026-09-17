// src/models/order.js
//
// What this file does:
// Defines the Order and OrderItem tables in MySQL using Sequelize.
//
// Feynman version:
// When you buy from an online store, you get one ORDER (the receipt)
// that contains multiple ORDER ITEMS (each product you bought).
//
// Example:
//   Order #1042  →  user_id: 5,  total: ₹12,500,  status: CONFIRMED
//     ├── OrderItem: iPhone case  × 1  @ ₹500
//     ├── OrderItem: Headphones   × 1  @ ₹8,000
//     └── OrderItem: USB Cable    × 2  @ ₹2,000 each
//
// That's TWO tables:
//   orders      → one row per order (the bill)
//   order_items → many rows per order (each line item on the bill)
//
// This is called a "one-to-many" relationship:
// One order HAS MANY order items.

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

// ── ORDER STATUS ─────────────────────────────────────────────────────────────
// An order goes through these stages in sequence:
//   PENDING → CONFIRMED → SHIPPED → DELIVERED
// Or if something goes wrong:
//   PENDING → CANCELLED
//   CONFIRMED → REFUNDED
const ORDER_STATUS = {
  PENDING:    'PENDING',    // just placed, waiting for payment
  CONFIRMED:  'CONFIRMED',  // payment done, being prepared
  SHIPPED:    'SHIPPED',    // on the way
  DELIVERED:  'DELIVERED',  // received by customer
  CANCELLED:  'CANCELLED',  // cancelled before shipping
  REFUNDED:   'REFUNDED',   // money returned
};

// ── ORDER MODEL ──────────────────────────────────────────────────────────────
const Order = sequelize.define('Order', {
  id: {
    type:          DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey:    true,
  },
  user_id: {
    type:      DataTypes.INTEGER,
    allowNull: false,
    comment:   'ID of the user who placed the order (from auth_db)',
    // NOTE: No foreign key to auth_db — different databases!
    // Microservices don't share databases. We just store the user_id as a number.
  },
  user_email: {
    type:      DataTypes.STRING,
    allowNull: true,
    comment:   'Customer email at time of order — stored here so Notification ' +
               'Service can be reached later (e.g. on admin status update) ' +
               'without Order Service needing to call Auth Service to look it up.',
  },
  status: {
    type:         DataTypes.ENUM(...Object.values(ORDER_STATUS)),
    defaultValue: ORDER_STATUS.PENDING,
    allowNull:    false,
  },
  total_amount: {
    type:      DataTypes.DECIMAL(10, 2), // up to 99,999,999.99
    allowNull: false,
    comment:   'Total cost of all items in this order',
  },
  delivery_address: {
    type:      DataTypes.TEXT,
    allowNull: false,
    comment:   'Full delivery address as a JSON string',
  },
  payment_id: {
    type:      DataTypes.STRING,
    allowNull: true,
    comment:   'Payment transaction ID from Payment Service (set after payment)',
  },
  notes: {
    type:      DataTypes.TEXT,
    allowNull: true,
    comment:   'Optional customer notes — e.g. "Leave at door"',
  },
}, {
  tableName:  'orders',
  timestamps: true,          // auto adds createdAt and updatedAt columns
  underscored: true,         // use snake_case column names in MySQL
});

// ── ORDER ITEM MODEL ─────────────────────────────────────────────────────────
const OrderItem = sequelize.define('OrderItem', {
  id: {
    type:          DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey:    true,
  },
  order_id: {
    type:       DataTypes.INTEGER,
    allowNull:  false,
    references: { model: Order, key: 'id' }, // foreign key to orders table
  },
  product_id: {
    type:      DataTypes.INTEGER,
    allowNull: false,
    comment:   'ID of the product (from product_db) — no cross-DB FK, just stored as number',
  },
  product_name: {
    type:      DataTypes.STRING,
    allowNull: false,
    comment:   'Product name at time of purchase — stored here in case product is deleted later',
  },
  quantity: {
    type:         DataTypes.INTEGER,
    allowNull:    false,
    defaultValue: 1,
  },
  unit_price: {
    type:      DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment:   'Price per unit at time of purchase — stored here in case price changes later',
  },
  subtotal: {
    type:      DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment:   'quantity × unit_price',
  },
}, {
  tableName:  'order_items',
  timestamps: true,
  underscored: true,
});

// ── RELATIONSHIPS ─────────────────────────────────────────────────────────────
// One Order has Many OrderItems
// One OrderItem belongs to One Order
Order.hasMany(OrderItem,    { foreignKey: 'order_id', as: 'items' });
OrderItem.belongsTo(Order,  { foreignKey: 'order_id' });

module.exports = { Order, OrderItem, ORDER_STATUS };
