import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Paper,
} from '@mui/material';
import {
  ArrowBack,
  LocalShipping,
  Payment,
  CancelOutlined,
  CheckCircleOutline,
} from '@mui/icons-material';
import axios from 'axios';
import { toast } from 'react-toastify';
import { fetchOrder } from '../store/slices/orderSlice';

const trackerSteps = ['Order Placed', 'Processing', 'Shipped', 'Delivered'];

const OrderDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { order, loading, error } = useSelector((state) => state.orders);

  useEffect(() => {
    dispatch(fetchOrder(id));
  }, [dispatch, id]);

  const getStatusStepIndex = (status) => {
    switch (status) {
      case 'pending':
        return 0;
      case 'processing':
        return 1;
      case 'shipped':
        return 2;
      case 'delivered':
        return 3;
      default:
        return 0;
    }
  };

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
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleCancelOrder = async () => {
    if (window.confirm('Are you sure you want to cancel this order?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.put(
          `/api/orders/${order._id}/cancel`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.info('Order has been cancelled');
        dispatch(fetchOrder(id));
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to cancel order');
      }
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!order) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">Order not found</Alert>
      </Container>
    );
  }

  const isCancelled = order.status === 'cancelled';
  const activeStep = getStatusStepIndex(order.status);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/orders')}
            sx={{ mr: 2 }}
          >
            Orders
          </Button>
          <Typography variant="h4" component="h1" fontWeight="bold">
            Order #{order._id.slice(-8).toUpperCase()}
          </Typography>
        </Box>
        {order.status === 'pending' && (
          <Button
            variant="outlined"
            color="error"
            startIcon={<CancelOutlined />}
            onClick={handleCancelOrder}
          >
            Cancel Order
          </Button>
        )}
      </Box>

      {/* Visual Tracking Stepper */}
      <Paper sx={{ p: 3, mb: 4, borderRadius: 3 }}>
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
          Order Tracking Status
        </Typography>
        {isCancelled ? (
          <Alert severity="error" sx={{ mt: 1 }}>
            This order was cancelled. Any authorized charges will be refunded.
          </Alert>
        ) : (
          <Box sx={{ mt: 2 }}>
            <Stepper activeStep={activeStep} alternativeLabel>
              {trackerSteps.map((label, index) => (
                <Step key={label} completed={activeStep > index || (activeStep === index && order.status === 'delivered')}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </Box>
        )}
      </Paper>

      <Grid container spacing={3}>
        {/* Order Details Left Column */}
        <Grid item xs={12} md={8}>
          {/* Order Info Card */}
          <Card sx={{ mb: 3, borderRadius: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Fulfillment Overview</Typography>
                <Chip
                  label={order.status.toUpperCase()}
                  color={getStatusColor(order.status)}
                  size="small"
                />
              </Box>

              <Typography variant="body2" color="text.secondary">
                Placed on: {formatDate(order.createdAt)}
              </Typography>

              {order.paidAt && (
                <Typography variant="body2" color="text.secondary">
                  Paid on: {formatDate(order.paidAt)}
                </Typography>
              )}

              {order.trackingNumber && (
                <Box sx={{ mt: 1.5, p: 1.5, bgcolor: 'grey.50', borderRadius: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Courier Tracking Code:
                  </Typography>
                  <Typography variant="subtitle2" fontFamily="monospace" fontWeight="bold">
                    {order.trackingNumber}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card sx={{ mb: 3, borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Purchased Items ({order.orderItems?.length})
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Product</TableCell>
                      <TableCell align="center">Quantity</TableCell>
                      <TableCell align="right">Price</TableCell>
                      <TableCell align="right">Total</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {order.orderItems.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Box
                              component="img"
                              src={item.image || 'https://via.placeholder.com/50'}
                              alt={item.name}
                              sx={{
                                width: 50,
                                height: 50,
                                objectFit: 'cover',
                                borderRadius: 1,
                                mr: 2,
                                border: '1px solid #eee',
                              }}
                            />
                            <Typography variant="body2" fontWeight="500">
                              {item.name}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="center">{item.quantity}</TableCell>
                        <TableCell align="right">${item.price?.toFixed(2)}</TableCell>
                        <TableCell align="right" fontWeight="bold">
                          ${(item.price * item.quantity).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>

          {/* Shipping Address */}
          <Card sx={{ borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <LocalShipping sx={{ mr: 1, verticalAlign: 'middle' }} />
                Shipping Destination
              </Typography>
              <Typography variant="body1" fontWeight="600">
                {order.shippingAddress.name}
              </Typography>
              <Typography variant="body2">
                {order.shippingAddress.street}
              </Typography>
              <Typography variant="body2">
                {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
              </Typography>
              <Typography variant="body2">
                {order.shippingAddress.country}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
                Contact Phone: {order.shippingAddress.phone}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Order Summary Right Column */}
        <Grid item xs={12} md={4}>
          <Card sx={{ position: 'sticky', top: 20, borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Financial Summary
              </Typography>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">Items Subtotal</Typography>
                <Typography variant="body2">${order.itemsPrice?.toFixed(2)}</Typography>
              </Box>

              {order.discountPrice > 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, color: 'success.main' }}>
                  <Typography variant="body2">
                    Promo Discount {order.couponCode ? `(${order.couponCode})` : ''}
                  </Typography>
                  <Typography variant="body2">-${order.discountPrice?.toFixed(2)}</Typography>
                </Box>
              )}

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">Shipping</Typography>
                <Typography variant="body2">
                  {order.shippingPrice === 0 ? 'FREE' : `$${order.shippingPrice?.toFixed(2)}`}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">Estimated Tax</Typography>
                <Typography variant="body2">${order.taxPrice?.toFixed(2)}</Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" fontWeight="bold">Total Paid</Typography>
                <Typography variant="h6" color="primary" fontWeight="bold">
                  ${order.totalPrice?.toFixed(2)}
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Payment Method
                </Typography>
                <Chip
                  icon={<Payment />}
                  label={order.paymentMethod?.toUpperCase()}
                  color={order.isPaid ? 'success' : 'warning'}
                  size="small"
                />
              </Box>

              {order.isPaid && (
                <Box sx={{ display: 'flex', alignItems: 'center', color: 'success.main', mt: 1 }}>
                  <CheckCircleOutline sx={{ mr: 0.5, fontSize: 18 }} />
                  <Typography variant="caption">Payment verified</Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default OrderDetailPage;
