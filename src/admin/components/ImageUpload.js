// src/admin/components/ImageUpload.js
import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  CircularProgress,
  Alert,
  IconButton,
  InputAdornment,
  Tabs,
  Tab,
  Paper,
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  Link as LinkIcon,
  Clear as ClearIcon,
  Image as ImageIcon,
} from '@mui/icons-material';
import { supabase } from '../../api/supabaseClient';

function TabPanel({ children, value, index }) {
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
}

function ImageUpload({ 
  value, 
  onChange, 
  label = 'Image', 
  helperText,
  required = false,
  disabled = false,
  folder = 'general' // Folder within the bucket to organize images
}) {
  const [tabValue, setTabValue] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [urlInput, setUrlInput] = useState(value || '');
  const [previewUrl, setPreviewUrl] = useState(value || '');

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setUploadError('');
  };

  const handleUrlChange = (e) => {
    const newUrl = e.target.value;
    setUrlInput(newUrl);
    setPreviewUrl(newUrl);
    onChange(newUrl);
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
      setUploadError('Please upload a valid image file (JPEG, PNG, WebP, GIF, or SVG)');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('File size must be less than 5MB');
      return;
    }

    setUploading(true);
    setUploadError('');

    try {
      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

      // Upload to Supabase storage
      const { data, error } = await supabase.storage
        .from('assets')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('assets')
        .getPublicUrl(data.path);

      // Update the value
      setPreviewUrl(publicUrl);
      setUrlInput(publicUrl);
      onChange(publicUrl);
      
      // Switch to URL tab to show the uploaded image URL
      setTabValue(0);
    } catch (error) {
      console.error('Upload error:', error);
      setUploadError(error.message || 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleClear = () => {
    setUrlInput('');
    setPreviewUrl('');
    onChange('');
  };

  return (
    <Box>
      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        {label} {required && <span style={{ color: 'error.main' }}>*</span>}
      </Typography>
      
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 2 }}>
          <Tab icon={<LinkIcon />} label="URL" />
          <Tab icon={<CloudUploadIcon />} label="Upload" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <TextField
            fullWidth
            value={urlInput}
            onChange={handleUrlChange}
            placeholder="Enter image URL"
            disabled={disabled}
            helperText={helperText || "Direct URL to the image"}
            InputProps={{
              endAdornment: urlInput && (
                <InputAdornment position="end">
                  <IconButton onClick={handleClear} edge="end" disabled={disabled}>
                    <ClearIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Box sx={{ textAlign: 'center' }}>
            <input
              accept="image/*"
              style={{ display: 'none' }}
              id={`image-upload-${label}`}
              type="file"
              onChange={handleFileUpload}
              disabled={disabled || uploading}
            />
            <label htmlFor={`image-upload-${label}`}>
              <Button
                variant="outlined"
                component="span"
                disabled={disabled || uploading}
                startIcon={uploading ? <CircularProgress size={20} /> : <CloudUploadIcon />}
                fullWidth
              >
                {uploading ? 'Uploading...' : 'Choose Image'}
              </Button>
            </label>
            
            {uploadError && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {uploadError}
              </Alert>
            )}
            
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              Supported formats: JPEG, PNG, WebP, GIF, SVG (max 5MB)
            </Typography>
          </Box>
        </TabPanel>

        {/* Image Preview */}
        {previewUrl && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
              Preview:
            </Typography>
            <Box
              sx={{
                width: '100%',
                height: 200,
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'grey.50',
              }}
            >
              <img
                src={previewUrl}
                alt="Preview"
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain',
                }}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <Box
                sx={{
                  display: 'none',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 1,
                  color: 'text.secondary',
                }}
              >
                <ImageIcon sx={{ fontSize: 48 }} />
                <Typography variant="caption">Failed to load image</Typography>
              </Box>
            </Box>
          </Box>
        )}
      </Paper>
    </Box>
  );
}

export default ImageUpload;