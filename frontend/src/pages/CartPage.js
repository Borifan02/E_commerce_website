import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardMedia,
  Grid,
  IconButton,
  Paper,
  Divider,
  Chip,
  Tooltip,
  Zoom,
  Fade,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Add,
  Remove,
  Delete,
  ShoppingCart,
  ArrowBack,
  FlashOn,
  Security,
  Verified,
  RemoveShoppingCart,
} from '@mui/icons-material';
import {
  selectCartItems,
  selectCartTotal,
  updateCartItemQuantity,
  removeFromCart,
  clearCart,
} from '../store/slices/cartSlice';
import { toast } from 'react-toastify';

const CartPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const cartItems = useSelector(selectCartItems);
  const cartTotal = useSelector(selectCartTotal);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [hoveredItem, setHoveredItem] = useState(null);

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity < 1) {
      setItemToDelete(productId);
      setDeleteDialogOpen(true);
    } else {
      dispatch(updateCartItemQuantity({ productId, quantity: newQuantity }));
      toast.success('Cart updated! 🛒');
    }
  };

  const handleRemoveItem = (productId) => {
    setItemToDelete(productId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (itemToDelete) {
      dispatch(removeFromCart(itemToDelete));
      toast.success('Item removed from cart 🗑️');
    }
    setDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  const handleCheckout = () => {
    navigate('/checkout');
  };

  const handleContinueShopping = () => {
    navigate('/products');
  };

  const subtotal = cartTotal;
  const shipping = subtotal > 100 ? 0 : 10;
  const tax = subtotal * 0.1;
  const total = subtotal + shipping + tax;

  if (cartItems.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Paper
          elevation={0}
          sx={{
            textAlign: 'center',
            py: 8,
            px: 4,
            borderRadius: 3,
            bgcolor: 'grey.50',
          }}
        >
          <RemoveShoppingCart
            sx={{
              fontSize: 120,
              color: 'text.secondary',
              mb: 3,
              opacity: 0.5,
            }}
          />
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
            Your cart is empty
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph sx={{ mb: 4 }}>
            Looks like you haven't added any items to your cart yet.
            <br />
            Start shopping to fill it up!
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={handleContinueShopping}
            sx={{
              borderRadius: 3,
              px: 4,
              py: 1.5,
              textTransform: 'none',
              fontWeight: 'bold',
              boxShadow: 2,
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: 4,
              },
              transition: 'all 0.3s',
            }}
          >
            Continue Shopping
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate(-1)}
            sx={{
              '&:hover': {
                bgcolor: 'action.hover',
              },
            }}
          >
            Back
          </Button>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
            Shopping Cart
          </Typography>
          <Chip
            label={`${cartItems.length} ${cartItems.length === 1 ? 'item' : 'items'}`}
            color="primary"
            sx={{ fontWeight: 'bold' }}
          />
        </Box>
        <Button
          variant="outlined"
          color="error"
          onClick={() => {
            if (window.confirm('Are you sure you want to clear your cart?')) {
              dispatch(clearCart());
              toast.success('Cart cleared');
            }
          }}
          sx={{ borderRadius: 2 }}
        >
          Clear Cart
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Cart Items */}
        <Grid item xs={12} md={8}>
          <Paper
            elevation={2}
            sx={{
              p: 3,
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
              Cart Items
            </Typography>
            {cartItems.map((item, index) => (
              <Fade in={true} timeout={300} key={item.product}>
                <Card
                  onMouseEnter={() => setHoveredItem(item.product)}
                  onMouseLeave={() => setHoveredItem(null)}
                  sx={{
                    mb: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 2,
                    overflow: 'hidden',
                    transition: 'all 0.3s',
                    '&:hover': {
                      borderColor: 'primary.main',
                      boxShadow: 4,
                      transform: 'translateX(4px)',
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', p: 2 }}>
                    {/* Product Image */}
                    <CardMedia
                      component="img"
                      image={item.image}
                      alt={item.name}
                      sx={{
                        width: 120,
                        height: 120,
                        objectFit: 'contain',
                        bgcolor: 'grey.50',
                        borderRadius: 2,
                        cursor: 'pointer',
                        mr: 2,
                        transition: 'transform 0.3s',
                        '&:hover': {
                          transform: 'scale(1.05)',
                        },
                      }}
                      onClick={() => navigate(`/products/${item.product}`)}
                    />

                    {/* Product Details */}
                    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 600,
                          mb: 1,
                          cursor: 'pointer',
                          '&:hover': {
                            color: 'primary.main',
                            textDecoration: 'underline',
                          },
                        }}
                        onClick={() => navigate(`/products/${item.product}`)}
                      >
                        {item.name}
                      </Typography>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
                          ${item.price.toFixed(2)}
                        </Typography>
                      </Box>

                      {/* Quantity Controls */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 'auto' }}>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            border: '1px solid',
                            borderColor: 'divider',
                            borderRadius: 2,
                            overflow: 'hidden',
                          }}
                        >
                          <IconButton
                            size="small"
                            onClick={() => handleQuantityChange(item.product, item.quantity - 1)}
                            sx={{ borderRadius: 0 }}
                          >
                            <Remove fontSize="small" />
                          </IconButton>
                          <Typography
                            variant="body1"
                            sx={{
                              px: 2,
                              minWidth: 50,
                              textAlign: 'center',
                              fontWeight: 'bold',
                            }}
                          >
                            {item.quantity}
                          </Typography>
                          <IconButton
                            size="small"
                            onClick={() => handleQuantityChange(item.product, item.quantity + 1)}
                            disabled={item.quantity >= (item.stock || 10)}
                            sx={{ borderRadius: 0 }}
                          >
                            <Add fontSize="small" />
                          </IconButton>
                        </Box>

                        <Typography variant="body1" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>
                          ${(item.price * item.quantity).toFixed(2)}
                        </Typography>

                        <Tooltip title="Remove from cart">
                          <IconButton
                            color="error"
                            onClick={() => handleRemoveItem(item.product)}
                            sx={{
                              ml: 'auto',
                              transition: 'transform 0.2s',
                              '&:hover': {
                                transform: 'scale(1.2)',
                              },
                            }}
                          >
                            <Delete />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>
                  </Box>
                </Card>
              </Fade>
            ))}
          </Paper>
        </Grid>

        {/* Order Summary */}
        <Grid item xs={12} md={4}>
          <Paper
            elevation={3}
            sx={{
              p: 3,
              borderRadius: 3,
              position: 'sticky',
              top: 20,
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
              Order Summary
            </Typography>

            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body1">Subtotal</Typography>
                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                  ${subtotal.toFixed(2)}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body1">Shipping</Typography>
                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                  {shipping === 0 ? (
                    <Chip label="FREE" size="small" color="success" />
                  ) : (
                    `$${shipping.toFixed(2)}`
                  )}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body1">Tax</Typography>
                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                  ${tax.toFixed(2)}
                </Typography>
              </Box>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  Total
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                  ${total.toFixed(2)}
                </Typography>
              </Box>
            </Box>

            {/* Free Shipping Alert */}
            {subtotal < 100 && (
              <Alert severity="info" sx={{ mb: 2, borderRadius: 2 }}>
                Add ${(100 - subtotal).toFixed(2)} more for <strong>FREE shipping</strong>!
              </Alert>
            )}

            {/* Security Badges */}
            <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
              <Chip
                icon={<Security />}
                label="Secure Checkout"
                size="small"
                color="success"
                variant="outlined"
              />
              <Chip
                icon={<Verified />}
                label="Verified"
                size="small"
                color="primary"
                variant="outlined"
              />
            </Box>

            {/* Action Buttons */}
            <Button
              fullWidth
              variant="contained"
              size="large"
              startIcon={<FlashOn />}
              onClick={handleCheckout}
              sx={{
                mb: 2,
                borderRadius: 3,
                py: 1.5,
                textTransform: 'none',
                fontWeight: 'bold',
                boxShadow: 3,
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: 5,
                },
                transition: 'all 0.3s',
              }}
            >
              Proceed to Checkout
            </Button>
            <Button
              fullWidth
              variant="outlined"
              size="large"
              onClick={handleContinueShopping}
              sx={{
                borderRadius: 3,
                py: 1.5,
                textTransform: 'none',
                fontWeight: 'bold',
              }}
            >
              Continue Shopping
            </Button>
          </Paper>
        </Grid>
      </Grid>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        TransitionComponent={Zoom}
      >
        <DialogTitle>Remove Item?</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to remove this item from your cart?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Remove
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CartPage;
