import React, { useEffect, useState, useMemo } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Chip,
  Paper,
  Button,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  Card,
  CardContent,
} from '@mui/material';
import {
  LocalOffer,
  Timer,
  ContentCopy,
  CheckCircle,
  TrendingDown,
  ShoppingBag,
} from '@mui/icons-material';
import api from '../utils/api';
import InteractiveProductCard from '../components/common/InteractiveProductCard';
import { toast } from 'react-toastify';

const DealsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [copiedCoupon, setCopiedCoupon] = useState(null);

  // Countdown timer simulation for daily deals (counts down to midnight)
  const [timeLeft, setTimeLeft] = useState({ hours: 11, minutes: 42, seconds: 18 });

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
        return { hours: 23, minutes: 59, seconds: 59 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchDealProducts = async () => {
      try {
        setLoading(true);
        const res = await api.get('/api/products?limit=50');
        if (res.data?.products) {
          setProducts(res.data.products);
        }
      } catch (err) {
        console.error('Error fetching deal products:', err);
        setError('Failed to load today deals. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchDealProducts();
  }, []);

  const promoCoupons = [
    { code: 'ETHIO2026', discount: '15% OFF', desc: 'Valid on electronics & fashion', minOrder: '$50' },
    { code: 'WELCOME10', discount: '10% OFF', desc: 'New customer welcome coupon', minOrder: '$30' },
    { code: 'SAVE50', discount: '20% OFF', desc: 'Orders above $200', minOrder: '$200' },
  ];

  const handleCopyCoupon = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCoupon(code);
    toast.success(`Coupon code ${code} copied to clipboard! Paste at checkout.`);
    setTimeout(() => setCopiedCoupon(null), 3000);
  };

  // Filter deals: either products with explicit discounts, or map promotional deals
  const dealProducts = useMemo(() => {
    let list = products.map((p, idx) => {
      const originalPrice = p.originalPrice || Math.round((p.price * (1.15 + (idx % 4) * 0.08)) * 100) / 100;
      const discountPercent = Math.round(((originalPrice - p.price) / originalPrice) * 100);
      return {
        ...p,
        originalPrice,
        discountPercent,
      };
    });

    if (activeTab === 'under50') {
      list = list.filter((p) => p.price < 50);
    } else if (activeTab === 'highDiscount') {
      list = list.filter((p) => p.discountPercent >= 20);
    } else if (activeTab !== 'all') {
      list = list.filter((p) => (p.category || '').toLowerCase() === activeTab.toLowerCase());
    }

    return list;
  }, [products, activeTab]);

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Banner / Header */}
      <Paper
        sx={{
          p: { xs: 3, md: 5 },
          mb: 4,
          borderRadius: 3,
          background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #f59e0b 100%)',
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: 3,
        }}
      >
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={7}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <LocalOffer sx={{ color: '#ffd700' }} />
              <Typography variant="overline" sx={{ letterSpacing: 1.5, fontWeight: 'bold', color: '#ffd700' }}>
                LIMITED TIME EXCLUSIVE PROMOTIONS
              </Typography>
            </Box>
            <Typography variant="h3" component="h1" fontWeight="800" sx={{ mb: 1.5 }}>
              Today's Flash Deals
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.95, maxWidth: 600, mb: 3 }}>
              Save up to 40% on top-rated electronics, fashion, and home essentials. Prices valid only for the next 24 hours or while supplies last.
            </Typography>

            {/* Countdown Clock */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Timer sx={{ color: '#ffffff' }} />
              <Typography variant="subtitle2" fontWeight="bold">
                Deals refresh in:
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                {[
                  { val: timeLeft.hours, label: 'HR' },
                  { val: timeLeft.minutes, label: 'MIN' },
                  { val: timeLeft.seconds, label: 'SEC' },
                ].map((item, idx) => (
                  <Box
                    key={idx}
                    sx={{
                      bgcolor: 'rgba(0, 0, 0, 0.4)',
                      px: 1.5,
                      py: 0.75,
                      borderRadius: 1.5,
                      textAlign: 'center',
                      minWidth: 50,
                      backdropFilter: 'blur(4px)',
                    }}
                  >
                    <Typography variant="h6" fontWeight="bold" sx={{ lineHeight: 1 }}>
                      {String(item.val).padStart(2, '0')}
                    </Typography>
                    <Typography variant="caption" sx={{ fontSize: '0.65rem', opacity: 0.8 }}>
                      {item.label}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          </Grid>

          {/* Active Coupons Banner */}
          <Grid item xs={12} md={5}>
            <Card sx={{ bgcolor: 'rgba(255, 255, 255, 0.95)', color: '#0f172a', borderRadius: 3, p: 2 }}>
              <CardContent sx={{ p: '12px !important' }}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TrendingDown color="error" /> Active Checkout Coupons
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mt: 1 }}>
                  {promoCoupons.map((coupon) => (
                    <Box
                      key={coupon.code}
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        border: '1px dashed #3b82f6',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        bgcolor: '#f8fafc',
                      }}
                    >
                      <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip
                            label={coupon.code}
                            size="small"
                            color="primary"
                            sx={{ fontWeight: 'bold', fontFamily: 'monospace' }}
                          />
                          <Typography variant="caption" fontWeight="bold" color="success.main">
                            {coupon.discount}
                          </Typography>
                        </Box>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                          {coupon.desc} (Min {coupon.minOrder})
                        </Typography>
                      </Box>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={copiedCoupon === coupon.code ? <CheckCircle color="success" /> : <ContentCopy />}
                        onClick={() => handleCopyCoupon(coupon.code)}
                        sx={{ textTransform: 'none', fontWeight: 'bold' }}
                      >
                        {copiedCoupon === coupon.code ? 'Copied' : 'Copy'}
                      </Button>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>

      {/* Category Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
        <Tabs
          value={activeTab}
          onChange={(e, val) => setActiveTab(val)}
          variant="scrollable"
          scrollButtons="auto"
          textColor="primary"
          indicatorColor="primary"
        >
          <Tab value="all" label="All Daily Deals" />
          <Tab value="highDiscount" label="🔥 20%+ Off Super Deals" />
          <Tab value="electronics" label="Electronics" />
          <Tab value="fashion" label="Fashion & Apparel" />
          <Tab value="home" label="Home & Kitchen" />
          <Tab value="under50" label="Under $50 Budget Deals" />
        </Tabs>
      </Box>

      {/* Product List */}
      {loading ? (
        <Box sx={{ py: 8, textAlign: 'center' }}>
          <CircularProgress />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Loading today's discount catalog...
          </Typography>
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      ) : dealProducts.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 2 }}>
          <ShoppingBag sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
          <Typography variant="h6">No deals found in this category</Typography>
          <Typography variant="body2" color="text.secondary">
            Check back shortly or explore all available deals.
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {dealProducts.map((product) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={product._id}>
              <InteractiveProductCard product={product} />
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default DealsPage;