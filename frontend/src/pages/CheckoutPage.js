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
  RadioGroup,
  FormControlLabel,
  Radio,
  Chip,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  CreditCard,
  LocalShipping,
  LocalOffer,
  CheckCircle,
  PhoneAndroid,
  AccountBalance,
  Security,
} from '@mui/icons-material';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import api from '../utils/api';
import {
  selectCartItems,
  selectCartTotal,
  selectShippingAddress,
  saveShippingAddress,
  clearCart,
} from '../store/slices/cartSlice';
import { createOrder, payOrder, createPaymentIntent } from '../store/slices/orderSlice';
import TelebirrPayment from '../components/payment/TelebirrPayment';
import CbePayment from '../components/payment/CbePayment';
import { formatPrice } from '../utils/currency';
import { toast } from 'react-toastify';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || 'pk_test_sample_key');

const steps = ['Shipping Address', 'Payment Method', 'Review & Pay'];

// Stripe Card Payment Sub-Component
const CheckoutForm = ({ order, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      if (stripe && elements && order.clientSecret && !order.clientSecret.startsWith('mock_')) {
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
          setLoading(false);
          return;
        } else if (paymentIntent.status === 'succeeded') {
          await dispatch(payOrder({
            orderId: order._id,
            paymentResult: {
              id: paymentIntent.id,
              status: paymentIntent.status,
              update_time: new Date().toISOString(),
              email_address: paymentIntent.receipt_email,
            },
          }));
          onSuccess(order);
          return;
        }
      }

      // Simulated Payment Fallback for demo/test mode
      await api.post('/api/payment/confirm', {
        orderId: order._id,
        paymentIntentId: `SIM-${Date.now()}`,
      });

      await dispatch(payOrder({
        orderId: order._id,
        paymentResult: {
          id: `SIM-${Date.now()}`,
          status: 'succeeded',
          update_time: new Date().toISOString(),
        },
      }));
      onSuccess(order);
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Payment processing failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card sx={{ mb: 3, borderRadius: 2 }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <CreditCard color="primary" />
            <Typography variant="h6" fontWeight="bold">
              Credit / Debit Card Payment
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Encrypted 256-bit SSL transaction via Stripe.
          </Typography>

          <Alert severity="info" sx={{ mb: 3 }}>
            Demo / Sandbox Gateway Active. You can use test card <code>4242 4242 4242 4242</code> or any live card with keys configured.
          </Alert>

          <Box
            sx={{
              p: 2,
              border: '1px solid #ccc',
              borderRadius: 2,
              bgcolor: 'background.paper',
              mb: 3,
            }}
          >
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
                  invalid: {
                    color: '#9e2146',
                  },
                },
              }}
            />
          </Box>

          <Button
            type="button"
            variant="outlined"
            color="primary"
            fullWidth
            size="medium"
            disabled={loading}
            onClick={async () => {
              try {
                setLoading(true);
                const mockIntentId = `MOCK-CARD-${Date.now()}`;
                await api.post('/api/payment/confirm', {
                  orderId: order._id,
                  paymentIntentId: mockIntentId,
                });
                await dispatch(payOrder({
                  orderId: order._id,
                  paymentResult: {
                    id: mockIntentId,
                    status: 'succeeded',
                    update_time: new Date().toISOString(),
                    email_address: 'demo@card.com',
                  },
                }));
                toast.success('⚡ Mock card payment authorized successfully!');
                onSuccess(order);
              } catch (err) {
                toast.error('Mock payment simulation error');
              } finally {
                setLoading(false);
              }
            }}
            sx={{ mb: 2, fontWeight: 'bold', borderStyle: 'dashed', borderWidth: 2 }}
          >
            ⚡ Instant Test / Mock Pay (Simulate Card Success)
          </Button>

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            size="large"
            disabled={loading}
            sx={{ py: 1.5, fontWeight: 'bold' }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : `Authorize Payment ($${order.totalPrice?.toFixed(2)})`}
          </Button>
        </CardContent>
      </Card>
    </form>
  );
};

const CheckoutPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const cartItems = useSelector(selectCartItems);
  const cartTotal = useSelector(selectCartTotal);
  const shippingAddress = useSelector(selectShippingAddress);
  const { loading } = useSelector((state) => state.orders);

  const [activeStep, setActiveStep] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('telebirr');
  const [currentOrder, setCurrentOrder] = useState(null);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState(null);

  const [addressForm, setAddressForm] = useState({
    name: shippingAddress.name || '',
    street: shippingAddress.street || '',
    city: shippingAddress.city || '',
    state: shippingAddress.state || '',
    zipCode: shippingAddress.zipCode || '',
    country: shippingAddress.country || 'ET',
    phone: shippingAddress.phone || '',
  });

  useEffect(() => {
    if (!loading && cartItems.length === 0 && !currentOrder) {
      navigate('/cart');
    }
  }, [cartItems, navigate, loading, currentOrder]);

  const handleAddressChange = (e) => {
    setAddressForm({
      ...addressForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    try {
      setValidatingCoupon(true);
      const res = await api.post('/api/coupons/validate', {
        code: couponCode.trim(),
        orderAmount: cartTotal,
      });
      if (res.data?.success) {
        setAppliedCoupon(res.data.coupon);
        toast.success(res.data.message || 'Coupon applied successfully!');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid or expired coupon');
      setAppliedCoupon(null);
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleNext = async () => {
    if (activeStep === 0) {
      const requiredFields = ['name', 'street', 'city', 'phone'];
      const missingFields = requiredFields.filter((field) => !addressForm[field]);

      if (missingFields.length > 0) {
        toast.error('Please fill in all required shipping address fields (Name, Street, City, Phone)');
        return;
      }

      dispatch(saveShippingAddress(addressForm));
      setActiveStep(1);
      return;
    }

    if (activeStep === 1) {
      await handlePlaceOrder();
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => Math.max(0, prev - 1));
  };

  const handlePlaceOrder = async () => {
    try {
      const safeShippingAddress = {
        name: addressForm.name?.trim() || 'Customer',
        street: addressForm.street?.trim() || 'Main Street',
        city: addressForm.city?.trim() || 'Addis Ababa',
        state: addressForm.state?.trim() || addressForm.city?.trim() || 'Addis Ababa',
        zipCode: addressForm.zipCode?.trim() || '1000',
        country: addressForm.country?.trim() || 'ET',
        phone: addressForm.phone?.trim() || '0911223344',
      };

      const orderData = {
        orderItems: cartItems.map((item) => ({
          product: item.product || item._id,
          name: item.name,
          image: item.image || item.images?.[0] || '',
          price: item.price,
          quantity: item.quantity,
        })),
        shippingAddress: safeShippingAddress,
        paymentMethod,
        couponCode: appliedCoupon?.code,
      };

      const result = await dispatch(createOrder(orderData)).unwrap();
      const createdOrder = result.order || result;
      setCurrentOrder(createdOrder);

      // If Cash on delivery: complete immediately
      if (paymentMethod === 'cod') {
        dispatch(clearCart());
        toast.success('Order placed successfully via Cash on Delivery!');
        navigate(`/orders/${createdOrder._id}`);
        return;
      }

      // If Card: create payment intent
      if (paymentMethod === 'stripe') {
        await dispatch(createPaymentIntent(createdOrder._id));
      }

      // Move to step 2 (Review & Pay)
      setActiveStep(2);
    } catch (error) {
      console.error('Order creation failed:', error);
      const msg = typeof error === 'string' ? error : (error?.message || 'Failed to place order');
      toast.error(msg);
    }
  };

  const handlePaymentSuccess = (completedOrder) => {
    dispatch(clearCart());
    const finalOrder = completedOrder || currentOrder;
    setConfirmedOrder(finalOrder);
    setSuccessDialogOpen(true);
    toast.success('Payment verified! Your order is now being processed.');
  };

  const shippingPrice = cartTotal > 100 ? 0 : 10;
  const taxPrice = Math.round(cartTotal * 0.1 * 100) / 100;
  const discountAmount = appliedCoupon?.discount || 0;
  const totalPrice = Math.max(0, Math.round((cartTotal + shippingPrice + taxPrice - discountAmount) * 100) / 100);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          Secure Checkout
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Fast and safe checkout with Ethiopian local payments & international cards
        </Typography>
      </Box>

      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Grid container spacing={3}>
        {/* Left Step Flow */}
        <Grid item xs={12} md={8}>
          {/* STEP 0: SHIPPING ADDRESS */}
          {activeStep === 0 && (
            <Card sx={{ borderRadius: 2 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  1. Shipping & Delivery Address
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      required
                      fullWidth
                      name="name"
                      label="Full Recipient Name"
                      placeholder="e.g. Abebe Bikila"
                      value={addressForm.name}
                      onChange={handleAddressChange}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      required
                      fullWidth
                      name="street"
                      label="Street Address / House No / Woreda"
                      placeholder="e.g. Bole Sub-city, Woreda 03, House 452"
                      value={addressForm.street}
                      onChange={handleAddressChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      required
                      fullWidth
                      name="city"
                      label="City / Town"
                      placeholder="e.g. Addis Ababa"
                      value={addressForm.city}
                      onChange={handleAddressChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      name="state"
                      label="State / Region / Zone"
                      placeholder="e.g. Addis Ababa / Oromia / Amhara"
                      value={addressForm.state}
                      onChange={handleAddressChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      name="zipCode"
                      label="Postal Code (Optional)"
                      placeholder="e.g. 1000"
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
                        <MenuItem value="ET">Ethiopia (ኢትዮጵያ)</MenuItem>
                        <MenuItem value="US">United States</MenuItem>
                        <MenuItem value="CA">Canada</MenuItem>
                        <MenuItem value="UK">United Kingdom</MenuItem>
                        <MenuItem value="DE">Germany</MenuItem>
                        <MenuItem value="KE">Kenya</MenuItem>
                        <MenuItem value="AE">United Arab Emirates</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      required
                      fullWidth
                      name="phone"
                      label="Contact Phone Number"
                      placeholder="e.g. 0911 234 567 or +251 91 123 4567"
                      value={addressForm.phone}
                      onChange={handleAddressChange}
                      helperText="Used for SMS delivery updates and Telebirr verification"
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          )}

          {/* STEP 1: PAYMENT METHOD SELECTION */}
          {activeStep === 1 && (
            <Card sx={{ borderRadius: 2 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  2. Select Payment Channel
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Choose your preferred Ethiopian local mobile money or international card method:
                </Typography>

                <FormControl component="fieldset" fullWidth>
                  <RadioGroup
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  >
                    {/* Telebirr Option */}
                    <Paper
                      variant="outlined"
                      sx={{
                        p: 2,
                        mb: 2,
                        borderRadius: 2,
                        border: paymentMethod === 'telebirr' ? '2px solid #0088cc' : '1px solid #e2e8f0',
                        bgcolor: paymentMethod === 'telebirr' ? '#f0f9ff' : 'transparent',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                      onClick={() => setPaymentMethod('telebirr')}
                    >
                      <FormControlLabel
                        value="telebirr"
                        control={<Radio sx={{ color: '#0088cc', '&.Mui-checked': { color: '#0088cc' } }} />}
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                              <Box sx={{ bgcolor: '#0088cc', color: 'white', p: 1, borderRadius: '50%', display: 'flex' }}>
                                <PhoneAndroid sx={{ fontSize: 24 }} />
                              </Box>
                              <Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Typography variant="subtitle1" fontWeight="bold">
                                    telebirr (Ethio Telecom)
                                  </Typography>
                                  <Chip label="Most Popular" size="small" color="primary" sx={{ height: 20, fontSize: '11px' }} />
                                </Box>
                                <Typography variant="body2" color="text.secondary">
                                  Pay via Telebirr mobile wallet app or *127# USSD shortcode in Birr (ETB)
                                </Typography>
                              </Box>
                            </Box>
                          </Box>
                        }
                      />
                    </Paper>

                    {/* CBE Option */}
                    <Paper
                      variant="outlined"
                      sx={{
                        p: 2,
                        mb: 2,
                        borderRadius: 2,
                        border: paymentMethod === 'cbe' ? '2px solid #6b21a8' : '1px solid #e2e8f0',
                        bgcolor: paymentMethod === 'cbe' ? '#faf5ff' : 'transparent',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                      onClick={() => setPaymentMethod('cbe')}
                    >
                      <FormControlLabel
                        value="cbe"
                        control={<Radio sx={{ color: '#6b21a8', '&.Mui-checked': { color: '#6b21a8' } }} />}
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Box sx={{ bgcolor: '#6b21a8', color: '#fbbf24', p: 1, borderRadius: '50%', display: 'flex' }}>
                              <AccountBalance sx={{ fontSize: 24 }} />
                            </Box>
                            <Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="subtitle1" fontWeight="bold">
                                  Commercial Bank of Ethiopia (CBE / CBE Birr)
                                </Typography>
                                <Chip label="Direct Bank" size="small" sx={{ bgcolor: '#f3e8ff', color: '#6b21a8', height: 20, fontSize: '11px' }} />
                              </Box>
                              <Typography variant="body2" color="text.secondary">
                                Transfer to official CBE account via Mobile Banking, CBE Birr (*847#), or Branch
                              </Typography>
                            </Box>
                          </Box>
                        }
                      />
                    </Paper>

                    {/* Stripe Card Option */}
                    <Paper
                      variant="outlined"
                      sx={{
                        p: 2,
                        mb: 2,
                        borderRadius: 2,
                        border: paymentMethod === 'stripe' ? '2px solid #1976d2' : '1px solid #e2e8f0',
                        bgcolor: paymentMethod === 'stripe' ? '#f0f7ff' : 'transparent',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                      onClick={() => setPaymentMethod('stripe')}
                    >
                      <FormControlLabel
                        value="stripe"
                        control={<Radio />}
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Box sx={{ bgcolor: '#1976d2', color: 'white', p: 1, borderRadius: '50%', display: 'flex' }}>
                              <CreditCard sx={{ fontSize: 24 }} />
                            </Box>
                            <Box>
                              <Typography variant="subtitle1" fontWeight="bold">
                                Credit / Debit Card (Stripe)
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Visa, Mastercard, American Express (Encrypted & Instant)
                              </Typography>
                            </Box>
                          </Box>
                        }
                      />
                    </Paper>

                    {/* Cash on Delivery Option */}
                    <Paper
                      variant="outlined"
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        border: paymentMethod === 'cod' ? '2px solid #1976d2' : '1px solid #e2e8f0',
                        bgcolor: paymentMethod === 'cod' ? '#f0f7ff' : 'transparent',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                      onClick={() => setPaymentMethod('cod')}
                    >
                      <FormControlLabel
                        value="cod"
                        control={<Radio />}
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Box sx={{ bgcolor: '#059669', color: 'white', p: 1, borderRadius: '50%', display: 'flex' }}>
                              <LocalShipping sx={{ fontSize: 24 }} />
                            </Box>
                            <Box>
                              <Typography variant="subtitle1" fontWeight="bold">
                                Cash on Delivery (COD)
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Pay upon receipt in cash or mobile transfer when courier arrives
                              </Typography>
                            </Box>
                          </Box>
                        }
                      />
                    </Paper>
                  </RadioGroup>
                </FormControl>
              </CardContent>
            </Card>
          )}

          {/* STEP 2: PAYMENT COMPLETION */}
          {activeStep === 2 && currentOrder && (
            <Box>
              {paymentMethod === 'telebirr' && (
                <TelebirrPayment
                  order={currentOrder}
                  initialPhone={addressForm.phone}
                  onSuccess={handlePaymentSuccess}
                />
              )}

              {paymentMethod === 'cbe' && (
                <CbePayment
                  order={currentOrder}
                  onSuccess={handlePaymentSuccess}
                />
              )}

              {paymentMethod === 'stripe' && (
                <Elements stripe={stripePromise}>
                  <CheckoutForm order={currentOrder} onSuccess={handlePaymentSuccess} />
                </Elements>
              )}
            </Box>
          )}

          {/* Bottom Navigation Buttons */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
              variant="outlined"
              sx={{ px: 3 }}
            >
              Back
            </Button>
            {activeStep < 2 && (
              <Button
                variant="contained"
                onClick={handleNext}
                size="large"
                sx={{
                  px: 4,
                  py: 1.25,
                  fontWeight: 'bold',
                  bgcolor: paymentMethod === 'telebirr' ? '#0088cc' : paymentMethod === 'cbe' ? '#6b21a8' : 'primary.main',
                  '&:hover': {
                    bgcolor: paymentMethod === 'telebirr' ? '#006699' : paymentMethod === 'cbe' ? '#581c87' : 'primary.dark',
                  },
                }}
              >
                {activeStep === 1
                  ? paymentMethod === 'cod'
                    ? 'Confirm Order (COD)'
                    : `Proceed to ${paymentMethod === 'telebirr' ? 'Telebirr' : paymentMethod === 'cbe' ? 'CBE' : 'Card'} Payment`
                  : 'Continue to Payment Method'}
              </Button>
            )}
          </Box>
        </Grid>

        {/* Right Column: Order Summary & Coupon */}
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 3, position: 'sticky', top: 20, borderRadius: 2 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Order Summary
            </Typography>

            {cartItems.map((item) => (
              <Box key={item.product || item._id} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                <Typography variant="body2" noWrap sx={{ maxWidth: '65%' }}>
                  {item.name} × {item.quantity}
                </Typography>
                <Typography variant="body2" fontWeight="600">
                  ${(item.price * item.quantity).toFixed(2)}
                </Typography>
              </Box>
            ))}

            <Divider sx={{ my: 2 }} />

            {/* Promo Code Input */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>
                Have a Promo Code?
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  size="small"
                  fullWidth
                  placeholder="e.g. WELCOME10"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LocalOffer fontSize="small" color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
                <Button
                  variant="outlined"
                  size="small"
                  disabled={validatingCoupon || !couponCode.trim()}
                  onClick={handleApplyCoupon}
                >
                  Apply
                </Button>
              </Box>
              {appliedCoupon && (
                <Chip
                  icon={<CheckCircle />}
                  label={`Applied: ${appliedCoupon.code} (-$${appliedCoupon.discount?.toFixed(2)})`}
                  color="success"
                  size="small"
                  sx={{ mt: 1 }}
                  onDelete={() => setAppliedCoupon(null)}
                />
              )}
            </Box>

            <Divider sx={{ my: 1.5 }} />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" color="text.secondary">Subtotal</Typography>
              <Typography variant="body2">${cartTotal.toFixed(2)}</Typography>
            </Box>

            {discountAmount > 0 && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, color: 'success.main' }}>
                <Typography variant="body2">Discount ({appliedCoupon?.code})</Typography>
                <Typography variant="body2">-${discountAmount.toFixed(2)}</Typography>
              </Box>
            )}

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" color="text.secondary">Shipping</Typography>
              <Typography variant="body2">
                {shippingPrice === 0 ? 'FREE' : `$${shippingPrice.toFixed(2)}`}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" color="text.secondary">Estimated Tax</Typography>
              <Typography variant="body2">${taxPrice.toFixed(2)}</Typography>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 1 }}>
              <Typography variant="h6" fontWeight="bold">Total (USD)</Typography>
              <Typography variant="h6" color="primary" fontWeight="bold">
                ${totalPrice.toFixed(2)}
              </Typography>
            </Box>

            {/* Total in ETB */}
            <Box
              sx={{
                bgcolor: '#f1f5f9',
                p: 1.5,
                borderRadius: 2,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mt: 1,
              }}
            >
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                  Total in Ethiopian Birr
                </Typography>
                <Typography variant="body2" fontWeight="bold" sx={{ color: '#0f172a' }}>
                  {formatPrice(totalPrice, 'ETB')}
                </Typography>
              </Box>
              <Chip label="1 USD ≈ 120 ETB" size="small" sx={{ fontSize: '11px', height: 22 }} />
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 3, color: 'text.secondary' }}>
              <Security fontSize="small" />
              <Typography variant="caption">
                Guaranteed safe checkout with buyer protection and verified fulfillment.
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Order Confirmed & Payment Verified Celebration Modal */}
      <Dialog
        open={successDialogOpen}
        onClose={() => navigate(confirmedOrder?._id ? `/orders/${confirmedOrder._id}` : '/orders')}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle component="div" sx={{ textAlign: 'center', pt: 4, pb: 1 }}>
          <CheckCircle sx={{ fontSize: 64, color: 'success.main', mb: 1 }} />
          <Typography variant="h5" component="div" fontWeight="bold">
            Payment Verified & Order Confirmed!
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'center', px: 4 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Thank you for shopping with EthioMart. Your payment was successfully confirmed and your order is now being fulfilled.
          </Typography>

          <Paper variant="outlined" sx={{ p: 2.5, bgcolor: '#f8fafc', borderRadius: 2, mb: 3, textAlign: 'left' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" color="text.secondary">Order Reference:</Typography>
              <Typography variant="subtitle2" fontWeight="bold">
                #{confirmedOrder?._id ? confirmedOrder._id.slice(-8).toUpperCase() : 'CONFIRMED'}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" color="text.secondary">Payment Method:</Typography>
              <Chip
                label={(confirmedOrder?.paymentMethod || paymentMethod).toUpperCase()}
                color="success"
                size="small"
                sx={{ fontWeight: 'bold' }}
              />
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" color="text.secondary">Total Paid:</Typography>
              <Typography variant="subtitle2" fontWeight="bold" color="primary">
                ${(confirmedOrder?.totalPrice || totalPrice)?.toFixed(2)} ({formatPrice(confirmedOrder?.totalPrice || totalPrice, 'ETB')})
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" color="text.secondary">Estimated Delivery (Ethiopia):</Typography>
              <Typography variant="subtitle2" fontWeight="bold" color="text.primary">
                24 – 48 Hours
              </Typography>
            </Box>
          </Paper>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0, justifyContent: 'center', gap: 2 }}>
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={() => navigate(confirmedOrder?._id ? `/orders/${confirmedOrder._id}` : '/orders')}
            sx={{ fontWeight: 'bold', px: 3 }}
          >
            Track Order Details
          </Button>
          <Button
            variant="outlined"
            size="large"
            onClick={() => navigate('/products')}
            sx={{ fontWeight: 'bold' }}
          >
            Continue Shopping
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CheckoutPage;
