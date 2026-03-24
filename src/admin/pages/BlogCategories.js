import React, { useState, useEffect } from 'react';
import {
  Container,
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
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  Box,
  Tabs,
  Tab,
  Alert,
  Snackbar,
  Chip,
  Switch,
  FormControlLabel,
} from '@mui/material';
import { Edit, Delete, Add } from '@mui/icons-material';
import { supabase } from '../../api/supabaseClient';
import { fetchActiveLanguages } from '../../api/content';
import { useAdminLanguage } from '../../contexts/AdminLanguageContext';

const BlogCategories = () => {
  const { adminLanguage } = useAdminLanguage();
  const [categories, setCategories] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deletingCategory, setDeletingCategory] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  // Form state
  const [formData, setFormData] = useState({
    slug: '',
    name: '',
    description: '',
    icon: '',
    color: '#3B9FD9',
    is_active: true,
    sort_order: 0,
    translations: {},
  });
  
  const [activeTab, setActiveTab] = useState('en');
  
  useEffect(() => {
    loadData();
  }, []);
  
  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load languages
      const languagesData = await fetchActiveLanguages();
      setLanguages(languagesData || []);
      
      // Load blog categories
      const { data: categoriesData, error } = await supabase
        .from('blog_categories')
        .select('*')
        .order('sort_order', { ascending: true });
      
      if (error) throw error;
      setCategories(categoriesData || []);
    } catch (error) {
      console.error('Error loading data:', error);
      showSnackbar('Error loading data', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  const handleOpenDialog = async (category = null) => {
    if (category) {
      // Load category translations
      const { data: translations, error } = await supabase
        .from('blog_categories_translations')
        .select('*')
        .eq('category_id', category.id);
      
      if (!error && translations) {
        const translationsMap = {};
        translations.forEach(trans => {
          translationsMap[trans.language_code] = {
            name: trans.name,
            description: trans.description,
          };
        });
        
        setFormData({
          ...category,
          translations: translationsMap,
        });
      } else {
        setFormData({
          ...category,
          translations: {},
        });
      }
      
      setEditingCategory(category);
    } else {
      // Reset form for new category
      setFormData({
        slug: '',
        name: '',
        description: '',
        icon: '',
        color: '#3B9FD9',
        is_active: true,
        sort_order: 0,
        translations: {},
      });
      setEditingCategory(null);
    }
    setActiveTab('en');
    setOpenDialog(true);
  };
  
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingCategory(null);
    setActiveTab('en');
  };
  
  const handleSave = async () => {
    try {
      const categoryData = {
        slug: formData.slug,
        name: formData.name,
        description: formData.description,
        icon: formData.icon,
        color: formData.color,
        is_active: formData.is_active,
        sort_order: formData.sort_order,
      };
      
      let categoryId;
      
      if (editingCategory) {
        // Update existing category
        const { data, error } = await supabase
          .from('blog_categories')
          .update(categoryData)
          .eq('id', editingCategory.id)
          .select()
          .single();
        
        if (error) throw error;
        categoryId = editingCategory.id;
      } else {
        // Create new category
        const { data, error } = await supabase
          .from('blog_categories')
          .insert(categoryData)
          .select()
          .single();
        
        if (error) throw error;
        categoryId = data.id;
      }
      
      // Update translations
      for (const [langCode, translation] of Object.entries(formData.translations)) {
        if (langCode !== 'en' && translation.name) {
          const translationData = {
            category_id: categoryId,
            language_code: langCode,
            name: translation.name,
            description: translation.description,
          };
          
          await supabase
            .from('blog_categories_translations')
            .upsert(translationData, {
              onConflict: 'category_id,language_code',
            });
        }
      }
      
      showSnackbar(editingCategory ? 'Category updated successfully' : 'Category created successfully', 'success');
      handleCloseDialog();
      loadData();
    } catch (error) {
      console.error('Error saving category:', error);
      showSnackbar(`Error saving category: ${error.message}`, 'error');
    }
  };
  
  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from('blog_categories')
        .delete()
        .eq('id', deletingCategory.id);
      
      if (error) throw error;
      
      showSnackbar('Category deleted successfully', 'success');
      setOpenDeleteDialog(false);
      setDeletingCategory(null);
      loadData();
    } catch (error) {
      console.error('Error deleting category:', error);
      showSnackbar(`Error deleting category: ${error.message}`, 'error');
    }
  };
  
  const handleFormChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };
  
  const handleTranslationChange = (langCode, field, value) => {
    setFormData(prev => ({
      ...prev,
      translations: {
        ...prev.translations,
        [langCode]: {
          ...prev.translations[langCode],
          [field]: value,
        },
      },
    }));
  };
  
  const handleToggleActive = async (category) => {
    try {
      const { error } = await supabase
        .from('blog_categories')
        .update({ is_active: !category.is_active })
        .eq('id', category.id);
      
      if (error) throw error;
      
      showSnackbar(`Category ${category.is_active ? 'deactivated' : 'activated'} successfully`, 'success');
      loadData();
    } catch (error) {
      console.error('Error toggling active status:', error);
      showSnackbar('Error updating category', 'error');
    }
  };
  
  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };
  
  return (
    <Container maxWidth="lg">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Blog Categories Management
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
        >
          Add New Category
        </Button>
      </Box>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Slug</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Icon</TableCell>
              <TableCell>Color</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Sort Order</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {categories.map((category) => (
              <TableRow key={category.id}>
                <TableCell>{category.name}</TableCell>
                <TableCell>
                  <Typography variant="caption">{category.slug}</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ maxWidth: 300 }}>
                    {category.description || '-'}
                  </Typography>
                </TableCell>
                <TableCell>
                  {category.icon && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <i className={`fas ${category.icon}`} />
                      <Typography variant="caption">{category.icon}</Typography>
                    </Box>
                  )}
                </TableCell>
                <TableCell>
                  {category.color && (
                    <Chip
                      label={category.color}
                      sx={{
                        backgroundColor: category.color,
                        color: 'white',
                        fontWeight: 'bold',
                      }}
                    />
                  )}
                </TableCell>
                <TableCell>
                  <Chip
                    label={category.is_active ? 'Active' : 'Inactive'}
                    color={category.is_active ? 'success' : 'default'}
                    size="small"
                    onClick={() => handleToggleActive(category)}
                    sx={{ cursor: 'pointer' }}
                  />
                </TableCell>
                <TableCell>{category.sort_order}</TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    onClick={() => handleOpenDialog(category)}
                    color="primary"
                  >
                    <Edit />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => {
                      setDeletingCategory(category);
                      setOpenDeleteDialog(true);
                    }}
                    color="error"
                  >
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      
      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingCategory ? 'Edit Blog Category' : 'Add New Blog Category'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
              <Tab label="English (Default)" value="en" />
              {languages
                .filter(lang => lang.code !== 'en')
                .map(lang => (
                  <Tab key={lang.code} label={lang.name} value={lang.code} />
                ))}
            </Tabs>
            
            <Box sx={{ mt: 3 }}>
              {activeTab === 'en' ? (
                <>
                  <TextField
                    fullWidth
                    label="Name"
                    value={formData.name}
                    onChange={(e) => handleFormChange('name', e.target.value)}
                    required
                    margin="normal"
                  />
                  <TextField
                    fullWidth
                    label="Slug"
                    value={formData.slug}
                    onChange={(e) => handleFormChange('slug', e.target.value)}
                    required
                    margin="normal"
                    helperText="URL-friendly version of the name"
                  />
                  <TextField
                    fullWidth
                    label="Description"
                    value={formData.description}
                    onChange={(e) => handleFormChange('description', e.target.value)}
                    multiline
                    rows={3}
                    margin="normal"
                  />
                  <TextField
                    fullWidth
                    label="Icon (Font Awesome class)"
                    value={formData.icon}
                    onChange={(e) => handleFormChange('icon', e.target.value)}
                    margin="normal"
                    helperText="e.g., fa-stethoscope"
                  />
                  <TextField
                    fullWidth
                    label="Color (Hex)"
                    type="color"
                    value={formData.color}
                    onChange={(e) => handleFormChange('color', e.target.value)}
                    margin="normal"
                  />
                  <TextField
                    fullWidth
                    label="Sort Order"
                    type="number"
                    value={formData.sort_order}
                    onChange={(e) => handleFormChange('sort_order', parseInt(e.target.value) || 0)}
                    margin="normal"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.is_active}
                        onChange={(e) => handleFormChange('is_active', e.target.checked)}
                      />
                    }
                    label="Active"
                    sx={{ mt: 2 }}
                  />
                </>
              ) : (
                // Translation fields
                <>
                  <Alert severity="info" sx={{ mb: 2 }}>
                    Translating content for {languages.find(l => l.code === activeTab)?.name}
                  </Alert>
                  <TextField
                    fullWidth
                    label="Name"
                    value={formData.translations[activeTab]?.name || ''}
                    onChange={(e) => handleTranslationChange(activeTab, 'name', e.target.value)}
                    margin="normal"
                  />
                  <TextField
                    fullWidth
                    label="Description"
                    value={formData.translations[activeTab]?.description || ''}
                    onChange={(e) => handleTranslationChange(activeTab, 'description', e.target.value)}
                    multiline
                    rows={3}
                    margin="normal"
                  />
                </>
              )}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>Delete Blog Category</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete "{deletingCategory?.name}"? This may affect blog posts using this category.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default BlogCategories;