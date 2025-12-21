# Vercel Deployment Fix Guide

## Issues Fixed:

1. **API URL Configuration**: Changed from localhost to relative paths
2. **Environment Variables**: Updated for production
3. **CORS Configuration**: Added proper CORS settings
4. **Vercel Configuration**: Fixed routing configuration

## Steps to Deploy:

### 1. Environment Variables in Vercel Dashboard
Set these environment variables in your Vercel project dashboard:

**Backend Environment Variables:**
- `NODE_ENV` = `production`
- `MONGODB_URI` = `mongodb+srv://dabasaborifan_db_user:Avjqz1lwZWukQnYH@cluster0.waerydc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`
- `JWT_SECRET` = `mysupersecretkey123456789`
- `JWT_EXPIRE` = `30d`
- `STRIPE_SECRET_KEY` = `sk_test_51ScnySR58FH8Bu5pgyRDGxs7es1kQJt8io9ZSiINsQpBN745lb5fhleJjfSSZUNrhsdZ0i21IzKJxG03i0gsDdp200SyUdyT3C`
- `STRIPE_PUBLISHABLE_KEY` = `pk_test_51ScnySR58FH8Bu5pYbHzsgS3vEA1qTS4sK7xEbU8ZJsQ2QGiu10j2jo0KAOHVwCwLDxNgQkRTjL56wMNxKLl5dLg0077uIz37y`
- `STRIPE_WEBHOOK_SECRET` = `whsec_80091f37d4a4fe291ff952085adce168ac577677b404dafdf53b973130f59817`
- `EMAIL_USER` = `dabasaborifan@gmail.com`
- `EMAIL_PASS` = `quhcafhrsoufsbvu`
- `CLIENT_URL` = `https://your-actual-vercel-url.vercel.app`

**Frontend Environment Variables:**
- `REACT_APP_API_URL` = `/api`
- `REACT_APP_STRIPE_PUBLISHABLE_KEY` = `pk_test_51ScnySR58FH8Bu5pYbHzsgS3vEA1qTS4sK7xEbU8ZJsQ2QGiu10j2jo0KAOHVwCwLDxNgQkRTjL56wMNxKLl5dLg0077uIz37y`
- `GENERATE_SOURCEMAP` = `false`

### 2. Update CLIENT_URL
After deployment, update the `CLIENT_URL` environment variable in both:
- Vercel dashboard
- backend/.env file (replace "your-vercel-app-url" with actual URL)
- server.js CORS configuration

### 3. Deploy to Vercel
```bash
# Install Vercel CLI if not already installed
npm i -g vercel

# Deploy from project root
vercel --prod
```

### 4. Test the Deployment
After deployment:
1. Visit your Vercel URL
2. Check if products load on the homepage
3. Test API endpoints: `https://your-url.vercel.app/api/health`
4. Test product API: `https://your-url.vercel.app/api/products`

## Common Issues and Solutions:

### Products Still Not Loading?
1. Check browser console for errors
2. Verify API calls are going to `/api/products` not `localhost:5000`
3. Check Vercel function logs for backend errors
4. Ensure MongoDB connection is working

### CORS Errors?
1. Update CLIENT_URL in environment variables
2. Add your actual Vercel URL to CORS origins in server.js

### Build Errors?
1. Check that all dependencies are in package.json
2. Ensure build scripts are correct in both frontend and backend

## Files Modified:
- `frontend/.env` - Updated API URL
- `frontend/.env.production` - Created production config
- `frontend/src/utils/api.js` - Fixed API base URL
- `backend/.env` - Fixed environment variables
- `backend/server.js` - Added CORS configuration
- `vercel.json` - Fixed routing configuration