import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  Container,
  Grid,
  Typography,
  Button,
  Card,
  CardMedia,
  Rating,
  Chip,
  TextField,
  Alert,
  CircularProgress,
  Divider,
  Paper,
  Avatar,
} from '@mui/material';
import { ShoppingCart, ArrowBack } from '@mui/icons-material';
import { fetchProduct, createReview } from '../store/slices/productSlice';
import { addToCart } from '../store/slices/cartSlice';
import { toast } from 'react-toastify';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { product, loading } = useSelector((state) => state.products);
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    comment: '',
  });

  useEffect(() => {
    dispatch(fetchProduct(id));
  }, [dispatch, id]);

  const handleAddToCart = () => {
    dispatch(addToCart({
      product: product._id,
      name: product.name,
      image: product.images[0],
      price: product.price,
      quantity: quantity,
    }));
    toast.success('Product added to cart!');
  };

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please login to write a review');
      return;
    }
    dispatch(createReview({
      productId: product._id,
      rating: reviewForm.rating,
      comment: reviewForm.comment,
    }));
    setReviewForm({ rating: 5, comment: '' });
    toast.success('Review submitted successfully!');
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!product) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">Product not found</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate(-1)}
        sx={{ mb: 3 }}
      >
        Back
      </Button>

      <Grid container spacing={4}>
        {/* Product Images */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardMedia
              component="img"
              height="400"
              image={product.images[selectedImage]}
              alt={product.name}
              sx={{ objectFit: 'cover' }}
            />
            {product.images.length > 1 && (
              <Box sx={{ p: 2, display: 'flex', gap: 1, overflowX: 'auto' }}>
                {product.images.map((image, index) => (
                  <CardMedia
                    key={index}
                    component="img"
                    height="80"
                    image={image}
                    alt={`${product.name} ${index + 1}`}
                    sx={{
                      width: 80,
                      objectFit: 'cover',
                      cursor: 'pointer',
                      border: selectedImage === index ? '2px solid #1976d2' : '2px solid transparent',
                      borderRadius: 1,
                    }}
                    onClick={() => setSelectedImage(index)}
                  />
                ))}
              </Box>
            )}
          </Card>
        </Grid>

        {/* Product Info */}
        <Grid item xs={12} md={6}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              {product.name}
            </Typography>
            
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {product.brand}
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Rating
                value={product.rating}
                readOnly
                precision={0.1}
                size="large"
              />
              <Typography variant="body1" sx={{ ml: 1 }}>
                ({product.numReviews} reviews)
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Typography variant="h4" color="primary">
                ${product.price}
              </Typography>
              {product.originalPrice && product.originalPrice > product.price && (
                <>
                  <Typography
                    variant="h6"
                    sx={{ textDecoration: 'line-through', color: 'text.secondary' }}
                  >
                    ${product.originalPrice}
                  </Typography>
                  <Chip
                    label={`${product.discountPercentage}% OFF`}
                    color="error"
                    size="small"
                  />
                </>
              )}
            </Box>

            <Typography variant="body1" paragraph>
              {product.description}
            </Typography>

            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" color="text.secondary">
                Category: <Chip label={product.category} size="small" />
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Stock: {product.stock > 0 ? `${product.stock} available` : 'Out of stock'}
              </Typography>
            </Box>

            {product.stock > 0 && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Typography variant="body1">Quantity:</Typography>
                <TextField
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Math.min(product.stock, parseInt(e.target.value) || 1)))}
                  inputProps={{ min: 1, max: product.stock }}
                  sx={{ width: 100 }}
                  size="small"
                />
              </Box>
            )}

            <Button
              variant="contained"
              size="large"
              startIcon={<ShoppingCart />}
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              sx={{ mb: 3 }}
            >
              {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </Button>
          </Box>
        </Grid>
      </Grid>

      {/* Reviews Section */}
      <Box sx={{ mt: 6 }}>
        <Typography variant="h5" gutterBottom>
          Customer Reviews
        </Typography>
        
        {product.reviews.length === 0 ? (
          <Typography color="text.secondary">No reviews yet. Be the first to review!</Typography>
        ) : (
          <Box sx={{ mt: 2 }}>
            {product.reviews.map((review, index) => (
              <Paper key={index} sx={{ p: 3, mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Avatar sx={{ mr: 2 }}>
                    {review.name.charAt(0).toUpperCase()}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1">{review.name}</Typography>
                    <Rating value={review.rating} readOnly size="small" />
                  </Box>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {new Date(review.createdAt).toLocaleDateString()}
                </Typography>
                <Typography variant="body1" sx={{ mt: 1 }}>
                  {review.comment}
                </Typography>
              </Paper>
            ))}
          </Box>
        )}

        {/* Review Form */}
        {isAuthenticated && (
          <Paper sx={{ p: 3, mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Write a Review
            </Typography>
            <Box component="form" onSubmit={handleReviewSubmit}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" gutterBottom>
                  Rating
                </Typography>
                <Rating
                  value={reviewForm.rating}
                  onChange={(e, newValue) => setReviewForm({ ...reviewForm, rating: newValue })}
                />
              </Box>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Your Review"
                value={reviewForm.comment}
                onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                sx={{ mb: 2 }}
              />
              <Button type="submit" variant="contained">
                Submit Review
              </Button>
            </Box>
          </Paper>
        )}
      </Box>
    </Container>
  );
};

export default ProductDetailPage;
