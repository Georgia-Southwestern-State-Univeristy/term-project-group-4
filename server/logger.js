import winston from 'winston';
import path from 'path';

const LOGS_DIR = path.resolve(process.cwd(), 'logs');
const LOG_FILE = path.join(LOGS_DIR, 'app.log');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.json(),
  transports: [
    // Write all logs to file with auto-rotation
    new winston.transports.File({
      filename: LOG_FILE,
      maxsize: 5242880, // 5MB - auto-rotate logs
      maxFiles: 5 // Keep 5 log files max
    }),
    // Also print to console in development
    ...(process.env.NODE_ENV !== 'production'
      ? [
          new winston.transports.Console({
            format: winston.format.combine(
              winston.format.colorize(),
              winston.format.timestamp(),
              winston.format.printf(({ level, message, timestamp }) => {
                // If message is an object, stringify it
                let msg = message;
                if (typeof message === 'object') {
                  msg = JSON.stringify(message, null, 2);
                }
                return `[${timestamp}] ${level}: ${msg}`;
              })
            )
          })
        ]
      : [])
  ]
});

/**
 * Structured logging function - maintains same signature as custom logger
 * @param {string} requestId - Unique identifier for correlating logs
 * @param {string} action - Action being performed (e.g., TRIP_CREATE, CHECKLIST_GENERATE)
 * @param {string} status - Status of the action (START, SUCCESS, ERROR, VALIDATION_ERROR, NOT_FOUND)
 * @param {object} details - Additional context details
 */
export async function log(requestId, action, status, details = {}) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    requestId,
    action,
    status,
    details
  };

  // Winston handles async internally, but we keep async signature for compatibility
  logger.info(logEntry);
}

export { LOG_FILE, LOGS_DIR, logger };
