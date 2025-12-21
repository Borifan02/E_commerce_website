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
  const { user, isAuthenticated } = useSelector((state) => state.auth);
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
                    left: '50%',
                    transform: 'translateX(-50%)',
                    bgcolor: 'rgba(0,0,0,0.7)',
                    color: 'white',
                  }}
                />
              )}
            </Box>
          </Box>
        </Grid>

        {/* Image Lightbox */}
        <ImageLightbox
          images={product.images}
          open={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
          initialIndex={selectedImage}
        />

        {/* Center: Interactive Details */}
        <Grid item xs={12} md={4}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="h4"
                component="h1"
                gutterBottom
                sx={{
                  fontWeight: 500,
                  color: '#0F1111',
                  lineHeight: 1.3,
                }}
              >
                {product.name}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1, ml: 2 }}>
              <Tooltip title={isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}>
                <IconButton
                  onClick={handleWishlistToggle}
                  sx={{
                    border: '1px solid',
                    borderColor: 'divider',
                    '&:hover': {
                      bgcolor: 'error.light',
                      color: 'error.main',
                    },
                  }}
                >
                  {isInWishlist ? <Favorite color="error" /> : <FavoriteBorder />}
                </IconButton>
              </Tooltip>
              <Tooltip title="Share">
                <IconButton
                  onClick={handleShare}
                  sx={{
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <Share />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          <Typography
            variant="body2"
            color="primary"
            sx={{
              mb: 2,
              cursor: 'pointer',
              fontWeight: 500,
              '&:hover': {
                textDecoration: 'underline',
                color: '#c7511f',
              },
            }}
          >
            Visit the {product.brand} Store
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Rating
              value={product.rating}
              readOnly
              precision={0.5}
              size="medium"
              sx={{ color: '#ffc107' }}
            />
            <Typography
              variant="body1"
              sx={{
                color: '#007185',
                cursor: 'pointer',
                fontWeight: 500,
                '&:hover': {
                  textDecoration: 'underline',
                  color: '#c7511f',
                },
              }}
              onClick={() => {
                document.getElementById('reviews-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              {product.numReviews} {product.numReviews === 1 ? 'rating' : 'ratings'}
            </Typography>
            {product.numReviews > 0 && (
              <Chip
                label={`${product.rating.toFixed(1)} out of 5`}
                size="small"
                color="success"
                sx={{ fontWeight: 'bold' }}
              />
            )}
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Price Section */}
          <Box sx={{ mb: 3 }}>
            {discountPercentage > 0 && (
              <Chip
                label={`Save ${discountPercentage}%`}
                color="error"
                sx={{
                  mb: 1,
                  fontWeight: 'bold',
                  fontSize: '0.9rem',
                  height: 32,
                }}
              />
            )}
            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 1 }}>
              <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#CC0C39' }}>
                ${product.price.toFixed(2)}
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
                    ${product.originalPrice.toFixed(2)}
                  </Typography>
                  <Chip
                    label={`Save $${(product.originalPrice - product.price).toFixed(2)}`}
                    size="small"
                    color="success"
                    sx={{ fontWeight: 'bold' }}
                  />
                </>
              )}
            </Box>
            {product.originalPrice && (
              <Typography variant="body2" color="text.secondary">
                List Price: <span style={{ textDecoration: 'line-through' }}>${product.originalPrice.toFixed(2)}</span>
              </Typography>
            )}
          </Box>

          {/* Description with Tabs */}
          <Box sx={{ mb: 3 }}>
            <Tabs
              value={activeTab}
              onChange={(e, newValue) => setActiveTab(newValue)}
              sx={{
                borderBottom: 1,
                borderColor: 'divider',
                mb: 2,
              }}
            >
              <Tab label="Description" />
              <Tab label="Specifications" />
              <Tab label={`Reviews (${product.numReviews})`} />
            </Tabs>

            {activeTab === 0 && (
              <Typography
                variant="body1"
                sx={{
                  mt: 2,
                  lineHeight: 1.8,
                  color: 'text.primary',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {product.description}
              </Typography>
            )}

            {activeTab === 1 && product.specifications && (
              <Box sx={{ mt: 2 }}>
                <Grid container spacing={2}>
                  {Object.entries(product.specifications).map(([key, value]) => (
                    <React.Fragment key={key}>
                      <Grid item xs={4}>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 'bold',
                            color: '#565959',
                          }}
                        >
                          {key}
                        </Typography>
                      </Grid>
                      <Grid item xs={8}>
                        <Typography variant="body2">{value}</Typography>
                      </Grid>
                    </React.Fragment>
                  ))}
                </Grid>
              </Box>
            )}

            {activeTab === 2 && (
              <Box id="reviews-section">
                {product.reviews.length === 0 ? (
                  <Alert severity="info" sx={{ mt: 2 }}>
                    No reviews yet. Be the first to review!
                  </Alert>
                ) : (
                  <Box sx={{ mt: 2 }}>
                    {product.reviews.map((review, index) => (
                      <Paper
                        key={index}
                        elevation={0}
                        sx={{
                          p: 2,
                          mb: 2,
                          border: '1px solid',
                          borderColor: 'divider',
                          borderRadius: 2,
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                            {review.name.charAt(0).toUpperCase()}
                          </Avatar>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                              {review.name}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Rating value={review.rating} readOnly size="small" />
                              <Chip
                                icon={<Verified />}
                                label="Verified Purchase"
                                size="small"
                                color="success"
                                sx={{ height: 20, fontSize: '0.7rem' }}
                              />
                            </Box>
                          </Box>
                        </Box>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ display: 'block', mb: 1 }}
                        >
                          Reviewed on {new Date(review.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </Typography>
                        <Typography variant="body1">{review.comment}</Typography>
                        <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                          <Tooltip title="Helpful">
                            <IconButton size="small">
                              <ThumbUp fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Not Helpful">
                            <IconButton size="small">
                              <ThumbDown fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Paper>
                    ))}
                  </Box>
                )}
              </Box>
            )}
          </Box>
        </Grid>

        {/* Right: Interactive Buy Box */}
        <Grid item xs={12} md={3}>
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
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#CC0C39', mb: 1 }}>
              ${product.price.toFixed(2)}
            </Typography>
            {product.originalPrice && product.originalPrice > product.price && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 2 }}
              >
                List Price: <span style={{ textDecoration: 'line-through' }}>${product.originalPrice.toFixed(2)}</span>
              </Typography>
            )}

            <Box sx={{ mt: 1 }}>
              <Typography variant="body2" sx={{ color: '#565959' }}>
                Delivery <span style={{ fontWeight: 'bold', color: '#0F1111' }}>Tuesday, Sep 19</span>
              </Typography>
              <Typography variant="caption" sx={{ color: '#007185', display: 'block', mt: 0.5 }}>
                Deliver to {isAuthenticated ? user?.name : 'Select Location'}
              </Typography>
            </Box>

            <Typography variant="h6" sx={{ color: product.stock > 0 ? '#007600' : '#B12704', fontSize: '18px', my: 2 }}>
              {product.stock > 0 ? 'In Stock' : 'Currently Unavailable'}
            </Typography>

            {product.stock > 0 ? (
              <Box>
                {/* Quantity Selector */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    mb: 3,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 2,
                    p: 1,
                    justifyContent: 'space-between',
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    Quantity:
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <IconButton
                      size="small"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                      sx={{
                        border: '1px solid',
                        borderColor: 'divider',
                      }}
                    >
                      <Remove fontSize="small" />
                    </IconButton>
                    <Typography
                      variant="h6"
                      sx={{
                        minWidth: 40,
                        textAlign: 'center',
                        fontWeight: 'bold',
                      }}
                    >
                      {quantity}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      disabled={quantity >= product.stock}
                      sx={{
                        border: '1px solid',
                        borderColor: 'divider',
                      }}
                    >
                      <Add fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>

                <Button
                  fullWidth
                  variant="contained"
                  color="secondary"
                  size="large"
                  startIcon={<ShoppingCart />}
                  sx={{
                    mb: 2,
                    borderRadius: 3,
                    textTransform: 'none',
                    fontWeight: 'bold',
                    py: 1.5,
                    boxShadow: 2,
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: 4,
                    },
                    transition: 'all 0.3s',
                  }}
                  onClick={handleAddToCart}
                >
                  Add to Cart
                </Button>
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  startIcon={<FlashOn />}
                  onClick={handleBuyNow}
                  sx={{
                    bgcolor: '#ffa41c',
                    '&:hover': {
                      bgcolor: '#fa8900',
                      transform: 'translateY(-2px)',
                    },
                    color: 'black',
                    borderRadius: 3,
                    textTransform: 'none',
                    fontWeight: 'bold',
                    py: 1.5,
                    boxShadow: 2,
                    transition: 'all 0.3s',
                  }}
                >
                  Buy Now
                </Button>
              </Box>
            ) : (
              <Alert severity="error" sx={{ mb: 2 }}>
                Currently unavailable
              </Alert>
            )}

            <Box sx={{ mt: 2, fontSize: '12px', color: '#565959' }}>
              <Grid container>
                <Grid item xs={4}>Ships from</Grid>
                <Grid item xs={8}>Amazon.com</Grid>
                <Grid item xs={4}>Sold by</Grid>
                <Grid item xs={8}>Amazon.com</Grid>
              </Grid>
            </Box>
          </Paper>
        </Grid>

      </Grid>

      {/* Review Form Section */}
      {isAuthenticated && activeTab === 2 && (
        <Paper
          elevation={2}
          sx={{
            p: 3,
            mt: 4,
            borderRadius: 3,
            maxWidth: 800,
          }}
        >
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
            Write a Review
          </Typography>
          <Box component="form" onSubmit={handleReviewSubmit} sx={{ mt: 2 }}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" gutterBottom>
                Rating
              </Typography>
              <Rating
                value={reviewForm.rating}
                onChange={(e, newValue) =>
                  setReviewForm({ ...reviewForm, rating: newValue })
                }
                size="large"
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
              placeholder="Share your thoughts about this product..."
              sx={{ mb: 2 }}
            />
            <Button
              type="submit"
              variant="contained"
              disabled={!reviewForm.comment.trim() || reviewForm.comment.length < 10}
              sx={{ borderRadius: 2, textTransform: 'none' }}
            >
              Submit Review
            </Button>
          </Box>
        </Paper>
      )}
    </Container>
  );
};

export default ProductDetailPage;
