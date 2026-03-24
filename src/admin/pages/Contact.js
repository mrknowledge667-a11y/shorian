// src/admin/pages/Contact.js
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
import { useAdminLanguage } from '../../contexts/AdminLanguageContext';

function Contact() {
  const [contactBlocks, setContactBlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBlock, setEditingBlock] = useState(null);
  const [formData, setFormData] = useState({
    key: '',
    title: '',
    content_lines: [],
    sort_order: 0,
  });
  const [lineInput, setLineInput] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const { adminLanguage } = useAdminLanguage();
  const [translations, setTranslations] = useState({});

  useEffect(() => {
    fetchContactBlocks();
  }, [adminLanguage]);

  const fetchContactBlocks = async () => {
    try {
      const { data, error } = await supabase
        .from('contact_blocks')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('id', { ascending: true });

      if (error) throw error;
      setContactBlocks(data || []);

      // Fetch translations if not English
      if (adminLanguage !== 'en') {
        const { data: transData } = await supabase
          .from('contact_blocks_translations')
          .select('*')
          .eq('language_code', adminLanguage);

        const trans = {};
        if (transData) {
          transData.forEach(t => {
            trans[t.block_id] = t;
          });
        }
        setTranslations(trans);
      }
    } catch (error) {
      console.error('Error fetching contact blocks:', error);
      showSnackbar('Failed to load contact blocks', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (block = null) => {
    if (block) {
      setEditingBlock(block);
      const translation = adminLanguage !== 'en' ? translations[block.id] : null;
      setFormData({
        key: block.key || '',
        title: translation?.title || block.title || '',
        content_lines: translation?.content_lines || block.content_lines || [],
        sort_order: block.sort_order || 0,
      });
    } else {
      setEditingBlock(null);
      setFormData({
        key: '',
        title: '',
        content_lines: [],
        sort_order: contactBlocks.length,
      });
    }
    setLineInput('');
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingBlock(null);
    setFormData({
      key: '',
      title: '',
      content_lines: [],
      sort_order: 0,
    });
    setLineInput('');
  };

  const handleAddLine = () => {
    if (lineInput.trim()) {
      setFormData({
        ...formData,
        content_lines: [...formData.content_lines, lineInput.trim()],
      });
      setLineInput('');
    }
  };

  const handleRemoveLine = (index) => {
    setFormData({
      ...formData,
      content_lines: formData.content_lines.filter((_, i) => i !== index),
    });
  };

  const handleSave = async () => {
    try {
      if (adminLanguage === 'en') {
        // Save base content
        if (editingBlock) {
          const { error } = await supabase
            .from('contact_blocks')
            .update({
              key: formData.key,
              title: formData.title,
              content_lines: formData.content_lines,
              sort_order: formData.sort_order,
            })
            .eq('id', editingBlock.id);

          if (error) throw error;
        } else {
          const { error } = await supabase.from('contact_blocks').insert([formData]);

          if (error) throw error;
        }
      } else {
        // Save translations
        if (editingBlock) {
          const { data: existing } = await supabase
            .from('contact_blocks_translations')
            .select('id')
            .eq('block_id', editingBlock.id)
            .eq('language_code', adminLanguage)
            .single();

          if (existing) {
            await supabase
              .from('contact_blocks_translations')
              .update({
                title: formData.title,
                content_lines: formData.content_lines
              })
              .eq('block_id', editingBlock.id)
              .eq('language_code', adminLanguage);
          } else {
            await supabase
              .from('contact_blocks_translations')
              .insert({
                block_id: editingBlock.id,
                language_code: adminLanguage,
                title: formData.title,
                content_lines: formData.content_lines,
              });
          }
        } else {
          // For new items, create in English first
          showSnackbar('Please create new contact blocks in English first, then add translations', 'info');
          return;
        }
      }

      showSnackbar('Contact block saved successfully');
      handleCloseDialog();
      fetchContactBlocks();
    } catch (error) {
      console.error('Error saving contact block:', error);
      showSnackbar('Failed to save contact block', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this contact block?')) return;

    try {
      const { error } = await supabase.from('contact_blocks').delete().eq('id', id);

      if (error) throw error;
      showSnackbar('Contact block deleted successfully');
      fetchContactBlocks();
    } catch (error) {
      console.error('Error deleting contact block:', error);
      showSnackbar('Failed to delete contact block', 'error');
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const getDisplayValue = (block, field) => {
    if (adminLanguage === 'en') {
      return block[field] || '';
    }
    const translation = translations[block.id];
    if (field === 'content_lines') {
      return translation?.content_lines || block.content_lines || [];
    }
    return translation?.[field] || block[field] || '';
  };

  const getBlockLabel = (key) => {
    const labels = {
      address: 'Address',
      email: 'Email',
      phone: 'Phone',
      hours: 'Working Hours',
    };
    return labels[key] || key;
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h4" component="h1">
            Contact Information Management
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
          Add Contact Block
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell width={50}></TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Title</TableCell>
              <TableCell>Content</TableCell>
              <TableCell>Sort Order</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Skeleton variant="circular" width={24} height={24} />
                  </TableCell>
                  <TableCell>
                    <Skeleton variant="text" width={80} />
                  </TableCell>
                  <TableCell>
                    <Skeleton variant="text" width={150} />
                  </TableCell>
                  <TableCell>
                    <Skeleton variant="text" width={300} />
                  </TableCell>
                  <TableCell>
                    <Skeleton variant="text" width={50} />
                  </TableCell>
                  <TableCell align="right">
                    <Skeleton variant="text" width={100} />
                  </TableCell>
                </TableRow>
              ))
            ) : contactBlocks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No contact blocks found. Add your first contact block!
                </TableCell>
              </TableRow>
            ) : (
              contactBlocks.map((block) => (
                <TableRow key={block.id}>
                  <TableCell>
                    <DragIcon sx={{ color: 'text.secondary' }} />
                  </TableCell>
                  <TableCell>
                    <Chip label={getBlockLabel(block.key)} size="small" color="primary" />
                  </TableCell>
                  <TableCell>{getDisplayValue(block, 'title')}</TableCell>
                  <TableCell sx={{ maxWidth: 400 }}>
                    {getDisplayValue(block, 'content_lines').join(', ') || '-'}
                  </TableCell>
                  <TableCell>{block.sort_order}</TableCell>
                  <TableCell align="right">
                    <IconButton onClick={() => handleOpenDialog(block)} color="primary">
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(block.id)} color="error">
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
        <DialogTitle>{editingBlock ? 'Edit Contact Block' : 'Add New Contact Block'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <TextField
              label="Block Key"
              value={formData.key}
              onChange={(e) => setFormData({ ...formData, key: e.target.value })}
              fullWidth
              required
              helperText="e.g., address, email, phone, hours"
              disabled={adminLanguage !== 'en'}
            />
            <TextField
              label="Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              fullWidth
              required
              helperText={adminLanguage !== 'en' ? 'Leave empty to use English version' : ''}
            />
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Content Lines
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <TextField
                  label="Add Line"
                  value={lineInput}
                  onChange={(e) => setLineInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddLine()}
                  fullWidth
                  size="small"
                  helperText={adminLanguage !== 'en' ? 'Leave empty to use English version' : 'Press Enter or click Add to add a line'}
                />
                <Button onClick={handleAddLine} variant="outlined">
                  Add
                </Button>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {formData.content_lines.map((line, index) => (
                  <Chip
                    key={index}
                    label={line}
                    onDelete={() => handleRemoveLine(index)}
                    sx={{ justifyContent: 'space-between' }}
                  />
                ))}
              </Box>
            </Box>
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
                ? !formData.key || !formData.title
                : !editingBlock // Disable for new items when not in English
            }
          >
            {editingBlock ? 'Update' : 'Add'}
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

export default Contact;