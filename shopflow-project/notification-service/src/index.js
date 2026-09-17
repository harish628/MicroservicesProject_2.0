// src/index.js — Entry point for Notification Service

const express = require('express');
const cors    = require('cors');
require('dotenv').config();

const { connectDB }         = require('./config/database');
const notificationRoutes    = require('./routes/notificationRoutes');

const app  = express();
const PORT = process.env.PORT || 8005;

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'notification-service', port: PORT });
});

// Register all notification routes
app.use('/api', notificationRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start
const start = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`🚀 Notification Service running on port ${PORT}`);
    console.log(`📋 Routes:`);
    console.log(`   POST  /api/notify/email           [any service] Send notification`);
    console.log(`   GET   /api/notifications/my       [customer]    My notifications`);
    console.log(`   GET   /api/notifications           [admin]       All logs`);
    console.log(`   GET   /api/notifications/types     [any]         Valid types`);
    console.log(`   GET   /health`);
  });
};

start();
