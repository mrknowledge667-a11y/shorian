// src/pages/ProductDetails.js
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  TextField,
  Grid,
  Paper,
  Chip,
  IconButton,
  Fade,
  CircularProgress,
  Alert,
  Snackbar,
  Dialog,
  DialogContent,
  useTheme,
  useMediaQuery,
  InputAdornment,
} from '@mui/material';
import {
  ArrowBack,
  Email,
  Person,
  Business,
  Phone,
  Message,
  CheckCircle,
  ZoomIn,
  NavigateBefore,
  NavigateNext,
  Close as CloseIcon,
} from '@mui/icons-material';
import Footer from '../components/Footer';
import { supabase } from '../api/supabaseClient';
import { useLanguage } from '../contexts/LanguageContext';
import { useTranslation } from '../hooks/useTranslation';

const PRIMARY = '#3B9FD9';
const PRIMARY_DARK = '#2B7EAA';
const HEADING = '#2c2976';
const TEXT = '#525252';
const MUTED = '#8a8a8a';

const ProductDetails = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { currentLanguage } = useLanguage();
  const { t } = useTranslation();

  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState(null);
  const [productImages, setProductImages] = useState([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company_name: '',
    phone_number: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState({});
  const [imageModalOpen, setImageModalOpen] = useState(false);

  useEffect(() => {
    fetchProductDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId, currentLanguage]);

  const fetchProductDetails = async () => {
    try {
      // Fetch product with category
      const { data: productData, error: productError } = await supabase
        .from('products')
        .select(
          `
          *,
          categories (
            id,
            name,
            slug
          )
        `
        )
        .eq('id', productId)
        .single();

      if (productError) throw productError;

      // Merge translations if needed
      if (currentLanguage !== 'en') {
        const { data: translation } = await supabase
          .from('products_translations')
          .select('*')
          .eq('product_id', productId)
          .eq('language_code', currentLanguage)
          .single();

        if (translation) {
          productData.name = translation.name || productData.name;
          productData.description = translation.description || productData.description;
          productData.detailed_description = translation.detailed_description || productData.detailed_description;
          productData.specifications = translation.specifications || productData.specifications;
          productData.features = translation.features || productData.features;
          productData.brand = translation.brand || productData.brand;
          productData.price_display = translation.price_display || productData.price_display;
        }
      }

      // Fetch product images (fallback to main product image)
      const { data: imagesData } = await supabase
        .from('product_images')
        .select('*')
        .eq('product_id', parseInt(productId, 10))
        .order('sort_order', { ascending: true });

      const images =
        imagesData && imagesData.length > 0
          ? imagesData
          : [{ id: 0, image_url: productData.image_url, alt_text: productData.name, is_primary: true }];

      setProduct(productData);
      setProductImages(images);
    } catch (error) {
      // Non-blocking: keep page stable with empty state handling
      // eslint-disable-next-line no-console
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = t('validation.name_required', 'Name is required');
    if (!formData.email) newErrors.email = t('validation.email_required', 'Email is required');
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = t('validation.email_invalid', 'Email is invalid');
    if (!formData.phone_number)
      newErrors.phone_number = t('validation.phone_required', 'Phone number is required');

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const { error } = await supabase.from('orders').insert([
        {
          product_id: productId,
          ...formData,
        },
      ]);

      if (error) throw error;

      setShowSuccess(true);
      setFormData({
        name: '',
        email: '',
        company_name: '',
        phone_number: '',
        message: '',
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error submitting order:', error);
      setErrors({
        submit: t('error.submit_failed', 'Failed to submit order. Please try again.'),
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleImageChange = (direction) => {
    if (!productImages.length) return;
    if (direction === 'next') {
      setSelectedImageIndex((prev) => (prev + 1) % productImages.length);
    } else {
      setSelectedImageIndex((prev) => (prev - 1 + productImages.length) % productImages.length);
    }
  };

  const currentImage = useMemo(
    () => productImages[selectedImageIndex] || productImages[0],
    [productImages, selectedImageIndex]
  );

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #f6f8fb 0%, #e9eef5 100%)',
          p: 4,
        }}
      >
        <CircularProgress size={60} sx={{ color: PRIMARY }} />
      </Box>
    );
  }

  if (!product) {
    return (
      <Box
        sx={{
          minHeight: '60vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 4,
        }}
      >
        <Typography variant="h5" color="text.secondary">
          {t('product.not_found', 'Product not found')}
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(160deg, #f6f8fb 0%, #eef2f7 100%)',
        pb: 0, display: 'flex', flexDirection: 'column',
      }}
    >
      <Container maxWidth="lg" sx={{ pt: { xs: 2, md: 4 } }}>
        {/* Back Button */}
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate(-1)}
          aria-label={t('common.back', 'Back')}
          sx={{
            mb: { xs: 2, md: 3 },
            borderRadius: 999,
            px: 2.25,
            py: 0.75,
            alignSelf: 'flex-start',
            color: PRIMARY_DARK,
            backgroundColor: 'rgba(59,159,217,0.08)',
            border: '1px solid rgba(59,159,217,0.18)',
            '&:hover': {
              backgroundColor: 'rgba(59,159,217,0.14)',
              borderColor: 'rgba(59,159,217,0.28)',
            },
            transition: 'all .2s ease',
          }}
        >
          {t('common.back', 'Back')}
        </Button>

        <Grid container spacing={{ xs: 3, md: 4 }}>
          {/* Image Gallery Section (first on mobile) */}
          <Grid item xs={12} md={6} order={{ xs: 1, md: 2 }}>
            <Fade in timeout={500}>
              <Paper
                elevation={0}
                sx={{
                  borderRadius: 3,
                  overflow: 'hidden',
                  background: '#fff',
                  boxShadow: '0 10px 40px rgba(0,0,0,.06)',
                  position: { xs: 'relative', md: 'sticky' },
                  top: { md: 20 },
                }}
              >
                {/* Main Image with responsive aspect ratio */}
                <Box
                  sx={{
                    position: 'relative',
                    width: '100%',
                    aspectRatio: { xs: '4 / 3', sm: '16 / 10', md: '1 / 1' },
                    minHeight: 260,
                    background:
                      'linear-gradient(135deg, rgba(245,247,250,0.8) 0%, rgba(216,225,238,0.6) 100%)',
                    cursor: 'zoom-in',
                  }}
                  onClick={() => setImageModalOpen(true)}
                >
                  {currentImage ? (
                    <img
                      src={currentImage.image_url}
                      alt={currentImage.alt_text || product.name}
                      loading="lazy"
                      decoding="async"
                      onError={(e) => {
                        e.currentTarget.src = product.image_url || '/placeholder-image.png';
                      }}
                      style={{
                        position: 'absolute',
                        inset: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        padding: 16,
                      }}
                    />
                  ) : (
                    <Box
                      sx={{
                        position: 'absolute',
                        inset: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Typography color="text.secondary">
                        {t('product.no_image', 'No image available')}
                      </Typography>
                    </Box>
                  )}

                  {/* Navigation Arrows */}
                  {productImages.length > 1 && (
                    <>
                      <IconButton
                        aria-label={t('product.prev_image', 'Previous image')}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleImageChange('prev');
                        }}
                        sx={{
                          position: 'absolute',
                          left: 8,
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'rgba(255,255,255,0.9)',
                          '&:hover': { background: '#fff' },
                          boxShadow: '0 2px 12px rgba(0,0,0,.12)',
                        }}
                      >
                        <NavigateBefore />
                      </IconButton>
                      <IconButton
                        aria-label={t('product.next_image', 'Next image')}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleImageChange('next');
                        }}
                        sx={{
                          position: 'absolute',
                          right: 8,
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'rgba(255,255,255,0.9)',
                          '&:hover': { background: '#fff' },
                          boxShadow: '0 2px 12px rgba(0,0,0,.12)',
                        }}
                      >
                        <NavigateNext />
                      </IconButton>
                    </>
                  )}

                  {/* Zoom Indicator */}
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: 12,
                      right: 12,
                      background: 'rgba(0,0,0,0.65)',
                      borderRadius: '50%',
                      p: 1,
                      display: 'flex',
                    }}
                  >
                    <ZoomIn sx={{ color: '#fff' }} />
                  </Box>
                </Box>

                {/* Thumbnail strip */}
                {productImages.length > 1 && (
                  <Box
                    sx={{
                      p: 1.5,
                      display: 'flex',
                      gap: 1,
                      overflowX: 'auto',
                      overflowY: 'hidden',
                      WebkitOverflowScrolling: 'touch',
                      scrollbarWidth: 'none',
                      msOverflowStyle: 'none',
                      '&::-webkit-scrollbar': { display: 'none' },

                      alignItems: 'center',
                      height: { xs: 80, sm: 90 },
                      borderTop: '1px solid rgba(59,159,217,0.10)',
                      
                    }}
                  >
                    {productImages.map((img, index) => (
                      <Box
                        key={`${img.id}-${index}`}
                        onClick={() => setSelectedImageIndex(index)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') setSelectedImageIndex(index);
                        }}
                        aria-label={t('product.view_image', 'View image')}
                        sx={{
                          width: { xs: 66, sm: 78 },
                          height: { xs: 66, sm: 78 },
                          borderRadius: 1.5,
                          overflow: 'hidden',
                          cursor: 'pointer',
                          border:
                            selectedImageIndex === index
                              ? `3px solid ${PRIMARY}`
                              : '3px solid transparent',
                          transition: 'all .2s ease',
                          flexShrink: 0,
                          backgroundColor: '#f3f6fa',
                          '&:hover': {
                            border: `3px solid ${PRIMARY}`,
                            transform: 'scale(1.03)',
                          },
                          outline: 'none',
                          '&:focus-visible': {
                            boxShadow: `0 0 0 3px rgba(59,159,217,0.35)`,
                          },
                        }}
                      >
                        <img
                          src={img.image_url}
                          alt={img.alt_text || product.name}
                          loading="lazy"
                          decoding="async"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                          }}
                        />
                      </Box>
                    ))}
                  </Box>
                )}
              </Paper>
            </Fade>
          </Grid>

          {/* Product Details Section (second on mobile) */}
          <Grid item xs={12} md={6} order={{ xs: 2, md: 1 }}>
            <Fade in timeout={650}>
              <Box>
                {/* Category + Title */}
                <Box sx={{ mb: 2.5 }}>
                  <Chip
                    label={product.categories?.name || t('product.default_category', 'Product')}
                    sx={{
                      mb: 1.5,
                      background: `linear-gradient(135deg, ${PRIMARY} 0%, ${PRIMARY_DARK} 100%)`,
                      color: 'white',
                      fontWeight: 600,
                      px: 1.5,
                      height: 30,
                    }}
                  />
                  <Typography
                    component="h1"
                    sx={{
                      fontWeight: 800,
                      color: HEADING,
                      mb: 1,
                      lineHeight: 1.15,
                      fontSize: 'clamp(1.6rem, 1.2rem + 1.8vw, 2.4rem)',
                      letterSpacing: '-0.015em',
                    }}
                  >
                    {product.name}
                  </Typography>

                  {product.brand && (
                    <Typography
                      variant="body2"
                      sx={{ color: 'text.secondary', mb: 1 }}
                    >
                      {product.brand}
                    </Typography>
                  )}

                  {product.condition && (
                    <Chip
                      label={
                        product.condition === 'Refurbished'
                          ? t('label.refurbished', 'Refurbished')
                          : product.condition === 'Used'
                          ? t('label.used', 'Used')
                          : product.condition
                      }
                      size="small"
                      sx={{
                        mb: 1.5,
                        backgroundColor: product.condition === 'Refurbished' ? 'primary.light' : 'grey.300',
                        color: product.condition === 'Refurbished' ? 'white' : 'text.primary',
                        fontWeight: 600,
                      }}
                    />
                  )}

                  {product.price_display && (
                    <Typography
                      variant="h5"
                      component="p"
                      sx={{
                        color: 'primary.main',
                        fontWeight: 800,
                        fontSize: { xs: '1.6rem', md: '2rem' },
                        mb: 2,
                      }}
                    >
                      {product.price_display}
                    </Typography>
                  )}

                  {product.description && (
                    <Typography
                      variant="h6"
                      sx={{
                        color: TEXT,
                        opacity: 0.9,
                        mb: 2.5,
                        lineHeight: 1.6,
                        fontSize: 'clamp(.95rem, .8rem + .4vw, 1.125rem)',
                      }}
                    >
                      {product.description}
                    </Typography>
                  )}
                </Box>

                {/* Detailed Description */}
                {product.detailed_description && (
                  <Paper
                    elevation={0}
                    sx={{
                      p: { xs: 2, md: 3 },
                      mb: 2.5,
                      borderRadius: 2,
                      background: 'rgba(255,255,255,0.95)',
                      border: '1px solid rgba(59, 159, 217, 0.12)',
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{ mb: 1.5, color: HEADING, fontWeight: 700, fontSize: '1.1rem' }}
                    >
                      {t('product.description', 'Description')}
                    </Typography>
                    <Typography sx={{ color: TEXT, lineHeight: 1.8, whiteSpace: 'pre-line' }}>
                      {product.detailed_description}
                    </Typography>
                  </Paper>
                )}

                {/* Features */}
                {Array.isArray(product.features) && product.features.length > 0 && (
                  <Paper
                    elevation={0}
                    sx={{
                      p: { xs: 2, md: 3 },
                      mb: 2.5,
                      borderRadius: 2,
                      background: 'rgba(255,255,255,0.95)',
                      border: '1px solid rgba(59, 159, 217, 0.12)',
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{ mb: 1.5, color: HEADING, fontWeight: 700, fontSize: '1.1rem' }}
                    >
                      {t('product.features', 'Features')}
                    </Typography>
                    <Box component="ul" sx={{ pl: 3, mb: 0 }}>
                      {product.features.map((feature, index) => (
                        <Typography
                          key={`${index}-${feature}`}
                          component="li"
                          sx={{
                            color: TEXT,
                            mb: 0.75,
                            '&::marker': {
                              color: PRIMARY,
                            },
                          }}
                        >
                          {feature}
                        </Typography>
                      ))}
                    </Box>
                  </Paper>
                )}

                {/* Specifications */}
                {product.specifications && Object.keys(product.specifications).length > 0 && (
                  <Paper
                    elevation={0}
                    sx={{
                      p: { xs: 2, md: 3 },
                      mb: 2.5,
                      borderRadius: 2,
                      background: 'rgba(255,255,255,0.95)',
                      border: '1px solid rgba(59, 159, 217, 0.12)',
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{ mb: 1.5, color: HEADING, fontWeight: 700, fontSize: '1.1rem' }}
                    >
                      {t('product.specifications', 'Specifications')}
                    </Typography>
                    <Grid container spacing={1.5}>
                      {Object.entries(product.specifications).map(([key, value]) => (
                        <Grid item xs={12} sm={6} key={key}>
                          <Typography sx={{ color: MUTED, fontSize: '.9rem', mb: 0.25 }}>
                            {key}
                          </Typography>
                          <Typography sx={{ color: TEXT, fontWeight: 600 }}>{value}</Typography>
                        </Grid>
                      ))}
                    </Grid>
                  </Paper>
                )}
              </Box>
            </Fade>
          </Grid>
        </Grid>

        {/* Order Form Section */}
        <Fade in timeout={800}>
          <Paper
            elevation={0}
            sx={{
              mt: { xs: 4, md: 6 },
              mb: { xs: 4, md: 6 },
              p: { xs: 2.5, md: 4 },
              borderRadius: 3,
              background: '#fff',
              boxShadow: '0 10px 40px rgba(0,0,0,.06)',
            }}
          >
            <Typography
              variant="h4"
              component="h2"
              sx={{
                mb: 3.5,
                textAlign: 'center',
                fontWeight: 800,
                color: HEADING,
                lineHeight: 1.15,
                letterSpacing: '-0.01em',
                fontSize: 'clamp(1.25rem, 1rem + 1.2vw, 2rem)',
                background: `linear-gradient(135deg, ${HEADING} 0%, ${PRIMARY} 100%)`,
                backgroundClip: 'text',
                textFillColor: 'transparent',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {t('product.request_quote', 'Request a Quote')}
            </Typography>

            <form onSubmit={handleSubmit} noValidate>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    required
                    name="name"
                    autoComplete="name"
                    inputProps={{ 'aria-label': t('form.name', 'Your Name') }}
                    label={t('form.name', 'Your Name')}
                    value={formData.name}
                    onChange={handleInputChange}
                    error={!!errors.name}
                    helperText={errors.name}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Person sx={{ color: PRIMARY }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        '&:hover fieldset': { borderColor: PRIMARY },
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    required
                    name="email"
                    type="email"
                    autoComplete="email"
                    inputProps={{ inputMode: 'email', 'aria-label': t('form.email', 'Email Address') }}
                    label={t('form.email', 'Email Address')}
                    value={formData.email}
                    onChange={handleInputChange}
                    error={!!errors.email}
                    helperText={errors.email}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Email sx={{ color: PRIMARY }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        '&:hover fieldset': { borderColor: PRIMARY },
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    name="company_name"
                    autoComplete="organization"
                    inputProps={{ 'aria-label': t('form.company', 'Company Name') }}
                    label={t('form.company', 'Company Name')}
                    value={formData.company_name}
                    onChange={handleInputChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Business sx={{ color: PRIMARY }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        '&:hover fieldset': { borderColor: PRIMARY },
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    required
                    name="phone_number"
                    autoComplete="tel"
                    inputProps={{
                      inputMode: 'tel',
                      'aria-label': t('form.phone', 'Phone Number'),
                    }}
                    label={t('form.phone', 'Phone Number')}
                    value={formData.phone_number}
                    onChange={handleInputChange}
                    error={!!errors.phone_number}
                    helperText={errors.phone_number}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Phone sx={{ color: PRIMARY }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        '&:hover fieldset': { borderColor: PRIMARY },
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    name="message"
                    autoComplete="off"
                    inputProps={{
                      'aria-label': t('form.message', 'Message (Optional)'),
                    }}
                    label={t('form.message', 'Message (Optional)')}
                    value={formData.message}
                    onChange={handleInputChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1 }}>
                          <Message sx={{ color: PRIMARY }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        '&:hover fieldset': { borderColor: PRIMARY },
                      },
                    }}
                  />
                </Grid>

                {errors.submit && (
                  <Grid item xs={12}>
                    <Alert severity="error" sx={{ borderRadius: 2 }}>
                      {errors.submit}
                    </Alert>
                  </Grid>
                )}

                <Grid item xs={12}>
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    fullWidth
                    disabled={submitting}
                    sx={{
                      py: 1.5,
                      borderRadius: 2,
                      background: `linear-gradient(135deg, ${PRIMARY} 0%, ${PRIMARY_DARK} 100%)`,
                      fontSize: '1.05rem',
                      fontWeight: 700,
                      letterSpacing: '.01em',
                      boxShadow: '0 8px 24px rgba(59,159,217,.35)',
                      '&:hover': {
                        background: `linear-gradient(135deg, ${PRIMARY_DARK} 0%, ${PRIMARY} 100%)`,
                        transform: 'translateY(-1px)',
                        boxShadow: '0 10px 28px rgba(59,159,217,.45)',
                      },
                      transition: 'all .2s ease',
                    }}
                  >
                    {submitting ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : (
                      t('form.submit', 'Submit Request')
                    )}
                  </Button>
                </Grid>
              </Grid>
            </form>
          </Paper>
        </Fade>
      </Container>

      {/* Image Modal */}
      <Dialog
        open={imageModalOpen}
        onClose={() => setImageModalOpen(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            background: 'black',
          },
        }}
      >
        <DialogContent sx={{ p: 0, position: 'relative' }}>
          <IconButton
            onClick={() => setImageModalOpen(false)}
            aria-label={t('common.close', 'Close')}
            sx={{
              position: 'absolute',
              right: 10,
              top: 10,
              color: 'white',
              background: 'rgba(0,0,0,0.5)',
              '&:hover': {
                background: 'rgba(0,0,0,0.7)',
              },
              zIndex: 2,
            }}
          >
            <CloseIcon />
          </IconButton>
          {currentImage && (
            <img
              src={currentImage.image_url}
              alt={currentImage.alt_text || product.name}
              onError={(e) => {
                e.currentTarget.src = product.image_url || '/placeholder-image.png';
              }}
              style={{
                width: '100%',
                height: 'auto',
                display: 'block',
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Success Snackbar */}
      <Snackbar
        open={showSuccess}
        autoHideDuration={6000}
        onClose={() => setShowSuccess(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setShowSuccess(false)}
          severity="success"
          icon={<CheckCircle />}
          sx={{
            borderRadius: 2,
            boxShadow: '0 6px 20px rgba(0,0,0,0.12)',
          }}
        >
          {t('success.order_submitted', 'Your request has been submitted successfully!')}
        </Alert>
      </Snackbar>

      <Footer />
    </Box>
  );
};

export default ProductDetails;