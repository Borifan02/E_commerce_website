import React, { useEffect, useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import {
  Container,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Card,
  CardContent,
  Avatar,
  Pagination,
  Alert,
  CircularProgress,
  Tooltip,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  Edit,
  Delete,
  Person,
  AdminPanelSettings,
  Search,
  Refresh,
  Security,
  VerifiedUser,
} from '@mui/icons-material';
import api from '../../utils/api';
import { toast } from 'react-toastify';

const AdminUsers = () => {
  const { user: currentAdmin } = useSelector((state) => state.auth);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);

  const [selectedUser, setSelectedUser] = useState(null);
  const [editDialog, setEditDialog] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    role: 'user',
  });
  const [saving, setSaving] = useState(false);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
      });
      if (searchTerm.trim()) {
        params.append('search', searchTerm.trim());
      }
      if (roleFilter) {
        params.append('role', roleFilter);
      }

      const response = await api.get(`/api/users?${params.toString()}`);
      if (response.data?.success) {
        setUsers(response.data.users || []);
        setTotalPages(response.data.pagination?.totalPages || 1);
        setTotalUsers(response.data.pagination?.totalUsers || 0);
      } else {
        setUsers(response.data?.users || []);
      }
    } catch (err) {
      console.error('Fetch users error:', err);
      setError(err.response?.data?.message || 'Failed to fetch registered user accounts');
    } finally {
      setLoading(false);
    }
  }, [page, searchTerm, roleFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setEditForm({
      name: user.name,
      email: user.email,
      role: user.role,
    });
    setEditDialog(true);
  };

  const handleUpdateUser = async () => {
    if (!editForm.name.trim() || !editForm.email.trim()) {
      toast.error('Name and Email are required');
      return;
    }

    // Safeguard: Single administrator policy
    if (editForm.role === 'admin' && selectedUser?.email !== 'admin@ecommerce.com') {
      toast.error('Policy Restriction: admin@ecommerce.com is designated as the sole Administrator. Additional admin accounts cannot be created.');
      return;
    }

    try {
      setSaving(true);
      await api.put(`/api/users/${selectedUser._id}`, editForm);
      toast.success('User updated successfully');
      setEditDialog(false);
      fetchUsers();
    } catch (err) {
      console.error('Update user error:', err);
      toast.error(err.response?.data?.message || 'Failed to update user');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteUser = async (user) => {
    if (user.email === 'admin@ecommerce.com' || user.role === 'admin') {
      toast.error('The primary Administrator account cannot be deleted.');
      return;
    }

    if (window.confirm(`Are you sure you want to permanently delete user "${user.name}" (${user.email})?`)) {
      try {
        await api.delete(`/api/users/${user._id}`);
        toast.success(`User "${user.name}" deleted successfully.`);
        fetchUsers();
      } catch (err) {
        console.error('Delete user error:', err);
        toast.error(err.response?.data?.message || 'Failed to delete user');
      }
    }
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" component="h1" fontWeight="bold">
            Customer Accounts & Users
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Inspect registered customer profiles, monitor activity, and manage access roles
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={fetchUsers}
          disabled={loading}
        >
          Refresh
        </Button>
      </Box>

      {/* Role Enforcement Notice */}
      <Alert severity="info" icon={<Security fontSize="inherit" />} sx={{ mb: 3, borderRadius: 2 }}>
        <strong>Single Administrator Rule Active:</strong> <code>admin@ecommerce.com</code> is the sole system administrator with elevated management privileges. All other registered users operate with customer permissions.
      </Alert>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Card sx={{ borderRadius: 2, boxShadow: 1 }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar sx={{ bgcolor: 'primary.main', mr: 2, width: 48, height: 48 }}>
                <Person />
              </Avatar>
              <Box>
                <Typography variant="h5" fontWeight="bold">
                  {totalUsers}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Registered Accounts
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Card sx={{ borderRadius: 2, boxShadow: 1 }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar sx={{ bgcolor: '#9c27b0', mr: 2, width: 48, height: 48 }}>
                <VerifiedUser />
              </Avatar>
              <Box>
                <Typography variant="h5" fontWeight="bold">
                  {users.filter((u) => u.role === 'user').length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Active Customer Accounts
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Card sx={{ borderRadius: 2, boxShadow: 1 }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar sx={{ bgcolor: '#ed6c02', mr: 2, width: 48, height: 48 }}>
                <AdminPanelSettings />
              </Avatar>
              <Box>
                <Typography variant="h5" fontWeight="bold">
                  1
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Sole Administrator
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filter Toolbar */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search by customer name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
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
              <InputLabel>Role Filter</InputLabel>
              <Select
                value={roleFilter}
                label="Role Filter"
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <MenuItem value="">All Roles</MenuItem>
                <MenuItem value="user">Customer (User)</MenuItem>
                <MenuItem value="admin">Administrator</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              fullWidth
              variant="contained"
              onClick={() => {
                setPage(1);
                fetchUsers();
              }}
            >
              Apply Filter
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Users Table */}
      {loading ? (
        <Box sx={{ py: 6, textAlign: 'center' }}>
          <CircularProgress />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Loading user accounts...
          </Typography>
        </Box>
      ) : users.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 2 }}>
          <Person sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
          <Typography variant="h6">No user accounts found</Typography>
          <Typography variant="body2" color="text.secondary">
            Try adjusting your search query or role filter.
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 1 }}>
          <Table>
            <TableHead sx={{ bgcolor: '#f8fafc' }}>
              <TableRow>
                <TableCell fontWeight="bold">Customer / User</TableCell>
                <TableCell fontWeight="bold">Email Address</TableCell>
                <TableCell fontWeight="bold">Phone / Contact</TableCell>
                <TableCell fontWeight="bold">Role</TableCell>
                <TableCell fontWeight="bold">Registration Date</TableCell>
                <TableCell align="right" fontWeight="bold">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((u) => {
                const isAdmin = u.role === 'admin' || u.email === 'admin@ecommerce.com';
                const isCurrent = currentAdmin?.email === u.email;
                return (
                  <TableRow key={u._id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar sx={{ bgcolor: isAdmin ? '#ed6c02' : '#1976d2' }}>
                          {u.name?.charAt(0)?.toUpperCase() || 'U'}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2" fontWeight="bold">
                            {u.name} {isCurrent && <Chip label="You" size="small" sx={{ ml: 0.5, height: 18 }} />}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            ID: {u._id}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{u.email}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{u.phone || '—'}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={isAdmin ? <AdminPanelSettings /> : <Person />}
                        label={isAdmin ? 'Administrator' : 'Customer'}
                        color={isAdmin ? 'warning' : 'primary'}
                        size="small"
                        sx={{ fontWeight: 'bold' }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        }) : '—'}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Edit Profile">
                        <IconButton
                          color="primary"
                          size="small"
                          onClick={() => handleEditUser(u)}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      {!isAdmin && (
                        <Tooltip title="Delete Account">
                          <IconButton
                            color="error"
                            size="small"
                            onClick={() => handleDeleteUser(u)}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            color="primary"
          />
        </Box>
      )}

      {/* Edit User Dialog */}
      <Dialog open={editDialog} onClose={() => setEditDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit User Account</DialogTitle>
        <DialogContent dividers>
          <TextField
            fullWidth
            label="Full Name"
            value={editForm.name}
            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Email Address"
            value={editForm.email}
            onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
            margin="normal"
            disabled={selectedUser?.email === 'admin@ecommerce.com'}
            helperText={selectedUser?.email === 'admin@ecommerce.com' ? 'Primary admin email is fixed.' : ''}
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Role</InputLabel>
            <Select
              value={editForm.role}
              label="Role"
              onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
              disabled={selectedUser?.email === 'admin@ecommerce.com'}
            >
              <MenuItem value="user">Customer (Standard User)</MenuItem>
              {selectedUser?.email === 'admin@ecommerce.com' && (
                <MenuItem value="admin">Administrator</MenuItem>
              )}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setEditDialog(false)} disabled={saving}>Cancel</Button>
          <Button onClick={handleUpdateUser} variant="contained" disabled={saving}>
            {saving ? <CircularProgress size={22} color="inherit" /> : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminUsers;