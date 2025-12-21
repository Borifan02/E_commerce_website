import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  Container,
  Grid,
  Typography,
  Button,
  Rating,
  Chip,
  TextField,
  Alert,
  Divider,
  Paper,
  Avatar,
  IconButton,
  Tooltip,
  Tabs,
  Tab,
  Fade,
  Breadcrumbs,
  Link,
} from '@mui/material';
import {
  ShoppingCart,
  ArrowBack,
  Favorite,
  FavoriteBorder,
  Share,
  ZoomIn,
  Add,
  Remove,
  FlashOn,
  Verified,
  ThumbUp,
  ThumbDown,
} from '@mui/icons-material';
import { fetchProduct, createReview } from '../store/slices/productSlice';
import { addToCart } from '../store/slices/cartSlice';
import { addToWishlist, removeFromWishlist } from '../store/slices/wishlistSlice';
import { toast } from 'react-toastify';
import ImageLightbox from '../components/common/ImageLightbox';
import { ProductDetailSkeleton } from '../components/common/SkeletonLoader';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { product, loading } = useSelector((state) => state.products);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { items: wishlistItems } = useSelector((state) => state.wishlist);

  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    comment: '',
  });
  const [imageZoom, setImageZoom] = useState(false);

  const isInWishlist = wishlistItems.some(
    (item) => item.product._id === product?._id
  );

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
      stock: product.stock
    }));
    toast.success(`Added ${quantity} ${product.name} to cart! 🛒`, {
      position: 'top-right',
    });
  };

  const handleBuyNow = () => {
    handleAddToCart();
    setTimeout(() => navigate('/checkout'), 500);
  };

  const handleWishlistToggle = async () => {
    if (!isAuthenticated) {
      toast.info('Please login to add to wishlist');
      navigate('/login');
      return;
    }

    try {
      if (isInWishlist) {
        await dispatch(removeFromWishlist(product._id)).unwrap();
        toast.success('Removed from wishlist ❤️');
      } else {
        await dispatch(addToWishlist(product._id)).unwrap();
        toast.success('Added to wishlist ❤️');
      }
    } catch (error) {
      toast.error(error);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: `Check out ${product.name} on E-Store!`,
          url: window.location.href,
        });
        toast.success('Shared successfully!');
      } catch (error) {
        // User cancelled or error
      }
    } else {
      // Fallback: Copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
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

  if (loading || !product) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <ProductDetailSkeleton />
      </Container>
    );
  }

  // Price formatting - removed unused variable
  const discountPercentage = product.originalPrice && product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <Container maxWidth="xl" sx={{ py: 4, bgcolor: 'white' }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link
          component="button"
          variant="body1"
          onClick={() => navigate('/')}
          sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
        >
          Home
        </Link>
        <Link
          component="button"
          variant="body1"
          onClick={() => navigate('/products')}
          sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
        >
          Products
        </Link>
        <Typography color="text.primary">{product.category}</Typography>
        <Typography color="text.primary">{product.name}</Typography>
      </Breadcrumbs>

      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate(-1)}
        sx={{
          mb: 2,
          color: '#565959',
          '&:hover': {
            bgcolor: 'action.hover',
          },
        }}
      >
        Back to results
      </Button>

      <Grid container spacing={4}>
        {/* Left: Interactive Image Gallery */}
        <Grid item xs={12} md={5}>
          <Box sx={{ display: 'flex', gap: 2, position: 'sticky', top: 20 }}>
            {/* Thumbnails */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {product.images.map((image, index) => (
                <Box
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  onMouseEnter={() => setSelectedImage(index)}
                  sx={{
                    width: 70,
                    height: 70,
                    border: selectedImage === index ? '3px solid' : '2px solid',
                    borderColor: selectedImage === index ? 'primary.main' : 'divider',
                    borderRadius: 2,
                    cursor: 'pointer',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s',
                    bgcolor: 'grey.50',
                    '&:hover': {
                      borderColor: 'primary.main',
                      transform: 'scale(1.05)',
                    },
                  }}
                >
                  <img
                    src={image}
                    alt={`Thumbnail ${index + 1}`}
                    style={{
                      maxWidth: '100%',
                      maxHeight: '100%',
                      objectFit: 'cover',
                    }}
                  />
                </Box>
              ))}
            </Box>

            {/* Main Image with Zoom */}
            <Box
              sx={{
                flexGrow: 1,
                position: 'relative',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'flex-start',
                bgcolor: 'grey.50',
                borderRadius: 2,
                overflow: 'hidden',
                minHeight: 500,
              }}
            >
              <Fade in={true} timeout={300}>
                <img
                  src={product.images[selectedImage]}
                  alt={product.name}
                  onClick={() => setLightboxOpen(true)}
                  style={{
                    maxWidth: '100%',
                    maxHeight: '500px',
                    objectFit: 'contain',
                    cursor: 'zoom-in',
                    transition: 'transform 0.3s',
                    transform: imageZoom ? 'scale(1.5)' : 'scale(1)',
                  }}
                  onMouseEnter={() => setImageZoom(true)}
                  onMouseLeave={() => setImageZoom(false)}
                />
              </Fade>

              {/* Zoom Indicator */}
              <Tooltip title="Click to view fullscreen">
                <IconButton
                  onClick={() => setLightboxOpen(true)}
                  sx={{
                    position: 'absolute',
                    top: 16,
                    right: 16,
                    bgcolor: 'rgba(255,255,255,0.9)',
                    '&:hover': {
                      bgcolor: 'white',
                    },
                  }}
                >
                  <ZoomIn />
                </IconButton>
              </Tooltip>

              {/* Image Counter */}
              {product.images.length > 1 && (
                <Chip
                  label={`${selectedImage + 1} / ${product.images.length}`}
                  size="small"
                  sx={{
                    position: 'absolute',
                    bottom: 16,
                    left: 16,
                    bgcolor: 'rgba(0,0,0,0.7)',
                    color: 'white',
                  }}
                />
              )}
            </Box>
          </Box>
        </Grid>

        {/* Right: Product Information */}
        <Grid item xs={12} md={7}>
          <Box sx={{ pl: { md: 4 } }}>
            {/* Product Title & Rating */}
            <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
              {product.name}
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Rating value={product.rating} precision={0.1} readOnly />
              <Typography variant="body2" color="text.secondary">
                ({product.numReviews} reviews)
              </Typography>
              {product.verified && (
                <Chip
                  icon={<Verified />}
                  label="Verified"
                  size="small"
                  color="success"
                  variant="outlined"
                />
              )}
            </Box>

            {/* Price Section */}
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 2, mb: 1 }}>
                <Typography variant="h4" color="error.main" sx={{ fontWeight: 700 }}>
                  ${product.price}
                </Typography>
                {product.originalPrice && product.originalPrice > product.price && (
                  <>
                    <Typography
                      variant="h6"
                      sx={{
                        textDecoration: 'line-through',
                        color: 'text.secondary',
                      }}
                    >
                      ${product.originalPrice}
                    </Typography>
                    <Chip
                      label={`${discountPercentage}% OFF`}
                      color="error"
                      size="small"
                      icon={<FlashOn />}
                    />
                  </>
                )}
              </Box>
              <Typography variant="body2" color="text.secondary">
                Inclusive of all taxes
              </Typography>
            </Box>

            {/* Stock Status */}
            <Box sx={{ mb: 3 }}>
              {product.stock > 0 ? (
                <Alert severity="success" sx={{ mb: 2 }}>
                  In Stock ({product.stock} available)
                </Alert>
              ) : (
                <Alert severity="error" sx={{ mb: 2 }}>
                  Out of Stock
                </Alert>
              )}
            </Box>

            {/* Description */}
            <Typography variant="body1" paragraph sx={{ mb: 3, lineHeight: 1.7 }}>
              {product.description}
            </Typography>

            {/* Quantity & Actions */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                Quantity:
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', border: 1, borderColor: 'divider', borderRadius: 1 }}>
                  <IconButton
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    size="small"
                  >
                    <Remove />
                  </IconButton>
                  <Typography sx={{ px: 2, minWidth: 40, textAlign: 'center' }}>
                    {quantity}
                  </Typography>
                  <IconButton
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    disabled={quantity >= product.stock}
                    size="small"
                  >
                    <Add />
                  </IconButton>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Max {product.stock} items
                </Typography>
              </Box>

              {/* Action Buttons */}
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<ShoppingCart />}
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  sx={{
                    flex: 1,
                    py: 1.5,
                    bgcolor: '#ff9f00',
                    '&:hover': {
                      bgcolor: '#e88900',
                    },
                  }}
                >
                  Add to Cart
                </Button>
                <Button
                  variant="contained"
                  size="large"
                  onClick={handleBuyNow}
                  disabled={product.stock === 0}
                  sx={{
                    flex: 1,
                    py: 1.5,
                    bgcolor: '#fb641b',
                    '&:hover': {
                      bgcolor: '#e55a19',
                    },
                  }}
                >
                  Buy Now
                </Button>
              </Box>

              {/* Secondary Actions */}
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  startIcon={isInWishlist ? <Favorite /> : <FavoriteBorder />}
                  onClick={handleWishlistToggle}
                  sx={{
                    flex: 1,
                    color: isInWishlist ? 'error.main' : 'text.secondary',
                    borderColor: isInWishlist ? 'error.main' : 'divider',
                  }}
                >
                  {isInWishlist ? 'In Wishlist' : 'Add to Wishlist'}
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Share />}
                  onClick={handleShare}
                  sx={{ flex: 1 }}
                >
                  Share
                </Button>
              </Box>
            </Box>

            {/* Product Features */}
            {product.features && product.features.length > 0 && (
              <Paper sx={{ p: 3, mb: 3, bgcolor: 'grey.50' }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  Key Features
                </Typography>
                <Box component="ul" sx={{ pl: 2, m: 0 }}>
                  {product.features.map((feature, index) => (
                    <Typography component="li" key={index} variant="body2" sx={{ mb: 0.5 }}>
                      {feature}
                    </Typography>
                  ))}
                </Box>
              </Paper>
            )}
          </Box>
        </Grid>
      </Grid>

      {/* Product Details Tabs */}
      <Box sx={{ mt: 6 }}>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Reviews" />
          <Tab label="Specifications" />
          <Tab label="Shipping & Returns" />
        </Tabs>

        {/* Reviews Tab */}
        {activeTab === 0 && (
          <Box sx={{ py: 4 }}>
            <Grid container spacing={4}>
              {/* Write Review */}
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  Write a Review
                </Typography>
                {isAuthenticated ? (
                  <Paper sx={{ p: 3 }}>
                    <form onSubmit={handleReviewSubmit}>
                      <Box sx={{ mb: 2 }}>
                        <Typography component="legend" gutterBottom>
                          Rating
                        </Typography>
                        <Rating
                          value={reviewForm.rating}
                          onChange={(e, newValue) =>
                            setReviewForm({ ...reviewForm, rating: newValue })
                          }
                        />
                      </Box>
                      <TextField
                        fullWidth
                        multiline
                        rows={4}
                        label="Your Review"
                        value={reviewForm.comment}
                        onChange={(e) =>
                          setReviewForm({ ...reviewForm, comment: e.target.value })
                        }
                        sx={{ mb: 2 }}
                      />
                      <Button type="submit" variant="contained">
                        Submit Review
                      </Button>
                    </form>
                  </Paper>
                ) : (
                  <Alert severity="info">
                    Please{' '}
                    <Link component="button" onClick={() => navigate('/login')}>
                      login
                    </Link>{' '}
                    to write a review.
                  </Alert>
                )}
              </Grid>

              {/* Reviews List */}
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  Customer Reviews ({product.reviews?.length || 0})
                </Typography>
                <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
                  {product.reviews && product.reviews.length > 0 ? (
                    product.reviews.map((review) => (
                      <Paper key={review._id} sx={{ p: 2, mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                            {review.user.name.charAt(0).toUpperCase()}
                          </Avatar>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                              {review.user.name}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Rating value={review.rating} size="small" readOnly />
                              <Typography variant="caption" color="text.secondary">
                                {new Date(review.createdAt).toLocaleDateString()}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                        <Typography variant="body2" sx={{ mb: 2 }}>
                          {review.comment}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <IconButton size="small">
                            <ThumbUp fontSize="small" />
                          </IconButton>
                          <IconButton size="small">
                            <ThumbDown fontSize="small" />
                          </IconButton>
                        </Box>
                      </Paper>
                    ))
                  ) : (
                    <Typography color="text.secondary">
                      No reviews yet. Be the first to review this product!
                    </Typography>
                  )}
                </Box>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Specifications Tab */}
        {activeTab === 1 && (
          <Box sx={{ py: 4 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Product Specifications
            </Typography>
            <Paper sx={{ p: 3 }}>
              {product.specifications ? (
                <Grid container spacing={2}>
                  {Object.entries(product.specifications).map(([key, value]) => (
                    <Grid item xs={12} sm={6} key={key}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, textTransform: 'capitalize' }}>
                          {key.replace(/([A-Z])/g, ' $1').trim()}:
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {value}
                        </Typography>
                      </Box>
                      <Divider />
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Typography color="text.secondary">
                  No specifications available for this product.
                </Typography>
              )}
            </Paper>
          </Box>
        )}

        {/* Shipping & Returns Tab */}
        {activeTab === 2 && (
          <Box sx={{ py: 4 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Shipping & Returns
            </Typography>
            <Paper sx={{ p: 3 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                    Shipping Information
                  </Typography>
                  <Typography variant="body2" paragraph>
                    • Free shipping on orders over $50
                  </Typography>
                  <Typography variant="body2" paragraph>
                    • Standard delivery: 3-5 business days
                  </Typography>
                  <Typography variant="body2" paragraph>
                    • Express delivery: 1-2 business days (additional charges apply)
                  </Typography>
                  <Typography variant="body2" paragraph>
                    • Same day delivery available in select cities
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                    Return Policy
                  </Typography>
                  <Typography variant="body2" paragraph>
                    • 30-day return policy
                  </Typography>
                  <Typography variant="body2" paragraph>
                    • Items must be in original condition
                  </Typography>
                  <Typography variant="body2" paragraph>
                    • Free returns for defective items
                  </Typography>
                  <Typography variant="body2" paragraph>
                    • Return shipping costs may apply for non-defective returns
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          </Box>
        )}
      </Box>

      {/* Image Lightbox */}
      <ImageLightbox
        images={product.images}
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        initialIndex={selectedImage}
      />
    </Container>
  );
};

export default ProductDetailPage;
