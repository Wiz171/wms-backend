const jwt = require('jsonwebtoken');
const User = require('../model/model');

// Token blacklist (in production, use Redis or similar)
const tokenBlacklist = new Set();

const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { 
      id: user._id,
      email: user.email,
      role: user.role
    },
    process.env.JWT_SECRET,
    { expiresIn: '2h' }
  );

  const refreshToken = jwt.sign(
    { id: user._id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );

  return { accessToken, refreshToken };
};

const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({
        status: 'error',
        message: 'No token provided'
      });
    }

    const token = authHeader.split(' ')[1];
    
    // Check if token is blacklisted
    if (tokenBlacklist.has(token)) {
      return res.status(401).json({
        status: 'error',
        message: 'Token has been invalidated'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user || !user.isActive) {
      return res.status(401).json({
        status: 'error',
        message: 'User not found or inactive'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        status: 'error',
        message: 'Token expired'
      });
    }
    return res.status(401).json({
      status: 'error',
      message: 'Invalid token'
    });
  }
};

const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({
        status: 'error',
        message: 'Refresh token is required'
      });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user || !user.isActive) {
      return res.status(401).json({
        status: 'error',
        message: 'User not found or inactive'
      });
    }

    const tokens = generateTokens(user);
    res.json({
      status: 'success',
      data: tokens
    });
  } catch (error) {
    return res.status(401).json({
      status: 'error',
      message: 'Invalid refresh token'
    });
  }
};

const invalidateToken = (token) => {
  tokenBlacklist.add(token);
  // In production, set an expiration for the blacklisted token
  setTimeout(() => {
    tokenBlacklist.delete(token);
  }, 24 * 60 * 60 * 1000); // 24 hours
};

module.exports = {
  generateTokens,
  verifyToken,
  refreshToken,
  invalidateToken
}; 