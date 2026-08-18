import { errorResponse } from '../utils/response/response.js';
import { NODE_ENV } from '../config/config.js';

export const globalErrorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let code = err.code || 'SERVER_ERROR';
  let details = err.details || null;

  // MongoDB CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid ID format';
    code = 'INVALID_ID';
  }

  // Duplicate key
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    message = `${field} already exists`;
    code = 'DUPLICATE_FIELD';
  }

  // Mongoose Validation Error (check for Mongoose-specific errors property)
  if (err.name === 'ValidationError' && err.errors && typeof err.errors === 'object' && !Array.isArray(err.errors) && err.code !== 'VALIDATION_ERROR') {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(', ');
    code = 'VALIDATION_ERROR';
  }

  if (NODE_ENV === 'development') {
    console.error('[Error]', { statusCode, message, code, stack: err.stack });
  }

  errorResponse({ res, statusCode, message, code, details });
};

export const notFoundHandler = (req, res, next) => {
  errorResponse({
    res,
    statusCode: 404,
    message: `Route ${req.originalUrl} not found`,
    code: 'ROUTE_NOT_FOUND',
  });
};
