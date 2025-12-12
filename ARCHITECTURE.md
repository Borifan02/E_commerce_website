# 🏗️ System Architecture

## Overview

This document describes the architecture of the E-Commerce Platform, including system design, data flow, and component interactions.

---

## 🎯 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                         │
├─────────────────────────────────────────────────────────────┤
│  React Application (Port 3000)                              │
│  ├── Components (UI)                                        │
│  ├── Pages (Routes)                                         │
│  ├── Redux Store (State Management)                        │
│  └── Material-UI (Styling)                                 │
└─────────────────────────────────────────────────────────────┘
                            ↕ HTTP/HTTPS
┌─────────────────────────────────────────────────────────────┐
│                      APPLICATION LAYER                       │
├─────────────────────────────────────────────────────────────┤
│  Express.js Server (Port 5000)                              │
│  ├── Routes (API Endpoints)                                 │
│  ├── Controllers (Business Logic)                           │
│  ├── Middleware (Auth, Validation, Error Handling)          │
│  └── Utils (Logger, Email, Helpers)                         │
└─────────────────────────────────────────────────────────────┘
                            ↕ Mongoose ODM
┌─────────────────────────────────────────────────────────────┐
│                        DATABASE LAYER                        │
├─────────────────────────────────────────────────────────────┤
│  MongoDB (Port 27017)                                       │
│  ├── Users Collection                                       │
│  ├── Products Collection                                    │
│  ├── Orders Collection                                      │
│  └── Wishlists Collection                                   │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 Request Flow

### User Authentication Flow

```
┌──────┐      ┌──────────┐      ┌────────────┐      ┌──────────┐
│Client│      │  Routes  │      │Controllers │      │ Database │
└──┬───┘      └────┬─────┘      └─────┬──────┘      └────┬─────┘
   │               │                   │                   │
   │ POST /login   │                   │                   │
   ├──────────────>│                   │                   │
   │               │ authController    │                   │
   │               ├──────────────────>│                   │
   │               │                   │ Find User         │
   │               │                   ├──────────────────>│
   │               │                   │                   │
   │               │                   │ User Data         │
   │               │                   │<──────────────────┤
   │               │                   │                   │
   │               │                   │ Compare Password  │
   │               │                   │                   │
   │               │                   │ Generate JWT      │
   │               │                   │                   │
   │               │ JWT Token         │                   │
   │               │<──────────────────┤                   │
   │ JWT Token     │                   │                   │
   │<──────────────┤                   │                   │
   │               │                   │                   │
```

### Product Purchase Flow

```
┌──────┐      ┌──────┐      ┌─────────┐      ┌────────┐      ┌──────┐
│Client│      │Routes│      │Controller│      │Database│      │Stripe│
└──┬───┘      └──┬───┘      └────┬────┘      └───┬────┘      └──┬───┘
   │             │                │                │              │
   │ Add to Cart │                │                │              │
   ├────────────>│                │                │              │
   │             │                │                │              │
   │ Checkout    │                │                │              │
   ├────────────>│ createOrder    │                │              │
   │             ├───────────────>│                │              │
   │             │                │ Verify Stock   │              │
   │             │                ├───────────────>│              │
   │             │                │                │              │
   │             │                │ Create Order   │              │
   │             │                ├───────────────>│              │
   │             │                │                │              │
   │             │                │ Process Payment│              │
   │             │                ├───────────────────────────────>│
   │             │                │                │              │
   │             │                │ Payment Success│              │
   │             │                │<───────────────────────────────┤
   │             │                │                │              │
   │             │                │ Update Stock   │              │
   │             │                ├───────────────>│              │
   │             │                │                │              │
   │             │                │ Send Email     │              │
   │             │                │                │              │
   │             │ Order Created  │                │              │
   │             │<───────────────┤                │              │
   │ Success     │                │                │              │
   │<────────────┤                │                │              │
```

---

## 📦 Component Architecture

### Backend Structure

```
backend/
│
├── server.js                    # Application entry point
│   ├── Express app setup
│   ├── Middleware configuration
│   ├── Route mounting
│   └── Error handling
│
├── config/
│   └── database.js              # MongoDB connection
│
├── controllers/                 # Business logic layer
│   ├── authController.js        # Authentication logic
│   ├── productController.js     # Product operations
│   ├── orderController.js       # Order management
│   ├── wishlistController.js    # Wishlist operations
│   └── analyticsController.js   # Analytics & reports
│
├── middleware/                  # Request processing
│   ├── auth.js                  # JWT verification
│   ├── errorHandler.js          # Error handling
│   └── rateLimiter.js           # Rate limiting
│
├── models/                      # Data models
│   ├── User.js                  # User schema
│   ├── Product.js               # Product schema
│   ├── Order.js                 # Order schema
│   └── Wishlist.js              # Wishlist schema
│
├── routes/                      # API endpoints
│   ├── auth.js                  # /api/auth/*
│   ├── products.js              # /api/products/*
│   ├── orders.js                # /api/orders/*
│   ├── wishlist.js              # /api/wishlist/*
│   ├── analytics.js             # /api/analytics/*
│   ├── users.js                 # /api/users/*
│   ├── payment.js               # /api/payment/*
│   └── upload.js                # /api/upload/*
│
└── utils/                       # Helper functions
    ├── logger.js                # Winston logger
    ├── emailService.js          # Email sending
    └── seeder.js                # Database seeding
```

