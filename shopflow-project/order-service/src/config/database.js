// src/config/database.js
//
// What this file does:
// Opens the MySQL connection using Sequelize (Node.js ORM)
// and exports it so every other file can use it.
//
// Feynman version:
// Think of Sequelize like a translator between Node.js and MySQL.
// You speak JavaScript → Sequelize translates → MySQL understands.
// This file is where the translator "wakes up" and connects.
//
// Why Sequelize and not raw SQL?
// Raw SQL: "SELECT * FROM orders WHERE user_id = 5 AND status = 'PENDING'"
// Sequelize: Order.findAll({ where: { user_id: 5, status: 'PENDING' } })
// Same result, but Sequelize is safer (prevents SQL injection) and more readable.

const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,      // database name: order_db
  process.env.DB_USER,      // username: root
  process.env.DB_PASSWORD,  // password
  {
    host:    process.env.DB_HOST,
    port:    process.env.DB_PORT,
    dialect: 'mysql',        // tell Sequelize we're using MySQL
    logging: false,          // set to console.log to see SQL queries in terminal
    pool: {
      max:     5,    // maximum 5 simultaneous connections
      min:     0,    // minimum 0 (close idle connections)
      acquire: 30000, // wait max 30s to get a connection
      idle:    10000, // close connection after 10s idle
    },
  }
);

// Test the connection
// connectDB() is called once at startup in index.js
const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ MySQL connected successfully (order_db)');

    // sync() creates tables if they don't exist
    // { alter: true } updates columns if model changes — safe for development
    // In production, use proper migrations instead
    await sequelize.sync({ alter: true });
    console.log('✅ Database tables synced');
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1); // crash hard if DB is down — no point running without it
  }
};

module.exports = { sequelize, connectDB };
