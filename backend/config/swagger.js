let swaggerJsDoc;
let swaggerUi;
try {
  swaggerJsDoc = require('swagger-jsdoc');
  swaggerUi = require('swagger-ui-express');
} catch (e) {
  swaggerJsDoc = null;
  swaggerUi = null;
}

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'E-Commerce Platform REST API',
    version: '1.0.0',
    description: 'Production-ready REST API for E-Commerce platform with Authentication, Products, Cart, Orders, Wishlist, Coupons, and Admin Analytics.',
    contact: {
      name: 'API Support',
      email: 'support@ecommerce.local',
    },
  },
  servers: [
    {
      url: 'http://localhost:5000',
      description: 'Development Server',
    },
    {
      url: '/api',
      description: 'Current Host API',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter your JWT token in format: Bearer <token>',
      },
    },
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
};

const setupSwagger = (app) => {
  let swaggerDocs = swaggerDefinition;

  if (swaggerJsDoc && swaggerUi) {
    const swaggerOptions = {
      definition: swaggerDefinition,
      apis: ['./routes/*.js', './server.js'],
    };
    try {
      swaggerDocs = swaggerJsDoc(swaggerOptions);
      app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs, {
        customSiteTitle: 'E-Commerce API Documentation',
        customCss: '.swagger-ui .topbar { display: none }',
      }));
    } catch (err) {
      // Fallback
      app.get('/api/docs', (req, res) => res.json(swaggerDocs));
    }
  } else {
    // Clean fallback HTML dashboard
    app.get('/api/docs', (req, res) => {
      res.send(`
        <!DOCTYPE html>
        <html>
          <head><title>E-Commerce API Documentation</title></head>
          <body style="font-family: sans-serif; padding: 2rem; max-width: 800px; margin: 0 auto; line-height: 1.6;">
            <h1>🛒 E-Commerce REST API</h1>
            <p>Production API endpoints:</p>
            <ul>
              <li><strong>Auth:</strong> <code>POST /api/auth/register</code>, <code>POST /api/auth/login</code>, <code>GET /api/auth/me</code>, <code>PUT /api/auth/profile</code></li>
              <li><strong>Products:</strong> <code>GET /api/products</code>, <code>GET /api/products/:id</code>, <code>POST /api/products</code> (Admin)</li>
              <li><strong>Orders:</strong> <code>POST /api/orders</code>, <code>GET /api/orders</code>, <code>GET /api/orders/:id</code>, <code>GET /api/orders/admin/all</code> (Admin)</li>
              <li><strong>Wishlist:</strong> <code>GET /api/wishlist</code>, <code>POST /api/wishlist/:productId</code>, <code>DELETE /api/wishlist/:productId</code></li>
              <li><strong>Coupons:</strong> <code>POST /api/coupons/validate</code>, <code>GET /api/coupons</code> (Admin)</li>
              <li><strong>Users:</strong> <code>GET /api/users</code>, <code>PUT /api/users/:id</code> (Admin)</li>
              <li><strong>Analytics:</strong> <code>GET /api/analytics/dashboard</code> (Admin)</li>
              <li><strong>Health:</strong> <code>GET /api/health</code></li>
            </ul>
            <p><a href="/api/docs.json">View OpenAPI 3.0 JSON specification</a></p>
          </body>
        </html>
      `);
    });
  }

  app.get('/api/docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerDocs);
  });
};

module.exports = setupSwagger;
