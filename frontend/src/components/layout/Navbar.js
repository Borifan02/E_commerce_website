import React, { useState, useRef, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Badge,
  Box,
  Menu,
  MenuItem,
  InputBase,
  Divider,
} from '@mui/material';
import {
  ShoppingCart,
  Search,
  AccountCircle,
  Menu as MenuIcon,
  Clear,
  Favorite,
  AdminPanelSettings,
  Inventory,
  ReceiptLong,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import { selectCartItemsCount } from '../../store/slices/cartSlice';
import { getStoredCurrency, setStoredCurrency } from '../../utils/currency';
import SearchSuggestions from '../common/SearchSuggestions';

const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const cartItemsCount = useSelector(selectCartItemsCount);
  const { items: wishlistItems = [] } = useSelector((state) => state.wishlist || {});

  const [anchorEl, setAnchorEl] = useState(null);
  const [currencyMenuAnchor, setCurrencyMenuAnchor] = useState(null);
  const [currency, setCurrency] = useState(getStoredCurrency());
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const searchInputRef = useRef(null);

  // Sync currency changes across windows/components
  useEffect(() => {
    const handleCurrencyChange = () => setCurrency(getStoredCurrency());
    window.addEventListener('currencyChange', handleCurrencyChange);
    return () => window.removeEventListener('currencyChange', handleCurrencyChange);
  }, []);

  const handleCurrencySelect = (newCurr) => {
    setStoredCurrency(newCurr);
    setCurrency(newCurr);
    setCurrencyMenuAnchor(null);
  };

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

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

  const handleSearch = (e, query = null) => {
    e?.preventDefault();
    const searchTerm = query || searchQuery.trim();
    if (searchTerm) {
      // Save to recent searches
      const updated = [searchTerm, ...recentSearches.filter(s => s !== searchTerm)].slice(0, 5);
      setRecentSearches(updated);
      localStorage.setItem('recentSearches', JSON.stringify(updated));

      navigate(`/products?search=${encodeURIComponent(searchTerm)}`);
      setSearchQuery('');
      setSearchFocused(false);
    }
  };

  // Mock suggestions (in real app, fetch from API)
  const getSuggestions = () => {
    if (!searchQuery.trim()) return [];
    // Simple mock - filter recent searches
    return recentSearches
      .filter(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
      .slice(0, 5);
  };

  const trendingSearches = ['Laptop', 'Phone', 'Headphones', 'Watch', 'Camera'];



  return (
    <AppBar position="sticky" sx={{ backgroundColor: 'primary.main', color: 'white' }}>
      <Toolbar sx={{ minHeight: '60px !important', px: 2 }}>
        {/* Logo */}
        <Typography
          variant="h6"
          component="div"
          sx={{
            cursor: 'pointer',
            fontWeight: 'bold',
            mr: 4,
            display: 'flex',
            alignItems: 'center',
            fontSize: '1.5rem',
            letterSpacing: '-0.5px'
          }}
          onClick={() => navigate('/')}
        >
          Ethio<span style={{ color: '#febd69', fontSize: '1.2rem', marginLeft: '2px', fontWeight: 800 }}>Mart</span>
        </Typography>

        {/* Location/Deliver To */}
        <Box
          sx={{
            display: { xs: 'none', md: 'flex' },
            flexDirection: 'column',
            mr: 2,
            cursor: 'pointer',
            border: '1px solid transparent',
            p: 1,
            '&:hover': { border: '1px solid white', borderRadius: 1 }
          }}
          onClick={() => navigate('/products')}
        >
          <Typography variant="body2" sx={{ color: '#ccc', fontSize: '11px' }}>Deliver to</Typography>
          <Typography variant="body2" sx={{ fontWeight: 'bold', fontSize: '13px' }}>🇪🇹 Ethiopia</Typography>
        </Box>

        {/* Enhanced Search Bar with Suggestions */}
        <Box
          component="form"
          onSubmit={handleSearch}
          sx={{
            position: 'relative',
            display: 'flex',
            flexGrow: 1,
            borderRadius: 1,
            overflow: 'visible',
            mx: 2,
            height: '40px',
            maxWidth: { xs: '100%', md: 600 },
          }}
        >
          <Box
            sx={{
              bgcolor: '#f3f3f3',
              display: 'flex',
              alignItems: 'center',
              px: 1.5,
              borderRight: '1px solid #cdcdcd',
              cursor: 'pointer',
              color: '#555',
              fontSize: '12px',
              borderRadius: '4px 0 0 4px',
              '&:hover': {
                bgcolor: '#e8e8e8',
              },
            }}
          >
            All
          </Box>
          <InputBase
            ref={searchInputRef}
            placeholder="Search products, brands and categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            sx={{
              bgcolor: 'white',
              flexGrow: 1,
              pl: 2,
              pr: searchQuery ? 1 : 2,
              color: 'black',
              fontSize: '14px',
            }}
            endAdornment={
              searchQuery && (
                <IconButton
                  size="small"
                  onClick={() => {
                    setSearchQuery('');
                    searchInputRef.current?.focus();
                  }}
                  sx={{ p: 0.5 }}
                >
                  <Clear fontSize="small" />
                </IconButton>
              )
            }
          />
          <IconButton
            type="submit"
            sx={{
              bgcolor: '#febd69',
              borderRadius: '0 4px 4px 0',
              width: '45px',
              transition: 'all 0.2s',
              '&:hover': {
                bgcolor: '#f3a847',
                transform: 'scale(1.05)',
              },
            }}
          >
            <Search sx={{ color: 'black' }} />
          </IconButton>

          {/* Search Suggestions Dropdown */}
          {searchFocused && (
            <SearchSuggestions
              open={searchFocused}
              onClose={() => setSearchFocused(false)}
              searchQuery={searchQuery}
              suggestions={getSuggestions()}
              recentSearches={recentSearches}
              trendingSearches={trendingSearches}
            />
          )}
        </Box>

        {/* Right Actions Cluster */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>

          {/* Currency Selector (ETB / USD) */}
          <Box
            onClick={(e) => setCurrencyMenuAnchor(e.currentTarget)}
            sx={{
              cursor: 'pointer',
              display: { xs: 'none', sm: 'flex' },
              alignItems: 'center',
              gap: 0.5,
              px: 1,
              py: 0.5,
              border: '1px solid transparent',
              borderRadius: 1,
              '&:hover': { border: '1px solid white' },
            }}
          >
            <Typography sx={{ fontSize: '16px' }}>{currency === 'ETB' ? '🇪🇹' : '🇺🇸'}</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Typography variant="caption" sx={{ fontSize: '10px', color: '#ccc', lineHeight: 1 }}>Currency</Typography>
              <Typography variant="body2" sx={{ fontWeight: 'bold', fontSize: '12px', lineHeight: 1.2 }}>{currency}</Typography>
            </Box>
          </Box>

          <Menu
            anchorEl={currencyMenuAnchor}
            open={Boolean(currencyMenuAnchor)}
            onClose={() => setCurrencyMenuAnchor(null)}
            sx={{ mt: 1 }}
          >
            <MenuItem onClick={() => handleCurrencySelect('ETB')} selected={currency === 'ETB'}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography sx={{ fontSize: '18px' }}>🇪🇹</Typography>
                <Box>
                  <Typography variant="body2" fontWeight="bold">ETB - Ethiopian Birr</Typography>
                  <Typography variant="caption" color="text.secondary">Telebirr & CBE standard</Typography>
                </Box>
              </Box>
            </MenuItem>
            <MenuItem onClick={() => handleCurrencySelect('USD')} selected={currency === 'USD'}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography sx={{ fontSize: '18px' }}>🇺🇸</Typography>
                <Box>
                  <Typography variant="body2" fontWeight="bold">USD - US Dollar</Typography>
                  <Typography variant="caption" color="text.secondary">International Cards</Typography>
                </Box>
              </Box>
            </MenuItem>
          </Menu>

          {/* Account & Lists */}
          <Box
            onClick={isAuthenticated ? handleMenuOpen : () => navigate('/login')}
            sx={{
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              mx: 1,
              p: 1,
              border: '1px solid transparent',
              '&:hover': { border: '1px solid white', borderRadius: 1 }
            }}
          >
            <Typography variant="body2" sx={{ fontSize: '12px' }}>
              Hello, {isAuthenticated ? user?.name?.split(' ')[0] : 'Sign in'}
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
              Account & Lists
            </Typography>
          </Box>

          {/* Returns & Orders */}
          <Box
            onClick={() => navigate(isAuthenticated ? '/orders' : '/login')}
            sx={{
              cursor: 'pointer',
              display: { xs: 'none', md: 'flex' },
              flexDirection: 'column',
              mx: 1,
              p: 1,
              border: '1px solid transparent',
              '&:hover': { border: '1px solid white', borderRadius: 1 }
            }}
          >
            <Typography variant="body2" sx={{ fontSize: '12px' }}>Returns</Typography>
            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>& Orders</Typography>
          </Box>

          {/* Wishlist */}
          <Box
            onClick={() => navigate(isAuthenticated ? '/wishlist' : '/login')}
            sx={{
              cursor: 'pointer',
              display: { xs: 'none', sm: 'flex' },
              alignItems: 'center',
              p: 1,
              border: '1px solid transparent',
              '&:hover': { border: '1px solid white', borderRadius: 1 }
            }}
          >
            <Badge badgeContent={wishlistItems.length} color="error" sx={{ mr: 0.5 }}>
              <Favorite sx={{ fontSize: 24, color: '#febd69' }} />
            </Badge>
            <Typography variant="body2" sx={{ fontWeight: 'bold', display: { xs: 'none', md: 'block' } }}>
              Wishlist
            </Typography>
          </Box>

          {/* Cart */}
          <Box
            onClick={() => navigate('/cart')}
            sx={{
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'flex-end',
              p: 1,
              border: '1px solid transparent',
              '&:hover': { border: '1px solid white', borderRadius: 1 }
            }}
          >
            <Badge badgeContent={cartItemsCount} color="secondary" sx={{ '& .MuiBadge-badge': { right: 2, top: 2 } }}>
              <ShoppingCart sx={{ fontSize: 32 }} />
            </Badge>
            <Typography variant="body2" sx={{ fontWeight: 'bold', ml: 0.5, mb: 0.5, display: { xs: 'none', md: 'block' } }}>
              Cart
            </Typography>
          </Box>
        </Box>

        {/* User Menu Dropdown (Keep existing logic) */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          onClick={handleMenuClose}
          sx={{ mt: 1 }}
        >
          <MenuItem onClick={() => navigate('/profile')}>
            <AccountCircle sx={{ mr: 1 }} />
            Profile
          </MenuItem>
          <MenuItem onClick={() => navigate('/orders')}>
            <ShoppingCart sx={{ mr: 1 }} />
            Orders
          </MenuItem>
          <MenuItem onClick={() => navigate('/wishlist')}>
            <Favorite sx={{ mr: 1, color: 'error.main' }} />
            Wishlist ({wishlistItems.length})
          </MenuItem>
          {user?.role === 'admin' && (
            <Box>
              <Divider sx={{ my: 1 }} />
              <MenuItem onClick={() => navigate('/admin')}>
                <AdminPanelSettings sx={{ mr: 1, color: 'primary.main' }} />
                Admin Dashboard
              </MenuItem>
              <MenuItem onClick={() => navigate('/admin/products')}>
                <Inventory sx={{ mr: 1 }} />
                Manage Products
              </MenuItem>
              <MenuItem onClick={() => navigate('/admin/orders')}>
                <ReceiptLong sx={{ mr: 1 }} />
                Manage Orders
              </MenuItem>
              <Divider sx={{ my: 1 }} />
            </Box>
          )}
          <MenuItem onClick={handleLogout}>
            Logout
          </MenuItem>
        </Menu>

      </Toolbar>

      {/* Sub-Header (Categories) */}
      <Box sx={{ bgcolor: '#232f3e', color: 'white', px: 2, py: 0.5, display: 'flex', alignItems: 'center', fontSize: '14px', gap: 2, overflowX: 'auto' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer', fontWeight: 'bold' }}>
          <MenuIcon sx={{ mr: 0.5 }} /> All
        </Box>
        {[{ label: "Today's Deals", path: '/deals' },
        { label: 'All Products', path: '/products' },
        { label: 'Electronics', path: '/products?category=Electronics' },
        { label: 'Fashion & Clothing', path: '/products?category=Clothing' },
        { label: 'Home & Living', path: '/products?category=Home%20%26%20Garden' },
        { label: 'Customer Support', path: '/service' },
        { label: 'Become a Seller', path: '/sell' }
        ].map((item) => (
          <Typography
            key={item.label}
            variant="body2"
            onClick={() => navigate(item.path)}
            sx={{
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              '&:hover': { textDecoration: 'underline' }
            }}
          >
            {item.label}
          </Typography>
        ))}
      </Box>
    </AppBar>
  );
};

export default Navbar;
