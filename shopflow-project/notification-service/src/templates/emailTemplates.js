// src/templates/emailTemplates.js
//
// What this file does:
// Contains the HTML templates for every email type we send.
// Each template is a function that takes data and returns { subject, html, text }.
//
// Feynman version:
// Think of these like Mad Libs — those fill-in-the-blank story games.
// "Dear [NAME], your order #[ORDER_ID] worth ₹[TOTAL] has been [STATUS]!"
// We pre-write the story and just fill in the blanks at send time.
//
// Why HTML emails?
// Plain text looks like a 1990s terminal. HTML emails look professional —
// colors, logos, buttons, proper formatting. Every marketing email you get
// is HTML. We keep it simple but clean.

const baseStyle = `
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  max-width: 600px;
  margin: 0 auto;
  color: #1a1a2e;
`;

const header = (title) => `
  <div style="background:#1a1a2e; padding:32px; text-align:center;">
    <h1 style="color:white; margin:0; font-size:28px;">🛒 ShopFlow</h1>
    <p style="color:#aaa; margin:8px 0 0;">${title}</p>
  </div>
`;

const footer = () => `
  <div style="background:#f7f5f0; padding:24px; text-align:center; margin-top:32px;">
    <p style="color:#999; font-size:13px; margin:0;">
      © 2024 ShopFlow · You're receiving this because you have an account with us.<br/>
      Questions? Contact support@shopflow.com
    </p>
  </div>
`;

const button = (text, color = '#ff4d00') => `
  <div style="text-align:center; margin:24px 0;">
    <a href="#" style="background:${color}; color:white; padding:14px 32px;
       border-radius:8px; text-decoration:none; font-weight:600; font-size:16px;">
      ${text}
    </a>
  </div>
`;


// ── ORDER CONFIRMATION ────────────────────────────────────────────────────────
const orderConfirmation = ({ name, order_id, total, items = [] }) => ({
  subject: `✅ Order #${order_id} Confirmed — ShopFlow`,
  html: `
    <div style="${baseStyle}">
      ${header('Order Confirmed!')}
      <div style="padding:32px;">
        <p>Hi <strong>${name || 'there'}</strong>,</p>
        <p>Your order has been placed successfully! Here's your summary:</p>

        <div style="background:#f7f5f0; border-radius:12px; padding:20px; margin:20px 0;">
          <p style="margin:0 0 8px;"><strong>Order ID:</strong> #${order_id}</p>
          <p style="margin:0 0 8px;"><strong>Total Amount:</strong> ₹${Number(total).toLocaleString('en-IN')}</p>
          <p style="margin:0;"><strong>Status:</strong> <span style="color:#2ecc71;">Confirmed ✅</span></p>
        </div>

        <p>We'll notify you when your order ships. Estimated delivery: 3–5 business days.</p>
        ${button('Track Your Order')}
      </div>
      ${footer()}
    </div>
  `,
  text: `Hi ${name || 'there'}, your order #${order_id} has been confirmed. Total: ₹${total}. We'll notify you when it ships.`,
});


// ── ORDER STATUS UPDATE ───────────────────────────────────────────────────────
const orderStatusUpdate = ({ name, order_id, status }) => {
  const statusInfo = {
    CONFIRMED:  { emoji: '✅', message: 'Your order is confirmed and being prepared.',    color: '#2ecc71' },
    SHIPPED:    { emoji: '🚚', message: 'Your order is on its way! Expected in 2–3 days.', color: '#3498db' },
    DELIVERED:  { emoji: '📦', message: 'Your order has been delivered. Enjoy!',           color: '#27ae60' },
    CANCELLED:  { emoji: '❌', message: 'Your order has been cancelled.',                  color: '#e74c3c' },
    REFUNDED:   { emoji: '💰', message: 'Your refund has been processed (3–5 business days).', color: '#9b59b6' },
  };

  const info = statusInfo[status] || { emoji: '📋', message: `Order status: ${status}`, color: '#666' };

  return {
    subject: `${info.emoji} Order #${order_id} — ${status} — ShopFlow`,
    html: `
      <div style="${baseStyle}">
        ${header('Order Update')}
        <div style="padding:32px;">
          <p>Hi <strong>${name || 'there'}</strong>,</p>

          <div style="border-left:4px solid ${info.color}; padding:16px 20px;
               background:#f9f9f9; border-radius:0 8px 8px 0; margin:20px 0;">
            <p style="font-size:24px; margin:0 0 8px;">${info.emoji}</p>
            <p style="font-size:18px; font-weight:600; color:${info.color}; margin:0 0 8px;">${status}</p>
            <p style="margin:0; color:#555;">${info.message}</p>
          </div>

          <p><strong>Order ID:</strong> #${order_id}</p>
          ${button('View Order Details')}
        </div>
        ${footer()}
      </div>
    `,
    text: `Hi ${name || 'there'}, your order #${order_id} status is now: ${status}. ${info.message}`,
  };
};


