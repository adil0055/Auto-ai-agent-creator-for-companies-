/**
 * Centralized Error Handler Middleware
 * Catches all errors and returns consistent error responses
 */

const logger = require('../utils/logger');

class AppError extends Error {
  constructor(message, statusCode = 500, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.timestamp = new Date().toISOString();
    Error.captureStackTrace(this, this.constructor);
  }
}

function errorHandler(err, req, res, next) {
  let error = err;

  // Convert non-AppError errors to AppError
  if (!(error instanceof AppError)) {
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Internal Server Error';
    error = new AppError(message, statusCode, false);
  }

  // Log error
  const logContext = {
    method: req.method,
    path: req.path,
    statusCode: error.statusCode,
    ip: req.ip,
  };

  if (error.statusCode >= 500) {
    logger.error(error.message, { ...logContext, stack: error.stack });
  } else {
    logger.warn(error.message, logContext);
  }

  // Send error response
  const response = {
    error: error.message,
    statusCode: error.statusCode,
    timestamp: error.timestamp,
  };

  // Include stack trace in development
  if (process.env.NODE_ENV === 'development') {
    response.stack = error.stack;
  }

  res.status(error.statusCode).json(response);
}

// Async error wrapper
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = {
  AppError,
  errorHandler,
  asyncHandler,
};
