@echo off
echo 🚀 E-commerce Quick Setup & Product Seeding
echo.

echo 📦 Seeding initial products...
cd backend
node utils/seeder.js

echo.
echo ➕ Adding more products...
cd ..
node add-products.js

echo.
echo 🎉 All products added! Your store now has real products.
echo.
echo 💡 Next steps:
echo    1. Start backend: cd backend && npm run dev
echo    2. Start frontend: cd frontend && npm start
echo    3. Visit: http://localhost:3000
echo.
pause