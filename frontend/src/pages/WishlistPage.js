import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Typography,
  Button,
  IconButton,
  Box,
  CircularProgress
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { fetchWishlist, removeFromWishlist } from '../store/slices/wishlistSlice';
import { addToCart } from '../store/slices/cartSlice';
import { toast } from 'react-toastify';

const WishlistPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, loading } = useSelector((state) => state.wishlist);
  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchWishlist());
    }
  }, [dispatch, isAuthenticated]);

  const handleRemove = async (productId) => {
    try {
      await dispatch(removeFromWishlist(productId)).unwrap();
      toast.success('Removed from wishlist');
    } catch (error) {
      toast.error(error);
    }
  };

  const handleAddToCart = (product) => {
    dispatch(addToCart({ ...product.product, quantity: 1 }));
    toast.success('Added to cart');
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        My Wishlist
      </Typography>

      {items.length === 0 ? (
        <Box textAlign="center" py={8}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Your wishlist is empty
          </Typography>
          <Button variant="contained" onClick={() => navigate('/products')} sx={{ mt: 2 }}>
            Browse Products
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {items.map((item) => (
            <Grid item xs={12} sm={6} md={4} key={item.product._id}>
              <Card>
                <CardMedia
                  component="img"
                  height="200"
                  image={item.product.images[0]}
                  alt={item.product.name}
                  sx={{ cursor: 'pointer' }}
                  onClick={() => navigate(`/products/${item.product._id}`)}
                />
                <CardContent>
                  <Typography variant="h6" noWrap>
                    {item.product.name}
                  </Typography>
                  <Typography variant="h5" color="primary" gutterBottom>
                    ${item.product.price}
                  </Typography>
                  <Box display="flex" gap={1}>
                    <Button
                      variant="contained"
                      startIcon={<ShoppingCartIcon />}
                      onClick={() => handleAddToCart(item)}
                      fullWidth
                    >
                      Add to Cart
                    </Button>
                    <IconButton
                      color="error"
                      onClick={() => handleRemove(item.product._id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default WishlistPage;
