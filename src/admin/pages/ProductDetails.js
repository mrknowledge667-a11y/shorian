import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Alert,
  Snackbar,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  FormControlLabel,
  Switch,
  Tooltip,
  CircularProgress,
  Card,
  CardMedia,
  CardActions,
} from '@mui/material';
import {
  Edit,
  Delete,
  Add,
  Close,
  Save,
  Image as ImageIcon,
  ArrowUpward,
  ArrowDownward,
  PhotoCamera,
} from '@mui/icons-material';
import { supabase } from '../../api/supabaseClient';
import { useAdminLanguage } from '../../contexts/AdminLanguageContext';

const ProductDetails = () => {
  const { currentLanguage } = useAdminLanguage();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    detailed_description: '',
    specifications: [],
    features: [],
  });
  const [productImages, setProductImages] = useState([]);
  const [newSpecKey, setNewSpecKey] = useState('');
  const [newSpecValue, setNewSpecValue] = useState('');
  const [newFeature, setNewFeature] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchProducts();
  }, [currentLanguage]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories (
            id,
            name
          )
        `)
        .order('name');

      if (error) throw error;

      // Fetch translations if needed
      if (currentLanguage !== 'en' && data) {
        const productIds = data.map(p => p.id);
        const { data: translations } = await supabase
          .from('products_translations')
          .select('*')
          .in('product_id', productIds)
          .eq('language_code', currentLanguage);

        if (translations) {
          const translationMap = translations.reduce((acc, trans) => {
            acc[trans.product_id] = trans;
            return acc;
          }, {});

          data.forEach(product => {
            const trans = translationMap[product.id];
            if (trans) {
              product.name = trans.name || product.name;
              product.description = trans.description || product.description;
              product.detailed_description = trans.detailed_description || product.detailed_description;
              product.specifications = trans.specifications || product.specifications;
              product.features = trans.features || product.features;
            }
          });
        }
      }

      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProductImages = async (productId) => {
    try {
      const { data, error } = await supabase
        .from('product_images')
        .select('*')
        .eq('product_id', productId)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      setProductImages(data || []);
    } catch (error) {
      console.error('Error fetching product images:', error);
    }
  };

  const handleEditClick = async (product) => {
    setSelectedProduct(product);
    setFormData({
      detailed_description: product.detailed_description || '',
      specifications: product.specifications || {},
      features: product.features || [],
    });
    await fetchProductImages(product.id);
    setEditDialogOpen(true);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddSpecification = () => {
    if (newSpecKey && newSpecValue) {
      setFormData(prev => ({
        ...prev,
        specifications: {
          ...prev.specifications,
          [newSpecKey]: newSpecValue,
        },
      }));
      setNewSpecKey('');
      setNewSpecValue('');
    }
  };

  const handleRemoveSpecification = (key) => {
    setFormData(prev => {
      const newSpecs = { ...prev.specifications };
      delete newSpecs[key];
      return { ...prev, specifications: newSpecs };
    });
  };

  const handleAddFeature = () => {
    if (newFeature) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, newFeature],
      }));
      setNewFeature('');
    }
  };

  const handleRemoveFeature = (index) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }));
  };

  const handleSaveDetails = async () => {
    if (!selectedProduct) return;

    try {
      // Ensure specifications is a proper object (not empty)
      const specifications = Object.keys(formData.specifications).length > 0
        ? formData.specifications
        : null;
      
      // Ensure features is a proper array
      const features = Array.isArray(formData.features) && formData.features.length > 0
        ? formData.features
        : null;

      const updateData = {
        detailed_description: formData.detailed_description || null,
        specifications: specifications,
        features: features,
      };

      console.log('Saving data:', updateData);

      if (!currentLanguage || currentLanguage === 'en') {
        // Update main product table
        const { data, error } = await supabase
          .from('products')
          .update(updateData)
          .eq('id', selectedProduct.id)
          .select();

        if (error) {
          console.error('Update error:', error);
          throw error;
        }
        console.log('Update successful:', data);
      } else {
        // Update translations table
        const { data: existing, error: fetchError } = await supabase
          .from('products_translations')
          .select('id')
          .eq('product_id', selectedProduct.id)
          .eq('language_code', currentLanguage)
          .maybeSingle();

        if (fetchError) {
          console.error('Fetch error:', fetchError);
          throw fetchError;
        }

        if (existing) {
          const { data, error } = await supabase
            .from('products_translations')
            .update({
              ...updateData,
              updated_at: new Date().toISOString(),
            })
            .eq('id', existing.id)
            .select();

          if (error) {
            console.error('Translation update error:', error);
            throw error;
          }
          console.log('Translation update successful:', data);
        } else {
          const { data, error } = await supabase
            .from('products_translations')
            .insert({
              product_id: selectedProduct.id,
              language_code: currentLanguage,
              name: selectedProduct.name,
              description: selectedProduct.description,
              ...updateData,
            })
            .select();

          if (error) {
            console.error('Translation insert error:', error);
            throw error;
          }
          console.log('Translation insert successful:', data);
        }
      }

      setSuccessMessage('Product details updated successfully');
      setShowSuccess(true);
      setEditDialogOpen(false);
      fetchProducts();
    } catch (error) {
      console.error('Error updating product details:', error);
      alert(`Error saving details: ${error.message || 'Unknown error'}`);
    }
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file || !selectedProduct) return;

    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert('You must be logged in to upload images');
      return;
    }

    // Check file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      return;
    }

    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      alert('Please upload a valid image file (JPEG, PNG, WebP, GIF, or SVG)');
      return;
    }

    setUploadingImage(true);
    try {
      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `product_${selectedProduct.id}_${Date.now()}.${fileExt}`;
      const filePath = `product-images/${fileName}`;

      console.log('Uploading file:', filePath);

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      console.log('Upload successful:', uploadData);

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(filePath);

      console.log('Public URL:', publicUrl);

      // Add to product_images table
      const { data: dbData, error: dbError } = await supabase
        .from('product_images')
        .insert({
          product_id: selectedProduct.id,
          image_url: publicUrl,
          alt_text: selectedProduct.name,
          sort_order: productImages.length,
          is_primary: productImages.length === 0 // Set as primary if it's the first image
        })
        .select();

      if (dbError) {
        console.error('Database error:', dbError);
        throw dbError;
      }

      console.log('Database insert successful:', dbData);

      // Reset the file input
      event.target.value = '';

      await fetchProductImages(selectedProduct.id);
      setSuccessMessage('Image uploaded successfully');
      setShowSuccess(true);
    } catch (error) {
      console.error('Error uploading image:', error);
      alert(`Error uploading image: ${error.message || 'Unknown error'}`);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleDeleteImage = async (imageId) => {
    try {
      const { error } = await supabase
        .from('product_images')
        .delete()
        .eq('id', imageId);

      if (error) throw error;

      await fetchProductImages(selectedProduct.id);
      setSuccessMessage('Image deleted successfully');
      setShowSuccess(true);
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  };

  const handleSetPrimaryImage = async (imageId) => {
    try {
      // Reset all images to non-primary
      await supabase
        .from('product_images')
        .update({ is_primary: false })
        .eq('product_id', selectedProduct.id);

      // Set selected image as primary
      await supabase
        .from('product_images')
        .update({ is_primary: true })
        .eq('id', imageId);

      await fetchProductImages(selectedProduct.id);
      setSuccessMessage('Primary image updated');
      setShowSuccess(true);
    } catch (error) {
      console.error('Error setting primary image:', error);
    }
  };

  const handleImageOrderChange = async (imageId, direction) => {
    const currentIndex = productImages.findIndex(img => img.id === imageId);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= productImages.length) return;

    const newImages = [...productImages];
    const [movedImage] = newImages.splice(currentIndex, 1);
    newImages.splice(newIndex, 0, movedImage);

    // Update sort_order for all images
    try {
      for (let i = 0; i < newImages.length; i++) {
        await supabase
          .from('product_images')
          .update({ sort_order: i })
          .eq('id', newImages[i].id);
      }

      await fetchProductImages(selectedProduct.id);
    } catch (error) {
      console.error('Error updating image order:', error);
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" sx={{ fontWeight: 600, color: '#2c2976' }}>
          Product Details Management
        </Typography>
        <Chip
          label={`Language: ${(currentLanguage || 'en').toUpperCase()}`}
          color="primary"
        />
      </Box>

      <Paper sx={{ borderRadius: '15px', overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell sx={{ fontWeight: 600 }}>Product</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Category</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Details</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Images</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 5 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 5 }}>
                    <Typography color="textSecondary">No products found</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                products.map((product) => (
                  <TableRow key={product.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        {product.image_url && (
                          <Box
                            component="img"
                            src={product.image_url}
                            alt={product.name}
                            sx={{
                              width: 50,
                              height: 50,
                              objectFit: 'cover',
                              borderRadius: '8px',
                            }}
                          />
                        )}
                        <Box>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {product.name}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {product.description}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>{product.categories?.name}</TableCell>
                    <TableCell>
                      <Box>
                        {product.detailed_description && (
                          <Chip label="Has Description" size="small" color="success" sx={{ mr: 1 }} />
                        )}
                        {product.specifications && Object.keys(product.specifications).length > 0 && (
                          <Chip label={`${Object.keys(product.specifications).length} Specs`} size="small" color="info" sx={{ mr: 1 }} />
                        )}
                        {product.features && product.features.length > 0 && (
                          <Chip label={`${product.features.length} Features`} size="small" color="primary" />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        startIcon={<ImageIcon />}
                        onClick={() => {
                          setSelectedProduct(product);
                          fetchProductImages(product.id);
                          setImageDialogOpen(true);
                        }}
                      >
                        Manage Images
                      </Button>
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Edit Details">
                        <IconButton
                          size="small"
                          onClick={() => handleEditClick(product)}
                          sx={{ color: '#3B9FD9' }}
                        >
                          <Edit />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Edit Details Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: '15px' } }}
      >
        <DialogTitle sx={{ 
          borderBottom: '1px solid #e0e0e0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Typography variant="h6">
            Edit Product Details - {selectedProduct?.name}
          </Typography>
          <IconButton size="small" onClick={() => setEditDialogOpen(false)}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ mt: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={6}
                label="Detailed Description"
                value={formData.detailed_description}
                onChange={(e) => handleInputChange('detailed_description', e.target.value)}
                placeholder="Enter a comprehensive product description..."
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 2 }}>Specifications</Typography>
              <Box sx={{ mb: 2 }}>
                {Object.entries(formData.specifications).map(([key, value]) => (
                  <Chip
                    key={key}
                    label={`${key}: ${value}`}
                    onDelete={() => handleRemoveSpecification(key)}
                    sx={{ mr: 1, mb: 1 }}
                  />
                ))}
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={5}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Specification Name"
                    value={newSpecKey}
                    onChange={(e) => setNewSpecKey(e.target.value)}
                    placeholder="e.g., Weight"
                  />
                </Grid>
                <Grid item xs={5}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Value"
                    value={newSpecValue}
                    onChange={(e) => setNewSpecValue(e.target.value)}
                    placeholder="e.g., 2.5 kg"
                  />
                </Grid>
                <Grid item xs={2}>
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={handleAddSpecification}
                    startIcon={<Add />}
                  >
                    Add
                  </Button>
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 2 }}>Features</Typography>
              <List dense>
                {formData.features.map((feature, index) => (
                  <ListItem key={index}>
                    <ListItemText primary={feature} />
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        size="small"
                        onClick={() => handleRemoveFeature(index)}
                      >
                        <Delete />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
              <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Add Feature"
                  value={newFeature}
                  onChange={(e) => setNewFeature(e.target.value)}
                  placeholder="Enter a product feature"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleAddFeature();
                    }
                  }}
                />
                <Button
                  variant="outlined"
                  onClick={handleAddFeature}
                  startIcon={<Add />}
                >
                  Add
                </Button>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3, borderTop: '1px solid #e0e0e0' }}>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSaveDetails}
            startIcon={<Save />}
            sx={{
              background: 'linear-gradient(135deg, #3B9FD9 0%, #2B7EAA 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #2B7EAA 0%, #3B9FD9 100%)',
              },
            }}
          >
            Save Details
          </Button>
        </DialogActions>
      </Dialog>

      {/* Image Management Dialog */}
      <Dialog
        open={imageDialogOpen}
        onClose={() => setImageDialogOpen(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{ sx: { borderRadius: '15px' } }}
      >
        <DialogTitle sx={{ 
          borderBottom: '1px solid #e0e0e0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Typography variant="h6">
            Manage Images - {selectedProduct?.name}
          </Typography>
          <Box>
            <input
              accept="image/*"
              style={{ display: 'none' }}
              id="image-upload"
              type="file"
              onChange={handleImageUpload}
              disabled={uploadingImage}
            />
            <label htmlFor="image-upload">
              <Button
                variant="contained"
                component="span"
                startIcon={uploadingImage ? <CircularProgress size={20} /> : <PhotoCamera />}
                disabled={uploadingImage}
                sx={{ mr: 2 }}
              >
                Upload Image
              </Button>
            </label>
            <IconButton size="small" onClick={() => setImageDialogOpen(false)}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ mt: 3 }}>
          <Grid container spacing={2}>
            {productImages.length === 0 ? (
              <Grid item xs={12}>
                <Typography color="textSecondary" align="center" sx={{ py: 5 }}>
                  No images uploaded yet. Click "Upload Image" to add product images.
                </Typography>
              </Grid>
            ) : (
              productImages.map((image, index) => (
                <Grid item xs={12} sm={6} md={4} key={image.id}>
                  <Card sx={{ position: 'relative' }}>
                    {image.is_primary && (
                      <Chip
                        label="Primary"
                        size="small"
                        color="primary"
                        sx={{
                          position: 'absolute',
                          top: 10,
                          left: 10,
                          zIndex: 1,
                        }}
                      />
                    )}
                    <CardMedia
                      component="img"
                      height="200"
                      image={image.image_url}
                      alt={image.alt_text}
                      sx={{ objectFit: 'cover' }}
                    />
                    <CardActions sx={{ justifyContent: 'space-between' }}>
                      <Box>
                        <IconButton
                          size="small"
                          onClick={() => handleImageOrderChange(image.id, 'up')}
                          disabled={index === 0}
                        >
                          <ArrowUpward />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleImageOrderChange(image.id, 'down')}
                          disabled={index === productImages.length - 1}
                        >
                          <ArrowDownward />
                        </IconButton>
                      </Box>
                      <Box>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={image.is_primary}
                              onChange={() => handleSetPrimaryImage(image.id)}
                              size="small"
                            />
                          }
                          label="Primary"
                        />
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteImage(image.id)}
                          color="error"
                        >
                          <Delete />
                        </IconButton>
                      </Box>
                    </CardActions>
                  </Card>
                </Grid>
              ))
            )}
          </Grid>
        </DialogContent>
      </Dialog>

      {/* Success Snackbar */}
      <Snackbar
        open={showSuccess}
        autoHideDuration={6000}
        onClose={() => setShowSuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setShowSuccess(false)}
          severity="success"
          sx={{ width: '100%' }}
        >
          {successMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ProductDetails;