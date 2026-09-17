// src/middleware/logger.js
//
// What this file does:
// Logs every request that passes through the Gateway — method, path, status, time taken.
//
// Feynman version:
// Think of this like the front desk's visitor logbook.
// "10:32am — Someone asked for /api/products — took 45ms — got 200 OK"
// "10:33am — Someone asked for /api/orders — took 230ms — got 500 Error"
// This logbook is invaluable for debugging. If customers report something is slow
// or broken, we check this log FIRST before looking anywhere else.

const requestLogger = (req, res, next) => {
  const start = Date.now();

  // res.on('finish') fires AFTER the response has been sent
  // This lets us measure exactly how long the request took
  res.on('finish', () => {
    const duration = Date.now() - start;
    const statusColor = res.statusCode >= 500 ? '🔴' : res.statusCode >= 400 ? '🟡' : '🟢';

    console.log(
      `${statusColor} ${req.method} ${req.originalUrl} → ${res.statusCode} (${duration}ms)`
    );
  });

  next();
};

module.exports = requestLogger;
