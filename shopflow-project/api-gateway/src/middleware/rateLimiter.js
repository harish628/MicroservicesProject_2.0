// src/middleware/rateLimiter.js
//
// What this file does:
// Limits how many requests one IP address can make in a time window.
// Protects all our services from being overwhelmed by too many requests
// (accidental bugs in frontend code, or deliberate abuse/attacks).
//
// Feynman version:
// Imagine a popular food stall with one cook. If 1000 people order at once,
// the cook gets overwhelmed and everyone's food is delayed or burnt.
// A rate limiter is like a ticket system: "Only 100 orders per person
// every 15 minutes." This keeps the kitchen running smoothly for everyone.
//
// Why put this at the GATEWAY level and not in each service?
// Because the Gateway is the single entry point. If we limited rates
// inside each service, a malicious user could still spam 5 services
// at 100 requests each = 500 requests. At the Gateway, ALL traffic
// passes through ONE checkpoint — so the limit is truly enforced.

const rateLimit = require('express-rate-limit');
require('dotenv').config();

const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max:      parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,         // 100 requests per window per IP

  // Custom response when limit is exceeded
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too many requests. Please try again later.',
      retryAfter: `${Math.ceil((parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000) / 60000)} minutes`,
    });
  },

  standardHeaders: true,  // return rate limit info in RateLimit-* headers
  legacyHeaders:   false, // disable the deprecated X-RateLimit-* headers
});

module.exports = limiter;
