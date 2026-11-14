const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
let helmet;
try {
  helmet = require('helmet');
} catch (e) {
  helmet = null;
}

let mongoSanitize;
try {
  mongoSanitize = require('express-mongo-sanitize');
} catch (e) {
  mongoSanitize = null;
}
const mongoose = require('mongoose');
const connectDB = require('./config/database');
const setupSwagger = require('./config/swagger');
const logger = require('./utils/logger');
const { apiLimiter } = require('./middleware/rateLimiter');
const errorHandler = require('./middleware/errorHandler');
const { bootstrapDatabase } = require('./utils/bootstrap');

// Load environment variables
dotenv.config();

const app = express();

// Enable trust proxy for rate limiter behind proxy (like Nginx, ALB, Create React App dev server)
app.set('trust proxy', 1);

// Connect to database and self-heal / bootstrap initial admin and catalog
connectDB().then(() => {
  bootstrapDatabase();
}).catch((err) => {
  logger.warn('DB bootstrap deferred:', err?.message || err);
});

// CORS configuration
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? [process.env.CLIENT_URL, 'http://localhost:3000'].filter(Boolean)
  : ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:5000'];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Postman, health checks)
    if (!origin) {
      return callback(null, true);
    }
    // Allow configured origins
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    // Allow all Vercel deployment preview and production URLs (*.vercel.app)
    if (/^https:\/\/.*\.vercel\.app$/.test(origin)) {
      return callback(null, true);
    }
    // Allow Render internal / preview domains (*.onrender.com)
    if (/^https:\/\/.*\.onrender\.com$/.test(origin)) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

// Security middleware
if (helmet) {
  app.use(helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: false,
  }));
} else {
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    next();
  });
}

