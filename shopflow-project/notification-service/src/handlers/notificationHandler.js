// src/handlers/notificationHandler.js
//
// What this file does:
// All notification logic — send email, get logs, get user notifications.
//
// Feynman version:
// This is the POSTAL DEPARTMENT of our company.
// - sendNotification()    → someone gives us a letter to deliver
// - getNotificationLogs() → admin checks delivery records
// - getUserNotifications()→ customer checks their notifications
//
// The most important thing this service does:
//   1. Receive a notification request (type + data)
//   2. Pick the right email template
//   3. Send the email
//   4. Log the result to MySQL (sent or failed)
//
// Other services call this one — they don't care HOW the email is sent.
// They just say "notify user X about order Y" and walk away.
// This service figures out the rest.

const { sendEmail }   = require('../config/mailer');
const { getTemplate } = require('../templates/emailTemplates');
const { Notification, NOTIFICATION_TYPES } = require('../models/notification');


// ── SEND NOTIFICATION ─────────────────────────────────────────────────────────
// POST /api/notify/email
//
// Called by: Order Service, Payment Service (fire-and-forget)
//
// What they send:
// {
//   user_id: 5,
//   email: "customer@example.com",
//   type: "ORDER_CONFIRMATION",
//   // any extra data needed by the template:
//   order_id: 42,
//   total: 12500,
//   name: "Ravi Kumar"
// }

const sendNotification = async (req, res) => {
  const { user_id, email, type, name, ...metadata } = req.body;

  // ── Validation ────────────────────────────────────────────────────────
  if (!user_id || !email || !type) {
    return res.status(400).json({ error: 'user_id, email, and type are required' });
  }

  if (!Object.values(NOTIFICATION_TYPES).includes(type)) {
    return res.status(400).json({
      error:   'Invalid notification type',
      allowed: Object.values(NOTIFICATION_TYPES),
    });
  }

  // ── Get the right email template ──────────────────────────────────────
  // Feynman: Pick the right letter template from the filing cabinet.
  // ORDER_CONFIRMATION → uses orderConfirmation template
  // ORDER_STATUS_UPDATE → uses orderStatusUpdate template
  // etc.
  const template = getTemplate(type, { name, ...metadata });

  // ── Send the email ────────────────────────────────────────────────────
  const result = await sendEmail({
    to:      email,
    subject: template.subject,
    html:    template.html,
    text:    template.text,
  });

  // ── Log to MySQL ──────────────────────────────────────────────────────
  // Whether email succeeded or failed, we record it.
  // This gives us full visibility: "did this customer actually receive the email?"
  const log = await Notification.create({
    user_id,
    email,
    type,
    subject:       template.subject,
    metadata:      { name, ...metadata },
    status:        result.success ? 'SENT' : 'FAILED',
    error_message: result.success ? null : result.error,
  });

  if (result.success) {
    return res.status(200).json({
      message:         'Notification sent successfully',
      notification_id: log.id,
      message_id:      result.messageId,
    });
  } else {
    // Return 200 anyway — calling service doesn't need to retry
    // The failure is logged and can be investigated/retried manually
    return res.status(200).json({
      message:         'Notification queued but email delivery failed — logged for retry',
      notification_id: log.id,
      error:           result.error,
    });
  }
};


// ── GET USER NOTIFICATIONS ────────────────────────────────────────────────────
// GET /api/notifications/my
// Returns all notifications sent to the logged-in user

const getUserNotifications = async (req, res) => {
  try {
    const notifications = await Notification.findAll({
      where:  { user_id: req.user.user_id },
      order:  [['created_at', 'DESC']],
      limit:  50,
    });

    return res.status(200).json({ notifications, total: notifications.length });
  } catch (error) {
    console.error('Get notifications error:', error);
    return res.status(500).json({ error: 'Failed to fetch notifications' });
  }
};


// ── GET ALL NOTIFICATION LOGS (ADMIN) ─────────────────────────────────────────
// GET /api/notifications?status=FAILED&type=ORDER_CONFIRMATION&page=1
// Admin view — full log of every notification with filters

const getAllNotifications = async (req, res) => {
  try {
    const { status, type, page = 1, per_page = 20 } = req.query;
    const where  = {};
    if (status) where.status = status;
    if (type)   where.type   = type;

    const offset = (page - 1) * per_page;
    const { count, rows } = await Notification.findAndCountAll({
      where,
      order:  [['created_at', 'DESC']],
      limit:  parseInt(per_page),
      offset,
    });

    return res.status(200).json({
      notifications: rows,
      total:         count,
      page:          parseInt(page),
      per_page:      parseInt(per_page),
      total_pages:   Math.ceil(count / per_page),
    });
  } catch (error) {
    console.error('Get all notifications error:', error);
    return res.status(500).json({ error: 'Failed to fetch notifications' });
  }
};


// ── GET NOTIFICATION TYPES ────────────────────────────────────────────────────
// GET /api/notifications/types
// Returns list of all valid notification types (useful for frontend/admin)

const getNotificationTypes = async (req, res) => {
  return res.status(200).json({
    types: Object.values(NOTIFICATION_TYPES),
  });
};

module.exports = {
  sendNotification,
  getUserNotifications,
  getAllNotifications,
  getNotificationTypes,
};