// ── PAYMENT SUCCESS ───────────────────────────────────────────────────────────
const paymentSuccess = ({ name, order_id, amount, transaction_id, method }) => ({
  subject: `💳 Payment Confirmed — ₹${Number(amount).toLocaleString('en-IN')} — ShopFlow`,
  html: `
    <div style="${baseStyle}">
      ${header('Payment Successful')}
      <div style="padding:32px;">
        <p>Hi <strong>${name || 'there'}</strong>,</p>
        <p>We've received your payment. Here are the details:</p>

        <div style="background:#f0fff4; border:1px solid #2ecc71; border-radius:12px; padding:20px; margin:20px 0;">
          <p style="margin:0 0 8px;"><strong>Transaction ID:</strong> ${transaction_id}</p>
          <p style="margin:0 0 8px;"><strong>Order ID:</strong> #${order_id}</p>
          <p style="margin:0 0 8px;"><strong>Amount Paid:</strong> ₹${Number(amount).toLocaleString('en-IN')}</p>
          <p style="margin:0;"><strong>Payment Method:</strong> ${method}</p>
        </div>

        ${button('View Order', '#2ecc71')}
      </div>
      ${footer()}
    </div>
  `,
  text: `Payment of ₹${amount} confirmed for order #${order_id}. Transaction ID: ${transaction_id}.`,
});


// ── PAYMENT FAILED ────────────────────────────────────────────────────────────
const paymentFailed = ({ name, order_id, reason }) => ({
  subject: `❌ Payment Failed — Order #${order_id} — ShopFlow`,
  html: `
    <div style="${baseStyle}">
      ${header('Payment Failed')}
      <div style="padding:32px;">
        <p>Hi <strong>${name || 'there'}</strong>,</p>
        <p>Unfortunately, we couldn't process your payment for order #${order_id}.</p>

        <div style="background:#fff5f5; border:1px solid #e74c3c; border-radius:12px; padding:20px; margin:20px 0;">
          <p style="color:#e74c3c; font-weight:600; margin:0 0 8px;">❌ Reason: ${reason || 'Payment declined'}</p>
          <p style="margin:0; color:#555;">Please try again with a different payment method or contact your bank.</p>
        </div>

        ${button('Try Again', '#e74c3c')}
      </div>
      ${footer()}
    </div>
  `,
  text: `Payment failed for order #${order_id}. Reason: ${reason}. Please try again.`,
});


// ── WELCOME EMAIL ─────────────────────────────────────────────────────────────
const welcome = ({ name, email }) => ({
  subject: `👋 Welcome to ShopFlow, ${name}!`,
  html: `
    <div style="${baseStyle}">
      ${header('Welcome to ShopFlow!')}
      <div style="padding:32px; text-align:center;">
        <p style="font-size:20px;">Hi <strong>${name}</strong>! 🎉</p>
        <p>Your account has been created successfully with <strong>${email}</strong>.</p>
        <p>Start exploring thousands of products and enjoy seamless shopping.</p>
        ${button('Start Shopping')}
        <p style="color:#999; font-size:13px; margin-top:24px;">
          Need help? We're always here at support@shopflow.com
        </p>
      </div>
      ${footer()}
    </div>
  `,
  text: `Welcome to ShopFlow, ${name}! Your account is ready. Start shopping at shopflow.com`,
});


// ── TEMPLATE ROUTER ───────────────────────────────────────────────────────────
// Given a notification type and data, returns the right template
const getTemplate = (type, data) => {
  const templates = {
    ORDER_CONFIRMATION:  orderConfirmation,
    ORDER_STATUS_UPDATE: orderStatusUpdate,
    PAYMENT_SUCCESS:     paymentSuccess,
    PAYMENT_FAILED:      paymentFailed,
    WELCOME:             welcome,
  };

  const templateFn = templates[type];
  if (!templateFn) {
    return {
      subject: `ShopFlow Notification`,
      html:    `<p>You have a new notification from ShopFlow.</p>`,
      text:    `You have a new notification from ShopFlow.`,
    };
  }

  return templateFn(data);
};

module.exports = { getTemplate };
