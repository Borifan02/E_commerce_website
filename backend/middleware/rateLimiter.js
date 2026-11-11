let rateLimit;
try {
  rateLimit = require('express-rate-limit');
} catch (e) {
  rateLimit = null;
}

const noopMiddleware = (req, res, next) => next();

if (rateLimit) {
  // General API rate limiter
  exports.apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: { success: false, message: 'Too many requests from this IP, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
  });

  // Auth rate limiter (stricter)
  exports.authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10,
    message: { success: false, message: 'Too many login attempts, please try again later.' },
    skipSuccessfulRequests: true,
  });

  // Create/Update rate limiter
  exports.createLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 30,
    message: { success: false, message: 'Too many requests, please try again later.' },
  });
} else {
  exports.apiLimiter = noopMiddleware;
  exports.authLimiter = noopMiddleware;
  exports.createLimiter = noopMiddleware;
}
