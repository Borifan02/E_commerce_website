import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  Divider,
  CircularProgress,
  Paper,
} from '@mui/material';
import {
  ShoppingCart,
  Inventory,
  People,
  TrendingUp,
  Add,
  ArrowForward,
  CheckCircle,
  Schedule,
} from '@mui/icons-material';
import axios from 'axios';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/analytics/dashboard', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data) {
        setAnalytics(response.data);
      }
    } catch (err) {
      console.error('Fetch dashboard analytics error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const stats = [
    {
      title: 'Total Revenue',
      value: `$${(analytics?.totalRevenue || 0).toFixed(2)}`,
      icon: <TrendingUp sx={{ fontSize: 32 }} />,
      color: '#2e7d32',
      bgColor: '#e8f5e9',
    },
    {
      title: 'Total Orders',
      value: analytics?.totalOrders ?? 0,
      icon: <ShoppingCart sx={{ fontSize: 32 }} />,
      color: '#1976d2',
      bgColor: '#e3f2fd',
      link: '/admin/orders',
    },
    {
      title: 'Active Products',
      value: analytics?.totalProducts ?? 0,
      icon: <Inventory sx={{ fontSize: 32 }} />,
      color: '#ed6c02',
      bgColor: '#fff3e0',
      link: '/admin/products',
    },
    {
      title: 'Registered Users',
      value: analytics?.totalUsers ?? 0,
      icon: <People sx={{ fontSize: 32 }} />,
      color: '#9c27b0',
      bgColor: '#f3e5f5',
      link: '/admin/users',
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'processing':
        return 'info';
      case 'shipped':
        return 'primary';
      case 'delivered':
        return 'success';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 8, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold">
            Executive Admin Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Store performance, live metrics, sales volume, and quick management actions
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button
            variant="outlined"
            onClick={() => navigate('/admin/orders')}
          >
            Manage Orders
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate('/admin/products')}
          >
            Add Product
          </Button>
        </Box>
      </Box>

      {/* KPI Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card
              sx={{
                borderRadius: 3,
                boxShadow: 2,
                cursor: stat.link ? 'pointer' : 'default',
                transition: 'transform 0.2s',
                '&:hover': stat.link ? { transform: 'translateY(-4px)' } : {},
              }}
              onClick={() => stat.link && navigate(stat.link)}
            >
              <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 3 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" fontWeight="500">
                    {stat.title}
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" sx={{ mt: 0.5, color: stat.color }}>
                    {stat.value}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 3,
                    backgroundColor: stat.bgColor,
                    color: stat.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {stat.icon}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Quick Navigation Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Paper
            sx={{
              p: 2.5,
              borderRadius: 3,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              border: '1px solid #e0e0e0',
              '&:hover': { borderColor: 'primary.main', backgroundColor: 'action.hover' },
            }}
            onClick={() => navigate('/admin/products')}
          >
            <Box>
              <Typography variant="subtitle1" fontWeight="bold">Catalog & Inventory</Typography>
              <Typography variant="body2" color="text.secondary">Create, edit, and set product pricing</Typography>
            </Box>
            <ArrowForward color="action" />
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper
            sx={{
              p: 2.5,
              borderRadius: 3,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              border: '1px solid #e0e0e0',
              '&:hover': { borderColor: 'primary.main', backgroundColor: 'action.hover' },
            }}
            onClick={() => navigate('/admin/orders')}
          >
            <Box>
              <Typography variant="subtitle1" fontWeight="bold">Fulfillment & Orders</Typography>
              <Typography variant="body2" color="text.secondary">Ship orders, track packages, update status</Typography>
            </Box>
            <ArrowForward color="action" />
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper
            sx={{
              p: 2.5,
              borderRadius: 3,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              border: '1px solid #e0e0e0',
              '&:hover': { borderColor: 'primary.main', backgroundColor: 'action.hover' },
            }}
            onClick={() => navigate('/admin/users')}
          >
            <Box>
              <Typography variant="subtitle1" fontWeight="bold">Customer Accounts</Typography>
              <Typography variant="body2" color="text.secondary">Manage customer roles and security</Typography>
            </Box>
            <ArrowForward color="action" />
          </Paper>
        </Grid>
      </Grid>

      {/* Main Grid: Recent Orders & Top Selling Products */}
      <Grid container spacing={3}>
        {/* Recent Orders */}
        <Grid item xs={12} md={7}>
          <Card sx={{ borderRadius: 3, boxShadow: 2, height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight="bold">
                  Recent Orders
                </Typography>
                <Button
                  size="small"
                  endIcon={<ArrowForward />}
                  onClick={() => navigate('/admin/orders')}
                >
                  View All
                </Button>
              </Box>
              <Divider sx={{ mb: 1 }} />
              {(!analytics?.recentOrders || analytics.recentOrders.length === 0) ? (
                <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
                  No recent orders available.
                </Typography>
              ) : (
                <List disablePadding>
                  {analytics.recentOrders.map((order, index) => (
                    <ListItem
                      key={order._id || index}
                      sx={{
                        px: 1,
                        py: 1.5,
                        borderRadius: 2,
                        '&:hover': { backgroundColor: 'action.hover' },
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: order.isPaid ? 'success.light' : 'warning.light' }}>
                          {order.isPaid ? <CheckCircle /> : <Schedule />}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Typography variant="subtitle2" fontWeight="600">
                            #{order._id.slice(-6).toUpperCase()} — ${order.totalPrice?.toFixed(2)}
                          </Typography>
                        }
                        secondary={
                          <Typography variant="caption" color="text.secondary">
                            {order.user?.name || 'Customer'} • {formatDate(order.createdAt)}
                          </Typography>
                        }
                      />
                      <Chip
                        label={order.status}
                        color={getStatusColor(order.status)}
                        size="small"
                        sx={{ textTransform: 'capitalize' }}
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Top Selling Products */}
        <Grid item xs={12} md={5}>
          <Card sx={{ borderRadius: 3, boxShadow: 2, height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight="bold">
                  Top Selling Products
                </Typography>
                <Button
                  size="small"
                  endIcon={<ArrowForward />}
                  onClick={() => navigate('/admin/products')}
                >
                  Catalog
                </Button>
              </Box>
              <Divider sx={{ mb: 1 }} />
              {(!analytics?.topProducts || analytics.topProducts.length === 0) ? (
                <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
                  No sales data yet. Once customers make purchases, top products will show here!
                </Typography>
              ) : (
                <List disablePadding>
                  {analytics.topProducts.map((item, index) => (
                    <ListItem key={index} sx={{ px: 1, py: 1.5 }}>
                      <ListItemAvatar>
                        <Avatar
                          src={item._id?.images?.[0]}
                          variant="rounded"
                          sx={{ width: 44, height: 44 }}
                        >
                          <Inventory />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Typography variant="subtitle2" fontWeight="600" noWrap>
                            {item._id?.name || 'Product'}
                          </Typography>
                        }
                        secondary={
                          <Typography variant="caption" color="text.secondary">
                            {item.totalSold} sold • ${item.revenue?.toFixed(2)} revenue
                          </Typography>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AdminDashboard;
