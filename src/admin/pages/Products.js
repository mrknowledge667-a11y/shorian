// src/admin/pages/Products.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  Alert,
  Skeleton,
  Avatar,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  DragIndicator as DragIcon,
} from '@mui/icons-material';
import { supabase } from '../../api/supabaseClient';
import ImageUpload from '../components/ImageUpload';
import { useAdminLanguage } from '../../contexts/AdminLanguageContext';

function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category_id: '',
    image_url: '',
    brand: '',
    condition: 'New',
    price_display: '',
    is_new: false,
    sort_order: 0,
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const { adminLanguage } = useAdminLanguage();
  const [translations, setTranslations] = useState({});

  useEffect(() => {
    fetchData();
  }, [adminLanguage]);

  const fetchData = async () => {
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        supabase
          .from('products')
          .select('*, categories(name)')
          .order('sort_order', { ascending: true })
          .order('id', { ascending: true }),
        supabase
          .from('categories')
          .select('*')
          .order('name', { ascending: true }),
      ]);

      if (productsRes.error) throw productsRes.error;
      if (categoriesRes.error) throw categoriesRes.error;

      setProducts(productsRes.data || []);
      setCategories(categoriesRes.data || []);

      // Fetch translations if not English
      if (adminLanguage !== 'en') {
        const { data: transData } = await supabase
          .from('products_translations')
          .select('*')
          .eq('language_code', adminLanguage);

        const trans = {};
        if (transData) {
          transData.forEach(t => {
            trans[t.product_id] = t;
          });
        }
        setTranslations(trans);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      showSnackbar('Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (product = null) => {
    if (product) {
      setEditingProduct(product);
      const translation = adminLanguage !== 'en' ? translations[product.id] : null;
      setFormData({
        name: translation?.name || product.name || '',
        category_id: product.category_id || '',
        image_url: product.image_url || '',
        brand: translation?.brand || product.brand || '',
        condition: product.condition || 'New',
        price_display: translation?.price_display || product.price_display || '',
        is_new: product.is_new || false,
        sort_order: product.sort_order || 0,
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        category_id: '',
        image_url: '',
        brand: '',
        condition: 'New',
        price_display: '',
        is_new: false,
        sort_order: products.length,
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingProduct(null);
    setFormData({
      name: '',
      category_id: '',
      image_url: '',
      brand: '',
      condition: 'New',
      price_display: '',
      is_new: false,
      sort_order: 0,
    });
  };

  const handleSave = async () => {
    try {
      if (adminLanguage === 'en') {
        // Save base content
        if (editingProduct) {
          const { error } = await supabase
            .from('products')
            .update({
              name: formData.name,
              category_id: formData.category_id,
              image_url: formData.image_url,
              brand: formData.brand,
              condition: formData.condition,
              price_display: formData.price_display,
              is_new: formData.is_new,
              sort_order: formData.sort_order,
            })
            .eq('id', editingProduct.id);

          if (error) throw error;
        } else {
          const { error } = await supabase.from('products').insert([formData]);

          if (error) throw error;
        }
      } else {
        // Save translations
        if (editingProduct) {
          const { data: existing } = await supabase
            .from('products_translations')
            .select('id')
            .eq('product_id', editingProduct.id)
            .eq('language_code', adminLanguage)
            .single();

          if (existing) {
            await supabase
              .from('products_translations')
              .update({
                name: formData.name,
                brand: formData.brand,
                price_display: formData.price_display
              })
              .eq('product_id', editingProduct.id)
              .eq('language_code', adminLanguage);
          } else {
            await supabase
              .from('products_translations')
              .insert({
                product_id: editingProduct.id,
                language_code: adminLanguage,
                name: formData.name,
                brand: formData.brand,
                price_display: formData.price_display,
              });
          }
        } else {
          // For new items, create in English first
          showSnackbar('Please create new products in English first, then add translations', 'info');
          return;
        }
      }

      showSnackbar('Product saved successfully');
      handleCloseDialog();
      fetchData();
    } catch (error) {
      console.error('Error saving product:', error);
      showSnackbar('Failed to save product', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    try {
      const { error } = await supabase.from('products').delete().eq('id', id);

      if (error) throw error;
      showSnackbar('Product deleted successfully');
      fetchData();
    } catch (error) {
      console.error('Error deleting product:', error);
      showSnackbar('Failed to delete product', 'error');
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const getDisplayValue = (product, field) => {
    if (adminLanguage === 'en') {
      return product[field] || '';
    }
    const translation = translations[product.id];
    return translation?.[field] || product[field] || '';
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h4" component="h1">
            Products Management
          </Typography>
          {adminLanguage !== 'en' && (
            <Chip
              label={`Editing in: ${adminLanguage.toUpperCase()}`}
              color="primary"
              size="small"
            />
          )}
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          disabled={adminLanguage !== 'en'}
        >
          Add Product
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell width={50}></TableCell>
              <TableCell>Image</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Brand</TableCell>
              <TableCell>Condition</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Skeleton variant="circular" width={24} height={24} />
                  </TableCell>
                  <TableCell>
                    <Skeleton variant="rectangular" width={60} height={60} />
                  </TableCell>
                  <TableCell>
                    <Skeleton variant="text" width={150} />
                  </TableCell>
                  <TableCell>
                    <Skeleton variant="text" width={100} />
                  </TableCell>
                  <TableCell>
                    <Skeleton variant="text" width={80} />
                  </TableCell>
                  <TableCell>
                    <Skeleton variant="text" width={80} />
                  </TableCell>
                  <TableCell>
                    <Skeleton variant="text" width={60} />
                  </TableCell>
                  <TableCell>
                    <Skeleton variant="text" width={50} />
                  </TableCell>
                  <TableCell align="right">
                    <Skeleton variant="text" width={100} />
                  </TableCell>
                </TableRow>
              ))
            ) : products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center">
                  No products found. Add your first product!
                </TableCell>
              </TableRow>
            ) : (
              products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <DragIcon sx={{ color: 'text.secondary' }} />
                  </TableCell>
                  <TableCell>
                    <Avatar
                      src={product.image_url}
                      alt={product.name}
                      sx={{ width: 60, height: 60 }}
                      variant="rounded"
                    />
                  </TableCell>
                  <TableCell>{getDisplayValue(product, 'name')}</TableCell>
                  <TableCell>{product.categories?.name || '-'}</TableCell>
                  <TableCell>{getDisplayValue(product, 'brand') || '-'}</TableCell>
                  <TableCell>
                    <Chip 
                      label={product.condition} 
                      size="small"
                      color={product.condition === 'Refurbished' ? 'primary' : 'default'}
                    />
                  </TableCell>
                  <TableCell>{getDisplayValue(product, 'price_display') || '-'}</TableCell>
                  <TableCell>
                    {product.is_new && (
                      <Chip label="NEW" color="secondary" size="small" />
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton onClick={() => handleOpenDialog(product)} color="primary">
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(product.id)} color="error">
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <TextField
              label="Product Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              fullWidth
              required
              helperText={adminLanguage !== 'en' ? 'Leave empty to use English version' : ''}
            />
            <FormControl fullWidth required>
              <InputLabel>Category</InputLabel>
              <Select
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                label="Category"
              >
                <MenuItem value="">
                  <em>Select a category</em>
                </MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {adminLanguage === 'en' && (
              <ImageUpload
                label="Product Image"
                value={formData.image_url}
                onChange={(url) => setFormData({ ...formData, image_url: url })}
                required
                folder="products"
              />
            )}
            <TextField
              label="Brand"
              value={formData.brand}
              onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
              fullWidth
              helperText={adminLanguage !== 'en' ? 'Leave empty to use English version' : 'Optional: Product brand or manufacturer'}
            />
            {adminLanguage === 'en' && (
              <FormControl fullWidth>
                <InputLabel>Condition</InputLabel>
                <Select
                  value={formData.condition}
                  onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                  label="Condition"
                >
                  <MenuItem value="New">New</MenuItem>
                  <MenuItem value="Refurbished">Refurbished</MenuItem>
                  <MenuItem value="Used">Used</MenuItem>
                </Select>
              </FormControl>
            )}
            <TextField
              label="Price Display"
              value={formData.price_display}
              onChange={(e) => setFormData({ ...formData, price_display: e.target.value })}
              fullWidth
              helperText={adminLanguage !== 'en' ? 'Leave empty to use English version' : 'e.g., £1,299 or Contact for Price'}
            />
            {adminLanguage === 'en' && (
              <>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.is_new}
                      onChange={(e) => setFormData({ ...formData, is_new: e.target.checked })}
                    />
                  }
                  label="Mark as New Arrival"
                />
                <TextField
                  label="Sort Order"
                  type="number"
                  value={formData.sort_order}
                  onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                  fullWidth
                  helperText="Lower numbers appear first"
                />
              </>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={
              adminLanguage === 'en'
                ? !formData.name || !formData.category_id || !formData.image_url
                : !editingProduct // Disable for new items when not in English
            }
          >
            {editingProduct ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default Products;