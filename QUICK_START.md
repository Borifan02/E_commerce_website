# ⚡ Quick Start Guide - E-Commerce Platform

## 🎯 Get Your E-Commerce Website Running in 10 Minutes!

Follow these simple steps to run your full-stack e-commerce website.

---

## 📋 Prerequisites Check

Before starting, make sure you have:

- ✅ **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- ✅ **MongoDB** - Choose one option:
  - **Option A**: Local MongoDB - [Download](https://www.mongodb.com/try/download/community)
  - **Option B**: MongoDB Atlas (Cloud - FREE) - [Sign Up](https://www.mongodb.com/cloud/atlas)

### Verify Installation

```bash
# Check Node.js
node --version
# Should show: v18.x.x or higher

# Check npm
npm --version
# Should show: 9.x.x or higher
```

---

## 🚀 Step-by-Step Setup

### Step 1: Install Dependencies (2 minutes)

Open terminal in project folder:

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

**Expected output**: "added XXX packages" for both

---

### Step 2: Setup MongoDB (3 minutes)

#### Option A: Local MongoDB

1. **Start MongoDB Service**

   **Windows:**
   ```bash
   # Open Command Prompt as Administrator
   net start MongoDB
   ```

   **Mac:**
   ```bash
   brew services start mongodb-community
   ```

   **Linux:**
   ```bash
   sudo systemctl start mongod
   ```

2. **Your MongoDB URI**: `mongodb://localhost:27017/ecommerce`

#### Option B: MongoDB Atlas (Cloud - Recommended)

1. **Create Free Account**: Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)

2. **Create Cluster**:
   - Click "Build a Database"
   - Choose "FREE" tier (M0)
   - Select region closest to you
   - Click "Create"

3. **Setup Access**:
   - **Database Access**: Add user (save username & password)
   - **Network Access**: Click "Add IP Address" → "Allow Access from Anywhere"

4. **Get Connection String**:
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your password
   - Example: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/ecommerce?retryWrites=true&w=majority`

---

### Step 3: Configure Environment (2 minutes)

1. **Open** `backend/.env` file

2. **Update** these settings:

```env
# REQUIRED - Update this!
MONGODB_URI=mongodb://localhost:27017/ecommerce
# OR for Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ecommerce

# REQUIRED - Change this to a random secret
JWT_SECRET=your_super_secret_key_change_this_to_something_random_123456789

# OPTIONAL - For testing, you can use these
STRIPE_SECRET_KEY=sk_test_51xxxxx
STRIPE_PUBLISHABLE_KEY=pk_test_51xxxxx

# OPTIONAL - For email features
EMAIL_USER=your.email@gmail.com
EMAIL_PASS=your_app_password

# Keep these as is
NODE_ENV=development
PORT=5000
JWT_EXPIRE=30d
CLIENT_URL=http://localhost:3000
```

**Minimum Required**: Just update `MONGODB_URI` and `JWT_SECRET`

---

### Step 4: Add Product Data (1 minute)

```bash
# Make sure you're in the backend folder
cd backend

# Seed database with 20 products
npm run seed
```

**Expected output**: 
```
✅ MongoDB Connected
🗑️  Products cleared
✅ 20 products added successfully!
🎉 Data seeding completed!
```

---

### Step 5: Start the Application (2 minutes)

**Open TWO terminal windows:**

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Expected output:**
```
Server running in development mode on port 5000
MongoDB Connected: localhost
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

**Expected output:**
```
Compiled successfully!
Local: http://localhost:3000
```

---

## 🎉 Success! Your Website is Running!

### Access Your E-Commerce Website:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/api/health

---

## 👤 Create Admin Account

### Method 1: Register & Upgrade (Easiest)

1. **Register** a new account at http://localhost:3000/register
2. **Open MongoDB** (Compass or Atlas)
3. **Find your user** in `users` collection
4. **Change** `role` from `"user"` to `"admin"`
5. **Logout and login** again

### Method 2: Using MongoDB Shell

```bash
# Open MongoDB shell
mongosh

# Switch to database
use ecommerce

# Update user to admin
db.users.updateOne(
  { email: "your@email.com" },
  { $set: { role: "admin" } }
)
```

---

## 🛍️ Test Your Website

### As Customer:
1. ✅ Browse products at http://localhost:3000
2. ✅ Register/Login
3. ✅ Add products to cart
4. ✅ View product details
5. ✅ Add to wishlist
6. ✅ Checkout (use test mode)

### As Admin:
1. ✅ Login with admin account
2. ✅ Visit http://localhost:3000/admin
3. ✅ View dashboard analytics
4. ✅ Manage products
5. ✅ Manage orders
6. ✅ View users

---

## 🎨 Sample Products Included

Your database now has 20 products:

- 📱 **Electronics**: iPhone, MacBook, PlayStation, Camera, TV
- 👟 **Sports**: Nike Shoes, Adidas Shoes, Fitness Tracker
- 👕 **Clothing**: Jeans, Jacket, Sunglasses
- 📚 **Books**: Harry Potter, Atomic Habits, Kindle
- 🏠 **Home**: KitchenAid Mixer, Dyson Vacuum, Instant Pot
- 🎮 **Toys**: LEGO Sets
- 🔊 **Audio**: Sony Headphones, Bose Speaker

All with real images from Unsplash!

---

## 🔧 Troubleshooting

### Problem: "Cannot connect to MongoDB"

**Solution:**
- Check if MongoDB is running
- Verify `MONGODB_URI` in `.env`
- For Atlas: Check network access settings

### Problem: "Port 5000 already in use"

**Solution:**
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:5000 | xargs kill -9
```

### Problem: "Module not found"

**Solution:**
```bash
cd backend
rm -rf node_modules package-lock.json
npm install
```

### Problem: "Products not showing"

**Solution:**
```bash
# Re-run seeder
cd backend
npm run seed
```

---

## 📱 Features Available

### ✅ Customer Features
- Product browsing with filters
- Search functionality
- Shopping cart
- Wishlist
- User authentication
- Order history
- Product reviews
- Checkout process

### ✅ Admin Features
- Dashboard with analytics
- Product management (CRUD)
- Order management
- User management
- Sales reports

---

## 🎯 Next Steps

### 1. Customize Your Store
- Update product images
- Add more products
- Customize colors/branding
- Update store name

### 2. Setup Payment (Optional)
- Get Stripe account: https://stripe.com
- Add test API keys to `.env`
- Test checkout process

### 3. Setup Email (Optional)
- Use Gmail with App Password
- Update `EMAIL_USER` and `EMAIL_PASS`
- Test order confirmations

### 4. Deploy Online
- See `DEPLOYMENT.md` for guides
- Deploy to Heroku, AWS, or DigitalOcean
- Get a custom domain

---

## 📚 Additional Resources

- **Full Setup Guide**: See `SETUP_GUIDE.md`
- **Deployment Guide**: See `DEPLOYMENT.md`
- **Architecture**: See `ARCHITECTURE.md`
- **API Documentation**: See `README.md`

---

## 💡 Quick Commands Reference

```bash
# Start backend
cd backend && npm run dev

# Start frontend
cd frontend && npm start

# Seed database
cd backend && npm run seed

# Install all dependencies
npm run install-all

# Run both (requires concurrently)
npm run dev
```

---

## 🆘 Need Help?

1. Check error messages carefully
2. Review this guide again
3. Check `SETUP_GUIDE.md` for detailed info
4. Verify all prerequisites are installed
5. Make sure MongoDB is running

---

## 🎊 Congratulations!

You now have a fully functional e-commerce website running locally!

**Happy Selling! 🛒**

---

## 📸 Screenshots

Your website should look like this:

- **Homepage**: Product grid with images
- **Product Page**: Details, reviews, add to cart
- **Cart**: Items with quantities and total
- **Admin Dashboard**: Analytics and charts
- **Product Management**: Add/edit/delete products

---

**Made with ❤️ using MERN Stack**
