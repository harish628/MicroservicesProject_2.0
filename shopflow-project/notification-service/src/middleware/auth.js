// src/middleware/auth.js — same pattern as Order Service
const axios = require('axios');
require('dotenv').config();

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:8001';

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ error: 'Authorization header required' });

  try {
    const response = await axios.get(`${AUTH_SERVICE_URL}/api/auth/verify-token`, {
      headers: { Authorization: authHeader },
      timeout: 5000,
    });
    req.user = response.data;
    next();
  } catch (error) {
    if (error.code === 'ECONNREFUSED') return res.status(503).json({ error: 'Auth service unavailable' });
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

const adminOnly = async (req, res, next) => {
  await verifyToken(req, res, () => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
    next();
  });
};

module.exports = { verifyToken, adminOnly };
