// src/admin/pages/Header.js
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
  Switch,
  FormControlLabel,
  Chip,
} from '@mui/material';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  DragIndicator as DragIcon,
} from '@mui/icons-material';
import { supabase } from '../../api/supabaseClient';
import { useAdminLanguage } from '../../contexts/AdminLanguageContext';

function Header() {
  const [navItems, setNavItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    route: '',
    sort_order: 0,
    is_active: true,
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const { adminLanguage } = useAdminLanguage();
  const [translations, setTranslations] = useState({});
  const [categories, setCategories] = useState([]);
  const [createCategory, setCreateCategory] = useState(false);
  
  // Available routes in the application
  const availableRoutes = [
    { path: '/', label: 'Home' },
    { path: '/anaesthesia', label: 'Anaesthesia' },
    { path: '/patient-monitors', label: 'Patient Monitoring' },
    { path: '/electrosurgical', label: 'Electrosurgical' },
    { path: '/endoscopy-laparoscopy', label: 'Endoscopy & Laparoscopy' },
    { path: '/endoscopes', label: 'Flexible Endoscopes' },
    { path: '/ventilators', label: 'Ventilators' },
    { path: '/services', label: 'Services' },
    { path: '/about-us', label: 'About Us' },
    { path: '/contact-us', label: 'Contact Us' },
    { path: '/blog', label: 'Blog' },
    { path: '#', label: 'Placeholder (no link)' },
  ];

  useEffect(() => {
    fetchNavItems();
    fetchCategories();
  }, [adminLanguage]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name, slug')
        .order('name', { ascending: true });
      
      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchNavItems = async () => {
    try {
      const { data, error } = await supabase
        .from('header_nav_items')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('id', { ascending: true });

      if (error) throw error;
      setNavItems(data || []);

      // Fetch translations if not English
      if (adminLanguage !== 'en') {
        const { data: transData } = await supabase
          .from('header_nav_items_translations')
          .select('*')
          .eq('language_code', adminLanguage);

        const trans = {};
        if (transData) {
          transData.forEach(t => {
            trans[t.nav_item_id] = t;
          });
        }
        setTranslations(trans);
      }
    } catch (error) {
      console.error('Error fetching nav items:', error);
      showSnackbar('Failed to load navigation items', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (item = null) => {
    if (item) {
      setEditingItem(item);
      const translation = adminLanguage !== 'en' ? translations[item.id] : null;
      setFormData({
        name: translation?.name || item.name || '',
        route: item.route || '',
        sort_order: item.sort_order || 0,
        is_active: item.is_active !== false,
      });
    } else {
      setEditingItem(null);
      setFormData({
        name: '',
        route: '',
        sort_order: navItems.length,
        is_active: true,
      });
      setCreateCategory(true); // Set to true by default for new items
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingItem(null);
    setFormData({
      name: '',
      route: '',
      sort_order: 0,
      is_active: true,
    });
  };

  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleSave = async () => {
    try {
      // Validate route
      if (formData.route && formData.route !== '#') {
        // Check if it's an external URL
        const isExternalUrl = formData.route.startsWith('http://') || formData.route.startsWith('https://');
        
        // If it's an internal route, ensure it starts with /
        if (!isExternalUrl && !formData.route.startsWith('/')) {
          showSnackbar('Internal routes must start with "/" (e.g., /about-us)', 'error');
          return;
        }
      }
      
      if (adminLanguage === 'en') {
        // Save base content
        if (editingItem) {
          const { error } = await supabase
            .from('header_nav_items')
            .update({
              name: formData.name,
              route: formData.route || '#',
              sort_order: formData.sort_order,
              is_active: formData.is_active,
            })
            .eq('id', editingItem.id);

          if (error) throw error;
        } else {
          const navData = {
            ...formData,
            route: formData.route || '#'
          };
          const { error } = await supabase.from('header_nav_items').insert([navData]);

          if (error) throw error;

          // Create corresponding category if requested
          if (createCategory && formData.route && formData.route !== '#' && !formData.route.startsWith('http')) {
            const categorySlug = formData.route.replace('/', '');
            
            // Check if category already exists
            const { data: existingCategory } = await supabase
              .from('categories')
              .select('id')
              .eq('slug', categorySlug)
              .single();

            if (!existingCategory) {
              const { error: categoryError } = await supabase
                .from('categories')
                .insert([{
                  name: formData.name,
                  slug: categorySlug,
                  description: `Products for ${formData.name}`,
                  sort_order: 999,
                  image_url: ''
                }]);

              if (categoryError) {
                console.error('Error creating category:', categoryError);
                showSnackbar('Navigation created but category creation failed. Please create the category manually.', 'warning');
              } else {
                showSnackbar('Navigation item and category created successfully!');
              }
            }
          }
        }
      } else {
        // Save translations
        if (editingItem) {
          const { data: existing } = await supabase
            .from('header_nav_items_translations')
            .select('id')
            .eq('nav_item_id', editingItem.id)
            .eq('language_code', adminLanguage)
            .single();

          if (existing) {
            await supabase
              .from('header_nav_items_translations')
              .update({ name: formData.name })
              .eq('nav_item_id', editingItem.id)
              .eq('language_code', adminLanguage);
          } else {
            await supabase
              .from('header_nav_items_translations')
              .insert({
                nav_item_id: editingItem.id,
                language_code: adminLanguage,
                name: formData.name,
              });
          }
        } else {
          // For new items, create in English first
          showSnackbar('Please create new navigation items in English first, then add translations', 'info');
          return;
        }
      }

      if (!createCategory || editingItem) {
        showSnackbar('Navigation item saved successfully');
      }
      handleCloseDialog();
      fetchNavItems();
      fetchCategories();
    } catch (error) {
      console.error('Error saving nav item:', error);
      showSnackbar('Failed to save navigation item', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this navigation item?')) return;

    try {
      const { error } = await supabase.from('header_nav_items').delete().eq('id', id);

      if (error) throw error;
      showSnackbar('Navigation item deleted successfully');
      fetchNavItems();
    } catch (error) {
      console.error('Error deleting nav item:', error);
      showSnackbar('Failed to delete navigation item', 'error');
    }
  };

  const handleToggleActive = async (item) => {
    try {
      const { error } = await supabase
        .from('header_nav_items')
        .update({ is_active: !item.is_active })
        .eq('id', item.id);

      if (error) throw error;
      showSnackbar('Navigation item status updated');
      fetchNavItems();
    } catch (error) {
      console.error('Error updating nav item:', error);
      showSnackbar('Failed to update navigation item', 'error');
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const getDisplayValue = (item, field) => {
    if (adminLanguage === 'en') {
      return item[field] || '';
    }
    const translation = translations[item.id];
    return translation?.[field] || item[field] || '';
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h4" component="h1">
            Header Navigation Management
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
          Add Navigation Item
        </Button>
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Manage the navigation menu items that appear in the website header. You can reorder, enable/disable, or customize navigation links.
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell width={50}></TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Route</TableCell>
              <TableCell>Sort Order</TableCell>
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
                    <Skeleton variant="text" width={150} />
                  </TableCell>
                  <TableCell>
                    <Skeleton variant="text" width={200} />
                  </TableCell>
                  <TableCell>
                    <Skeleton variant="text" width={50} />
                  </TableCell>
                  <TableCell>
                    <Skeleton variant="text" width={60} />
                  </TableCell>
                  <TableCell align="right">
                    <Skeleton variant="text" width={100} />
                  </TableCell>
                </TableRow>
              ))
            ) : navItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No navigation items found. Add your first navigation item!
                </TableCell>
              </TableRow>
            ) : (
              navItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <DragIcon sx={{ color: 'text.secondary' }} />
                  </TableCell>
                  <TableCell>{getDisplayValue(item, 'name')}</TableCell>
                  <TableCell>
                    <code style={{ backgroundColor: '#f5f5f5', padding: '2px 6px', borderRadius: '4px' }}>
                      {item.route || '/'}
                    </code>
                  </TableCell>
                  <TableCell>{item.sort_order}</TableCell>
                  <TableCell>
                    <Switch
                      checked={item.is_active}
                      onChange={() => handleToggleActive(item)}
                      color="primary"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton onClick={() => handleOpenDialog(item)} color="primary">
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(item.id)} color="error">
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
        <DialogTitle>{editingItem ? 'Edit Navigation Item' : 'Add New Navigation Item'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <TextField
              label="Navigation Label"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              fullWidth
              required
              helperText={adminLanguage !== 'en' ? 'Leave empty to use English version' : 'The text that will appear in the navigation menu'}
            />
            {adminLanguage === 'en' && (
              <>
                <Box sx={{
                  p: 2,
                  bgcolor: 'info.light',
                  borderRadius: 1,
                  mb: 2,
                  display: !editingItem && formData.route && !formData.route.startsWith('http') && formData.route !== '#' && formData.route !== '/' ? 'block' : 'none'
                }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={createCategory}
                        onChange={(e) => setCreateCategory(e.target.checked)}
                        color="primary"
                      />
                    }
                    label="Also create a product category for this navigation item"
                  />
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1, ml: 4.5 }}>
                    This will create a matching category so you can add products to this page
                  </Typography>
                </Box>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Select Route or Enter Custom URL</InputLabel>
                  <Select
                    value={availableRoutes.find(r => r.path === formData.route && r.path !== '/') ? formData.route : 'custom'}
                    onChange={(e) => {
                      if (e.target.value !== 'custom') {
                        setFormData({ ...formData, route: e.target.value });
                      } else {
                        // When switching to custom, keep the current route if it's "/"
                        // otherwise clear it
                        if (formData.route !== '/') {
                          setFormData({ ...formData, route: '' });
                        }
                      }
                    }}
                    label="Select Route or Enter Custom URL"
                  >
                    <MenuItem value="custom">
                      <em>Custom URL</em>
                    </MenuItem>
                    {availableRoutes.map(route => (
                      <MenuItem key={route.path} value={route.path}>
                        {route.label} ({route.path})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                {(!availableRoutes.find(r => r.path === formData.route && r.path !== '/') || formData.route === '' || formData.route === '/') && (
                  <TextField
                    label="Custom Route/URL"
                    value={formData.route}
                    onChange={(e) => setFormData({ ...formData, route: e.target.value })}
                    fullWidth
                    margin="normal"
                    placeholder="/custom-page or https://example.com"
                    helperText="Enter a custom internal route (starting with /) or external URL (starting with http:// or https://). Use # for no link."
                  />
                )}
                {!editingItem && formData.route && !availableRoutes.find(r => r.path === formData.route) && (
                  <Alert severity="info" sx={{ mt: 2 }}>
                    <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                      Important: Product Pages Setup
                    </Typography>
                    <Typography variant="body2">
                      For this navigation item to display products, you need a matching category with the slug: <code>{formData.route?.replace('/', '')}</code>
                    </Typography>
                    {categories.some(cat => cat.slug === formData.route?.replace('/', '')) ? (
                      <Typography variant="body2" sx={{ mt: 1, color: 'success.main' }}>
                        ✓ Category already exists! Products in this category will be displayed on this page.
                      </Typography>
                    ) : (
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        {createCategory ? '✓ A category will be created automatically.' : 'Enable the option above to create it automatically, or create it manually in Categories.'}
                      </Typography>
                    )}
                  </Alert>
                )}
                <TextField
                  label="Sort Order"
                  type="number"
                  value={formData.sort_order}
                  onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                  fullWidth
                  helperText="Lower numbers appear first in the navigation"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    />
                  }
                  label="Active"
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
                ? !formData.name
                : !editingItem // Disable for new items when not in English
            }
          >
            {editingItem ? 'Update' : 'Add'}
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

export default Header;