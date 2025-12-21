import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Paper,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  LocalShipping,
  VerifiedUser,
  SupportAgent,
  TrendingUp,
  FlashOn,
  Star,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTopProducts } from '../store/slices/productSlice';
import InteractiveProductCard from '../components/common/InteractiveProductCard';
import { ProductListSkeleton } from '../components/common/SkeletonLoader';

const HomePage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { topProducts, loading } = useSelector((state) => state.products);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    dispatch(fetchTopProducts());
  }, [dispatch]);

  // Auto-rotate hero slides
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % 3);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const heroSlides = [
    {
      title: 'Welcome to E-Store',
      subtitle: 'Discover amazing products at unbeatable prices',
      bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      icon: <FlashOn sx={{ fontSize: 60 }} />,
    },
    {
      title: 'Summer Sale',
      subtitle: 'Up to 50% off on selected items',
      bg: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      icon: <TrendingUp sx={{ fontSize: 60 }} />,
    },
    {
      title: 'New Arrivals',
      subtitle: 'Check out our latest collection',
      bg: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      icon: <Star sx={{ fontSize: 60 }} />,
    },
  ];

  return (
    <Box>
      {/* Interactive Hero Section with Carousel */}
      <Box
        sx={{
          position: 'relative',
          height: isMobile ? '60vh' : '70vh',
          overflow: 'hidden',
          color: 'white',
        }}
      >
        {heroSlides.map((slide, index) => (
          <Box
            key={index}
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: slide.bg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: currentSlide === index ? 1 : 0,
              transform: `translateX(${(index - currentSlide) * 100}%)`,
              transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
              zIndex: currentSlide === index ? 2 : 1,
            }}
          >
            <Container maxWidth="md" sx={{ textAlign: 'center' }}>
              <Box
                sx={{
                  animation: currentSlide === index ? 'fadeInUp 1s ease-out' : 'none',
                  '@keyframes fadeInUp': {
                    from: {
                      opacity: 0,
                      transform: 'translateY(30px)',
                    },
                    to: {
                      opacity: 1,
                      transform: 'translateY(0)',
                    },
                  },
                }}
              >
                {slide.icon}
                <Typography
                  variant={isMobile ? 'h3' : 'h2'}
                  component="h1"
                  gutterBottom
                  fontWeight="bold"
                  sx={{ mt: 2 }}
                >
                  {slide.title}
                </Typography>
                <Typography
                  variant={isMobile ? 'h6' : 'h5'}
                  sx={{ mb: 4, opacity: 0.95 }}
                >
                  {slide.subtitle}
                </Typography>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => navigate('/products')}
                  sx={{
                    backgroundColor: 'white',
                    color: 'primary.main',
                    px: 4,
                    py: 1.5,
                    borderRadius: 3,
                    fontWeight: 'bold',
                    textTransform: 'none',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                    '&:hover': {
                      backgroundColor: 'grey.100',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 25px rgba(0,0,0,0.3)',
                    },
                    transition: 'all 0.3s',
                  }}
                >
                  Shop Now
                </Button>
              </Box>
            </Container>
          </Box>
        ))}

        {/* Slide Indicators */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 20,
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: 1,
            zIndex: 3,
          }}
        >
          {heroSlides.map((_, index) => (
            <Box
              key={index}
              onClick={() => setCurrentSlide(index)}
              sx={{
                width: currentSlide === index ? 32 : 12,
                height: 12,
                borderRadius: 6,
                bgcolor: currentSlide === index ? 'white' : 'rgba(255,255,255,0.5)',
                cursor: 'pointer',
                transition: 'all 0.3s',
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.8)',
                },
              }}
            />
          ))}
        </Box>
      </Box>

      {/* Interactive Features Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography
          variant="h4"
          component="h2"
          textAlign="center"
          gutterBottom
          sx={{ fontWeight: 'bold', mb: 4 }}
        >
          Why Choose Us?
        </Typography>
        <Grid container spacing={4}>
          {[
            {
              icon: <LocalShipping sx={{ fontSize: 50 }} />,
              title: 'Fast Delivery',
              description: 'Get your orders delivered quickly with our reliable shipping partners.',
              color: '#1976d2',
            },
            {
              icon: <VerifiedUser sx={{ fontSize: 50 }} />,
              title: 'Quality Products',
              description: 'We only sell high-quality products from trusted brands and suppliers.',
              color: '#2e7d32',
            },
            {
              icon: <SupportAgent sx={{ fontSize: 50 }} />,
              title: '24/7 Support',
              description: 'Our customer support team is always here to help you with any questions.',
              color: '#ed6c02',
            },
          ].map((feature, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  textAlign: 'center',
                  height: '100%',
                  border: '2px solid transparent',
                  borderRadius: 3,
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  cursor: 'pointer',
                  '&:hover': {
                    borderColor: feature.color,
                    transform: 'translateY(-8px)',
                    boxShadow: `0 12px 40px rgba(0,0,0,0.15)`,
                    '& .feature-icon': {
                      transform: 'scale(1.1) rotate(5deg)',
                      color: feature.color,
                    },
                  },
                }}
              >
                <Box
                  className="feature-icon"
                  sx={{
                    color: feature.color,
                    mb: 2,
                    transition: 'all 0.3s',
                  }}
                >
                  {feature.icon}
                </Box>
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{ fontWeight: 'bold', mb: 2 }}
                >
                  {feature.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {feature.description}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Top Products Section */}
      <Box sx={{ backgroundColor: 'grey.50', py: 8 }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography
              variant="h4"
              component="h2"
              gutterBottom
              sx={{ fontWeight: 'bold' }}
            >
              Top Rated Products
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Discover our most loved products
            </Typography>
          </Box>
          
          {loading ? (
            <Grid container spacing={3}>
              {Array.from({ length: 8 }).map((_, index) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                  <ProductListSkeleton />
                </Grid>
              ))}
            </Grid>
          ) : topProducts.length > 0 ? (
            <>
              <Grid container spacing={3}>
                {topProducts.map((product, index) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={product._id}>
                    <InteractiveProductCard product={product} index={index} />
                  </Grid>
                ))}
              </Grid>
              <Box textAlign="center" sx={{ mt: 6 }}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => navigate('/products')}
                  sx={{
                    px: 6,
                    py: 1.5,
                    borderRadius: 3,
                    fontWeight: 'bold',
                    textTransform: 'none',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 25px rgba(0,0,0,0.2)',
                    },
                    transition: 'all 0.3s',
                  }}
                >
                  View All Products
                </Button>
              </Box>
            </>
          ) : (
            <Box textAlign="center" py={8}>
              <Typography variant="h6" color="text.secondary">
                No products available at the moment
              </Typography>
            </Box>
          )}
        </Container>
      </Box>

      {/* Interactive Newsletter Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          py: 8,
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)',
          },
        }}
      >
        <Container maxWidth="md" sx={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <Typography
            variant={isMobile ? 'h4' : 'h3'}
            component="h2"
            gutterBottom
            sx={{ fontWeight: 'bold', mb: 2 }}
          >
            Stay Updated
          </Typography>
          <Typography
            variant="h6"
            sx={{ mb: 4, opacity: 0.95 }}
          >
            Subscribe to our newsletter for the latest deals and product updates.
          </Typography>
          <Box
            component="form"
            sx={{
              display: 'flex',
              gap: 2,
              maxWidth: 500,
              mx: 'auto',
              flexDirection: isMobile ? 'column' : 'row',
            }}
          >
            <input
              type="email"
              placeholder="Enter your email"
              style={{
                flex: 1,
                padding: '12px 20px',
                borderRadius: '8px',
                border: 'none',
                fontSize: '16px',
                outline: 'none',
              }}
            />
            <Button
              variant="contained"
              size="large"
              sx={{
                backgroundColor: 'white',
                color: 'primary.main',
                px: 4,
                py: 1.5,
                borderRadius: 2,
                fontWeight: 'bold',
                textTransform: 'none',
                boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                '&:hover': {
                  backgroundColor: 'grey.100',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 25px rgba(0,0,0,0.3)',
                },
                transition: 'all 0.3s',
              }}
            >
              Subscribe Now
            </Button>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default HomePage;