### Frontend Structure

```
frontend/src/
│
├── App.js                       # Main application component
│   ├── Router configuration
│   ├── Global providers
│   └── Layout components
│
├── components/                  # Reusable components
│   ├── common/
│   │   ├── ProductCard.js       # Product display
│   │   ├── LoadingSpinner.js    # Loading state
│   │   ├── SearchBar.js         # Search input
│   │   └── ProtectedRoute.js    # Route protection
│   └── layout/
│       ├── Navbar.js            # Navigation bar
│       └── Footer.js            # Page footer
│
├── pages/                       # Page components
│   ├── HomePage.js              # Landing page
│   ├── ProductListPage.js       # Product catalog
│   ├── ProductDetailPage.js     # Product details
│   ├── CartPage.js              # Shopping cart
│   ├── CheckoutPage.js          # Checkout process
│   ├── WishlistPage.js          # User wishlist
│   ├── OrderHistoryPage.js      # Order history
│   ├── OrderDetailPage.js       # Order details
│   ├── ProfilePage.js           # User profile
│   ├── LoginPage.js             # Login form
│   ├── RegisterPage.js          # Registration form
│   └── admin/
│       ├── AdminDashboard.js    # Admin overview
│       ├── AdminProducts.js     # Product management
│       ├── AdminOrders.js       # Order management
│       └── AdminUsers.js        # User management
│
└── store/                       # State management
    ├── store.js                 # Redux store config
    └── slices/
        ├── authSlice.js         # Authentication state
        ├── productSlice.js      # Products state
        ├── cartSlice.js         # Cart state
        ├── orderSlice.js        # Orders state
        └── wishlistSlice.js     # Wishlist state
```

---

## 🗄️ Database Schema

### Users Collection

