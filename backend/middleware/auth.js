const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../utils/logger');
const { UnauthorizedError, ForbiddenError } = require('../utils/errors');

// Protect routes - verify JWT token
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from token
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return next(new UnauthorizedError('Not authorized, user not found'));
      }

      next();
    } catch (error) {
      logger.error('Token verification error:', error);
      return next(new UnauthorizedError('Not authorized, token failed'));
    }
  }

  if (!token) {
    return next(new UnauthorizedError('Not authorized, no token'));
  }
};

// Grant access to specific roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new UnauthorizedError('Not authenticated'));
    }
    
    if (!roles.includes(req.user.role)) {
      return next(new ForbiddenError(
        `User role ${req.user.role} is not authorized to access this route`
      ));
    }
    next();
  };
};

// Optional auth - doesn't fail if no token
const optionalAuth = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
    } catch (error) {
      // Token is invalid, but we continue without user
      req.user = null;
    }
  }

  next();
};

module.exports = { protect, authorize, optionalAuth };
