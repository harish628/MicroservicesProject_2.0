// src/config/mailer.js
//
// What this file does:
// Sets up the email sending capability using Nodemailer.
//
// Feynman version:
// Think of Nodemailer as a postal worker.
// You hand him a letter (email content) and tell him:
//   "Deliver this to john@example.com"
// He knows HOW to deliver it (via SMTP protocol to Gmail/SendGrid/etc.)
// You just write the letter — he handles the delivery.
//
// SMTP (Simple Mail Transfer Protocol) is the postal system of the internet.
// Every email you've ever sent went through SMTP somewhere.
//
// In development: EMAIL_ENABLED=false → emails are printed to console instead
// In production:  EMAIL_ENABLED=true  → real emails sent via Gmail/SendGrid

const nodemailer = require('nodemailer');
require('dotenv').config();

let transporter;

const EMAIL_ENABLED = process.env.EMAIL_ENABLED === 'true';

if (EMAIL_ENABLED) {
  // Real SMTP transporter — connects to Gmail, SendGrid, etc.
  transporter = nodemailer.createTransporter({
    host:   process.env.EMAIL_HOST,   // smtp.gmail.com
    port:   parseInt(process.env.EMAIL_PORT), // 587
    secure: false,                    // true for port 465, false for 587
    auth: {
      user: process.env.EMAIL_USER,   // your-email@gmail.com
      pass: process.env.EMAIL_PASS,   // app password from Google Account settings
    },
  });

  console.log('📧 Email transporter configured (SMTP)');
} else {
  // Mock transporter — logs emails to console instead of sending
  // Perfect for development and testing
  transporter = {
    sendMail: async (options) => {
      console.log('\n📧 [MOCK EMAIL — not actually sent]');
      console.log(`   To:      ${options.to}`);
      console.log(`   Subject: ${options.subject}`);
      console.log(`   Preview: ${options.text?.substring(0, 100)}...`);
      console.log('─'.repeat(50));
      return { messageId: `mock-${Date.now()}` };
    }
  };

  console.log('📧 Email transporter configured (MOCK — set EMAIL_ENABLED=true to send real emails)');
}


// sendEmail() is the function all handlers call
// It wraps nodemailer's sendMail with consistent error handling
const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const result = await transporter.sendMail({
      from:    process.env.EMAIL_FROM || 'ShopFlow <noreply@shopflow.com>',
      to,
      subject,
      html,    // rich HTML email
      text,    // plain text fallback (for email clients that don't render HTML)
    });

    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('❌ Email send failed:', error.message);
    return { success: false, error: error.message };
  }
};

module.exports = { sendEmail };
