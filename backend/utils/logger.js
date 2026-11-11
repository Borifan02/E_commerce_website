const fs = require('fs');
const path = require('path');

let winston;
try {
  winston = require('winston');
} catch (e) {
  winston = null;
}

let logger;

if (winston) {
  const logDir = path.join(__dirname, '../logs');
  if (!fs.existsSync(logDir)) {
    try {
      fs.mkdirSync(logDir, { recursive: true });
    } catch (err) {}
  }

  const transports = [
    new winston.transports.Console({
      format: process.env.NODE_ENV === 'production'
        ? winston.format.combine(
            winston.format.timestamp(),
            winston.format.json()
          )
        : winston.format.combine(
            winston.format.colorize(),
            winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
            winston.format.printf(info => `[${info.timestamp}] ${info.level}: ${info.message}${info.stack ? '\n' + info.stack : ''}`)
          ),
    }),
  ];

  try {
    transports.push(
      new winston.transports.File({
        filename: path.join(logDir, 'error.log'),
        level: 'error',
        maxsize: 5242880,
        maxFiles: 5,
      }),
      new winston.transports.File({
        filename: path.join(logDir, 'combined.log'),
        maxsize: 10485760,
        maxFiles: 5,
      })
    );
  } catch (e) {}

  logger = winston.createLogger({
    level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.errors({ stack: true }),
      winston.format.json()
    ),
    transports,
  });
} else {
  // Built-in fallback logger when winston is not yet installed
  const formatTime = () => new Date().toISOString();
  logger = {
    info: (msg, meta) => console.log(`[${formatTime()}] [INFO] ${msg}`, meta || ''),
    error: (msg, meta) => console.error(`[${formatTime()}] [ERROR] ${msg}`, meta || ''),
    warn: (msg, meta) => console.warn(`[${formatTime()}] [WARN] ${msg}`, meta || ''),
    debug: (msg, meta) => console.debug(`[${formatTime()}] [DEBUG] ${msg}`, meta || ''),
  };
}

module.exports = logger;
