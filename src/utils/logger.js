const winston = require('winston');
const { createLogger, format, transports } = require('winston');
const MongoDB = require('winston-mongodb').MongoDB;
require('dotenv').config();

const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp(),
    format.simple(),
    format.printf(info => {
      const { timestamp, level, message, user } = info;
      const userName = user ? ` (User: ${user})` : '';

      return `${timestamp} [${level}] ${message, user}${userName}`;
    })
  ),
  transports: [
    new transports.Console(),
    new transports.File({ filename: 'logs/app.log' }),
    new MongoDB({
      db: process.env.CONNECTION,
      options: {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      },
      collection: 'logs',
    }),
  ],
});

module.exports = logger;
