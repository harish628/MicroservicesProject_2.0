// src/routes/healthRoutes.js
//
// What this file does:
// Provides health check endpoints — both for the Gateway itself,
// and an AGGREGATE check that pings every downstream service.
//
// Feynman version:
// Think of this like a building manager doing rounds.
// "Is the lobby okay? Yes. Is the elevator okay? Yes. Is the parking gate okay? No, it's stuck."
// The /health/all endpoint does exactly this — checks every department
// and gives you ONE report on the whole building's status.
//
// This is incredibly useful for:
//   - Quickly diagnosing "why isn't anything working?" during development
//   - Future Kubernetes health probes
//   - A simple status page for the team

const express = require('express');
const axios   = require('axios');
const router  = express.Router();
const SERVICES = require('../config/services');

// GET /health — Gateway's own health
router.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'api-gateway', port: process.env.PORT || 8000 });
});

// GET /health/all — checks every downstream service and reports back
router.get('/health/all', async (req, res) => {
  const results = {};

  // Ping all services IN PARALLEL using Promise.all
  // Feynman: instead of calling each department one by one (slow),
  // we call all of them AT THE SAME TIME and wait for everyone to answer.
  await Promise.all(
    Object.entries(SERVICES).map(async ([key, service]) => {
      try {
        const start    = Date.now();
        const response  = await axios.get(`${service.url}/health`, { timeout: 3000 });
        const duration = Date.now() - start;

        results[key] = {
          name:        service.name,
          status:      'UP',
          responseTime: `${duration}ms`,
          url:         service.url,
        };
      } catch (error) {
        results[key] = {
          name:   service.name,
          status: 'DOWN',
          error:  error.code === 'ECONNREFUSED' ? 'Connection refused — service not running' : error.message,
          url:    service.url,
        };
      }
    })
  );

  // Overall status: UP only if ALL services are UP
  const allUp = Object.values(results).every(s => s.status === 'UP');

  res.status(allUp ? 200 : 503).json({
    gateway_status: allUp ? 'ALL_SYSTEMS_OPERATIONAL' : 'SOME_SERVICES_DOWN',
    services:       results,
    checked_at:     new Date().toISOString(),
  });
});

module.exports = router;
