/**
 * Input Validation Middleware
 * Validates request bodies, params, and query strings using Zod
 */

const { z } = require('zod');
const { AppError } = require('./errorHandler');

function validateBody(schema) {
  return (req, res, next) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      const message = error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
      next(new AppError(`Validation failed: ${message}`, 400));
    }
  };
}

function validateParams(schema) {
  return (req, res, next) => {
    try {
      req.params = schema.parse(req.params);
      next();
    } catch (error) {
      const message = error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
      next(new AppError(`Validation failed: ${message}`, 400));
    }
  };
}

function validateQuery(schema) {
  return (req, res, next) => {
    try {
      req.query = schema.parse(req.query);
      next();
    } catch (error) {
      const message = error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
      next(new AppError(`Validation failed: ${message}`, 400));
    }
  };
}

// Common validation schemas
const schemas = {
  uuid: z.string().uuid(),
  prompt: z.object({
    prompt: z.string().min(10).max(1000),
  }),
  pagination: z.object({
    page: z.string().regex(/^\d+$/).transform(Number).default('1'),
    limit: z.string().regex(/^\d+$/).transform(Number).default('20'),
  }),
};

module.exports = {
  validateBody,
  validateParams,
  validateQuery,
  schemas,
};
