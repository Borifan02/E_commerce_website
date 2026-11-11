let rateLimit;
try {
  rateLimit = require('express-rate-limit');
} catch (e) {
  rateLimit = null;
}

const noopMiddleware = (req, res, next) => next();

// Helper to detect local development or loopback calls so developer workflow is never blocked
const isLocalOrDev = (req) => {
  if (process.env.NODE_ENV !== 'production') {
    return true;
  }
  const ip = req.ip || req.connection?.remoteAddress || '';
  if (ip === '127.0.0.1' || ip === '::1' || ip.includes('127.0.0.1')) {
    return true;
  }
  return false;
};

if (rateLimit) {
  // General API rate limiter (production-ready: 3000 requests per 15 min; bypassed on dev/localhost)
  exports.apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 3000,
    message: { success: false, message: 'Too many requests from this IP, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
    skip: isLocalOrDev,
  });

  // Auth rate limiter (stricter against brute force, bypassed on dev/localhost)
  exports.authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 30,
    message: { success: false, message: 'Too many login attempts, please try again after 15 minutes.' },
    skipSuccessfulRequests: true,
    standardHeaders: true,
    legacyHeaders: false,
    skip: isLocalOrDev,
  });

  // Create/Update rate limiter
  exports.createLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 500,
    message: { success: false, message: 'Too many requests, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
    skip: isLocalOrDev,
  });
} else {
  exports.apiLimiter = noopMiddleware;
  exports.authLimiter = noopMiddleware;
  exports.createLimiter = noopMiddleware;
}
