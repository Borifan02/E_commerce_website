import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Box, CircularProgress, Typography, Button, Paper } from '@mui/material';
import { AdminPanelSettings, Security } from '@mui/icons-material';

const ProtectedRoute = ({ children, adminOnly = false, customerOnly = false }) => {
  const { isAuthenticated, user, loading } = useSelector((state) => state.auth);
  const location = useLocation();
  const navigate = useNavigate();

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="50vh"
        flexDirection="column"
      >
        <CircularProgress />
        <Typography variant="body1" sx={{ mt: 2 }}>
          Loading...
        </Typography>
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (adminOnly && user?.role !== 'admin') {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="50vh"
        p={3}
      >
        <Paper elevation={3} sx={{ p: 4, maxWidth: 500, textAlign: 'center', borderRadius: 3 }}>
          <Security color="error" sx={{ fontSize: 60, mb: 1 }} />
          <Typography variant="h5" color="error" fontWeight="bold" gutterBottom>
            Administrator Access Required
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            You do not have administrative privileges to view the Admin Dashboard or management consoles.
          </Typography>
          <Button variant="contained" onClick={() => navigate('/')}>
            Return to Store
          </Button>
        </Paper>
      </Box>
    );
  }

  if (customerOnly && user?.role === 'admin') {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="50vh"
        p={3}
      >
        <Paper elevation={3} sx={{ p: 4, maxWidth: 520, textAlign: 'center', borderRadius: 3, border: '1px solid #e2e8f0' }}>
          <AdminPanelSettings color="primary" sx={{ fontSize: 60, mb: 1 }} />
          <Typography variant="h5" color="primary" fontWeight="bold" gutterBottom>
            Role-Based Access Notice
          </Typography>
          <Typography variant="body1" fontWeight="500" sx={{ mb: 1 }}>
            Checkout and Cart are reserved for Customer accounts.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            You are logged in with the System Administrator role. In accordance with role-based segregation of duties, administrators manage catalog inventory and fulfillment rather than purchasing items.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button variant="contained" onClick={() => navigate('/admin')}>
              Go to Admin Dashboard
            </Button>
            <Button variant="outlined" onClick={() => navigate('/admin/products')}>
              Manage Products
            </Button>
          </Box>
        </Paper>
      </Box>
    );
  }

  return children;
};

export default ProtectedRoute;
