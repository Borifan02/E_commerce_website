import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Container } from '@mui/material';

// Components
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import ErrorBoundary from './components/common/ErrorBoundary';

// Pages
import HomePage from './pages/HomePage';
import ProductListPage from './pages/ProductListPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import OrderHistoryPage from './pages/OrderHistoryPage';
import OrderDetailPage from './pages/OrderDetailPage';
import CheckoutPage from './pages/CheckoutPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminOrders from './pages/admin/AdminOrders';
import AdminUsers from './pages/admin/AdminUsers';
import InfoPage from './pages/InfoPage';

// Protected Route Component
import ProtectedRoute from './components/common/ProtectedRoute';

function App() {
  return (
    <ErrorBoundary>
      <div className="App">
        <Navbar />
        <Container maxWidth="xl" sx={{ mt: 2, mb: 2, minHeight: '80vh' }}>
          <ErrorBoundary>
            <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductListPage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Info Pages */}
          <Route path="/deals" element={<InfoPage title="Today's Deals" />} />
          <Route path="/service" element={<InfoPage title="Customer Service" />} />
          <Route path="/registry" element={<InfoPage title="Registry" />} />
          <Route path="/gift-cards" element={<InfoPage title="Gift Cards" />} />
          <Route path="/sell" element={<InfoPage title="Sell on Amazon Clone" />} />
          <Route path="/about" element={<InfoPage title="About Us" />} />
          <Route path="/contact" element={<InfoPage title="Contact Us" />} />
          <Route path="/help" element={<InfoPage title="Help Center" />} />
          <Route path="/shipping" element={<InfoPage title="Shipping Information" />} />
          <Route path="/returns" element={<InfoPage title="Returns & Replacements" />} />
          <Route path="/privacy" element={<InfoPage title="Privacy Policy" />} />

          {/* Protected User Routes */}
          <Route path="/profile" element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } />
          <Route path="/orders" element={
            <ProtectedRoute>
              <OrderHistoryPage />
            </ProtectedRoute>
          } />
          <Route path="/orders/:id" element={
            <ProtectedRoute>
              <OrderDetailPage />
            </ProtectedRoute>
          } />
          <Route path="/checkout" element={
            <ProtectedRoute>
              <CheckoutPage />
            </ProtectedRoute>
          } />

          {/* Admin Routes */}
          <Route path="/admin" element={
            <ProtectedRoute adminOnly>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/products" element={
            <ProtectedRoute adminOnly>
              <AdminProducts />
            </ProtectedRoute>
          } />
          <Route path="/admin/orders" element={
            <ProtectedRoute adminOnly>
              <AdminOrders />
            </ProtectedRoute>
          } />
          <Route path="/admin/users" element={
            <ProtectedRoute adminOnly>
              <AdminUsers />
            </ProtectedRoute>
            } />
            </Routes>
          </ErrorBoundary>
        </Container>
        <Footer />
      </div>
    </ErrorBoundary>
  );
}

export default App;
