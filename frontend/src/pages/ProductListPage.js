import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
  Paper,
  InputAdornment,
  Chip,
  ToggleButton,
  ToggleButtonGroup,
  Drawer,
  IconButton,
  Slider,
  Collapse,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Search,
  FilterList,
  ViewModule,
  ViewList,
  Tune,
  Clear,
  ExpandMore,
  ExpandLess,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { fetchProducts, clearFilters } from '../store/slices/productSlice';
import InteractiveProductCard from '../components/common/InteractiveProductCard';
import { ProductListSkeleton } from '../components/common/SkeletonLoader';
import { PRODUCT_CATEGORIES } from '../utils/constants';

const ProductListPage = () => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [searchParams, setSearchParams] = useSearchParams();
  const { products, loading, pagination } = useSelector((state) => state.products);

  const [localFilters, setLocalFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    brand: searchParams.get('brand') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    sort: searchParams.get('sort') || '',
  });

  const [viewMode, setViewMode] = useState('grid');
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [priceRange, setPriceRange] = useState([
    parseInt(localFilters.minPrice) || 0,
    parseInt(localFilters.maxPrice) || 1000,
  ]);
  const [filtersExpanded, setFiltersExpanded] = useState(!isMobile);

  const sortOptions = [
    { value: '', label: 'Default' },
    { value: 'newest', label: 'Newest' },
    { value: 'price_asc', label: 'Price: Low to High' },
    { value: 'price_desc', label: 'Price: High to Low' },
    { value: 'rating', label: 'Highest Rated' },
  ];

  useEffect(() => {
    const params = {
      page: searchParams.get('page') || 1,
      limit: 12,
      ...localFilters,
    };

    // Remove empty values
    Object.keys(params).forEach(key => {
      if (params[key] === '' || params[key] === null) {
        delete params[key];
      }
    });

    dispatch(fetchProducts(params));
  }, [dispatch, searchParams, localFilters]);

  const handleFilterChange = (key, value) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);

    // Update URL params
    const newSearchParams = new URLSearchParams();
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v) newSearchParams.set(k, v);
    });
    newSearchParams.set('page', '1'); // Reset to first page
    setSearchParams(newSearchParams);
  };

  const handlePageChange = (event, page) => {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('page', page);
    setSearchParams(newSearchParams);
  };



  const handleClearFilters = () => {
    setLocalFilters({
      search: '',
      category: '',
      brand: '',
      minPrice: '',
      maxPrice: '',
      sort: '',
    });
    setPriceRange([0, 1000]);
    setSearchParams({});
    dispatch(clearFilters());
  };

  const handlePriceRangeChange = (event, newValue) => {
    setPriceRange(newValue);
    handleFilterChange('minPrice', newValue[0]);
    handleFilterChange('maxPrice', newValue[1]);
  };

  const activeFiltersCount = Object.values(localFilters).filter(
    (value) => value !== '' && value !== null
  ).length;

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
        Products
          {pagination.totalProducts > 0 && (
            <Typography component="span" variant="body1" color="text.secondary" sx={{ ml: 2, fontWeight: 'normal' }}>
              ({pagination.totalProducts} {pagination.totalProducts === 1 ? 'product' : 'products'})
            </Typography>
          )}
      </Typography>

        {/* View Mode Toggle */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(e, newMode) => newMode && setViewMode(newMode)}
            size="small"
          >
            <ToggleButton value="grid">
              <ViewModule />
            </ToggleButton>
            <ToggleButton value="list">
              <ViewList />
            </ToggleButton>
          </ToggleButtonGroup>

          {/* Mobile Filter Button */}
          {isMobile && (
            <Button
              variant="outlined"
              startIcon={<Tune />}
              onClick={() => setFilterDrawerOpen(true)}
              sx={{ position: 'relative' }}
            >
              Filters
              {activeFiltersCount > 0 && (
                <Chip
                  label={activeFiltersCount}
                  size="small"
                  color="primary"
                  sx={{
                    ml: 1,
                    height: 20,
                    minWidth: 20,
                    fontSize: '0.7rem',
                  }}
                />
              )}
            </Button>
          )}
        </Box>
      </Box>

      {/* Filters - Desktop */}
      {!isMobile && (
        <Paper
          elevation={2}
          sx={{
            p: 3,
            mb: 3,
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              mb: 2,
              cursor: 'pointer',
            }}
            onClick={() => setFiltersExpanded(!filtersExpanded)}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <FilterList color="primary" />
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                Filters
              </Typography>
              {activeFiltersCount > 0 && (
                <Chip
                  label={activeFiltersCount}
                  size="small"
                  color="primary"
                  sx={{ ml: 1 }}
                />
              )}
            </Box>
            {filtersExpanded ? <ExpandLess /> : <ExpandMore />}
          </Box>

          <Collapse in={filtersExpanded}>
            <Grid container spacing={2}>
              {/* Search */}
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  placeholder="Search products..."
                  value={localFilters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search color="action" />
                      </InputAdornment>
                    ),
                    endAdornment: localFilters.search && (
                      <InputAdornment position="end">
                        <IconButton
                          size="small"
                          onClick={() => handleFilterChange('search', '')}
                        >
                          <Clear fontSize="small" />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    },
                  }}
                />
              </Grid>

              {/* Category */}
              <Grid item xs={12} md={2}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={localFilters.category}
                    label="Category"
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    sx={{ borderRadius: 2 }}
                  >
                    <MenuItem value="">All Categories</MenuItem>
                    {PRODUCT_CATEGORIES.map((category) => (
                      <MenuItem key={category} value={category}>
                        {category}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Price Range Slider */}
              <Grid item xs={12} md={4}>
                <Box sx={{ px: 2 }}>
                  <Typography variant="body2" gutterBottom>
                    Price Range: ${priceRange[0]} - ${priceRange[1]}
                  </Typography>
                  <Slider
                    value={priceRange}
                    onChange={handlePriceRangeChange}
                    valueLabelDisplay="auto"
                    min={0}
                    max={1000}
                    step={10}
                    sx={{
                      '& .MuiSlider-thumb': {
                        '&:hover': {
                          boxShadow: '0 0 0 8px rgba(25, 118, 210, 0.16)',
                        },
                      },
                    }}
                  />
                </Box>
              </Grid>

              {/* Sort */}
              <Grid item xs={12} md={2}>
                <FormControl fullWidth>
                  <InputLabel>Sort By</InputLabel>
                  <Select
                    value={localFilters.sort}
                    label="Sort By"
                    onChange={(e) => handleFilterChange('sort', e.target.value)}
                    sx={{ borderRadius: 2 }}
                  >
                    {sortOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Clear Filters */}
              {activeFiltersCount > 0 && (
                <Grid item xs={12}>
                  <Button
                    variant="outlined"
                    startIcon={<Clear />}
                    onClick={handleClearFilters}
                    sx={{ borderRadius: 2 }}
                  >
                    Clear All Filters
                  </Button>
                </Grid>
              )}
            </Grid>
          </Collapse>
        </Paper>
      )}

      {/* Mobile Filter Drawer */}
      <Drawer
        anchor="right"
        open={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
        PaperProps={{
          sx: { width: { xs: '85%', sm: 400 }, p: 3 },
        }}
      >
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            Filters
          </Typography>
          <IconButton onClick={() => setFilterDrawerOpen(false)}>
            <Clear />
          </IconButton>
        </Box>
        {/* Mobile filter content - similar to desktop but in drawer */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <TextField
            fullWidth
            placeholder="Search products..."
            value={localFilters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />
          {/* Add other mobile filters here */}
        </Box>
      </Drawer>

      {/* Products Grid/List */}
      {loading ? (
        <Grid container spacing={3}>
          {Array.from({ length: 8 }).map((_, index) => (
            <Grid
              item
              xs={12}
              sm={viewMode === 'grid' ? 6 : 12}
              md={viewMode === 'grid' ? 4 : 12}
              lg={viewMode === 'grid' ? 3 : 12}
              key={index}
            >
              <ProductListSkeleton />
            </Grid>
          ))}
        </Grid>
      ) : products.length > 0 ? (
        <>
          <Grid
            container
            spacing={3}
            sx={{
              '& .MuiGrid-item': {
                display: 'flex',
              },
            }}
          >
            {products.map((product, index) => (
              <Grid
                item
                xs={12}
                sm={viewMode === 'grid' ? 6 : 12}
                md={viewMode === 'grid' ? 4 : 12}
                lg={viewMode === 'grid' ? 3 : 12}
                key={product._id}
              >
                <InteractiveProductCard product={product} index={index} />
              </Grid>
            ))}
          </Grid>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              mt={6}
              gap={2}
            >
              <Pagination
                count={pagination.totalPages}
                page={pagination.currentPage}
                onChange={handlePageChange}
                color="primary"
                size="large"
                showFirstButton
                showLastButton
                sx={{
                  '& .MuiPaginationItem-root': {
                    fontSize: '1rem',
                    '&.Mui-selected': {
                      fontWeight: 'bold',
                    },
                  },
                }}
              />
              <Typography variant="body2" color="text.secondary">
                Page {pagination.currentPage} of {pagination.totalPages}
              </Typography>
            </Box>
          )}
        </>
      ) : (
        <Paper
          elevation={0}
          sx={{
            textAlign: 'center',
            py: 8,
            px: 4,
            borderRadius: 3,
            bgcolor: 'grey.50',
          }}
        >
          <Typography variant="h5" color="text.secondary" gutterBottom>
            No products found
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Try adjusting your filters or search terms
          </Typography>
          {activeFiltersCount > 0 && (
            <Button
              variant="contained"
              onClick={handleClearFilters}
              sx={{ borderRadius: 2, textTransform: 'none' }}
            >
              Clear All Filters
            </Button>
          )}
        </Paper>
      )}
    </Container>
  );
};

export default ProductListPage;
