/**
 * Application Constants
 * Centralized constants to avoid magic numbers and strings
 */

module.exports = {
  // Time constants (in milliseconds)
  TIME: {
    ONE_HOUR: 60 * 60 * 1000,
    ONE_DAY: 24 * 60 * 60 * 1000,
    ONE_WEEK: 7 * 24 * 60 * 60 * 1000,
    ONE_MONTH: 30 * 24 * 60 * 60 * 1000,
  },

  // Pagination defaults
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 12,
    MAX_LIMIT: 100,
    DEFAULT_ORDER_LIMIT: 10,
  },

  // Order statuses
  ORDER_STATUS: {
    PENDING: 'pending',
    PROCESSING: 'processing',
    SHIPPED: 'shipped',
    DELIVERED: 'delivered',
    CANCELLED: 'cancelled',
  },

  // Payment methods
  PAYMENT_METHODS: {
    STRIPE: 'stripe',
    PAYPAL: 'paypal',
    COD: 'cod',
  },

  // User roles
  USER_ROLES: {
    USER: 'user',
    ADMIN: 'admin',
  },

  // Product categories
  PRODUCT_CATEGORIES: [
    'Electronics',
    'Clothing',
    'Books',
    'Home & Garden',
    'Sports',
    'Toys',
    'Beauty',
    'Other',
  ],

  // Tax and shipping
  TAX: {
    RATE: 0.1, // 10%
  },
  SHIPPING: {
    FREE_THRESHOLD: 100, // Free shipping for orders over $100
    STANDARD_COST: 10, // Standard shipping cost
  },

  // Validation limits
  VALIDATION: {
    MIN_PASSWORD_LENGTH: 6,
    MAX_PASSWORD_LENGTH: 128,
    MIN_NAME_LENGTH: 2,
    MAX_NAME_LENGTH: 50,
    MIN_COMMENT_LENGTH: 10,
    MAX_COMMENT_LENGTH: 500,
    MIN_RATING: 1,
    MAX_RATING: 5,
    MIN_STOCK: 0,
    MAX_PRODUCT_NAME_LENGTH: 100,
    MAX_DESCRIPTION_LENGTH: 1000,
  },

  // File upload limits
  FILE_UPLOAD: {
    MAX_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  },

  // Rate limiting
  RATE_LIMIT: {
    API_WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    API_MAX_REQUESTS: 100,
    AUTH_WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    AUTH_MAX_REQUESTS: 5,
    CREATE_WINDOW_MS: 60 * 60 * 1000, // 1 hour
    CREATE_MAX_REQUESTS: 20,
  },

  // Error messages
  ERROR_MESSAGES: {
    UNAUTHORIZED: 'Not authorized',
    FORBIDDEN: 'Access denied',
    NOT_FOUND: 'Resource not found',
    VALIDATION_ERROR: 'Validation error',
    SERVER_ERROR: 'Server error',
    INVALID_CREDENTIALS: 'Invalid credentials',
    USER_EXISTS: 'User already exists',
    PRODUCT_EXISTS: 'Product already exists',
    INSUFFICIENT_STOCK: 'Insufficient stock',
    ORDER_NOT_FOUND: 'Order not found',
    PRODUCT_NOT_FOUND: 'Product not found',
    USER_NOT_FOUND: 'User not found',
    INVALID_TOKEN: 'Invalid or expired token',
  },

  // Success messages
  SUCCESS_MESSAGES: {
    ORDER_CREATED: 'Order created successfully',
    ORDER_UPDATED: 'Order updated successfully',
    ORDER_CANCELLED: 'Order cancelled successfully',
    PRODUCT_CREATED: 'Product created successfully',
    PRODUCT_UPDATED: 'Product updated successfully',
    PRODUCT_DELETED: 'Product deleted successfully',
    REVIEW_ADDED: 'Review added successfully',
    PROFILE_UPDATED: 'Profile updated successfully',
  },
};

