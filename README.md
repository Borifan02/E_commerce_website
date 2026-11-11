# 🛒 Professional E-Commerce Platform - MERN Stack

A full-featured, production-ready e-commerce platform built with the MERN stack (MongoDB, Express.js, React.js, Node.js). Engineered for production scalability, customer reliability, secure checkouts, and comprehensive admin store management.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)
![React](https://img.shields.io/badge/react-18.2.0-blue)
![Tests](https://img.shields.io/badge/tests-25%20passed-success)
![API Docs](https://img.shields.io/badge/Swagger-OpenAPI%203.0-green)

---

## 🌟 Key Features

### 🛍️ Customer Experience
- 🔐 **Secure Authentication** - JWT authorization with password hashing, profile updates, and password reset flows.
- 🔍 **Catalog & Search** - Instant keyword search, department filtering, multi-attribute sorting (`price_asc`, `price_desc`, `rating`, `newest`), and responsive grid/list views.
- 🛒 **Enhanced Shopping Cart** - Real-time quantity adjustments, stock availability checks, free shipping threshold bar, and subtotal calculations.
- 🏷️ **Coupon & Promo Discount System** - Apply promo codes (e.g., `WELCOME10`, `SUPER20`, `FLAT15`) at checkout with instant validation and discount deduction.
- 💳 **Flexible Checkouts** - Support for Cash on Delivery (COD) and Credit/Debit Card payments (Stripe & simulated test cards).
- 📦 **Visual Order Tracking** - 4-stage fulfillment stepper (`Placed` ➔ `Processing` ➔ `Shipped` ➔ `Delivered`) with courier tracking codes and customer self-service order cancellation for pending orders.
- ❤️ **Customer Wishlist** - Save favorite products with one-click "Move to Cart" action and persistent synchronization.
- ⭐ **Reviews & Star Ratings** - Verified customer rating submissions and aggregated review scores.

### 📊 Admin Operations & Management
- 📈 **Executive Analytics Dashboard** - Live KPI cards (Total Revenue, Orders, Products, Users), recent orders stream, and top-selling products by sales volume.
- 🏷️ **Product Management Portal** - Full catalog CRUD: create products, edit prices and stock, upload images, and toggle visibility.
- 🚚 **Order Fulfillment Portal** - Inspect customer orders, filter by status, update fulfillment states, and assign shipping tracking numbers.
- 👥 **Customer Account Control** - View registered accounts, update contact information, and adjust role privileges with safeguard protections.
- 🎟️ **Promo Coupon Management** - Create percentage or fixed-amount discount codes with expiration dates and minimum order constraints.

### 🛡️ Production & Engineering Highlights
- 📖 **Interactive Swagger / OpenAPI 3.0 Documentation** - Available live at `/api/docs` and schema endpoint at `/api/docs.json`.
- 🧪 **Automated Testing Suite** - 25 unit and integration tests verifying error handling, constants, coupon calculations, and API routing.
- 🔒 **Security Hardening** - Helmet HTTP security headers, Mongo Sanitize injection protection, CORS controls, rate limiting, and defensive directory traversal guards on uploads.
- 🩺 **Comprehensive Health Monitoring** - `/api/health` reports database connectivity, process uptime, memory RSS/heap usage, and server timestamp.
- 🪵 **Production Logging** - Winston structured logger with automatic stdout streaming in container environments and file rotation in local development.

---

## 🏗️ Architecture & Folder Structure

```
E_commerce_website/
├── backend/
│   ├── config/              # Database connection pooling & Swagger OpenAPI setup
│   ├── controllers/         # Business logic (Auth, Products, Orders, Users, Coupons, Payment, Analytics)
│   ├── middleware/          # JWT auth, role authorization, rate limiter, global error handler
│   ├── models/              # Mongoose schemas (User, Product, Order, Wishlist, Coupon)
│   ├── routes/              # RESTful API routing endpoints
│   ├── tests/               # Automated integration and unit test suite
│   ├── utils/               # Logger, constants, custom errors, email service, seeder
│   └── server.js            # Express application bootstrapper & graceful shutdown
├── frontend/
│   ├── public/              # Static index.html and assets
│   └── src/
│       ├── components/      # Reusable UI widgets (Navbar, Footer, SearchBar, ErrorBoundary)
│       ├── pages/           # Pages (HomePage, ProductListPage, EnhancedCartPage, CheckoutPage, OrderDetailPage)
│       │   └── admin/       # Admin portals (AdminDashboard, AdminProducts, AdminOrders, AdminUsers)
│       ├── store/           # Redux Toolkit state slices
│       └── App.js           # Client routes and navigation wrapper
├── docker-compose.yml       # Multi-container orchestration (MongoDB, Backend, Frontend)
└── README.md
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js** (v18.0.0 or higher)
- **MongoDB** (Local instance or MongoDB Atlas connection URI)

### 2. Configure Backend Environment
Create `backend/.env` (or copy from `backend/.env.example`):
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/ecommerce
JWT_SECRET=ecommerce_super_secure_jwt_key_2026_xyz
JWT_EXPIRE=30d
CLIENT_URL=http://localhost:3000
STRIPE_PUBLISHABLE_KEY=pk_test_sample_mock_key
```

### 3. Seed Catalog & Default Admin
```bash
# Seed 20 products and active promo coupons
cd backend
npm run seed

# Create or reset administrator account (admin@example.com / password123)
node utils/create_admin.js
```

### 4. Run Automated Backend Tests
```bash
cd backend
npm test
```
Expected output:
```
✔ API Endpoints - Integration Sanity Tests
✔ System Constants - Business Rules Integrity
✔ Coupon Model - Discount Calculation & Validity Rules
✔ Error Classes - Hierarchy and Status Codes
ℹ tests 25 | pass 25 | fail 0
```

### 5. Launch Application
In **Terminal 1** (Backend):
```bash
cd backend
npm run dev
# Server starts on port 5000 (Swagger docs at http://localhost:5000/api/docs)
```

In **Terminal 2** (Frontend):
```bash
cd frontend
npm start
# Client opens at http://localhost:3000
```

---

## 🔑 Default Credentials & Sample Coupons

| Role | Email | Password |
|---|---|---|
| **Administrator** | `admin@example.com` | `password123` |
| **Customer** | Register in UI or login | Any chosen password |

### Active Promo Coupons (Try at Checkout):
- `WELCOME10` - 10% discount on orders over \$20
- `SUPER20` - 20% discount on orders over \$100
- `FLAT15` - \$15 flat discount on orders over \$50

---

## 📖 API Documentation (Swagger)

Start the backend and visit:
👉 **[http://localhost:5000/api/docs](http://localhost:5000/api/docs)**

Raw OpenAPI specification JSON is available at:
👉 **[http://localhost:5000/api/docs.json](http://localhost:5000/api/docs.json)**

---

## 🐳 Docker Deployment

To launch the full production stack with MongoDB, Express, and React under Nginx reverse proxy:
```bash
docker-compose up --build -d
```
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:5000/api`
- Swagger Docs: `http://localhost:5000/api/docs`

---

## 📄 License
This project is open-source and licensed under the [MIT License](LICENSE).
