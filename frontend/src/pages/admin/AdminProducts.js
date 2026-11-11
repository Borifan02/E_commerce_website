import React, { useEffect, useState, useCallback } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Pagination,
  CircularProgress,
  Alert,
  Tooltip,
  InputAdornment,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Search,
  Inventory,
  CheckCircle,
  Cancel,
  Warning,
} from '@mui/icons-material';
import axios from 'axios';
import { toast } from 'react-toastify';
import { PRODUCT_CATEGORIES } from '../../utils/constants';

const defaultProductForm = {
  name: '',
  description: '',
  price: '',
  originalPrice: '',
  category: 'Electronics',
  brand: '',
  stock: 10,
  images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500'],
  tags: '',
  isActive: true,
};

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  // Filters
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');

  // Dialogs
  const [openDialog, setOpenDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [formData, setFormData] = useState(defaultProductForm);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
      });
      if (search.trim()) params.append('search', search.trim());
      if (category) params.append('category', category);

      const response = await axios.get(`/api/products?${params.toString()}`);
      if (response.data?.success) {
        setProducts(response.data.products || []);
        setTotalPages(response.data.pagination?.totalPages || 1);
        setTotalProducts(response.data.pagination?.totalProducts || 0);
      }
    } catch (err) {
      console.error('Fetch products error:', err);
      setError(err.response?.data?.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [page, search, category]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleOpenCreate = () => {
    setIsEditing(false);
    setCurrentId(null);
    setFormData(defaultProductForm);
    setOpenDialog(true);
  };

  const handleOpenEdit = (prod) => {
    setIsEditing(true);
    setCurrentId(prod._id);
    setFormData({
      name: prod.name || '',
      description: prod.description || '',
      price: prod.price || '',
      originalPrice: prod.originalPrice || '',
      category: prod.category || 'Electronics',
      brand: prod.brand || '',
      stock: prod.stock ?? 0,
      images: prod.images?.length ? prod.images : ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500'],
      tags: Array.isArray(prod.tags) ? prod.tags.join(', ') : '',
      isActive: prod.isActive !== false,
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : undefined,
        stock: parseInt(formData.stock, 10),
        images: Array.isArray(formData.images)
          ? formData.images
          : formData.images.split(',').map((img) => img.trim()).filter(Boolean),
        tags: typeof formData.tags === 'string'
          ? formData.tags.split(',').map((t) => t.trim()).filter(Boolean)
          : formData.tags,
      };

      if (isEditing) {
        await axios.put(`/api/products/${currentId}`, payload, getAuthHeader());
        toast.success('Product updated successfully!');
      } else {
        await axios.post('/api/products', payload, getAuthHeader());
        toast.success('Product created successfully!');
      }

      setOpenDialog(false);
      fetchProducts();
    } catch (err) {
      console.error('Save product error:', err);
      toast.error(err.response?.data?.message || 'Failed to save product');
    }
  };

  const handleToggleStatus = async (prod) => {
    try {
      await axios.put(
        `/api/products/${prod._id}`,
        { isActive: !prod.isActive },
        getAuthHeader()
      );
      toast.info(`Product marked as ${!prod.isActive ? 'Active' : 'Inactive'}`);
      fetchProducts();
    } catch (err) {
      toast.error('Failed to change product status');
    }
  };

  const handleDeleteClick = (prod) => {
    setProductToDelete(prod);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;
    try {
      await axios.delete(`/api/products/${productToDelete._id}`, getAuthHeader());
      toast.success('Product deleted successfully');
      setDeleteConfirmOpen(false);
      setProductToDelete(null);
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete product');
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold">
            Products Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage your store catalog, pricing, inventory stock, and availability
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleOpenCreate}
          sx={{ borderRadius: 2 }}
        >
          Add Product
        </Button>
      </Box>

      {/* Filter and Search Bar */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search products by name or brand..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Category</InputLabel>
              <Select
                value={category}
                label="Category"
                onChange={(e) => setCategory(e.target.value)}
              >
                <MenuItem value="">All Categories</MenuItem>
                {PRODUCT_CATEGORIES.map((cat) => (
                  <MenuItem key={cat} value={cat}>
                    {cat}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={5} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            <Chip
              icon={<Inventory />}
              label={`Total Products: ${totalProducts}`}
              color="primary"
              variant="outlined"
            />
          </Grid>
        </Grid>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Products Table */}
      <TableContainer component={Paper} sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <Table>
          <TableHead sx={{ backgroundColor: 'grey.100' }}>
            <TableRow>
              <TableCell>Image</TableCell>
              <TableCell>Name & Brand</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Stock</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                  <CircularProgress size={36} />
                </TableCell>
              </TableRow>
            ) : products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                  <Typography variant="body1" color="text.secondary">
                    No products found matching criteria.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              products.map((prod) => (
                <TableRow key={prod._id} hover>
                  <TableCell>
                    <Box
                      component="img"
                      src={prod.images?.[0] || 'https://via.placeholder.com/60'}
                      alt={prod.name}
                      sx={{
                        width: 50,
                        height: 50,
                        objectFit: 'cover',
                        borderRadius: 1,
                        border: '1px solid #e0e0e0',
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle2" fontWeight="600" noWrap sx={{ maxWidth: 220 }}>
                      {prod.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {prod.brand || 'No brand'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={prod.category} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle2" fontWeight="bold">
                      ${prod.price?.toFixed(2)}
                    </Typography>
                    {prod.originalPrice > prod.price && (
                      <Typography variant="caption" sx={{ textDecoration: 'line-through', color: 'text.secondary' }}>
                        ${prod.originalPrice.toFixed(2)}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {prod.stock <= 5 ? (
                      <Chip
                        icon={<Warning />}
                        label={`Low: ${prod.stock}`}
                        color="error"
                        size="small"
                      />
                    ) : (
                      <Chip label={`${prod.stock} in stock`} color="success" size="small" variant="outlined" />
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      icon={prod.isActive ? <CheckCircle /> : <Cancel />}
                      label={prod.isActive ? 'Active' : 'Hidden'}
                      color={prod.isActive ? 'success' : 'default'}
                      size="small"
                      clickable
                      onClick={() => handleToggleStatus(prod)}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Edit Product">
                      <IconButton color="primary" size="small" onClick={() => handleOpenEdit(prod)}>
                        <Edit fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Product">
                      <IconButton color="error" size="small" onClick={() => handleDeleteClick(prod)}>
                        <Delete fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(e, val) => setPage(val)}
            color="primary"
          />
        </Box>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle fontWeight="bold">
            {isEditing ? 'Edit Product' : 'Add New Product'}
          </DialogTitle>
          <DialogContent dividers>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={8}>
                <TextField
                  required
                  fullWidth
                  label="Product Name"
                  name="name"
                  value={formData.name}
                  onChange={handleFormChange}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth required>
                  <InputLabel>Category</InputLabel>
                  <Select
                    name="category"
                    value={formData.category}
                    label="Category"
                    onChange={handleFormChange}
                  >
                    {PRODUCT_CATEGORIES.map((cat) => (
                      <MenuItem key={cat} value={cat}>
                        {cat}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="Price ($)"
                  name="price"
                  type="number"
                  inputProps={{ step: '0.01', min: '0' }}
                  value={formData.price}
                  onChange={handleFormChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Original Price ($) (Optional)"
                  name="originalPrice"
                  type="number"
                  inputProps={{ step: '0.01', min: '0' }}
                  value={formData.originalPrice}
                  onChange={handleFormChange}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="Brand"
                  name="brand"
                  value={formData.brand}
                  onChange={handleFormChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="Stock Inventory"
                  name="stock"
                  type="number"
                  inputProps={{ min: '0' }}
                  value={formData.stock}
                  onChange={handleFormChange}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  multiline
                  rows={3}
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={handleFormChange}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Image URL"
                  name="images"
                  helperText="Enter product image URL (e.g., https://...)"
                  value={Array.isArray(formData.images) ? formData.images.join(', ') : formData.images}
                  onChange={handleFormChange}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Tags (Comma separated)"
                  name="tags"
                  placeholder="wireless, premium, bluetooth"
                  value={formData.tags}
                  onChange={handleFormChange}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={handleCloseDialog} color="inherit">
              Cancel
            </Button>
            <Button type="submit" variant="contained">
              {isEditing ? 'Save Changes' : 'Create Product'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>Delete Product</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Are you sure you want to permanently delete <strong>{productToDelete?.name}</strong>? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Confirm Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminProducts;
