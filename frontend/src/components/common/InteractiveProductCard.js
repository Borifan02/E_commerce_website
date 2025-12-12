import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
  Button,
  IconButton,
  Box,
  Chip,
  Rating,
  Tooltip,
  Fade,
} from '@mui/material';
import {
  ShoppingCart,
  Favorite,
  FavoriteBorder,
  Visibility,
  Add,
  Remove,
  FlashOn,
} from '@mui/icons-material';
import { addToCart } from '../../store/slices/cartSlice';
import { addToWishlist, removeFromWishlist } from '../../store/slices/wishlistSlice';
import { toast } from 'react-toastify';
// Animation will be handled with CSS transitions

const InteractiveProductCard = ({ product, index = 0 }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { items: wishlistItems } = useSelector((state) => state.wishlist);
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const isInWishlist = wishlistItems.some(
    (item) => item.product._id === product._id
  );

  const handleAddToCart = (e) => {
    e.stopPropagation();
    dispatch(addToCart({
      product: product._id,
      name: product.name,
      image: product.images[0],
      price: product.price,
      quantity: quantity,
      stock: product.stock
    }));
    toast.success(`Added ${quantity} ${product.name} to cart!`, {
      icon: '🛒',
    });
    setQuantity(1);
  };

  const handleWishlistToggle = async (e) => {
    e.stopPropagation();
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

  const handleQuickView = (e) => {
    e.stopPropagation();
    navigate(`/products/${product._id}`);
  };

  const handleQuantityChange = (e, delta) => {
    e.stopPropagation();
    const newQuantity = Math.max(1, Math.min(product.stock, quantity + delta));
    setQuantity(newQuantity);
  };

  const discountPercentage = product.originalPrice && product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <Box
      sx={{
        animation: 'fadeInUp 0.5s ease-out',
        '@keyframes fadeInUp': {
          from: {
            opacity: 0,
            transform: 'translateY(20px)',
          },
          to: {
            opacity: 1,
            transform: 'translateY(0)',
          },
        },
      }}
    >
      <Card
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => navigate(`/products/${product._id}`)}
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          cursor: 'pointer',
          border: '1px solid #e0e0e0',
          borderRadius: 2,
          overflow: 'hidden',
          position: 'relative',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            borderColor: 'primary.main',
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            transform: 'translateY(-4px)',
          },
        }}
      >
        {/* Badge for New/Featured */}
        {product.isNew && (
          <Chip
            label="NEW"
            size="small"
            color="success"
            sx={{
              position: 'absolute',
              top: 8,
              left: 8,
              zIndex: 2,
              fontWeight: 'bold',
            }}
          />
        )}

        {/* Discount Badge */}
        {discountPercentage > 0 && (
          <Chip
            label={`-${discountPercentage}%`}
            size="small"
            color="error"
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              zIndex: 2,
              fontWeight: 'bold',
            }}
          />
        )}

        {/* Image Container with Hover Effects */}
        <Box
          sx={{
            position: 'relative',
            height: 280,
            overflow: 'hidden',
            bgcolor: '#f5f5f5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {!imageLoaded && (
            <Box
              sx={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                bgcolor: '#e0e0e0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography variant="body2" color="text.secondary">
                Loading...
              </Typography>
            </Box>
          )}

          <CardMedia
            component="img"
            image={product.images[0]}
            alt={product.name}
            onLoad={() => setImageLoaded(true)}
            sx={{
              height: '100%',
              width: '100%',
              objectFit: 'contain',
              transition: 'transform 0.5s ease',
              transform: isHovered ? 'scale(1.1)' : 'scale(1)',
              p: 2,
            }}
          />

          {/* Quick Actions Overlay */}
          <Fade in={isHovered}>
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                bgcolor: 'rgba(0,0,0,0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1,
                opacity: isHovered ? 1 : 0,
                transition: 'opacity 0.3s',
              }}
            >
              <Tooltip title="Quick View">
                <IconButton
                  onClick={handleQuickView}
                  sx={{
                    bgcolor: 'white',
                    '&:hover': { bgcolor: 'primary.main', color: 'white' },
                  }}
                >
                  <Visibility />
                </IconButton>
              </Tooltip>
              <Tooltip title={isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}>
                <IconButton
                  onClick={handleWishlistToggle}
                  sx={{
                    bgcolor: 'white',
                    '&:hover': { bgcolor: 'error.main', color: 'white' },
                  }}
                >
                  {isInWishlist ? <Favorite color="error" /> : <FavoriteBorder />}
                </IconButton>
              </Tooltip>
            </Box>
          </Fade>
        </Box>

        <CardContent sx={{ flexGrow: 1, p: 2 }}>
          {/* Brand */}
          <Typography
            variant="caption"
            color="primary"
            sx={{
              textTransform: 'uppercase',
              fontWeight: 'bold',
              letterSpacing: 1,
              mb: 0.5,
            }}
          >
            {product.brand}
          </Typography>

          {/* Product Name */}
          <Typography
            variant="h6"
            component="h3"
            sx={{
              fontWeight: 600,
              mb: 1,
              display: '-webkit-box',
              overflow: 'hidden',
              WebkitBoxOrient: 'vertical',
              WebkitLineClamp: 2,
              minHeight: 48,
              lineHeight: 1.4,
            }}
          >
            {product.name}
          </Typography>

          {/* Rating */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5, gap: 1 }}>
            <Rating
              value={product.rating}
              precision={0.5}
              size="small"
              readOnly
              sx={{ color: '#ffc107' }}
            />
            <Typography variant="caption" color="text.secondary">
              ({product.numReviews})
            </Typography>
          </Box>

          {/* Price */}
          <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 2 }}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 'bold',
                color: 'primary.main',
              }}
            >
              ${product.price.toFixed(2)}
            </Typography>
            {product.originalPrice && product.originalPrice > product.price && (
              <>
                <Typography
                  variant="body2"
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
                  sx={{ height: 20, fontSize: '0.7rem' }}
                />
              </>
            )}
          </Box>

          {/* Stock Status */}
          {product.stock > 0 ? (
            <Typography variant="caption" color="success.main" sx={{ fontWeight: 'bold' }}>
              ✓ In Stock ({product.stock} available)
            </Typography>
          ) : (
            <Typography variant="caption" color="error.main" sx={{ fontWeight: 'bold' }}>
              ✗ Out of Stock
            </Typography>
          )}
        </CardContent>

        <CardActions sx={{ p: 2, pt: 0, gap: 1 }}>
          {product.stock > 0 ? (
            <>
              {/* Quantity Selector */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  border: '1px solid #e0e0e0',
                  borderRadius: 1,
                  overflow: 'hidden',
                }}
              >
                <IconButton
                  size="small"
                  onClick={(e) => handleQuantityChange(e, -1)}
                  disabled={quantity <= 1}
                  sx={{ borderRadius: 0 }}
                >
                  <Remove fontSize="small" />
                </IconButton>
                <Typography
                  variant="body2"
                  sx={{
                    px: 2,
                    minWidth: 40,
                    textAlign: 'center',
                    fontWeight: 'bold',
                  }}
                >
                  {quantity}
                </Typography>
                <IconButton
                  size="small"
                  onClick={(e) => handleQuantityChange(e, 1)}
                  disabled={quantity >= product.stock}
                  sx={{ borderRadius: 0 }}
                >
                  <Add fontSize="small" />
                </IconButton>
              </Box>

              {/* Add to Cart Button */}
              <Button
                fullWidth
                variant="contained"
                startIcon={<ShoppingCart />}
                onClick={handleAddToCart}
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 'bold',
                  py: 1.2,
                  transition: 'all 0.3s',
                  '&:hover': {
                    transform: 'scale(1.02)',
                    boxShadow: 4,
                  },
                }}
              >
                Add to Cart
              </Button>

              {/* Buy Now Button */}
              <Tooltip title="Buy Now">
                <IconButton
                  color="secondary"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddToCart(e);
                    navigate('/checkout');
                  }}
                  sx={{
                    bgcolor: 'secondary.main',
                    color: 'white',
                    '&:hover': {
                      bgcolor: 'secondary.dark',
                      transform: 'scale(1.1)',
                    },
                  }}
                >
                  <FlashOn />
                </IconButton>
              </Tooltip>
            </>
          ) : (
            <Button
              fullWidth
              variant="outlined"
              disabled
              sx={{ borderRadius: 2, textTransform: 'none' }}
            >
              Out of Stock
            </Button>
          )}
        </CardActions>
      </Card>
    </Box>
  );
};

export default InteractiveProductCard;

