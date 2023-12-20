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
      const { timestamp, level, message, meta  } = info;
      console.log("meta",meta)
      const user_name_info = meta && meta.user_name ? ` (User Name: ${meta.user_name})` : '';


      return `${timestamp} [${level}] ${message}${user_name_info}`;
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
      metaKey: 'meta',
      
    }),
  ],
});


module.exports = logger;
