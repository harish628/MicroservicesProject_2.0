// src/models/notification.js
//
// What this file does:
// Defines two tables:
//   notifications → log of every notification ever sent
//   templates     → reusable email templates per notification type
//
// Feynman version:
// notifications table = the POST OFFICE'S DELIVERY LOG
//   Every package (email) they sent, to whom, when, did it arrive?
//   This is our audit trail — we always know what was sent.
//
// templates table = the LETTER TEMPLATES in a corporate office
//   "Dear {name}, Your order #{order_id} has been placed..."
//   Instead of writing each email from scratch, we have templates.
//   We just fill in the blanks.

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

// ── NOTIFICATION TYPES ────────────────────────────────────────────────────────
// Every type of notification our system sends
const NOTIFICATION_TYPES = {
  ORDER_CONFIRMATION:  'ORDER_CONFIRMATION',   // order placed successfully
  ORDER_STATUS_UPDATE: 'ORDER_STATUS_UPDATE',  // order shipped, delivered etc.
  PAYMENT_SUCCESS:     'PAYMENT_SUCCESS',      // payment confirmed
  PAYMENT_FAILED:      'PAYMENT_FAILED',       // payment declined
  ORDER_CANCELLED:     'ORDER_CANCELLED',      // order cancelled
  REFUND_PROCESSED:    'REFUND_PROCESSED',     // money returned
  WELCOME:             'WELCOME',              // new user registration
};

// ── NOTIFICATION LOG ──────────────────────────────────────────────────────────
const Notification = sequelize.define('Notification', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type:      DataTypes.INTEGER,
    allowNull: false,
    comment:   'Who received this notification',
  },
  email: {
    type:      DataTypes.STRING,
    allowNull: false,
    comment:   'Email address the notification was sent to',
  },
  type: {
    type:      DataTypes.ENUM(...Object.values(NOTIFICATION_TYPES)),
    allowNull: false,
  },
  subject: {
    type:      DataTypes.STRING,
    allowNull: false,
  },
  // Store metadata about the notification as JSON
  // e.g. { order_id: 42, total: 12500, status: 'SHIPPED' }
  metadata: {
    type:      DataTypes.JSON,
    allowNull: true,
  },
  status: {
    type:         DataTypes.ENUM('SENT', 'FAILED'),
    defaultValue: 'SENT',
  },
  error_message: {
    type:      DataTypes.TEXT,
    allowNull: true,
    comment:   'If status=FAILED, what went wrong',
  },
}, {
  tableName:   'notifications',
  timestamps:  true,
  underscored: true,
});

// ── EMAIL TEMPLATES ───────────────────────────────────────────────────────────
// Stores HTML email templates for each notification type
// Allows non-developers to update email content via admin panel (future feature)
const Template = sequelize.define('Template', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  type: {
    type:      DataTypes.ENUM(...Object.values(NOTIFICATION_TYPES)),
    allowNull: false,
    unique:    true,
    comment:   'One template per notification type',
  },
  subject: {
    type:      DataTypes.STRING,
    allowNull: false,
  },
  html_body: {
    type:      DataTypes.TEXT('long'),
    allowNull: false,
    comment:   'HTML email template with {{variable}} placeholders',
  },
  text_body: {
    type:      DataTypes.TEXT,
    allowNull: true,
    comment:   'Plain text version for email clients that cannot render HTML',
  },
}, {
  tableName:   'templates',
  timestamps:  true,
  underscored: true,
});

module.exports = { Notification, Template, NOTIFICATION_TYPES };
