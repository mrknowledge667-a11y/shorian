// src/admin/pages/Categories.js
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

function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    image_url: '',
    description: '',
    sort_order: 0,
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const { adminLanguage } = useAdminLanguage();
  const [translations, setTranslations] = useState({});

  useEffect(() => {
    fetchCategories();
  }, [adminLanguage]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('id', { ascending: true });

      if (error) throw error;
      setCategories(data || []);

      // Fetch translations if not English
      if (adminLanguage !== 'en') {
        const { data: transData } = await supabase
          .from('categories_translations')
          .select('*')
          .eq('language_code', adminLanguage);

        const trans = {};
        if (transData) {
          transData.forEach(t => {
            trans[t.category_id] = t;
          });
        }
        setTranslations(trans);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      showSnackbar('Failed to load categories', 'error');
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleOpenDialog = (category = null) => {
    if (category) {
      setEditingCategory(category);
      const translation = adminLanguage !== 'en' ? translations[category.id] : null;
      setFormData({
        name: translation?.name || category.name || '',
        slug: category.slug || '',
        image_url: category.image_url || '',
        description: translation?.description || category.description || '',
        sort_order: category.sort_order || 0,
      });
    } else {
      setEditingCategory(null);
      setFormData({
        name: '',
        slug: '',
        image_url: '',
        description: '',
        sort_order: categories.length,
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingCategory(null);
    setFormData({
      name: '',
      slug: '',
      image_url: '',
      description: '',
      sort_order: 0,
    });
  };

  const handleSave = async () => {
    try {
      if (adminLanguage === 'en') {
        // Save base content
        const dataToSave = {
          name: formData.name,
          slug: formData.slug || generateSlug(formData.name),
          image_url: formData.image_url,
          description: formData.description,
          sort_order: formData.sort_order,
        };

        if (editingCategory) {
          const { error } = await supabase
            .from('categories')
            .update(dataToSave)
            .eq('id', editingCategory.id);

          if (error) throw error;
        } else {
          const { error } = await supabase.from('categories').insert([dataToSave]);

          if (error) throw error;
        }
      } else {
        // Save translations
        if (editingCategory) {
          const { data: existing } = await supabase
            .from('categories_translations')
            .select('id')
            .eq('category_id', editingCategory.id)
            .eq('language_code', adminLanguage)
            .single();

          if (existing) {
            await supabase
              .from('categories_translations')
              .update({
                name: formData.name,
                description: formData.description
              })
              .eq('category_id', editingCategory.id)
              .eq('language_code', adminLanguage);
          } else {
            await supabase
              .from('categories_translations')
              .insert({
                category_id: editingCategory.id,
                language_code: adminLanguage,
                name: formData.name,
                description: formData.description,
              });
          }
        } else {
          // For new items, create in English first
          showSnackbar('Please create new categories in English first, then add translations', 'info');
          return;
        }
      }

      showSnackbar('Category saved successfully');
      handleCloseDialog();
      fetchCategories();
    } catch (error) {
      console.error('Error saving category:', error);
      showSnackbar('Failed to save category', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category? This will affect all products in this category.')) return;

    try {
      const { error } = await supabase.from('categories').delete().eq('id', id);

      if (error) throw error;
      showSnackbar('Category deleted successfully');
      fetchCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      showSnackbar('Failed to delete category', 'error');
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const getDisplayValue = (category, field) => {
    if (adminLanguage === 'en') {
      return category[field] || '';
    }
    const translation = translations[category.id];
    return translation?.[field] || category[field] || '';
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h4" component="h1">
            Categories Management
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
          Add Category
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell width={50}></TableCell>
              <TableCell>Image</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Slug</TableCell>
              <TableCell>Description</TableCell>
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
                    <Skeleton variant="rectangular" width={60} height={60} />
                  </TableCell>
                  <TableCell>
                    <Skeleton variant="text" width={150} />
                  </TableCell>
                  <TableCell>
                    <Skeleton variant="text" width={100} />
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
            ) : categories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No categories found. Add your first category!
                </TableCell>
              </TableRow>
            ) : (
              categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell>
                    <DragIcon sx={{ color: 'text.secondary' }} />
                  </TableCell>
                  <TableCell>
                    <Avatar
                      src={category.image_url}
                      alt={category.name}
                      sx={{ width: 60, height: 60 }}
                      variant="rounded"
                    />
                  </TableCell>
                  <TableCell>{getDisplayValue(category, 'name')}</TableCell>
                  <TableCell>
                    <Chip label={category.slug} size="small" />
                  </TableCell>
                  <TableCell sx={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {getDisplayValue(category, 'description') || '-'}
                  </TableCell>
                  <TableCell>{category.sort_order}</TableCell>
                  <TableCell align="right">
                    <IconButton onClick={() => handleOpenDialog(category)} color="primary">
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(category.id)} color="error">
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
        <DialogTitle>{editingCategory ? 'Edit Category' : 'Add New Category'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <TextField
              label="Category Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              fullWidth
              required
              helperText={adminLanguage !== 'en' ? 'Leave empty to use English version' : ''}
            />
            {adminLanguage === 'en' && (
              <TextField
                label="Slug"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                fullWidth
                helperText={`URL path for this category (auto-generated if empty). Preview: /${formData.slug || generateSlug(formData.name)}`}
              />
            )}
            {adminLanguage === 'en' && (
              <ImageUpload
                label="Category Image"
                value={formData.image_url}
                onChange={(url) => setFormData({ ...formData, image_url: url })}
                required
                folder="categories"
              />
            )}
            <TextField
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              fullWidth
              multiline
              rows={3}
              helperText={adminLanguage !== 'en' ? 'Leave empty to use English version' : 'Optional description for the category'}
            />
            {adminLanguage === 'en' && (
              <TextField
                label="Sort Order"
                type="number"
                value={formData.sort_order}
                onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                fullWidth
                helperText="Lower numbers appear first"
              />
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
                ? !formData.name || !formData.image_url
                : !editingCategory // Disable for new items when not in English
            }
          >
            {editingCategory ? 'Update' : 'Add'}
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

export default Categories;