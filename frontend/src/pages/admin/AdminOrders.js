import React, { useEffect, useState, useCallback } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Grid,
  Pagination,
  CircularProgress,
  Alert,
  Tooltip,
  Divider,
} from '@mui/material';
import {
  Visibility,
  LocalShipping,
  CheckCircle,
  Schedule,
  Refresh,
} from '@mui/icons-material';
import axios from 'axios';
import { toast } from 'react-toastify';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');

  // Status update modal
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');

  // Order detail preview modal
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [previewOrder, setPreviewOrder] = useState(null);

  const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
      });
      if (statusFilter) params.append('status', statusFilter);

      const response = await axios.get(`/api/orders/admin/all?${params.toString()}`, getAuthHeader());
      if (response.data?.success) {
        setOrders(response.data.orders || []);
        setTotalPages(response.data.pagination?.totalPages || 1);
        setTotalOrders(response.data.pagination?.totalOrders || 0);
      }
    } catch (err) {
      console.error('Fetch admin orders error:', err);
      setError(err.response?.data?.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleOpenStatusModal = (order) => {
    setSelectedOrder(order);
    setNewStatus(order.status || 'pending');
    setTrackingNumber(order.trackingNumber || '');
    setStatusModalOpen(true);
  };

  const handleUpdateStatus = async () => {
    if (!selectedOrder) return;
    try {
      await axios.put(
        `/api/orders/${selectedOrder._id}/status`,
        {
          status: newStatus,
          trackingNumber: trackingNumber.trim(),
        },
        getAuthHeader()
      );
      toast.success(`Order updated to ${newStatus}`);
      setStatusModalOpen(false);
      fetchOrders();
    } catch (err) {
      console.error('Update order status error:', err);
      toast.error(err.response?.data?.message || 'Failed to update order status');
    }
  };

  const handleOpenDetailModal = (order) => {
    setPreviewOrder(order);
    setDetailModalOpen(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'processing':
        return 'info';
      case 'shipped':
        return 'primary';
      case 'delivered':
        return 'success';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold">
            Customer Orders Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Track fulfillment, update shipping status, and inspect customer purchases
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={fetchOrders}
        >
          Refresh
        </Button>
      </Box>

      {/* Filter Paper */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Filter by Status</InputLabel>
              <Select
                value={statusFilter}
                label="Filter by Status"
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
              >
                <MenuItem value="">All Statuses</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="processing">Processing</MenuItem>
                <MenuItem value="shipped">Shipped</MenuItem>
                <MenuItem value="delivered">Delivered</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={8} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            <Chip label={`Total: ${totalOrders}`} color="primary" variant="outlined" />
          </Grid>
        </Grid>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Table */}
      <TableContainer component={Paper} sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <Table>
          <TableHead sx={{ backgroundColor: 'grey.100' }}>
            <TableRow>
              <TableCell>Order ID</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Items</TableCell>
              <TableCell>Total</TableCell>
              <TableCell>Payment</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                  <CircularProgress size={36} />
                </TableCell>
              </TableRow>
            ) : orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                  <Typography variant="body1" color="text.secondary">
                    No orders found.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              orders.map((ord) => (
                <TableRow key={ord._id} hover>
                  <TableCell>
                    <Tooltip title={ord._id}>
                      <Typography variant="body2" fontFamily="monospace" fontWeight="bold">
                        #{ord._id.slice(-6).toUpperCase()}
                      </Typography>
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle2" fontWeight="600">
                      {ord.shippingAddress?.name || ord.user?.name || 'Customer'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {ord.user?.email || ord.shippingAddress?.phone}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {formatDate(ord.createdAt)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {ord.orderItems?.reduce((sum, item) => sum + item.quantity, 0)} items
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle2" fontWeight="bold">
                      ${ord.totalPrice?.toFixed(2)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      icon={ord.isPaid ? <CheckCircle /> : <Schedule />}
                      label={ord.isPaid ? 'Paid' : 'Unpaid'}
                      color={ord.isPaid ? 'success' : 'warning'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={ord.status || 'pending'}
                      color={getStatusColor(ord.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="View Order Details">
                      <IconButton
                        color="info"
                        size="small"
                        onClick={() => handleOpenDetailModal(ord)}
                      >
                        <Visibility fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Update Fulfillment Status">
                      <IconButton
                        color="primary"
                        size="small"
                        onClick={() => handleOpenStatusModal(ord)}
                      >
                        <LocalShipping fontSize="small" />
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

      {/* Update Status Modal */}
      <Dialog open={statusModalOpen} onClose={() => setStatusModalOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle fontWeight="bold">Update Order Status</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" color="text.secondary">
              Order ID: #{selectedOrder?._id}
            </Typography>
          </Box>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={newStatus}
              label="Status"
              onChange={(e) => setNewStatus(e.target.value)}
            >
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="processing">Processing</MenuItem>
              <MenuItem value="shipped">Shipped</MenuItem>
              <MenuItem value="delivered">Delivered</MenuItem>
              <MenuItem value="cancelled">Cancelled</MenuItem>
            </Select>
          </FormControl>
          <TextField
            fullWidth
            label="Tracking Number (Optional)"
            placeholder="e.g. TRACK-982347"
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusModalOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleUpdateStatus} variant="contained">
            Save Status
          </Button>
        </DialogActions>
      </Dialog>

      {/* Detail Preview Modal */}
      <Dialog open={detailModalOpen} onClose={() => setDetailModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle fontWeight="bold">
          Order Summary #{previewOrder?._id.slice(-8).toUpperCase()}
        </DialogTitle>
        <DialogContent dividers>
          {previewOrder && (
            <Box>
              <Typography variant="subtitle2" color="primary" gutterBottom>
                Customer & Shipping Information
              </Typography>
              <Typography variant="body2">
                <strong>Name:</strong> {previewOrder.shippingAddress?.name}
              </Typography>
              <Typography variant="body2">
                <strong>Address:</strong> {previewOrder.shippingAddress?.street}, {previewOrder.shippingAddress?.city}, {previewOrder.shippingAddress?.state} {previewOrder.shippingAddress?.zipCode}, {previewOrder.shippingAddress?.country}
              </Typography>
              <Typography variant="body2">
                <strong>Phone:</strong> {previewOrder.shippingAddress?.phone}
              </Typography>

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle2" color="primary" gutterBottom>
                Purchased Items ({previewOrder.orderItems?.length})
              </Typography>
              {previewOrder.orderItems?.map((item, idx) => (
                <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.5 }}>
                  <Typography variant="body2">
                    {item.name} × {item.quantity}
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
                    ${(item.price * item.quantity).toFixed(2)}
                  </Typography>
                </Box>
              ))}

              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2">Subtotal:</Typography>
                <Typography variant="body2">${previewOrder.itemsPrice?.toFixed(2)}</Typography>
              </Box>
              {previewOrder.discountPrice > 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', color: 'success.main' }}>
                  <Typography variant="body2">Discount ({previewOrder.couponCode}):</Typography>
                  <Typography variant="body2">-${previewOrder.discountPrice?.toFixed(2)}</Typography>
                </Box>
              )}
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2">Shipping:</Typography>
                <Typography variant="body2">${previewOrder.shippingPrice?.toFixed(2)}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2">Tax:</Typography>
                <Typography variant="body2">${previewOrder.taxPrice?.toFixed(2)}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                <Typography variant="subtitle1" fontWeight="bold">Total Amount:</Typography>
                <Typography variant="subtitle1" fontWeight="bold" color="primary">
                  ${previewOrder.totalPrice?.toFixed(2)}
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailModalOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminOrders;
