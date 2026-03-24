// src/admin/pages/Services.js
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
  Build as BuildIcon,
  LocalShipping as LocalShippingIcon,
  Verified as VerifiedIcon,
  SupportAgent as SupportAgentIcon,
} from '@mui/icons-material';
import { supabase } from '../../api/supabaseClient';
import { useAdminLanguage } from '../../contexts/AdminLanguageContext';

const iconOptions = [
  { key: 'build', label: 'Build', icon: <BuildIcon /> },
  { key: 'local_shipping', label: 'Local Shipping', icon: <LocalShippingIcon /> },
  { key: 'verified', label: 'Verified', icon: <VerifiedIcon /> },
  { key: 'support_agent', label: 'Support Agent', icon: <SupportAgentIcon /> },
];

const gradientOptions = [
  { value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', label: 'Purple' },
  { value: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', label: 'Pink' },
  { value: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', label: 'Blue' },
  { value: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', label: 'Orange' },
];

function Services() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    features: [],
    icon_key: 'build',
    gradient: gradientOptions[0].value,
    sort_order: 0,
  });
  const [featureInput, setFeatureInput] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const { adminLanguage } = useAdminLanguage();
  const [translations, setTranslations] = useState({});

  useEffect(() => {
    fetchServices();
  }, [adminLanguage]);

  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('id', { ascending: true });

      if (error) throw error;
      setServices(data || []);

      // Fetch translations if not English
      if (adminLanguage !== 'en') {
        const { data: transData } = await supabase
          .from('services_translations')
          .select('*')
          .eq('language_code', adminLanguage);

        const trans = {};
        if (transData) {
          transData.forEach(t => {
            trans[t.service_id] = t;
          });
        }
        setTranslations(trans);
      }
    } catch (error) {
      console.error('Error fetching services:', error);
      showSnackbar('Failed to load services', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (service = null) => {
    if (service) {
      setEditingService(service);
      const translation = adminLanguage !== 'en' ? translations[service.id] : null;
      setFormData({
        title: translation?.title || service.title || '',
        description: translation?.description || service.description || '',
        features: service.features || [],
        icon_key: service.icon_key || 'build',
        gradient: service.gradient || gradientOptions[0].value,
        sort_order: service.sort_order || 0,
      });
    } else {
      setEditingService(null);
      setFormData({
        title: '',
        description: '',
        features: [],
        icon_key: 'build',
        gradient: gradientOptions[0].value,
        sort_order: services.length,
      });
    }
    setFeatureInput('');
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingService(null);
    setFormData({
      title: '',
      description: '',
      features: [],
      icon_key: 'build',
      gradient: gradientOptions[0].value,
      sort_order: 0,
    });
    setFeatureInput('');
  };

  const handleAddFeature = () => {
    if (featureInput.trim()) {
      setFormData({
        ...formData,
        features: [...formData.features, featureInput.trim()],
      });
      setFeatureInput('');
    }
  };

  const handleRemoveFeature = (index) => {
    setFormData({
      ...formData,
      features: formData.features.filter((_, i) => i !== index),
    });
  };

  const handleSave = async () => {
    try {
      if (adminLanguage === 'en') {
        // Save base content
        if (editingService) {
          const { error } = await supabase
            .from('services')
            .update(formData)
            .eq('id', editingService.id);

          if (error) throw error;
        } else {
          const { error } = await supabase.from('services').insert([formData]);

          if (error) throw error;
        }
      } else {
        // Save translations
        if (editingService) {
          const { data: existing } = await supabase
            .from('services_translations')
            .select('id')
            .eq('service_id', editingService.id)
            .eq('language_code', adminLanguage)
            .single();

          if (existing) {
            await supabase
              .from('services_translations')
              .update({
                title: formData.title,
                description: formData.description
              })
              .eq('service_id', editingService.id)
              .eq('language_code', adminLanguage);
          } else {
            await supabase
              .from('services_translations')
              .insert({
                service_id: editingService.id,
                language_code: adminLanguage,
                title: formData.title,
                description: formData.description,
              });
          }
        } else {
          // For new items, create in English first
          showSnackbar('Please create new services in English first, then add translations', 'info');
          return;
        }
      }

      showSnackbar('Service saved successfully');
      handleCloseDialog();
      fetchServices();
    } catch (error) {
      console.error('Error saving service:', error);
      showSnackbar('Failed to save service', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this service?')) return;

    try {
      const { error } = await supabase.from('services').delete().eq('id', id);

      if (error) throw error;
      showSnackbar('Service deleted successfully');
      fetchServices();
    } catch (error) {
      console.error('Error deleting service:', error);
      showSnackbar('Failed to delete service', 'error');
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const getIconComponent = (iconKey) => {
    const option = iconOptions.find((opt) => opt.key === iconKey);
    return option ? option.icon : <BuildIcon />;
  };

  const getDisplayValue = (service, field) => {
    if (adminLanguage === 'en') {
      return service[field] || '';
    }
    const translation = translations[service.id];
    return translation?.[field] || service[field] || '';
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h4" component="h1">
            Services Management
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
          Add Service
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell width={50}></TableCell>
              <TableCell>Icon</TableCell>
              <TableCell>Title</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Features</TableCell>
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
                    <Skeleton variant="circular" width={40} height={40} />
                  </TableCell>
                  <TableCell>
                    <Skeleton variant="text" width={150} />
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
            ) : services.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No services found. Add your first service!
                </TableCell>
              </TableRow>
            ) : (
              services.map((service) => (
                <TableRow key={service.id}>
                  <TableCell>
                    <DragIcon sx={{ color: 'text.secondary' }} />
                  </TableCell>
                  <TableCell>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '8px',
                        background: service.gradient,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                      }}
                    >
                      {getIconComponent(service.icon_key)}
                    </Box>
                  </TableCell>
                  <TableCell>{getDisplayValue(service, 'title')}</TableCell>
                  <TableCell sx={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {getDisplayValue(service, 'description')}
                  </TableCell>
                  <TableCell>
                    <Chip label={`${service.features?.length || 0} features`} size="small" />
                  </TableCell>
                  <TableCell>{service.sort_order}</TableCell>
                  <TableCell align="right">
                    <IconButton onClick={() => handleOpenDialog(service)} color="primary">
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(service.id)} color="error">
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
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>{editingService ? 'Edit Service' : 'Add New Service'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <TextField
              label="Service Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              fullWidth
              required
              helperText={adminLanguage !== 'en' ? 'Leave empty to use English version' : ''}
            />
            <TextField
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              fullWidth
              multiline
              rows={3}
              required
              helperText={adminLanguage !== 'en' ? 'Leave empty to use English version' : ''}
            />
            {adminLanguage === 'en' && (
              <>
                <FormControl fullWidth>
                  <InputLabel>Icon</InputLabel>
                  <Select
                    value={formData.icon_key}
                    onChange={(e) => setFormData({ ...formData, icon_key: e.target.value })}
                    label="Icon"
                  >
                    {iconOptions.map((option) => (
                      <MenuItem key={option.key} value={option.key}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {option.icon}
                          <span>{option.label}</span>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl fullWidth>
                  <InputLabel>Gradient Color</InputLabel>
                  <Select
                    value={formData.gradient}
                    onChange={(e) => setFormData({ ...formData, gradient: e.target.value })}
                    label="Gradient Color"
                  >
                    {gradientOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box
                            sx={{
                              width: 24,
                              height: 24,
                              borderRadius: '4px',
                              background: option.value,
                            }}
                          />
                          <span>{option.label}</span>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Features
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <TextField
                      label="Add Feature"
                      value={featureInput}
                      onChange={(e) => setFeatureInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddFeature()}
                      fullWidth
                      size="small"
                    />
                    <Button onClick={handleAddFeature} variant="outlined">
                      Add
                    </Button>
                  </Box>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {formData.features.map((feature, index) => (
                      <Chip
                        key={index}
                        label={feature}
                        onDelete={() => handleRemoveFeature(index)}
                      />
                    ))}
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
                ? !formData.title || !formData.description
                : !editingService // Disable for new items when not in English
            }
          >
            {editingService ? 'Update' : 'Add'}
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

export default Services;