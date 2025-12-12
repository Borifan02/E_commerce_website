/**
 * Frontend Constants
 * Centralized constants for the frontend application
 */

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    PROFILE: '/api/auth/profile',
    ME: '/api/auth/me',
  },
  PRODUCTS: {
    LIST: '/api/products',
    DETAIL: (id) => `/api/products/${id}`,
    FEATURED: '/api/products/featured',
    TOP_RATED: '/api/products/top/rated',
  },
  ORDERS: {
    CREATE: '/api/orders',
    LIST: '/api/orders',
    DETAIL: (id) => `/api/orders/${id}`,
    PAY: (id) => `/api/orders/${id}/pay`,
    ADMIN_ALL: '/api/orders/admin/all',
    STATUS: (id) => `/api/orders/${id}/status`,
  },
  WISHLIST: {
    GET: '/api/wishlist',
    ADD: (id) => `/api/wishlist/${id}`,
    REMOVE: (id) => `/api/wishlist/${id}`,
    CLEAR: '/api/wishlist',
  },
};

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 12,
  DEFAULT_ORDER_LIMIT: 10,
  MAX_LIMIT: 100,
};

export const VALIDATION = {
  MIN_PASSWORD_LENGTH: 6,
  MAX_PASSWORD_LENGTH: 128,
  MIN_NAME_LENGTH: 2,
  MAX_NAME_LENGTH: 50,
  MIN_COMMENT_LENGTH: 10,
  MAX_COMMENT_LENGTH: 500,
  MIN_RATING: 1,
  MAX_RATING: 5,
};

export const ORDER_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
};

export const PAYMENT_METHODS = {
  STRIPE: 'stripe',
  PAYPAL: 'paypal',
  COD: 'cod',
};

export const PRODUCT_CATEGORIES = [
  'Electronics',
  'Clothing',
  'Books',
  'Home & Garden',
  'Sports',
  'Toys',
  'Beauty',
  'Other',
];

export const SORT_OPTIONS = {
  PRICE_ASC: 'price_asc',
  PRICE_DESC: 'price_desc',
  RATING: 'rating',
  NEWEST: 'newest',
};

export const TOAST_DURATION = {
  SUCCESS: 3000,
  ERROR: 5000,
  WARNING: 4000,
  INFO: 3000,
};

export const LOCAL_STORAGE_KEYS = {
  TOKEN: 'token',
  CART_ITEMS: 'cartItems',
  SHIPPING_ADDRESS: 'shippingAddress',
  PAYMENT_METHOD: 'paymentMethod',
};

export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  SERVER_ERROR: 'Server error. Please try again later.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  UNKNOWN_ERROR: 'An unexpected error occurred.',
};

export const SUCCESS_MESSAGES = {
  ORDER_CREATED: 'Order created successfully!',
  ORDER_UPDATED: 'Order updated successfully!',
  PRODUCT_ADDED: 'Product added to cart!',
  PRODUCT_REMOVED: 'Product removed from cart!',
  WISHLIST_ADDED: 'Product added to wishlist!',
  WISHLIST_REMOVED: 'Product removed from wishlist!',
  PROFILE_UPDATED: 'Profile updated successfully!',
  REVIEW_ADDED: 'Review added successfully!',
};

