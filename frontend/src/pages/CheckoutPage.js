import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Divider,
  Alert,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import {
  selectCartItems,
  selectCartTotal,
  selectShippingAddress,
  selectPaymentMethod,
  saveShippingAddress,
  savePaymentMethod,
  clearCart,
} from '../store/slices/cartSlice';
import { createOrder, payOrder } from '../store/slices/orderSlice';
import { toast } from 'react-toastify';
import axios from 'axios';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || 'pk_test_your_publishable_key_here');

const steps = ['Shipping Address', 'Payment Method', 'Review Order'];

const CheckoutForm = ({ order, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setLoading(true);

    try {
      const { error, paymentIntent } = await stripe.confirmCardPayment(
        order.clientSecret,
        {
          payment_method: {
            card: elements.getElement(CardElement),
          },
        }
      );

      if (error) {
        toast.error(error.message);
      } else if (paymentIntent.status === 'succeeded') {
        dispatch(payOrder({
          orderId: order._id,
          paymentResult: {
            id: paymentIntent.id,
            status: paymentIntent.status,
            update_time: new Date().toISOString(),
            email_address: paymentIntent.receipt_email,
          },
        }));
        onSuccess();
      }
    } catch (error) {
      toast.error('Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Payment Information
          </Typography>
          <Box sx={{ mb: 2 }}>
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: '16px',
                    color: '#424770',
                    '::placeholder': {
                      color: '#aab7c4',
                    },
                  },
                },
              }}
            />
          </Box>
          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={!stripe || loading}
            sx={{ py: 1.5 }}
          >
            {loading ? <CircularProgress size={24} /> : `Pay $${order.totalPrice.toFixed(2)}`}
          </Button>
        </CardContent>
      </Card>
    </form>
  );
};

const CheckoutPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const cartItems = useSelector(selectCartItems);
  const cartTotal = useSelector(selectCartTotal);
  const shippingAddress = useSelector(selectShippingAddress);
  const paymentMethod = useSelector(selectPaymentMethod);
  const { order, loading } = useSelector((state) => state.orders);

  const [activeStep, setActiveStep] = useState(0);
  const [addressForm, setAddressForm] = useState({
    name: user?.name || '',
    street: shippingAddress.street || '',
    city: shippingAddress.city || '',
    state: shippingAddress.state || '',
    zipCode: shippingAddress.zipCode || '',
    country: shippingAddress.country || 'US',
    phone: shippingAddress.phone || '',
  });

  useEffect(() => {
    if (cartItems.length === 0) {
      navigate('/cart');
    }
  }, [cartItems, navigate]);

  const handleAddressChange = (e) => {
    setAddressForm({
      ...addressForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleNext = () => {
    if (activeStep === 0) {
      // Validate address
      const requiredFields = ['name', 'street', 'city', 'state', 'zipCode', 'phone'];
      const missingFields = requiredFields.filter(field => !addressForm[field]);
      
      if (missingFields.length > 0) {
        toast.error('Please fill in all required fields');
        return;
      }
      
      dispatch(saveShippingAddress(addressForm));
    }
    setActiveStep(activeStep + 1);
  };

  const handleBack = () => {
    setActiveStep(activeStep - 1);
  };

  const handlePlaceOrder = async () => {
    try {
      const orderData = {
        orderItems: cartItems,
        shippingAddress: addressForm,
        paymentMethod: 'stripe',
        itemsPrice: cartTotal,
        taxPrice: cartTotal * 0.1,
        shippingPrice: cartTotal > 100 ? 0 : 10,
      };

      const result = await dispatch(createOrder(orderData));
      
      if (result.payload.success) {
        setActiveStep(2);
      }
    } catch (error) {
      toast.error('Failed to create order');
    }
  };

  const handlePaymentSuccess = () => {
    dispatch(clearCart());
    toast.success('Payment successful! Order placed.');
    navigate(`/orders/${order._id}`);
  };

  const shippingPrice = cartTotal > 100 ? 0 : 10;
  const taxPrice = cartTotal * 0.1;
  const totalPrice = cartTotal + shippingPrice + taxPrice;

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Checkout
      </Typography>

      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          {activeStep === 0 && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Shipping Address
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      required
                      fullWidth
                      name="name"
                      label="Full Name"
                      value={addressForm.name}
                      onChange={handleAddressChange}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      required
                      fullWidth
                      name="street"
                      label="Street Address"
                      value={addressForm.street}
                      onChange={handleAddressChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      required
                      fullWidth
                      name="city"
                      label="City"
                      value={addressForm.city}
                      onChange={handleAddressChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      required
                      fullWidth
                      name="state"
                      label="State"
                      value={addressForm.state}
                      onChange={handleAddressChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      required
                      fullWidth
                      name="zipCode"
                      label="ZIP Code"
                      value={addressForm.zipCode}
                      onChange={handleAddressChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Country</InputLabel>
                      <Select
                        name="country"
                        value={addressForm.country}
                        onChange={handleAddressChange}
                        label="Country"
                      >
                        <MenuItem value="US">United States</MenuItem>
                        <MenuItem value="CA">Canada</MenuItem>
                        <MenuItem value="UK">United Kingdom</MenuItem>
                        <MenuItem value="AU">Australia</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      required
                      fullWidth
                      name="phone"
                      label="Phone Number"
                      value={addressForm.phone}
                      onChange={handleAddressChange}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          )}

          {activeStep === 1 && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Payment Method
                </Typography>
                <Alert severity="info" sx={{ mb: 2 }}>
                  This is a demo. Use test card: 4242 4242 4242 4242
                </Alert>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={handlePlaceOrder}
                  sx={{ py: 1.5 }}
                >
                  Create Order
                </Button>
              </CardContent>
            </Card>
          )}

          {activeStep === 2 && order && (
            <Elements stripe={stripePromise}>
              <CheckoutForm order={order} onSuccess={handlePaymentSuccess} />
            </Elements>
          )}
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 3, position: 'sticky', top: 20 }}>
            <Typography variant="h6" gutterBottom>
              Order Summary
            </Typography>
            
            {cartItems.map((item) => (
              <Box key={item.product} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">
                  {item.name} x {item.quantity}
                </Typography>
                <Typography variant="body2">
                  ${(item.price * item.quantity).toFixed(2)}
                </Typography>
              </Box>
            ))}
            
            <Divider sx={{ my: 2 }} />
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2">Subtotal</Typography>
              <Typography variant="body2">${cartTotal.toFixed(2)}</Typography>
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2">Shipping</Typography>
              <Typography variant="body2">
                {shippingPrice === 0 ? 'FREE' : `$${shippingPrice.toFixed(2)}`}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2">Tax</Typography>
              <Typography variant="body2">${taxPrice.toFixed(2)}</Typography>
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="h6">Total</Typography>
              <Typography variant="h6" color="primary">
                ${totalPrice.toFixed(2)}
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
        <Button
          disabled={activeStep === 0}
          onClick={handleBack}
        >
          Back
        </Button>
        {activeStep < 2 && (
          <Button
            variant="contained"
            onClick={handleNext}
          >
            {activeStep === 1 ? 'Place Order' : 'Next'}
          </Button>
        )}
      </Box>
    </Container>
  );
};

export default CheckoutPage;
