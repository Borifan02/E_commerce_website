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
    description: 'Production-ready REST API for E-Commerce platform with Authentication, Products, Cart, Orders, Wishlist, Coupons, Admin Analytics, and Ethiopian Local Payments (Telebirr & CBE).',
    contact: {
      name: 'API Support',
      email: 'support@ecommerce.local',
      url: 'http://localhost:3000',
    },
  },
  servers: [
    {
      url: 'http://localhost:5000',
      description: 'Localhost / Development Server',
    },
    {
      url: '/api',
      description: 'Current Production Host API',
    },
  ],
  tags: [
    { name: 'Authentication', description: 'User login, registration, and profile management' },
    { name: 'Products', description: 'Product catalog, search, categories, and inventory' },
    { name: 'Orders', description: 'Checkout, customer orders, fulfillment, and tracking' },
    { name: 'Payments', description: 'Telebirr, CBE Bank Transfer, and Card payments' },
    { name: 'Coupons', description: 'Discount codes and promotional vouchers' },
    { name: 'Users', description: 'Customer accounts and administrative role controls' },
    { name: 'Analytics', description: 'Executive store KPI metrics and sales reports' },
    { name: 'System', description: 'Health checks and platform diagnostics' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter your JWT token (e.g. Bearer eyJhbGciOi...)',
      },
    },
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
  paths: {
    '/api/auth/register': {
      post: {
        tags: ['Authentication'],
        summary: 'Register a new customer account',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'email', 'password'],
                properties: {
                  name: { type: 'string', example: 'Abebe Bikila' },
                  email: { type: 'string', example: 'abebe@example.com' },
                  password: { type: 'string', example: 'password123' },
                  phone: { type: 'string', example: '0911223344' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'User registered successfully with JWT token' },
          400: { description: 'Validation error or email already in use' },
        },
      },
    },
    '/api/auth/login': {
      post: {
        tags: ['Authentication'],
        summary: 'Log in with email and password',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', example: 'admin@ecommerce.com' },
                  password: { type: 'string', example: 'admin123456' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Authentication successful, returns JWT token and user info' },
          401: { description: 'Invalid credentials' },
        },
      },
    },
    '/api/auth/me': {
      get: {
        tags: ['Authentication'],
        summary: 'Get currently authenticated user profile',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Current user profile data' },
          401: { description: 'Unauthorized / Token expired' },
        },
      },
    },
    '/api/products': {
      get: {
        tags: ['Products'],
        summary: 'List products with search, pagination, and category filters',
        parameters: [
          { name: 'keyword', in: 'query', schema: { type: 'string' }, description: 'Search term' },
          { name: 'category', in: 'query', schema: { type: 'string' }, description: 'Category name' },
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 12 } },
        ],
        responses: {
          200: { description: 'Paginated list of products' },
        },
      },
      post: {
        tags: ['Products'],
        summary: 'Create a new product (Admin only)',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'price', 'category', 'stock'],
                properties: {
                  name: { type: 'string', example: 'Samsung Galaxy Ultra' },
                  price: { type: 'number', example: 799.99 },
                  originalPrice: { type: 'number', example: 899.99 },
                  category: { type: 'string', example: 'Electronics' },
                  stock: { type: 'integer', example: 25 },
                  description: { type: 'string', example: 'Flagship smartphone' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Product created successfully' },
          403: { description: 'Admin privileges required' },
        },
      },
    },
    '/api/products/{id}': {
      get: {
        tags: ['Products'],
        summary: 'Get product details by ID',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'Product object details' },
          404: { description: 'Product not found' },
        },
      },
    },
    '/api/orders': {
      get: {
        tags: ['Orders'],
        summary: 'Get customer order history',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'List of customer orders' },
        },
      },
      post: {
        tags: ['Orders'],
        summary: 'Place a new customer order',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['orderItems', 'shippingAddress', 'paymentMethod'],
                properties: {
                  orderItems: { type: 'array', items: { type: 'object' } },
                  shippingAddress: { type: 'object' },
                  paymentMethod: { type: 'string', enum: ['telebirr', 'cbe', 'stripe', 'cod'] },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Order created successfully' },
          400: { description: 'Invalid order payload' },
        },
      },
    },
    '/api/orders/{id}': {
      get: {
        tags: ['Orders'],
        summary: 'Get single order details by ID',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'Order details' },
          404: { description: 'Order not found' },
        },
      },
    },
    '/api/orders/{id}/status': {
      put: {
        tags: ['Orders'],
        summary: 'Update order fulfillment status (Admin or Demo dispatch)',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['status'],
                properties: {
                  status: { type: 'string', enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'] },
                  trackingNumber: { type: 'string', example: 'EMS-ET-8491823' },
                  notes: { type: 'string', example: 'Addis Ababa express dispatched' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Order status updated' },
        },
      },
    },
    '/api/payment/telebirr/initiate': {
      post: {
        tags: ['Payments'],
        summary: 'Initiate a Telebirr mobile payment session (*127#)',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['orderId'],
                properties: {
                  orderId: { type: 'string' },
                  phoneNumber: { type: 'string', example: '0911223344' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Telebirr session details, merchant phone, USSD code, and Birr total' },
        },
      },
    },
    '/api/payment/telebirr/verify': {
      post: {
        tags: ['Payments'],
        summary: 'Verify Telebirr transaction reference with Security PIN and confirm payment',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['orderId', 'transactionId', 'pin'],
                properties: {
                  orderId: { type: 'string' },
                  transactionId: { type: 'string', example: 'TLB109827361' },
                  phoneNumber: { type: 'string', example: '0911223344' },
                  pin: { type: 'string', example: '1234', description: 'User 4-6 digit Telebirr Security PIN' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Telebirr payment verified with PIN and order updated to processing' },
        },
      },
    },
    '/api/payment/cbe/initiate': {
      post: {
        tags: ['Payments'],
        summary: 'Initiate CBE (Commercial Bank of Ethiopia) transfer voucher (*847#)',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['orderId'],
                properties: {
                  orderId: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'CBE account number, account name, reference, and Birr amount' },
        },
      },
    },
    '/api/payment/cbe/verify': {
      post: {
        tags: ['Payments'],
        summary: 'Verify CBE bank deposit voucher reference with Security PIN & Account Number',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['orderId', 'transactionId', 'pin'],
                properties: {
                  orderId: { type: 'string' },
                  transactionId: { type: 'string', example: 'FT24098192837' },
                  senderAccountNumber: { type: 'string', example: '1000123456789', description: 'Sender 13-digit CBE Account Number' },
                  senderName: { type: 'string', example: 'Abebe Bikila' },
                  senderPhone: { type: 'string', example: '0911223344' },
                  pin: { type: 'string', example: '1234', description: 'User 4-6 digit CBE Security PIN' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'CBE payment verified with PIN and account successfully' },
        },
      },
    },
    '/api/payment/rates': {
      get: {
        tags: ['Payments'],
        summary: 'Get live ETB/USD exchange rates',
        responses: {
          200: { description: 'Current exchange rates (1 USD = ETB rate)' },
        },
      },
    },
    '/api/coupons/validate': {
      post: {
        tags: ['Coupons'],
        summary: 'Validate promo coupon code',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['code', 'orderAmount'],
                properties: {
                  code: { type: 'string', example: 'WELCOME10' },
                  orderAmount: { type: 'number', example: 50.0 },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Coupon details and calculated discount' },
        },
      },
    },
    '/api/users': {
      get: {
        tags: ['Users'],
        summary: 'Get registered users list (Admin only)',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'search', in: 'query', schema: { type: 'string' } },
          { name: 'role', in: 'query', schema: { type: 'string' } },
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
        ],
        responses: {
          200: { description: 'Paginated user accounts' },
          403: { description: 'Admin only' },
        },
      },
    },
    '/api/analytics/dashboard': {
      get: {
        tags: ['Analytics'],
        summary: 'Get executive store performance analytics and sales KPIs (Admin only)',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Store metrics: revenue, order count, top products, recent transactions' },
        },
      },
    },
    '/api/health': {
      get: {
        tags: ['System'],
        summary: 'System health check and database diagnostics',
        responses: {
          200: { description: 'Healthy: API and MongoDB connected' },
          503: { description: 'Degraded: Database connection issue' },
        },
      },
    },
  },
};

const setupSwagger = (app) => {
  const swaggerDocs = swaggerDefinition;

  if (swaggerUi) {
    try {
      app.use(
        '/api/docs',
        swaggerUi.serve,
        swaggerUi.setup(swaggerDocs, {
          customSiteTitle: 'EthioMart API Documentation',
          customCss: '.swagger-ui .topbar { display: none }',
        })
      );
    } catch (err) {
      app.get('/api/docs', (req, res) => res.json(swaggerDocs));
    }
  } else {
    app.get('/api/docs', (req, res) => {
      res.json(swaggerDocs);
    });
  }

  app.get('/api/docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerDocs);
  });
};

module.exports = setupSwagger;
