import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  InputAdornment,
  Alert,
  Snackbar,
  Tooltip,
} from '@mui/material';
import {
  Visibility,
  Delete,
  Email,
  Phone,
  Business,
  Person,
  Message,
  FilterList,
  Download,
  Refresh,
} from '@mui/icons-material';
import { supabase } from '../../api/supabaseClient';
import { format } from 'date-fns';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchOrders();
  }, [page, rowsPerPage, filterStatus]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('orders')
        .select(`
          *,
          products (
            id,
            name,
            image_url,
            categories (
              id,
              name
            )
          )
        `, { count: 'exact' });

      // Apply status filter
      if (filterStatus !== 'all') {
        query = query.eq('status', filterStatus);
      }

      // Apply search filter
      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,company_name.ilike.%${searchTerm}%`);
      }

      // Apply pagination
      const from = page * rowsPerPage;
      const to = from + rowsPerPage - 1;
      query = query.range(from, to).order('created_at', { ascending: false });

      const { data, error, count } = await query;

      if (error) throw error;
      setOrders(data || []);
      setTotalCount(count || 0);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setDetailsOpen(true);
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;

      // Update local state
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));

      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }

      setSuccessMessage('Order status updated successfully');
      setShowSuccess(true);
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleDeleteClick = (order) => {
    setOrderToDelete(order);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!orderToDelete) return;

    try {
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', orderToDelete.id);

      if (error) throw error;

      setSuccessMessage('Order deleted successfully');
      setShowSuccess(true);
      fetchOrders();
    } catch (error) {
      console.error('Error deleting order:', error);
    } finally {
      setDeleteConfirmOpen(false);
      setOrderToDelete(null);
    }
  };

  const handleExportOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          products (
            name,
            categories (
              name
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Convert to CSV
      const headers = ['Date', 'Product', 'Category', 'Name', 'Email', 'Company', 'Phone', 'Status', 'Message'];
      const csvContent = [
        headers.join(','),
        ...data.map(order => [
          format(new Date(order.created_at), 'yyyy-MM-dd HH:mm'),
          `"${order.products.name}"`,
          `"${order.products.categories.name}"`,
          `"${order.name}"`,
          order.email,
          `"${order.company_name || ''}"`,
          order.phone_number,
          order.status,
          `"${order.message || ''}"`,
        ].join(','))
      ].join('\n');

      // Download CSV
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `orders_${format(new Date(), 'yyyy-MM-dd')}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);

      setSuccessMessage('Orders exported successfully');
      setShowSuccess(true);
    } catch (error) {
      console.error('Error exporting orders:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'contacted':
        return 'info';
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" sx={{ fontWeight: 600, color: '#2c2976' }}>
          Orders Management
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={fetchOrders}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<Download />}
            onClick={handleExportOrders}
            sx={{
              background: 'linear-gradient(135deg, #3B9FD9 0%, #2B7EAA 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #2B7EAA 0%, #3B9FD9 100%)',
              },
            }}
          >
            Export CSV
          </Button>
        </Box>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: '15px' }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              label="Search"
              placeholder="Search by name, email, or company"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setPage(0);
                  fetchOrders();
                }
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <FilterList />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Status Filter</InputLabel>
              <Select
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value);
                  setPage(0);
                }}
                label="Status Filter"
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="contacted">Contacted</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => {
                setPage(0);
                fetchOrders();
              }}
            >
              Apply Filters
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Orders Table */}
      <Paper sx={{ borderRadius: '15px', overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Product</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Customer</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Company</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 5 }}>
                    <Typography color="textSecondary">Loading orders...</Typography>
                  </TableCell>
                </TableRow>
              ) : orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 5 }}>
                    <Typography color="textSecondary">No orders found</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order) => (
                  <TableRow key={order.id} hover>
                    <TableCell>
                      {format(new Date(order.created_at), 'MMM dd, yyyy')}
                      <br />
                      <Typography variant="caption" color="textSecondary">
                        {format(new Date(order.created_at), 'HH:mm')}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {order.products?.image_url && (
                          <Box
                            component="img"
                            src={order.products.image_url}
                            alt={order.products.name}
                            sx={{
                              width: 40,
                              height: 40,
                              objectFit: 'cover',
                              borderRadius: '8px',
                            }}
                          />
                        )}
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {order.products?.name}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {order.products?.categories?.name}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {order.name}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {order.email}
                      </Typography>
                    </TableCell>
                    <TableCell>{order.company_name || '-'}</TableCell>
                    <TableCell>
                      <FormControl size="small" sx={{ minWidth: 120 }}>
                        <Select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          renderValue={(value) => (
                            <Chip
                              label={getStatusLabel(value)}
                              color={getStatusColor(value)}
                              size="small"
                            />
                          )}
                        >
                          <MenuItem value="pending">Pending</MenuItem>
                          <MenuItem value="contacted">Contacted</MenuItem>
                          <MenuItem value="completed">Completed</MenuItem>
                          <MenuItem value="cancelled">Cancelled</MenuItem>
                        </Select>
                      </FormControl>
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="View Details">
                        <IconButton
                          size="small"
                          onClick={() => handleViewDetails(order)}
                          sx={{ color: '#3B9FD9' }}
                        >
                          <Visibility />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Order">
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteClick(order)}
                          sx={{ color: '#f44336' }}
                        >
                          <Delete />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={totalCount}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {/* Order Details Dialog */}
      <Dialog
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: '15px' } }}
      >
        {selectedOrder && (
          <>
            <DialogTitle sx={{ 
              borderBottom: '1px solid #e0e0e0',
              background: 'linear-gradient(135deg, #f5f7fa 0%, #e9ecef 100%)',
            }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Order Details #{selectedOrder.id}
              </Typography>
            </DialogTitle>
            <DialogContent sx={{ mt: 3 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 3, borderRadius: '12px', backgroundColor: '#f9f9f9' }}>
                    <Typography variant="subtitle2" sx={{ mb: 2, color: '#666' }}>
                      Customer Information
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Person sx={{ color: '#3B9FD9', fontSize: 20 }} />
                        <Typography>{selectedOrder.name}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Email sx={{ color: '#3B9FD9', fontSize: 20 }} />
                        <Typography>{selectedOrder.email}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Phone sx={{ color: '#3B9FD9', fontSize: 20 }} />
                        <Typography>{selectedOrder.phone_number}</Typography>
                      </Box>
                      {selectedOrder.company_name && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Business sx={{ color: '#3B9FD9', fontSize: 20 }} />
                          <Typography>{selectedOrder.company_name}</Typography>
                        </Box>
                      )}
                    </Box>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 3, borderRadius: '12px', backgroundColor: '#f9f9f9' }}>
                    <Typography variant="subtitle2" sx={{ mb: 2, color: '#666' }}>
                      Product Information
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      {selectedOrder.products?.image_url && (
                        <Box
                          component="img"
                          src={selectedOrder.products.image_url}
                          alt={selectedOrder.products.name}
                          sx={{
                            width: 80,
                            height: 80,
                            objectFit: 'cover',
                            borderRadius: '8px',
                          }}
                        />
                      )}
                      <Box>
                        <Typography variant="h6">{selectedOrder.products?.name}</Typography>
                        <Typography variant="body2" color="textSecondary">
                          Category: {selectedOrder.products?.categories?.name}
                        </Typography>
                        <Chip
                          label={getStatusLabel(selectedOrder.status)}
                          color={getStatusColor(selectedOrder.status)}
                          size="small"
                          sx={{ mt: 1 }}
                        />
                      </Box>
                    </Box>
                  </Paper>
                </Grid>
                {selectedOrder.message && (
                  <Grid item xs={12}>
                    <Paper sx={{ p: 3, borderRadius: '12px', backgroundColor: '#f9f9f9' }}>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                        <Message sx={{ color: '#3B9FD9', fontSize: 20, mt: 0.5 }} />
                        <Box>
                          <Typography variant="subtitle2" sx={{ mb: 1, color: '#666' }}>
                            Message
                          </Typography>
                          <Typography sx={{ whiteSpace: 'pre-wrap' }}>
                            {selectedOrder.message}
                          </Typography>
                        </Box>
                      </Box>
                    </Paper>
                  </Grid>
                )}
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="caption" color="textSecondary">
                      Created: {format(new Date(selectedOrder.created_at), 'PPpp')}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      Updated: {format(new Date(selectedOrder.updated_at), 'PPpp')}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions sx={{ p: 3, borderTop: '1px solid #e0e0e0' }}>
              <Button onClick={() => setDetailsOpen(false)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        PaperProps={{ sx: { borderRadius: '15px' } }}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this order? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Snackbar */}
      <Snackbar
        open={showSuccess}
        autoHideDuration={6000}
        onClose={() => setShowSuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setShowSuccess(false)}
          severity="success"
          sx={{ width: '100%' }}
        >
          {successMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Orders;