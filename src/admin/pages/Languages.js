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
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  DragIndicator as DragIcon,
  Translate as TranslateIcon,
} from '@mui/icons-material';
import { supabase } from '../../api/supabaseClient';

function Languages() {
  const [languages, setLanguages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLanguage, setEditingLanguage] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    native_name: '',
    is_active: true,
    is_default: false,
    sort_order: 0,
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    fetchLanguages();
  }, []);

  const fetchLanguages = async () => {
    try {
      const { data, error } = await supabase
        .from('languages')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('id', { ascending: true });

      if (error) throw error;
      setLanguages(data || []);
    } catch (error) {
      console.error('Error fetching languages:', error);
      showSnackbar('Failed to load languages', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (language = null) => {
    if (language) {
      setEditingLanguage(language);
      setFormData({
        code: language.code || '',
        name: language.name || '',
        native_name: language.native_name || '',
        is_active: language.is_active !== false,
        is_default: language.is_default === true,
        sort_order: language.sort_order || 0,
      });
    } else {
      setEditingLanguage(null);
      setFormData({
        code: '',
        name: '',
        native_name: '',
        is_active: true,
        is_default: false,
        sort_order: languages.length,
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingLanguage(null);
    setFormData({
      code: '',
      name: '',
      native_name: '',
      is_active: true,
      is_default: false,
      sort_order: 0,
    });
  };

  const handleSave = async () => {
    try {
      // If setting as default, unset other defaults
      if (formData.is_default && (!editingLanguage || !editingLanguage.is_default)) {
        await supabase
          .from('languages')
          .update({ is_default: false })
          .eq('is_default', true);
      }

      if (editingLanguage) {
        const { error } = await supabase
          .from('languages')
          .update(formData)
          .eq('id', editingLanguage.id);

        if (error) throw error;
        showSnackbar('Language updated successfully');
      } else {
        const { error } = await supabase.from('languages').insert([formData]);

        if (error) throw error;
        showSnackbar('Language added successfully');
      }

      handleCloseDialog();
      fetchLanguages();
    } catch (error) {
      console.error('Error saving language:', error);
      showSnackbar('Failed to save language', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this language? This will also delete all translations for this language.')) return;

    try {
      const { error } = await supabase.from('languages').delete().eq('id', id);

      if (error) throw error;
      showSnackbar('Language deleted successfully');
      fetchLanguages();
    } catch (error) {
      console.error('Error deleting language:', error);
      showSnackbar('Failed to delete language', 'error');
    }
  };

  const handleToggleActive = async (language) => {
    try {
      const { error } = await supabase
        .from('languages')
        .update({ is_active: !language.is_active })
        .eq('id', language.id);

      if (error) throw error;
      showSnackbar('Language status updated');
      fetchLanguages();
    } catch (error) {
      console.error('Error updating language:', error);
      showSnackbar('Failed to update language', 'error');
    }
  };

  const handleSetDefault = async (language) => {
    try {
      // Unset current default
      await supabase
        .from('languages')
        .update({ is_default: false })
        .eq('is_default', true);

      // Set new default
      const { error } = await supabase
        .from('languages')
        .update({ is_default: true })
        .eq('id', language.id);

      if (error) throw error;
      showSnackbar('Default language updated');
      fetchLanguages();
    } catch (error) {
      console.error('Error setting default language:', error);
      showSnackbar('Failed to set default language', 'error');
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" component="h1">
            Language Management
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Manage available languages for your website. Enable languages to make them available in the language selector.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Language
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell width={50}></TableCell>
              <TableCell>Code</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Native Name</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Default</TableCell>
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
                    <Skeleton variant="text" width={50} />
                  </TableCell>
                  <TableCell>
                    <Skeleton variant="text" width={100} />
                  </TableCell>
                  <TableCell>
                    <Skeleton variant="text" width={100} />
                  </TableCell>
                  <TableCell>
                    <Skeleton variant="text" width={60} />
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
            ) : languages.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  No languages found. Add your first language!
                </TableCell>
              </TableRow>
            ) : (
              languages.map((language) => (
                <TableRow key={language.id}>
                  <TableCell>
                    <DragIcon sx={{ color: 'text.secondary' }} />
                  </TableCell>
                  <TableCell>
                    <code style={{ backgroundColor: '#f5f5f5', padding: '2px 6px', borderRadius: '4px' }}>
                      {language.code}
                    </code>
                  </TableCell>
                  <TableCell>{language.name}</TableCell>
                  <TableCell>{language.native_name}</TableCell>
                  <TableCell>
                    <Switch
                      checked={language.is_active}
                      onChange={() => handleToggleActive(language)}
                      color="primary"
                      disabled={language.is_default}
                    />
                  </TableCell>
                  <TableCell>
                    {language.is_default ? (
                      <Chip label="Default" color="primary" size="small" />
                    ) : (
                      <Button
                        size="small"
                        onClick={() => handleSetDefault(language)}
                        disabled={!language.is_active}
                      >
                        Set Default
                      </Button>
                    )}
                  </TableCell>
                  <TableCell>{language.sort_order}</TableCell>
                  <TableCell align="right">
                    <IconButton onClick={() => handleOpenDialog(language)} color="primary">
                      <EditIcon />
                    </IconButton>
                    <IconButton 
                      onClick={() => handleDelete(language.id)} 
                      color="error"
                      disabled={language.is_default}
                    >
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
        <DialogTitle>{editingLanguage ? 'Edit Language' : 'Add New Language'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <TextField
              label="Language Code"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toLowerCase() })}
              fullWidth
              required
              disabled={editingLanguage !== null}
              helperText="ISO 639-1 code (e.g., en, es, fr)"
              inputProps={{ maxLength: 10 }}
            />
            <TextField
              label="Language Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              fullWidth
              required
              helperText="Name in English (e.g., Spanish, French)"
            />
            <TextField
              label="Native Name"
              value={formData.native_name}
              onChange={(e) => setFormData({ ...formData, native_name: e.target.value })}
              fullWidth
              required
              helperText="Name in the native language (e.g., Español, Français)"
            />
            <TextField
              label="Sort Order"
              type="number"
              value={formData.sort_order}
              onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
              fullWidth
              helperText="Lower numbers appear first in the language selector"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                />
              }
              label="Active (visible in language selector)"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={formData.is_default}
                  onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
                />
              }
              label="Set as default language"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            onClick={handleSave} 
            variant="contained" 
            disabled={!formData.code || !formData.name || !formData.native_name}
          >
            {editingLanguage ? 'Update' : 'Add'}
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

export default Languages;