// src/admin/pages/Brands.js
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

function Brands() {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    logo_url: '',
    fallback_logo_url: '',
    sort_order: 0,
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const { adminLanguage } = useAdminLanguage();
  const [translations, setTranslations] = useState({});

  useEffect(() => {
    fetchBrands();
  }, [adminLanguage]);

  const fetchBrands = async () => {
    try {
      const { data, error } = await supabase
        .from('brands')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('id', { ascending: true });

      if (error) throw error;
      setBrands(data || []);

      // Fetch translations if not English
      if (adminLanguage !== 'en') {
        const { data: transData } = await supabase
          .from('brands_translations')
          .select('*')
          .eq('language_code', adminLanguage);

        const trans = {};
        if (transData) {
          transData.forEach(t => {
            trans[t.brand_id] = t;
          });
        }
        setTranslations(trans);
      }
    } catch (error) {
      console.error('Error fetching brands:', error);
      showSnackbar('Failed to load brands', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (brand = null) => {
    if (brand) {
      setEditingBrand(brand);
      const translation = adminLanguage !== 'en' ? translations[brand.id] : null;
      setFormData({
        name: translation?.name || brand.name || '',
        logo_url: brand.logo_url || '',
        fallback_logo_url: brand.fallback_logo_url || '',
        sort_order: brand.sort_order || 0,
      });
    } else {
      setEditingBrand(null);
      setFormData({
        name: '',
        logo_url: '',
        fallback_logo_url: '',
        sort_order: brands.length,
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingBrand(null);
    setFormData({
      name: '',
      logo_url: '',
      fallback_logo_url: '',
      sort_order: 0,
    });
  };

  const handleSave = async () => {
    try {
      if (adminLanguage === 'en') {
        // Save base content
        if (editingBrand) {
          const { error } = await supabase
            .from('brands')
            .update({
              name: formData.name,
              logo_url: formData.logo_url,
              fallback_logo_url: formData.fallback_logo_url,
              sort_order: formData.sort_order,
            })
            .eq('id', editingBrand.id);

          if (error) throw error;
        } else {
          const { error } = await supabase.from('brands').insert([formData]);

          if (error) throw error;
        }
      } else {
        // Save translations
        if (editingBrand) {
          const { data: existing } = await supabase
            .from('brands_translations')
            .select('id')
            .eq('brand_id', editingBrand.id)
            .eq('language_code', adminLanguage)
            .single();

          if (existing) {
            await supabase
              .from('brands_translations')
              .update({ name: formData.name })
              .eq('brand_id', editingBrand.id)
              .eq('language_code', adminLanguage);
          } else {
            await supabase
              .from('brands_translations')
              .insert({
                brand_id: editingBrand.id,
                language_code: adminLanguage,
                name: formData.name,
              });
          }
        } else {
          // For new items, create in English first
          showSnackbar('Please create new brands in English first, then add translations', 'info');
          return;
        }
      }

      showSnackbar('Brand saved successfully');
      handleCloseDialog();
      fetchBrands();
    } catch (error) {
      console.error('Error saving brand:', error);
      showSnackbar('Failed to save brand', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this brand?')) return;

    try {
      const { error } = await supabase.from('brands').delete().eq('id', id);

      if (error) throw error;
      showSnackbar('Brand deleted successfully');
      fetchBrands();
    } catch (error) {
      console.error('Error deleting brand:', error);
      showSnackbar('Failed to delete brand', 'error');
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const getDisplayValue = (brand, field) => {
    if (adminLanguage === 'en') {
      return brand[field] || '';
    }
    const translation = translations[brand.id];
    return translation?.[field] || brand[field] || '';
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h4" component="h1">
            Brands Management
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
          Add Brand
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell width={50}></TableCell>
              <TableCell>Logo</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Logo URL</TableCell>
              <TableCell>Sort Order</TableCell>
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
                    <Skeleton variant="circular" width={40} height={40} />
                  </TableCell>
                  <TableCell>
                    <Skeleton variant="text" width={150} />
                  </TableCell>
                  <TableCell>
                    <Skeleton variant="text" width={200} />
                  </TableCell>
                  <TableCell>
                    <Skeleton variant="text" width={50} />
                  </TableCell>
                  <TableCell align="right">
                    <Skeleton variant="text" width={100} />
                  </TableCell>
                </TableRow>
              ))
            ) : brands.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No brands found. Add your first brand!
                </TableCell>
              </TableRow>
            ) : (
              brands.map((brand) => (
                <TableRow key={brand.id}>
                  <TableCell>
                    <DragIcon sx={{ color: 'text.secondary' }} />
                  </TableCell>
                  <TableCell>
                    <Avatar
                      src={brand.logo_url}
                      alt={brand.name}
                      sx={{ width: 40, height: 40 }}
                      variant="square"
                    />
                  </TableCell>
                  <TableCell>{getDisplayValue(brand, 'name')}</TableCell>
                  <TableCell sx={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {brand.logo_url}
                  </TableCell>
                  <TableCell>{brand.sort_order}</TableCell>
                  <TableCell align="right">
                    <IconButton onClick={() => handleOpenDialog(brand)} color="primary">
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(brand.id)} color="error">
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
        <DialogTitle>{editingBrand ? 'Edit Brand' : 'Add New Brand'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <TextField
              label="Brand Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              fullWidth
              required
              helperText={adminLanguage !== 'en' ? 'Leave empty to use English version' : ''}
            />
            {adminLanguage === 'en' && (
              <>
                <ImageUpload
                  label="Brand Logo"
                  value={formData.logo_url}
                  onChange={(url) => setFormData({ ...formData, logo_url: url })}
                  required
                  folder="brands"
                />
                <ImageUpload
                  label="Fallback Logo"
                  value={formData.fallback_logo_url}
                  onChange={(url) => setFormData({ ...formData, fallback_logo_url: url })}
                  helperText="Optional: Alternative logo if primary fails"
                  folder="brands"
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
                ? !formData.name || !formData.logo_url
                : !editingBrand // Disable for new items when not in English
            }
          >
            {editingBrand ? 'Update' : 'Add'}
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

export default Brands;