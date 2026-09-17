// src/middleware/auth.js
//
// What this file does:
// Express middleware that verifies JWT tokens by calling the Auth Service.
// Attached to protected routes so unauthorized requests never reach handlers.
//
// Feynman version:
// Imagine a VIP event. At the entrance there's a bouncer (this middleware).
// Before you enter, the bouncer calls the organizer (Auth Service):
// "Is this person on the guest list?"
// If yes → you're let in, and the bouncer writes your name on a sticky note
// attached to your jacket (req.user) so everyone inside knows who you are.
// If no → you're turned away right at the door.

const axios = require('axios');
require('dotenv').config();

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:8001';

// verifyToken — checks if the request has a valid JWT
// Attaches user info to req.user for downstream handlers
const verifyToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    return res.status(401).json({ error: 'Authorization header required' });
  }

  try {
    // Call Auth Service to verify the token
    const response = await axios.get(`${AUTH_SERVICE_URL}/api/auth/verify-token`, {
      headers: { Authorization: authHeader },
      timeout: 5000, // 5 second timeout
    });

    // Token is valid — attach user info to the request object
    // Now any handler can read req.user.user_id, req.user.role, etc.
    req.user = response.data;
    next(); // pass control to the next middleware or handler

  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({ error: 'Auth service unavailable' });
    }
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

// adminOnly — same as verifyToken but also checks for admin role
const adminOnly = async (req, res, next) => {
  await verifyToken(req, res, async () => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    next();
  });
};

module.exports = { verifyToken, adminOnly };
