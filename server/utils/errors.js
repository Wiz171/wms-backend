class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

class ForbiddenError extends AppError {
  constructor(message = 'Forbidden access') {
    super(message, 403);
  }
}

class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized access') {
    super(message, 401);
  }
}

class ValidationError extends AppError {
  constructor(message = 'Validation error') {
    super(message, 400);
  }
}

class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404);
  }
}

module.exports = {
  AppError,
  ForbiddenError,
  UnauthorizedError,
  ValidationError,
  NotFoundError
}; 