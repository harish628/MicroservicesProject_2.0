// src/routes/notificationRoutes.js
//
// Routes for the Notification Service.
// Note: sendNotification is called by OTHER SERVICES (Order, Payment)
// using their own service tokens — so it uses verifyToken not adminOnly.

const express = require('express');
const router  = express.Router();
const { verifyToken, adminOnly } = require('../middleware/auth');
const {
  sendNotification,
  getUserNotifications,
  getAllNotifications,
  getNotificationTypes,
} = require('../handlers/notificationHandler');

// Called by other services to send a notification
// Any valid token (service or customer) can trigger a notification
router.post('/notify/email',         verifyToken, sendNotification);

// Customer: see their own notification history
router.get('/notifications/my',      verifyToken, getUserNotifications);

// Admin: see all notifications with filters
router.get('/notifications',         adminOnly,   getAllNotifications);

// Public: list all valid notification types
router.get('/notifications/types',   verifyToken, getNotificationTypes);

module.exports = router;
