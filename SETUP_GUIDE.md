# 🚀 Complete Setup Guide

This guide will walk you through setting up the E-commerce platform from scratch.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Local Development Setup](#local-development-setup)
3. [Database Setup](#database-setup)
4. [Environment Configuration](#environment-configuration)
5. [Running the Application](#running-the-application)
6. [Docker Setup](#docker-setup)
7. [Creating Admin User](#creating-admin-user)
8. [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Software
- **Node.js** (v18.0.0 or higher)
  - Download: https://nodejs.org/
  - Verify: `node --version`

- **MongoDB** (v7.0 or higher)
  - Option 1: Local installation - https://www.mongodb.com/try/download/community
  - Option 2: MongoDB Atlas (Cloud) - https://www.mongodb.com/cloud/atlas
  - Verify: `mongod --version`

- **Git**
  - Download: https://git-scm.com/
  - Verify: `git --version`

### Optional Software
- **Docker** (for containerized deployment)
  - Download: https://www.docker.com/products/docker-desktop
  - Verify: `docker --version`

- **Postman** (for API testing)
  - Download: https://www.postman.com/downloads/

## Local Development Setup

### Step 1: Clone the Repository

```bash
git clone <your-repository-url>
cd E_commerce_website
```

### Step 2: Install Backend Dependencies

```bash
cd backend
npm install
```

Expected packages:
- express
- mongoose
- jsonwebtoken
- bcryptjs
- cors
- dotenv
- stripe
- nodemailer
- helmet
- winston
- express-rate-limit
- express-mongo-sanitize

### Step 3: Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

Expected packages:
- react
- react-dom
- react-router-dom
- @reduxjs/toolkit
- react-redux
- @mui/material
- axios
- @stripe/stripe-js
- react-toastify

## Database Setup

### Option 1: Local MongoDB

1. **Start MongoDB Service**

   Windows:
   ```bash
   net start MongoDB
   ```

   macOS/Linux:
   ```bash
   sudo systemctl start mongod
   ```

2. **Verify Connection**
   ```bash
   mongosh
   ```

3. **Create Database**
   ```javascript
   use ecommerce
   ```

### Option 2: MongoDB Atlas (Cloud)

1. **Create Account**
   - Go to https://www.mongodb.com/cloud/atlas
   - Sign up for free tier

2. **Create Cluster**
   - Click "Build a Database"
   - Choose "Free" tier
   - Select region closest to you
   - Click "Create Cluster"

3. **Setup Database Access**
   - Go to "Database Access"
   - Add new database user
   - Save username and password

4. **Setup Network Access**
   - Go to "Network Access"
   - Add IP Address
   - Allow access from anywhere (0.0.0.0/0) for development

5. **Get Connection String**
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password

## Environment Configuration

### Backend Environment Variables

Create `backend/.env` file:

```env
# Server Configuration
NODE_ENV=development
PORT=5000

# Database
MONGODB_URI=mongodb://localhost:27017/ecommerce
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ecommerce?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_minimum_32_characters_long
JWT_EXPIRE=30d

# Stripe Configuration (Get from https://dashboard.stripe.com/test/apikeys)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Email Configuration (Gmail example)
EMAIL_USER=your.email@gmail.com
EMAIL_PASS=your_app_specific_password

# Frontend URL
CLIENT_URL=http://localhost:3000

# Logging
LOG_LEVEL=info
```

### Frontend Environment Variables

Create `frontend/.env` file:

```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
```

### Setting up Gmail for Email Service

1. **Enable 2-Factor Authentication**
   - Go to Google Account settings
   - Security → 2-Step Verification

2. **Generate App Password**
   - Security → App passwords
   - Select "Mail" and "Other"
   - Copy the generated password
   - Use this as `EMAIL_PASS` in .env

### Setting up Stripe

1. **Create Stripe Account**
   - Go to https://stripe.com
   - Sign up for free

2. **Get API Keys**
   - Dashboard → Developers → API keys
   - Copy "Publishable key" and "Secret key"
   - Use test keys for development

3. **Setup Webhook (Optional)**
   - Dashboard → Developers → Webhooks
   - Add endpoint: `http://localhost:5000/api/payment/webhook`
   - Select events: `payment_intent.succeeded`

## Running the Application

### Method 1: Separate Terminals

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

Expected output:
```
Server running in development mode on port 5000
MongoDB Connected: localhost
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

Expected output:
```
Compiled successfully!
Local: http://localhost:3000
```

### Method 2: Concurrently (from root)

```bash
npm install -g concurrently
concurrently "cd backend && npm run dev" "cd frontend && npm start"
```

## Docker Setup

### Build and Run with Docker Compose

1. **Update docker-compose.yml**
   - Set environment variables
   - Update MongoDB credentials

2. **Build and Start**
   ```bash
   docker-compose up -d
   ```

3. **View Logs**
   ```bash
   docker-compose logs -f
   ```

4. **Stop Services**
   ```bash
   docker-compose down
   ```

### Access Services
- Frontend: http://localhost:3000
- Backend: http://localhost:5000
- MongoDB: localhost:27017

## Creating Admin User

### Method 1: Using MongoDB Shell

```bash
mongosh
use ecommerce

db.users.insertOne({
  name: "Admin User",
  email: "admin@example.com",
  password: "$2a$10$YourHashedPasswordHere",
  role: "admin",
  isEmailVerified: true,
  createdAt: new Date(),
  updatedAt: new Date()
})
```

### Method 2: Using Registration + Manual Update

1. Register a new user through the frontend
2. Update the user role in MongoDB:

```bash
mongosh
use ecommerce
db.users.updateOne(
  { email: "your@email.com" },
  { $set: { role: "admin" } }
)
```

### Method 3: Using create-admin Script

Create `backend/scripts/create-admin.js`:

```javascript
const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const admin = await User.create({
      name: 'Admin',
      email: 'admin@example.com',
      password: 'admin123456',
      role: 'admin'
    });
    
    console.log('Admin created:', admin.email);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

createAdmin();
```

Run:
```bash
node backend/scripts/create-admin.js
```

## Seeding Sample Data

```bash
cd backend
npm run seed
```

This will populate the database with:
- 8 sample products
- Various categories
- Sample images

## Testing the Application

### 1. Health Check
```bash
curl http://localhost:5000/api/health
```

### 2. Register User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }'
```

### 3. Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### 4. Get Products
```bash
curl http://localhost:5000/api/products
```

## Troubleshooting

### MongoDB Connection Issues

**Error: "MongoNetworkError: failed to connect"**

Solutions:
- Verify MongoDB is running: `mongosh`
- Check MONGODB_URI in .env
- For Atlas: Check network access settings
- Verify credentials

### Port Already in Use

**Error: "EADDRINUSE: address already in use :::5000"**

Solutions:
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:5000 | xargs kill -9
```

### Module Not Found

**Error: "Cannot find module 'express'"**

Solution:
```bash
cd backend
rm -rf node_modules package-lock.json
npm install
```

### CORS Issues

**Error: "Access-Control-Allow-Origin"**

Solution:
- Verify CLIENT_URL in backend/.env
- Check CORS configuration in server.js
- Clear browser cache

### Stripe Payment Issues

**Error: "Invalid API Key"**

Solutions:
- Verify Stripe keys in .env
- Use test keys (start with sk_test_ and pk_test_)
- Check Stripe dashboard for key status

### Email Not Sending

**Error: "Invalid login"**

Solutions:
- Use App Password, not regular password
- Enable 2FA on Gmail
- Check EMAIL_USER and EMAIL_PASS in .env

## Development Tips

### Hot Reload
- Backend: Uses nodemon (auto-restart on file changes)
- Frontend: Uses React hot reload (auto-refresh)

### Debugging
- Backend: Add `console.log()` or use VS Code debugger
- Frontend: Use React DevTools browser extension
- Redux: Use Redux DevTools extension

### Database GUI Tools
- MongoDB Compass (Official)
- Robo 3T
- Studio 3T

### API Testing
- Postman
- Insomnia
- Thunder Client (VS Code extension)

## Next Steps

1. ✅ Complete environment setup
2. ✅ Start development servers
3. ✅ Create admin user
4. ✅ Seed sample data
5. 📝 Customize branding
6. 🎨 Modify UI components
7. 🚀 Deploy to production

## Production Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for production deployment guide.

## Support

If you encounter issues:
1. Check this guide thoroughly
2. Review error messages carefully
3. Search existing GitHub issues
4. Create new issue with:
   - Error message
   - Steps to reproduce
   - Environment details

---

Happy Coding! 🚀
