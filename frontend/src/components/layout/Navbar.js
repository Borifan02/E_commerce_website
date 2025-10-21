import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Badge,
  Box,
  Menu,
  MenuItem,
  Avatar,
  InputBase,
  alpha,
} from '@mui/material';
import {
  ShoppingCart,
  Search,
  AccountCircle,
  Menu as MenuIcon,
  Close,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import { selectCartItemsCount } from '../../store/slices/cartSlice';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const cartItemsCount = useSelector(selectCartItemsCount);
  
  const [anchorEl, setAnchorEl] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    dispatch(logout());
    handleMenuClose();
    navigate('/');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <AppBar position="sticky" sx={{ backgroundColor: '#1976d2' }}>
      <Toolbar>
        {/* Logo */}
        <Typography
          variant="h6"
          component="div"
          sx={{
            flexGrow: 0,
            cursor: 'pointer',
            fontWeight: 'bold',
            mr: 4,
          }}
          onClick={() => navigate('/')}
        >
          E-Store
        </Typography>

        {/* Navigation Links */}
        <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 2, flexGrow: 1 }}>
          <Button
            color="inherit"
            onClick={() => navigate('/')}
            sx={{
              backgroundColor: isActive('/') ? alpha('#fff', 0.1) : 'transparent',
            }}
          >
            Home
          </Button>
          <Button
            color="inherit"
            onClick={() => navigate('/products')}
            sx={{
              backgroundColor: isActive('/products') ? alpha('#fff', 0.1) : 'transparent',
            }}
          >
            Products
          </Button>
          {isAuthenticated && user?.role === 'admin' && (
            <Button
              color="inherit"
              onClick={() => navigate('/admin')}
              sx={{
                backgroundColor: isActive('/admin') ? alpha('#fff', 0.1) : 'transparent',
              }}
            >
              Admin
            </Button>
          )}
        </Box>

        {/* Search Bar */}
        <Box
          component="form"
          onSubmit={handleSearch}
          sx={{
            position: 'relative',
            borderRadius: 1,
            backgroundColor: alpha('#fff', 0.15),
            '&:hover': {
              backgroundColor: alpha('#fff', 0.25),
            },
            marginLeft: 0,
            width: { xs: '100%', sm: 'auto' },
            flexGrow: { xs: 1, sm: 0 },
            mr: 2,
          }}
        >
          <Box
            sx={{
              padding: '0 16px',
              height: '100%',
              position: 'absolute',
              pointerEvents: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Search />
          </Box>
          <InputBase
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{
              color: 'inherit',
              '& .MuiInputBase-input': {
                padding: '8px 8px 8px 40px',
                transition: 'width 0.2s',
                width: { xs: '100%', sm: '200px' },
                '&:focus': {
                  width: { xs: '100%', sm: '300px' },
                },
              },
            }}
          />
        </Box>

        {/* Cart */}
        <IconButton
          color="inherit"
          onClick={() => navigate('/cart')}
          sx={{ mr: 1 }}
        >
          <Badge badgeContent={cartItemsCount} color="error">
            <ShoppingCart />
          </Badge>
        </IconButton>

        {/* User Menu */}
        {isAuthenticated ? (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton
              size="large"
              onClick={handleMenuOpen}
              color="inherit"
            >
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
                {user?.name?.charAt(0).toUpperCase()}
              </Avatar>
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              onClick={handleMenuClose}
            >
              <MenuItem onClick={() => navigate('/profile')}>
                <AccountCircle sx={{ mr: 1 }} />
                Profile
              </MenuItem>
              <MenuItem onClick={() => navigate('/orders')}>
                <ShoppingCart sx={{ mr: 1 }} />
                Orders
              </MenuItem>
              {user?.role === 'admin' && (
                <MenuItem onClick={() => navigate('/admin')}>
                  Admin Dashboard
                </MenuItem>
              )}
              <MenuItem onClick={handleLogout}>
                Logout
              </MenuItem>
            </Menu>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              color="inherit"
              onClick={() => navigate('/login')}
              variant="outlined"
              sx={{ borderColor: 'white', color: 'white' }}
            >
              Login
            </Button>
            <Button
              color="inherit"
              onClick={() => navigate('/register')}
              variant="contained"
              sx={{ backgroundColor: 'white', color: 'primary.main' }}
            >
              Register
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
