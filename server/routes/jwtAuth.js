const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../model/model');

if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET is not set in environment variables');
  process.exit(1);
}

const jwtSecret = process.env.JWT_SECRET;

class AuthError extends Error {
  constructor(message, status = 401) {
    super(message);
    this.name = 'AuthError';
    this.status = status;
  }
}

async function jwtAuth(req, res, next) {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      throw new AuthError('No authorization header');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new AuthError('No token provided');
    }

    const decoded = jwt.verify(token, jwtSecret);
    if (!decoded.id) {
      throw new AuthError('Invalid token payload');
    }

    // Use the User model instead of direct MongoDB access
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      throw new AuthError('User not found', 404);
    }

    // Check if user is active
    if (user.isActive === false) {
      throw new AuthError('User account is inactive');
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    console.error('JWT Auth Error:', {
      error: error.message,
      stack: error.stack,
      path: req.path,
      method: req.method
    });

    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid token'
      });
    }
    
    if (error instanceof AuthError) {
      return res.status(error.status).json({
        status: 'error',
        message: error.message
      });
    }

    return res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
}

module.exports = jwtAuth;
