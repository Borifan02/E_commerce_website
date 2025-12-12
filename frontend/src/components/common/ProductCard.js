import React from 'react';
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
  Rating
} from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { addToCart } from '../../store/slices/cartSlice';
import { addToWishlist, removeFromWishlist } from '../../store/slices/wishlistSlice';
import { toast } from 'react-toastify';

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { items: wishlistItems } = useSelector((state) => state.wishlist);

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
      quantity: 1,
      stock: product.stock
    }));
    toast.success('Added to cart!');
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
        toast.success('Removed from wishlist');
      } else {
        await dispatch(addToWishlist(product._id)).unwrap();
        toast.success('Added to wishlist');
      }
    } catch (error) {
      toast.error(error);
    }
  };

  // Price formatting
  const priceParts = product.price.toString().split('.');
  const wholePrice = priceParts[0];
  const fractionPrice = priceParts[1] || '00';

  return (
    <Card
      onClick={() => navigate(`/products/${product._id}`)}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        border: '1px solid #eee',
        boxShadow: 'none',
        borderRadius: 0,
        position: 'relative',
        '&:hover': {
          borderColor: '#ddd',
          boxShadow: '0 0 10px rgba(0,0,0,0.1)'
        }
      }}
    >
      {/* Wishlist Icon */}
      <IconButton
        sx={{ position: 'absolute', top: 5, right: 5, zIndex: 10, bgcolor: 'rgba(255,255,255,0.8)' }}
        onClick={handleWishlistToggle}
        size="small"
      >
        {isInWishlist ? <FavoriteIcon color="error" fontSize="small" /> : <FavoriteBorderIcon fontSize="small" />}
      </IconButton>

      <Box sx={{ p: 2, display: 'flex', justifyContent: 'center', bgcolor: '#f7f7f7', height: '220px' }}>
        <CardMedia
          component="img"
          image={product.images[0]}
          alt={product.name}
          sx={{
            height: '100%',
            width: 'auto',
            maxWidth: '100%',
            objectFit: 'contain',
            mixBlendMode: 'multiply'
          }}
        />
      </Box>

      <CardContent sx={{ flexGrow: 1, p: 1.5, '&:last-child': { pb: 1.5 } }}>
        {/* Brand */}
        <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontSize: '10px', fontWeight: 'bold' }}>
          {product.brand}
        </Typography>

        {/* Title */}
        <Typography
          variant="body1"
          component="h2"
          sx={{
            fontWeight: 500,
            fontSize: '15px',
            lineHeight: 1.3,
            mb: 0.5,
            display: '-webkit-box',
            overflow: 'hidden',
            WebkitBoxOrient: 'vertical',
            WebkitLineClamp: 3,
            height: '60px'
          }}
        >
          {product.name}
        </Typography>

        {/* Rating */}
        <Box display="flex" alignItems="center" mb={0.5}>
          <Rating value={product.rating} precision={0.5} size="small" readOnly sx={{ fontSize: '16px' }} />
          <Typography variant="caption" color="primary" sx={{ ml: 0.5 }}>
            {product.numReviews}
          </Typography>
        </Box>

        {/* Price Block */}
        <Box display="flex" alignItems="baseline" mb={0.5}>
          <Typography variant="caption" sx={{ position: 'relative', top: '-5px', fontSize: '11px' }}>$</Typography>
          <Typography variant="h5" sx={{ fontWeight: 500, lineHeight: 1 }}>{wholePrice}</Typography>
          <Typography variant="caption" sx={{ position: 'relative', top: '-5px', fontSize: '11px' }}>{fractionPrice}</Typography>

          {product.originalPrice && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ textDecoration: 'line-through', ml: 1 }}
            >
              ${product.originalPrice}
            </Typography>
          )}
        </Box>

        {/* Prime / Delivery Mock */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Typography variant="caption" sx={{ color: '#565959' }}>
            Delivery by <span style={{ fontWeight: 'bold' }}>Tomorrow</span>
          </Typography>
        </Box>

        {product.stock === 0 ? (
          <Typography variant="body2" color="error">Currently unavailable.</Typography>
        ) : (
          <Button
            fullWidth
            variant="contained"
            color="secondary"
            size="small"
            onClick={handleAddToCart}
            sx={{ mt: 'auto', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}
          >
            Add to Cart
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default ProductCard;
