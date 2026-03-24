// src/admin/pages/Collapsible.js
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
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  DragIndicator as DragIcon,
} from '@mui/icons-material';
import { supabase } from '../../api/supabaseClient';

function Collapsible() {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    items: [],
    sort_order: 0,
  });
  const [itemInput, setItemInput] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    fetchSections();
  }, []);

  const fetchSections = async () => {
    try {
      const { data, error } = await supabase
        .from('collapsible_sections')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('id', { ascending: true });

      if (error) throw error;
      setSections(data || []);
    } catch (error) {
      console.error('Error fetching sections:', error);
      showSnackbar('Failed to load sections', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (section = null) => {
    if (section) {
      setEditingSection(section);
      setFormData({
        title: section.title || '',
        items: section.items || [],
        sort_order: section.sort_order || 0,
      });
    } else {
      setEditingSection(null);
      setFormData({
        title: '',
        items: [],
        sort_order: sections.length,
      });
    }
    setItemInput('');
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingSection(null);
    setFormData({
      title: '',
      items: [],
      sort_order: 0,
    });
    setItemInput('');
  };

  const handleAddItem = () => {
    if (itemInput.trim()) {
      setFormData({
        ...formData,
        items: [...formData.items, itemInput.trim()],
      });
      setItemInput('');
    }
  };

  const handleRemoveItem = (index) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index),
    });
  };

  const handleSave = async () => {
    try {
      if (editingSection) {
        const { error } = await supabase
          .from('collapsible_sections')
          .update(formData)
          .eq('id', editingSection.id);

        if (error) throw error;
        showSnackbar('Section updated successfully');
      } else {
        const { error } = await supabase.from('collapsible_sections').insert([formData]);

        if (error) throw error;
        showSnackbar('Section added successfully');
      }

      handleCloseDialog();
      fetchSections();
    } catch (error) {
      console.error('Error saving section:', error);
      showSnackbar('Failed to save section', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this section?')) return;

    try {
      const { error } = await supabase.from('collapsible_sections').delete().eq('id', id);

      if (error) throw error;
      showSnackbar('Section deleted successfully');
      fetchSections();
    } catch (error) {
      console.error('Error deleting section:', error);
      showSnackbar('Failed to delete section', 'error');
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
        <Typography variant="h4" component="h1">
          Collapsible Sections Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Section
        </Button>
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Manage the accordion/collapsible sections displayed on the landing page.
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell width={50}></TableCell>
              <TableCell>Title</TableCell>
              <TableCell>Items</TableCell>
              <TableCell>Sort Order</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Skeleton variant="circular" width={24} height={24} />
                  </TableCell>
                  <TableCell>
                    <Skeleton variant="text" width={200} />
                  </TableCell>
                  <TableCell>
                    <Skeleton variant="text" width={100} />
                  </TableCell>
                  <TableCell>
                    <Skeleton variant="text" width={50} />
                  </TableCell>
                  <TableCell align="right">
                    <Skeleton variant="text" width={100} />
                  </TableCell>
                </TableRow>
              ))
            ) : sections.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No sections found. Add your first collapsible section!
                </TableCell>
              </TableRow>
            ) : (
              sections.map((section) => (
                <TableRow key={section.id}>
                  <TableCell>
                    <DragIcon sx={{ color: 'text.secondary' }} />
                  </TableCell>
                  <TableCell>{section.title}</TableCell>
                  <TableCell>
                    <Chip label={`${section.items?.length || 0} items`} size="small" />
                  </TableCell>
                  <TableCell>{section.sort_order}</TableCell>
                  <TableCell align="right">
                    <IconButton onClick={() => handleOpenDialog(section)} color="primary">
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(section.id)} color="error">
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
        <DialogTitle>{editingSection ? 'Edit Section' : 'Add New Section'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <TextField
              label="Section Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              fullWidth
              required
              helperText="The title that users will click to expand/collapse"
            />
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Section Items
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <TextField
                  label="Add Item"
                  value={itemInput}
                  onChange={(e) => setItemInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddItem()}
                  fullWidth
                  size="small"
                  helperText="Press Enter or click Add to add an item"
                />
                <Button onClick={handleAddItem} variant="outlined">
                  Add
                </Button>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {formData.items.map((item, index) => (
                  <Chip
                    key={index}
                    label={item}
                    onDelete={() => handleRemoveItem(index)}
                    sx={{ justifyContent: 'space-between' }}
                  />
                ))}
                {formData.items.length === 0 && (
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                    No items added yet
                  </Typography>
                )}
              </Box>
            </Box>
            <TextField
              label="Sort Order"
              type="number"
              value={formData.sort_order}
              onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
              fullWidth
              helperText="Lower numbers appear first"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            onClick={handleSave} 
            variant="contained" 
            disabled={!formData.title || formData.items.length === 0}
          >
            {editingSection ? 'Update' : 'Add'}
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

export default Collapsible;