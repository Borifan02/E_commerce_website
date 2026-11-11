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
  Chip,
} from '@mui/material';
import {
  LocalShipping,
  VerifiedUser,
  SupportAgent,
  TrendingUp,
  FlashOn,
  Star,
  PhoneAndroid,
  AccountBalance,
  Timer,
  Category,
  ArrowForward,
  Devices,
  CheckCircle,
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

  // Live Flash Sale Countdown Timer (counts down 8 hours 45 mins)
  const [timeLeft, setTimeLeft] = useState({
    hours: 8,
    minutes: 42,
    seconds: 19,
  });

  useEffect(() => {
    dispatch(fetchTopProducts());
  }, [dispatch]);

  // Auto-rotate hero slides
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % 3);
    }, 5500);
    return () => clearInterval(interval);
  }, []);

  // Flash Sale Timer Tick
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 12, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const heroSlides = [
    {
      title: 'Modern E-Commerce in Ethiopia',
      subtitle: 'Shop top international & local electronics with instant Telebirr and CBE checkout',
      bg: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #0284c7 100%)',
      badge: '🇪🇹 Direct Telebirr & CBE Payment',
      icon: <FlashOn sx={{ fontSize: 60 }} />,
    },
    {
      title: 'Flash Sale Discounts',
      subtitle: 'Up to 50% off on premium smartphones, laptops, audio & accessories',
      bg: 'linear-gradient(135deg, #701a75 0%, #c026d3 50%, #db2777 100%)',
      badge: '⚡ Limited Time Deals',
      icon: <TrendingUp sx={{ fontSize: 60 }} />,
    },
    {
      title: 'Express Doorstep Delivery',
      subtitle: 'Same-day courier in Addis Ababa, 48-hour delivery across all regional cities',
      bg: 'linear-gradient(135deg, #064e3b 0%, #059669 50%, #10b981 100%)',
      badge: '🚀 Addis Ababa & Nationwide',
      icon: <Star sx={{ fontSize: 60 }} />,
    },
  ];

  const categories = [
    { name: 'Electronics', count: '120+ Items', icon: <Devices />, color: '#2563eb' },
    { name: 'Laptops & Computers', count: '45+ Items', icon: <Devices />, color: '#7c3aed' },
    { name: 'Mobile Phones', count: '80+ Items', icon: <PhoneAndroid />, color: '#059669' },
    { name: 'Audio & Wearables', count: '60+ Items', icon: <Star />, color: '#ea580c' },
    { name: 'All Categories', count: 'Browse Catalog', icon: <Category />, color: '#0f172a' },
  ];

  return (
    <Box>
      {/* Interactive Hero Carousel */}
      <Box
        sx={{
          position: 'relative',
          height: isMobile ? '65vh' : '72vh',
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
                  animation: currentSlide === index ? 'fadeInUp 0.8s ease-out' : 'none',
                  '@keyframes fadeInUp': {
                    from: { opacity: 0, transform: 'translateY(25px)' },
                    to: { opacity: 1, transform: 'translateY(0)' },
                  },
                }}
              >
                <Chip
                  label={slide.badge}
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    fontWeight: 'bold',
                    mb: 2,
                    backdropFilter: 'blur(8px)',
                    fontSize: '14px',
                    py: 1.5,
                  }}
                />
                <Typography
                  variant={isMobile ? 'h3' : 'h2'}
                  component="h1"
                  gutterBottom
                  fontWeight="800"
                  sx={{ letterSpacing: '-0.5px' }}
                >
                  {slide.title}
                </Typography>
                <Typography
                  variant={isMobile ? 'body1' : 'h6'}
                  sx={{ mb: 4, opacity: 0.95, maxWidth: 650, mx: 'auto', fontWeight: 400 }}
                >
                  {slide.subtitle}
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
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
                      },
                      transition: 'all 0.3s',
                    }}
                  >
                    Start Shopping
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={() => navigate('/deals')}
                    sx={{
                      color: 'white',
                      borderColor: 'rgba(255,255,255,0.7)',
                      px: 4,
                      py: 1.5,
                      borderRadius: 3,
                      fontWeight: 'bold',
                      textTransform: 'none',
                      '&:hover': {
                        borderColor: 'white',
                        backgroundColor: 'rgba(255,255,255,0.1)',
                      },
                    }}
                  >
                    View Flash Deals
                  </Button>
                </Box>
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
                height: 10,
                borderRadius: 5,
                bgcolor: currentSlide === index ? 'white' : 'rgba(255,255,255,0.5)',
                cursor: 'pointer',
                transition: 'all 0.3s',
              }}
            />
          ))}
        </Box>
      </Box>

      {/* Ethiopian Payment & Trust Strip */}
      <Box sx={{ bgcolor: '#0f172a', color: 'white', py: 2.5, borderBottom: '3px solid #f59e0b' }}>
        <Container maxWidth="lg">
          <Grid container spacing={2} alignItems="center" justifyContent="space-between">
            <Grid item xs={6} sm={3}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{ bgcolor: '#0088cc', p: 1, borderRadius: '50%', display: 'flex' }}>
                  <PhoneAndroid sx={{ fontSize: 22, color: 'white' }} />
                </Box>
                <Box>
                  <Typography variant="subtitle2" fontWeight="bold">Telebirr Integrated</Typography>
                  <Typography variant="caption" sx={{ color: '#94a3b8' }}>USSD *127# or App</Typography>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={6} sm={3}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{ bgcolor: '#7e22ce', p: 1, borderRadius: '50%', display: 'flex' }}>
                  <AccountBalance sx={{ fontSize: 22, color: '#fbbf24' }} />
                </Box>
                <Box>
                  <Typography variant="subtitle2" fontWeight="bold">CBE & CBE Birr</Typography>
                  <Typography variant="caption" sx={{ color: '#94a3b8' }}>Direct Bank Transfer</Typography>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={6} sm={3}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{ bgcolor: '#059669', p: 1, borderRadius: '50%', display: 'flex' }}>
                  <LocalShipping sx={{ fontSize: 22, color: 'white' }} />
                </Box>
                <Box>
                  <Typography variant="subtitle2" fontWeight="bold">Nationwide Delivery</Typography>
                  <Typography variant="caption" sx={{ color: '#94a3b8' }}>Same-Day Addis Ababa</Typography>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={6} sm={3}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{ bgcolor: '#d97706', p: 1, borderRadius: '50%', display: 'flex' }}>
                  <VerifiedUser sx={{ fontSize: 22, color: 'white' }} />
                </Box>
                <Box>
                  <Typography variant="subtitle2" fontWeight="bold">100% Genuine</Typography>
                  <Typography variant="caption" sx={{ color: '#94a3b8' }}>Verified Warranty</Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Interactive Flash Sale Live Countdown Banner */}
      <Container maxWidth="lg" sx={{ mt: 5 }}>
        <Paper
          elevation={4}
          sx={{
            p: { xs: 2.5, md: 3.5 },
            borderRadius: 3,
            background: 'linear-gradient(135deg, #831843 0%, #be185d 50%, #e11d48 100%)',
            color: 'white',
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
            boxShadow: '0 10px 30px rgba(190, 24, 93, 0.3)',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ bgcolor: 'rgba(255,255,255,0.2)', p: 1.5, borderRadius: '50%', display: 'flex' }}>
              <Timer sx={{ fontSize: 36, color: '#fef08a' }} />
            </Box>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="h5" fontWeight="bold">
                  Flash Sale Today!
                </Typography>
                <Chip label="Save up to 40%" size="small" sx={{ bgcolor: '#fef08a', color: '#831843', fontWeight: 'bold' }} />
              </Box>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Hurry up! Special deals end when the countdown reaches zero. Use code <strong>SUPER20</strong> for extra $20 off.
              </Typography>
            </Box>
          </Box>

          {/* Countdown Clock Tiles */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ bgcolor: 'rgba(0,0,0,0.3)', p: 1.25, borderRadius: 2, minWidth: 60, textAlign: 'center' }}>
              <Typography variant="h5" fontWeight="bold">
                {String(timeLeft.hours).padStart(2, '0')}
              </Typography>
              <Typography variant="caption" sx={{ fontSize: '10px', textTransform: 'uppercase' }}>Hours</Typography>
            </Box>
            <Typography variant="h5" fontWeight="bold">:</Typography>
            <Box sx={{ bgcolor: 'rgba(0,0,0,0.3)', p: 1.25, borderRadius: 2, minWidth: 60, textAlign: 'center' }}>
              <Typography variant="h5" fontWeight="bold">
                {String(timeLeft.minutes).padStart(2, '0')}
              </Typography>
              <Typography variant="caption" sx={{ fontSize: '10px', textTransform: 'uppercase' }}>Mins</Typography>
            </Box>
            <Typography variant="h5" fontWeight="bold">:</Typography>
            <Box sx={{ bgcolor: 'rgba(0,0,0,0.3)', p: 1.25, borderRadius: 2, minWidth: 60, textAlign: 'center' }}>
              <Typography variant="h5" fontWeight="bold" sx={{ color: '#fef08a' }}>
                {String(timeLeft.seconds).padStart(2, '0')}
              </Typography>
              <Typography variant="caption" sx={{ fontSize: '10px', textTransform: 'uppercase' }}>Secs</Typography>
            </Box>

            <Button
              variant="contained"
              onClick={() => navigate('/products')}
              sx={{
                bgcolor: 'white',
                color: '#be185d',
                fontWeight: 'bold',
                px: 3,
                py: 1.25,
                ml: 1,
                borderRadius: 2,
                whiteSpace: 'nowrap',
                '&:hover': { bgcolor: '#fdf2f8' },
              }}
            >
              Shop Deals
            </Button>
          </Box>
        </Paper>
      </Container>

      {/* Category Explorer Strip */}
      <Container maxWidth="lg" sx={{ mt: 6 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" fontWeight="bold">
            Explore Popular Categories
          </Typography>
          <Button
            endIcon={<ArrowForward />}
            onClick={() => navigate('/products')}
            sx={{ fontWeight: 'bold' }}
          >
            All Categories
          </Button>
        </Box>

        <Grid container spacing={2}>
          {categories.map((cat, idx) => (
            <Grid item xs={6} sm={4} md={2.4} key={idx}>
              <Paper
                variant="outlined"
                sx={{
                  p: 2.5,
                  textAlign: 'center',
                  borderRadius: 3,
                  cursor: 'pointer',
                  transition: 'all 0.25s',
                  '&:hover': {
                    borderColor: cat.color,
                    boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                    transform: 'translateY(-4px)',
                  },
                }}
                onClick={() => navigate(cat.name === 'All Categories' ? '/products' : `/products?category=${encodeURIComponent(cat.name)}`)}
              >
                <Box sx={{ color: cat.color, mb: 1 }}>{cat.icon}</Box>
                <Typography variant="subtitle2" fontWeight="bold">
                  {cat.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {cat.count}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Top Products Section */}
      <Box sx={{ backgroundColor: 'grey.50', py: 8, mt: 6 }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography
              variant="h4"
              component="h2"
              gutterBottom
              sx={{ fontWeight: 'bold' }}
            >
              Featured & Trending Products
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Hand-picked best sellers backed by genuine warranty and local Telebirr / CBE payment
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
                  View All Catalog Products
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

      {/* Why Choose Us */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography
          variant="h4"
          component="h2"
          textAlign="center"
          gutterBottom
          sx={{ fontWeight: 'bold', mb: 4 }}
        >
          Why Customers Love Us
        </Typography>
        <Grid container spacing={4}>
          {[
            {
              icon: <LocalShipping sx={{ fontSize: 50 }} />,
              title: 'Fast Ethiopian Delivery',
              description: 'Doorstep fulfillment across Addis Ababa (same-day) and regional express freight.',
              color: '#1976d2',
            },
            {
              icon: <CheckCircle sx={{ fontSize: 50 }} />,
              title: 'Seamless Telebirr & CBE',
              description: 'Zero hassle local checkout. Pay in Ethiopian Birr without foreign credit card restrictions.',
              color: '#2e7d32',
            },
            {
              icon: <SupportAgent sx={{ fontSize: 50 }} />,
              title: 'Dedicated 24/7 Support',
              description: 'Direct customer service helpline in Amharic & English for orders and tracking.',
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
                  border: '1px solid #e2e8f0',
                  borderRadius: 3,
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  cursor: 'pointer',
                  '&:hover': {
                    borderColor: feature.color,
                    transform: 'translateY(-6px)',
                    boxShadow: '0 12px 30px rgba(0,0,0,0.08)',
                  },
                }}
              >
                <Box sx={{ color: feature.color, mb: 2 }}>{feature.icon}</Box>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
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

      {/* Interactive Newsletter */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
          color: 'white',
          py: 8,
          position: 'relative',
        }}
      >
        <Container maxWidth="md" sx={{ textAlign: 'center' }}>
          <Typography variant={isMobile ? 'h4' : 'h3'} component="h2" gutterBottom fontWeight="bold">
            Get Exclusive Ethiopian Birr Deals
          </Typography>
          <Typography variant="body1" sx={{ mb: 4, opacity: 0.85 }}>
            Subscribe to receive weekly flash sale coupon codes (up to 20% off) directly in your inbox.
          </Typography>
          <Box
            component="form"
            onSubmit={(e) => {
              e.preventDefault();
              alert('Thank you for subscribing! Check your email for promo code WELCOME10');
            }}
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
              required
              placeholder="Enter your email address"
              style={{
                flex: 1,
                padding: '14px 20px',
                borderRadius: '8px',
                border: '1px solid #334155',
                fontSize: '15px',
                outline: 'none',
                backgroundColor: '#1e293b',
                color: 'white',
              }}
            />
            <Button
              type="submit"
              variant="contained"
              size="large"
              sx={{
                backgroundColor: '#3b82f6',
                color: 'white',
                px: 4,
                py: 1.5,
                borderRadius: 2,
                fontWeight: 'bold',
                textTransform: 'none',
                '&:hover': { backgroundColor: '#2563eb' },
              }}
            >
              Subscribe
            </Button>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default HomePage;
