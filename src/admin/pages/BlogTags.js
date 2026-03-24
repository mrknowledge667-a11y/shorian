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

const BlogTags = () => {
  const { adminLanguage } = useAdminLanguage();
  const [tags, setTags] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [editingTag, setEditingTag] = useState(null);
  const [deletingTag, setDeletingTag] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  // Form state
  const [formData, setFormData] = useState({
    slug: '',
    name: '',
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
      
      // Load blog tags
      const { data: tagsData, error } = await supabase
        .from('blog_tags')
        .select('*')
        .order('sort_order', { ascending: true });
      
      if (error) throw error;
      setTags(tagsData || []);
    } catch (error) {
      console.error('Error loading data:', error);
      showSnackbar('Error loading data', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  const handleOpenDialog = async (tag = null) => {
    if (tag) {
      // Load tag translations
      const { data: translations, error } = await supabase
        .from('blog_tags_translations')
        .select('*')
        .eq('tag_id', tag.id);
      
      if (!error && translations) {
        const translationsMap = {};
        translations.forEach(trans => {
          translationsMap[trans.language_code] = {
            name: trans.name,
          };
        });
        
        setFormData({
          ...tag,
          translations: translationsMap,
        });
      } else {
        setFormData({
          ...tag,
          translations: {},
        });
      }
      
      setEditingTag(tag);
    } else {
      // Reset form for new tag
      setFormData({
        slug: '',
        name: '',
        is_active: true,
        sort_order: 0,
        translations: {},
      });
      setEditingTag(null);
    }
    setActiveTab('en');
    setOpenDialog(true);
  };
  
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingTag(null);
    setActiveTab('en');
  };
  
  const handleSave = async () => {
    try {
      const tagData = {
        slug: formData.slug,
        name: formData.name,
        is_active: formData.is_active,
        sort_order: formData.sort_order,
      };
      
      let tagId;
      
      if (editingTag) {
        // Update existing tag
        const { data, error } = await supabase
          .from('blog_tags')
          .update(tagData)
          .eq('id', editingTag.id)
          .select()
          .single();
        
        if (error) throw error;
        tagId = editingTag.id;
      } else {
        // Create new tag
        const { data, error } = await supabase
          .from('blog_tags')
          .insert(tagData)
          .select()
          .single();
        
        if (error) throw error;
        tagId = data.id;
      }
      
      // Update translations
      for (const [langCode, translation] of Object.entries(formData.translations)) {
        if (langCode !== 'en' && translation.name) {
          const translationData = {
            tag_id: tagId,
            language_code: langCode,
            name: translation.name,
          };
          
          await supabase
            .from('blog_tags_translations')
            .upsert(translationData, {
              onConflict: 'tag_id,language_code',
            });
        }
      }
      
      showSnackbar(editingTag ? 'Tag updated successfully' : 'Tag created successfully', 'success');
      handleCloseDialog();
      loadData();
    } catch (error) {
      console.error('Error saving tag:', error);
      showSnackbar(`Error saving tag: ${error.message}`, 'error');
    }
  };
  
  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from('blog_tags')
        .delete()
        .eq('id', deletingTag.id);
      
      if (error) throw error;
      
      showSnackbar('Tag deleted successfully', 'success');
      setOpenDeleteDialog(false);
      setDeletingTag(null);
      loadData();
    } catch (error) {
      console.error('Error deleting tag:', error);
      showSnackbar(`Error deleting tag: ${error.message}`, 'error');
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
  
  const handleToggleActive = async (tag) => {
    try {
      const { error } = await supabase
        .from('blog_tags')
        .update({ is_active: !tag.is_active })
        .eq('id', tag.id);
      
      if (error) throw error;
      
      showSnackbar(`Tag ${tag.is_active ? 'deactivated' : 'activated'} successfully`, 'success');
      loadData();
    } catch (error) {
      console.error('Error toggling active status:', error);
      showSnackbar('Error updating tag', 'error');
    }
  };
  
  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };
  
  return (
    <Container maxWidth="lg">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Blog Tags Management
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
        >
          Add New Tag
        </Button>
      </Box>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Slug</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Sort Order</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tags.map((tag) => (
              <TableRow key={tag.id}>
                <TableCell>{tag.name}</TableCell>
                <TableCell>
                  <Typography variant="caption">{tag.slug}</Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={tag.is_active ? 'Active' : 'Inactive'}
                    color={tag.is_active ? 'success' : 'default'}
                    size="small"
                    onClick={() => handleToggleActive(tag)}
                    sx={{ cursor: 'pointer' }}
                  />
                </TableCell>
                <TableCell>{tag.sort_order}</TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    onClick={() => handleOpenDialog(tag)}
                    color="primary"
                  >
                    <Edit />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => {
                      setDeletingTag(tag);
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
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingTag ? 'Edit Blog Tag' : 'Add New Blog Tag'}
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
        <DialogTitle>Delete Blog Tag</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete "{deletingTag?.name}"? This may affect blog posts using this tag.
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

export default BlogTags;