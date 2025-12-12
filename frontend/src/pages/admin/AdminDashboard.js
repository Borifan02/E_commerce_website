import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
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
} from '@mui/material';
import {
  ShoppingCart,
  Inventory,
  People,
  TrendingUp,
  Add,
  Visibility,
} from '@mui/icons-material';
import { fetchProducts } from '../../store/slices/productSlice';
import { fetchAllOrders } from '../../store/slices/orderSlice';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { products } = useSelector((state) => state.products);
  const { orders } = useSelector((state) => state.orders);

  useEffect(() => {
    dispatch(fetchProducts({ limit: 5 }));
    dispatch(fetchAllOrders({ limit: 5 }));
  }, [dispatch]);

  const stats = [
    {
      title: 'Total Products',
      value: products.length,
      icon: <Inventory />,
      color: 'primary',
    },
    {
      title: 'Total Orders',
      value: orders.length,
      icon: <ShoppingCart />,
      color: 'secondary',
    },
    {
      title: 'Total Users',
      value: 0, // This would come from a users API
      icon: <People />,
      color: 'success',
    },
    {
      title: 'Revenue',
      value: `$${orders.reduce((sum, order) => sum + order.totalPrice, 0).toFixed(2)}`,
      icon: <TrendingUp />,
      color: 'warning',
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

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1">
          Admin Dashboard
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate('/admin/products')}
        >
          Add Product
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar sx={{ bgcolor: `${stat.color}.main`, mr: 2 }}>
                    {stat.icon}
                  </Avatar>
                  <Box>
                    <Typography variant="h4" component="div">
                      {stat.value}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {stat.title}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* Recent Orders */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Recent Orders
                </Typography>
                <Button
                  size="small"
                  onClick={() => navigate('/admin/orders')}
                >
                  View All
                </Button>
              </Box>
              <List>
                {orders.slice(0, 5).map((order, index) => (
                  <React.Fragment key={order._id}>
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar>
                          <ShoppingCart />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={`Order #${order._id.slice(-8).toUpperCase()}`}
                        secondary={`$${order.totalPrice.toFixed(2)} • ${new Date(order.createdAt).toLocaleDateString()}`}
                      />
                      <Chip
                        label={order.status}
                        color={getStatusColor(order.status)}
                        size="small"
                      />
                    </ListItem>
                    {index < orders.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Products */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Recent Products
                </Typography>
                <Button
                  size="small"
                  onClick={() => navigate('/admin/products')}
                >
                  View All
                </Button>
              </Box>
              <List>
                {products.slice(0, 5).map((product, index) => (
                  <React.Fragment key={product._id}>
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar
                          src={product.images[0]}
                          alt={product.name}
                          variant="rounded"
                        />
                      </ListItemAvatar>
                      <ListItemText
                        primary={product.name}
                        secondary={`$${product.price} • Stock: ${product.stock}`}
                      />
                      <Button
                        size="small"
                        startIcon={<Visibility />}
                        onClick={() => navigate(`/products/${product._id}`)}
                      >
                        View
                      </Button>
                    </ListItem>
                    {index < products.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Quick Actions
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                variant="outlined"
                fullWidth
                startIcon={<Add />}
                onClick={() => navigate('/admin/products')}
              >
                Add Product
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                variant="outlined"
                fullWidth
                startIcon={<ShoppingCart />}
                onClick={() => navigate('/admin/orders')}
              >
                Manage Orders
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                variant="outlined"
                fullWidth
                startIcon={<People />}
                onClick={() => navigate('/admin/users')}
              >
                Manage Users
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                variant="outlined"
                fullWidth
                startIcon={<Inventory />}
                onClick={() => navigate('/products')}
              >
                View Products
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Container>
  );
};

export default AdminDashboard;
