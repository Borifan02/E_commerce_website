# 🚀 START HERE - Complete Setup in 5 Steps

## Copy & Paste These Commands to Get Started!

---

## ✅ Step 1: Install Backend Dependencies

```bash
cd backend
npm install
```

**Wait for**: "added XXX packages"

---

## ✅ Step 2: Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

**Wait for**: "added XXX packages"

---

## ✅ Step 3: Configure Database

### Option A: Use MongoDB Atlas (Cloud - FREE & Easy)

1. Go to: https://www.mongodb.com/cloud/atlas
2. Sign up for free
3. Create a cluster (FREE tier)
4. Get connection string
5. Update `backend/.env`:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ecommerce
JWT_SECRET=mysupersecretkey123456789
```

### Option B: Use Local MongoDB

1. Install MongoDB from: https://www.mongodb.com/try/download/community
2. Start MongoDB service
3. Update `backend/.env`:

```env
MONGODB_URI=mongodb://localhost:27017/ecommerce
JWT_SECRET=mysupersecretkey123456789
```

---

## ✅ Step 4: Add Products to Database

```bash
cd backend
npm run seed
```

**Expected**: "✅ 20 products added successfully!"

---

## ✅ Step 5: Start Your Website

### Terminal 1 (Backend):
```bash
cd backend
npm run dev
```

**Expected**: "Server running on port 5000"

### Terminal 2 (Frontend):
```bash
cd frontend
npm start
```

**Expected**: Browser opens at http://localhost:3000

---

## 🎉 DONE! Your Website is Live!

Visit: **http://localhost:3000**

---

## 🔐 Create Admin Account

1. Register at: http://localhost:3000/register
2. Use MongoDB Compass or Atlas to change your user role to "admin"
3. Login again to access admin panel at: http://localhost:3000/admin

---

## 📦 What You Get

- ✅ 20 Products with real images
- ✅ Shopping cart
- ✅ User authentication
- ✅ Admin dashboard
- ✅ Order management
- ✅ Product reviews
- ✅ Wishlist feature

---

## 🆘 Having Issues?

### MongoDB Connection Error?
- Check if MongoDB is running
- Verify connection string in `backend/.env`

### Port Already in Use?
```bash
# Kill process on port 5000
npx kill-port 5000

# Kill process on port 3000
npx kill-port 3000
```

### Missing Packages?
```bash
# Reinstall backend
cd backend
rm -rf node_modules
npm install

# Reinstall frontend
cd frontend
rm -rf node_modules
npm install
```

---

## 📚 More Information

- **Detailed Guide**: See `QUICK_START.md`
- **Full Documentation**: See `README.md`
- **Deployment**: See `DEPLOYMENT.md`

---

**Happy Coding! 🎊**
