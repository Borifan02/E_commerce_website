import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Grid,
  IconButton,
} from '@mui/material';
import {
  Facebook,
  Twitter,
  Instagram,
  LinkedIn,
  Email,
  Phone,
  LocationOn,
} from '@mui/icons-material';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: '#1976d2',
        color: 'white',
        py: 6,
        mt: 'auto',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Company Info */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" gutterBottom>
              E-Store
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Your one-stop destination for quality products at great prices.
              We're committed to providing excellent customer service and
              fast delivery.
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton color="inherit" size="small" component="a" href="https://facebook.com" target="_blank">
                <Facebook />
              </IconButton>
              <IconButton color="inherit" size="small" component="a" href="https://twitter.com" target="_blank">
                <Twitter />
              </IconButton>
              <IconButton color="inherit" size="small" component="a" href="https://instagram.com" target="_blank">
                <Instagram />
              </IconButton>
              <IconButton color="inherit" size="small" component="a" href="https://linkedin.com" target="_blank">
                <LinkedIn />
              </IconButton>
            </Box>
          </Grid>

          {/* Quick Links */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" gutterBottom>
              Quick Links
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <RouterLink to="/" style={{ color: 'white', textDecoration: 'none' }}>
                Home
              </RouterLink>
              <RouterLink to="/products" style={{ color: 'white', textDecoration: 'none' }}>
                Products
              </RouterLink>
              <RouterLink to="/about" style={{ color: 'white', textDecoration: 'none' }}>
                About Us
              </RouterLink>
              <RouterLink to="/contact" style={{ color: 'white', textDecoration: 'none' }}>
                Contact
              </RouterLink>
            </Box>
          </Grid>

          {/* Customer Service */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" gutterBottom>
              Customer Service
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <RouterLink to="/help" style={{ color: 'white', textDecoration: 'none' }}>
                Help Center
              </RouterLink>
              <RouterLink to="/shipping" style={{ color: 'white', textDecoration: 'none' }}>
                Shipping Info
              </RouterLink>
              <RouterLink to="/returns" style={{ color: 'white', textDecoration: 'none' }}>
                Returns
              </RouterLink>
              <RouterLink to="/privacy" style={{ color: 'white', textDecoration: 'none' }}>
                Privacy Policy
              </RouterLink>
            </Box>
          </Grid>

          {/* Contact Info */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" gutterBottom>
              Contact Info
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocationOn fontSize="small" />
                <Typography variant="body2">
                Addis Ababa, Ethiopia
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Phone fontSize="small" />
                <Typography variant="body2">
                  +251965844287
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Email fontSize="small" />
                <Typography variant="body2">
                  dabasaborifan@gmail.com
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>

        {/* Bottom Bar */}
        <Box
          sx={{
            borderTop: '1px solid rgba(255, 255, 255, 0.2)',
            mt: 4,
            pt: 3,
            textAlign: 'center',
          }}
        >
          <Typography variant="body2">
            © {new Date().getFullYear()} E-Store. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