```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique, indexed),
  password: String (hashed),
  role: String (enum: ['user', 'admin']),
  avatar: String,
  phone: String,
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  isEmailVerified: Boolean,
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Products Collection

```javascript
{
  _id: ObjectId,
  name: String (indexed),
  description: String (indexed),
  price: Number,
  originalPrice: Number,
  category: String (indexed),
  brand: String (indexed),
  images: [String],
  stock: Number,
  rating: Number,
  numReviews: Number,
  reviews: [{
    user: ObjectId (ref: User),
    name: String,
    rating: Number,
    comment: String,
    createdAt: Date
  }],
  isActive: Boolean,
  tags: [String],
  specifications: Map,
  weight: Number,
  dimensions: {
    length: Number,
    width: Number,
    height: Number
  },
  createdAt: Date,
  updatedAt: Date
}
```

### Orders Collection

```javascript
{
  _id: ObjectId,
  user: ObjectId (ref: User, indexed),
  orderItems: [{
    product: ObjectId (ref: Product),
    name: String,
    image: String,
    price: Number,
    quantity: Number
  }],
  shippingAddress: {
    name: String,
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
    phone: String
  },
  paymentMethod: String,
  paymentResult: {
    id: String,
    status: String,
    update_time: String,
    email_address: String
  },
  itemsPrice: Number,
  taxPrice: Number,
  shippingPrice: Number,
  totalPrice: Number,
  isPaid: Boolean,
  paidAt: Date,
  isDelivered: Boolean,
  deliveredAt: Date,
  status: String (indexed),
  trackingNumber: String,
  notes: String,
  createdAt: Date (indexed),
  updatedAt: Date
}
```

### Wishlists Collection

```javascript
{
  _id: ObjectId,
  user: ObjectId (ref: User, unique, indexed),
  products: [{
    product: ObjectId (ref: Product),
    addedAt: Date
  }],
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🔐 Security Architecture

### Authentication Flow

```
┌─────────────────────────────────────────────────────────┐
│                   Security Layers                        │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  1. Rate Limiting                                        │
│     └─> 100 requests per 15 minutes                     │
│                                                          │
│  2. Helmet.js                                            │
│     └─> Security headers (XSS, CSP, etc.)               │
│                                                          │
│  3. CORS                                                 │
│     └─> Allowed origins configuration                   │
│                                                          │
│  4. Input Validation                                     │
│     └─> Express-validator                               │
│                                                          │
│  5. MongoDB Sanitization                                 │
│     └─> Prevent injection attacks                       │
│                                                          │
│  6. JWT Authentication                                   │
│     └─> Token-based auth with expiration                │
│                                                          │
│  7. Password Hashing                                     │
│     └─> Bcrypt with 10 rounds                           │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## 🚀 Deployment Architecture

### Docker Container Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Docker Network                        │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   Frontend   │  │   Backend    │  │   MongoDB    │ │
│  │   (Nginx)    │  │  (Node.js)   │  │              │ │
│  │   Port 80    │  │  Port 5000   │  │  Port 27017  │ │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘ │
│         │                  │                  │         │
│         └──────────────────┴──────────────────┘         │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### Production Deployment

```
┌─────────────────────────────────────────────────────────┐
│                      Internet                            │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│                 Load Balancer                            │
│              (Nginx / AWS ELB)                           │
└────────────────────┬────────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
┌───────▼────────┐       ┌───────▼────────┐
│  App Server 1  │       │  App Server 2  │
│   (Node.js)    │       │   (Node.js)    │
└───────┬────────┘       └───────┬────────┘
        │                         │
        └────────────┬────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│              Database Cluster                            │
│         (MongoDB Atlas / Replica Set)                    │
└─────────────────────────────────────────────────────────┘
```

---

## 📊 Data Flow Diagrams

### Product Search Flow

```
User Input → SearchBar Component
    ↓
Redux Action (searchProducts)
    ↓
API Call (/api/products?search=...)
    ↓
Backend Route → Controller
    ↓
MongoDB Text Search
    ↓
Results → Controller → Route
    ↓
Redux State Update
    ↓
Component Re-render
    ↓
Display Results
```

### Order Creation Flow

```
Cart Items → Checkout Page
    ↓
Validate Items & Address
    ↓
Create Order (Redux Action)
    ↓
API Call (/api/orders)
    ↓
Backend Controller
    ├─> Verify Stock
    ├─> Create Order Document
    ├─> Process Payment (Stripe)
    ├─> Update Product Stock
    └─> Send Email Notification
    ↓
Return Order Details
    ↓
Update Redux State
    ↓
Redirect to Order Confirmation
```

---

## 🔄 State Management

### Redux Store Structure

```javascript
{
  auth: {
    user: Object | null,
    token: String | null,
    isAuthenticated: Boolean,
    loading: Boolean,
    error: String | null
  },
  products: {
    items: Array,
    currentProduct: Object | null,
    loading: Boolean,
    error: String | null,
    page: Number,
    pages: Number,
    total: Number
  },
  cart: {
    items: Array,
    totalItems: Number,
    totalPrice: Number
  },
  orders: {
    items: Array,
    currentOrder: Object | null,
    loading: Boolean,
    error: String | null
  },
  wishlist: {
    items: Array,
    loading: Boolean,
    error: String | null
  }
}
```

---

## 🎯 API Endpoints Summary

### Public Endpoints
- `GET /api/health` - Health check
- `GET /api/products` - List products
- `GET /api/products/:id` - Get product
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `POST /api/auth/forgot-password` - Request password reset
- `PUT /api/auth/reset-password/:token` - Reset password

### Protected Endpoints (User)
- `GET /api/auth/profile` - Get profile
- `PUT /api/auth/profile` - Update profile
- `POST /api/orders` - Create order
- `GET /api/orders` - Get user orders
- `GET /api/orders/:id` - Get order details
- `PUT /api/orders/:id/cancel` - Cancel order
- `GET /api/wishlist` - Get wishlist
- `POST /api/wishlist/:productId` - Add to wishlist
- `DELETE /api/wishlist/:productId` - Remove from wishlist
- `POST /api/products/:id/reviews` - Add review

### Admin Endpoints
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product
- `GET /api/orders/admin/all` - Get all orders
- `PUT /api/orders/:id/status` - Update order status
- `GET /api/analytics/dashboard` - Get dashboard data
- `GET /api/analytics/sales` - Get sales report
- `GET /api/users` - Get all users
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

---

## 🔧 Technology Stack Details

### Frontend Technologies
- **React 18.2** - UI library with Hooks
- **Redux Toolkit** - State management
- **React Router 6** - Client-side routing
- **Material-UI 5** - Component library
- **Axios** - HTTP client
- **Stripe.js** - Payment processing
- **React Toastify** - Notifications

### Backend Technologies
- **Node.js 18+** - Runtime environment
- **Express.js 4** - Web framework
- **MongoDB 7** - NoSQL database
- **Mongoose 7** - ODM
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Stripe** - Payment gateway
- **Nodemailer** - Email service
- **Winston** - Logging
- **Helmet** - Security
- **Express Rate Limit** - Rate limiting

### DevOps Tools
- **Docker** - Containerization
- **Docker Compose** - Orchestration
- **GitHub Actions** - CI/CD
- **Nginx** - Reverse proxy
- **PM2** - Process manager

---

## 📈 Scalability Considerations

### Horizontal Scaling
- Stateless application design
- JWT for authentication (no sessions)
- Load balancer ready
- Multiple server instances

### Database Scaling
- MongoDB replica sets
- Read replicas for queries
- Sharding for large datasets
- Indexing for performance

### Caching Strategy
- Redis for session storage
- CDN for static assets
- API response caching
- Database query caching

### Performance Optimization
- Database indexing
- Lazy loading
- Code splitting
- Image optimization
- Gzip compression

---

This architecture supports growth from MVP to enterprise-scale application! 🚀