if (mongoSanitize) {
  app.use(mongoSanitize());
}
app.use(cors(corsOptions));

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting for API
app.use('/api/', apiLimiter);

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Swagger API Documentation
setupSwagger(app);

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// Health check route with comprehensive diagnostics
app.get('/api/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState;
  const statusMap = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  const isHealthy = dbStatus === 1;

  res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? 'healthy' : 'degraded',
    message: isHealthy ? 'E-commerce API is operating normally' : 'Database not connected',
    database: statusMap[dbStatus] || 'unknown',
    uptime: Math.floor(process.uptime()),
    memoryUsage: {
      rss: `${Math.round(process.memoryUsage().rss / 1024 / 1024)} MB`,
      heapUsed: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB`,
    },
    docs: '/api/docs',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// Root endpoint: Serves welcoming HTML dashboard in browser or clean JSON to API clients
app.get('/', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'connecting';
  const acceptsHtml = req.accepts('html', 'json') === 'html';

  if (!acceptsHtml) {
    return res.json({
      success: true,
      service: 'EthioMart E-Commerce Platform REST API',
      version: '1.0.0',
      status: 'online',
      environment: process.env.NODE_ENV || 'development',
      database: dbStatus,
      docs: '/api/docs',
      health: '/api/health',
      endpoints: {
        auth: '/api/auth',
        products: '/api/products',
        orders: '/api/orders',
        payment: '/api/payment',
        users: '/api/users',
        coupons: '/api/coupons',
        analytics: '/api/analytics',
      },
      clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',
    });
  }

  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>EthioMart API Server</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background: #0f172a; color: #f8fafc; margin: 0; padding: 40px 20px; display: flex; justify-content: center; }
        .card { background: #1e293b; border: 1px solid #334155; border-radius: 12px; max-width: 680px; width: 100%; padding: 32px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
        .header { display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #334155; padding-bottom: 20px; margin-bottom: 24px; }
        .title { font-size: 24px; font-weight: 700; color: #38bdf8; margin: 0; }
        .badge { background: #10b981; color: white; padding: 4px 12px; border-radius: 9999px; font-size: 13px; font-weight: 600; }
        .description { color: #94a3b8; font-size: 15px; line-height: 1.6; margin-bottom: 24px; }
        .btn-group { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 28px; }
        .btn { padding: 10px 18px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px; transition: all 0.2s; }
        .btn-primary { background: #0284c7; color: white; }
        .btn-primary:hover { background: #0369a1; }
        .btn-secondary { background: #334155; color: #f8fafc; }
        .btn-secondary:hover { background: #475569; }
        .endpoints { background: #0f172a; border-radius: 8px; padding: 16px; border: 1px solid #1e293b; }
        .endpoint-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #1e293b; font-family: monospace; font-size: 13px; }
        .endpoint-row:last-child { border-bottom: none; }
        .method { color: #38bdf8; font-weight: 700; }
        .path { color: #cbd5e1; }
        .footer { margin-top: 24px; font-size: 12px; color: #64748b; text-align: center; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <h1 class="title">EthioMart API Server</h1>
          <span class="badge">🟢 Online & Active</span>
        </div>
        <p class="description">
          Welcome to the backend REST API for EthioMart E-Commerce Platform. Delivering enterprise e-commerce capabilities with Ethiopian local payment integrations (Telebirr & CBE) and global card processing.
        </p>
        <div class="btn-group">
          <a href="/api/docs" class="btn btn-primary">📖 Swagger API Docs</a>
          <a href="/api/health" class="btn btn-secondary">🩺 Health Check</a>
          <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}" class="btn btn-secondary">🛒 Frontend Store</a>
        </div>
        <div class="endpoints">
          <div style="font-weight: 600; color: #94a3b8; margin-bottom: 10px; font-size: 13px;">PRIMARY API ROUTES:</div>
          <div class="endpoint-row"><span class="method">GET/POST</span> <span class="path">/api/products</span></div>
          <div class="endpoint-row"><span class="method">GET/POST</span> <span class="path">/api/orders</span></div>
          <div class="endpoint-row"><span class="method">POST</span> <span class="path">/api/payment/telebirr/initiate & verify</span></div>
          <div class="endpoint-row"><span class="method">POST</span> <span class="path">/api/payment/cbe/initiate & verify</span></div>
          <div class="endpoint-row"><span class="method">POST</span> <span class="path">/api/auth/login & register</span></div>
          <div class="endpoint-row"><span class="method">GET</span> <span class="path">/api/coupons & /api/users</span></div>
        </div>
        <div class="footer">
          EthioMart Backend Engine &bull; Environment: ${process.env.NODE_ENV || 'development'}
        </div>
      </div>
    </body>
    </html>
  `);
});

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/users', require('./routes/users'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/payment', require('./routes/payment'));
app.use('/api/wishlist', require('./routes/wishlist'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/coupons', require('./routes/coupons'));

// Error handling middleware (must be after all routes)
app.use(errorHandler);

// 404 handler for unknown routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Endpoint ${req.method} ${req.originalUrl} not found`,
    docs: '/api/docs',
  });
});

const PORT = process.env.PORT || 5000;

if (require.main === module) {
  const server = app.listen(PORT, () => {
    logger.info(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    logger.info(`API Documentation available at: http://localhost:${PORT}/api/docs`);
  });

  // Graceful shutdown
  const gracefulShutdown = (signal) => {
    logger.info(`${signal} received. Initiating graceful shutdown...`);
    server.close(async () => {
      logger.info('HTTP server closed.');
      try {
        await mongoose.connection.close(false);
        logger.info('MongoDB connection closed.');
      } catch (err) {
        logger.error('Error closing MongoDB connection:', err);
      }
      process.exit(0);
    });

    // Force shutdown after 10s if not finished
    setTimeout(() => {
      logger.error('Could not close connections in time, forcefully shutting down');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (err) => {
    logger.error(`Unhandled Rejection: ${err.message}`, { stack: err.stack });
    server.close(() => process.exit(1));
  });
}

module.exports = app;
