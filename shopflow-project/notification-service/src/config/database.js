// src/config/database.js
//
// Same Sequelize setup as Order Service — connect to MySQL, sync tables.
// notification_db stores two things:
//   1. notifications → every email/alert we've ever sent (audit log)
//   2. templates     → reusable email templates (subject + body per notification type)

const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host:    process.env.DB_HOST,
    port:    process.env.DB_PORT,
    dialect: 'mysql',
    logging: false,
  }
);

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ MySQL connected successfully (notification_db)');
    await sequelize.sync({ alter: true });
    console.log('✅ Notification tables synced');
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };
