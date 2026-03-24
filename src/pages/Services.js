// src/pages/Services.js
import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  Fade,
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import BuildIcon from '@mui/icons-material/Build';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import VerifiedIcon from '@mui/icons-material/Verified';
import Footer from '../components/Footer';
import { fetchServices } from '../api/content';
import { useLanguage } from '../contexts/LanguageContext';
import { useTranslation } from '../hooks/useTranslation';

const iconMap = {
  build: <BuildIcon sx={{ fontSize: 40 }} />,
  local_shipping: <LocalShippingIcon sx={{ fontSize: 40 }} />,
  verified: <VerifiedIcon sx={{ fontSize: 40 }} />,
  support_agent: <SupportAgentIcon sx={{ fontSize: 40 }} />,
};

const Services = () => {
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState([]);
  const { currentLanguage } = useLanguage();
  const { t, loading: translationsLoading } = useTranslation();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const rows = await fetchServices(currentLanguage);
        if (!cancelled) setServices(rows || []);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [currentLanguage]);

  const renderCard = (service, index) => {
    const features = Array.isArray(service.features) ? service.features : [];
    const gradient = service.gradient || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    const iconEl = iconMap[service.icon_key] || <VerifiedIcon sx={{ fontSize: 40 }} />;
    return (
      <Fade in={!loading} timeout={800 + index * 200} key={service.id || index}>
        <Grid
          item
          xs={12}
          md={6}
          sx={{
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <Card
          sx={{
            width: '500px',
            height: '550px',
            maxWidth: '100%',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            overflow: 'hidden',
            backgroundColor: 'white',
            borderRadius: 3,
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            cursor: 'pointer',
            '&:hover': {
              transform: 'translateY(-8px)',
              boxShadow: '0 20px 40px rgba(0,0,0,0.12)',
              '& .icon-box': {
                transform: 'rotate(10deg) scale(1.1)',
              },
            },
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '5px',
              background: gradient,
              borderRadius: '12px 12px 0 0',
            },
          }}
        >
          <CardContent sx={{ p: 4, pt: 5, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                mb: 3,
                gap: 3,
              }}
            >
              <Box
                className="icon-box"
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: '20px',
                  background: gradient,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
                  transition: 'all 0.3s ease',
                  flexShrink: 0,
                }}
              >
                {iconEl}
              </Box>
              <Typography
                variant="h5"
                component="h2"
                sx={{
                  fontWeight: 700,
                  color: '#1a1a1a',
                  fontSize: { xs: '1.25rem', sm: '1.5rem' },
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                }}
              >
                {service.title}
              </Typography>
            </Box>

            <Typography
              variant="body1"
              sx={{
                mb: 3,
                color: '#666',
                fontSize: { xs: '0.95rem', sm: '1rem' },
                lineHeight: 1.6,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                minHeight: '48px',
              }}
            >
              {service.description}
            </Typography>

            <List
              sx={{
                p: 0,
                flexGrow: 1,
                overflow: 'auto',
                '&::-webkit-scrollbar': { width: '4px' },
                '&::-webkit-scrollbar-track': { background: '#f1f1f1' },
                '&::-webkit-scrollbar-thumb': { background: '#888', borderRadius: '4px' },
                '&::-webkit-scrollbar-thumb:hover': { background: '#555' },
              }}
            >
              {features.map((feature, idx) => (
                <ListItem key={idx} sx={{ px: 0, py: 0.75 }}>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <CheckCircleOutlineIcon sx={{ color: '#2E7D32', fontSize: 22 }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={feature}
                    primaryTypographyProps={{
                      variant: 'body2',
                      color: '#555',
                      fontSize: { xs: '0.9rem', sm: '0.95rem' },
                      lineHeight: 1.6,
                    }}
                  />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      </Grid>
    </Fade>
    );
  };


  // Show loading spinner if translations are still loading
  if (translationsLoading) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress size={60} sx={{ color: '#3B9FD9' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Hero Section */}
      <Box sx={{ backgroundColor: '#f9f9f9', py: 6, textAlign: 'center' }}>
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            component="h1"
            sx={{ fontWeight: 700, color: '#2c2976', mb: 2 }}
          >
            {t('services.title', 'Our Services')}
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: '#666',
              maxWidth: '800px',
              margin: '0 auto',
            }}
          >
            {t('services.subtitle', 'Comprehensive medical equipment services to support healthcare providers with installation, maintenance, training, and technical support')}
          </Typography>
        </Container>
      </Box>

      {/* Services Grid */}
      <Box sx={{ py: 8, flex: 1, backgroundColor: '#f8f9fa' }}>
        <Container maxWidth="lg">
          {loading ? (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '400px',
              }}
            >
              <CircularProgress
                size={60}
                sx={{
                  color: '#3B9FD9',
                  '& .MuiCircularProgress-circle': {
                    strokeLinecap: 'round',
                  },
                }}
              />
            </Box>
          ) : (
            <Grid container spacing={4} justifyContent="center">
              {services.map((service, index) => renderCard(service, index))}
            </Grid>
          )}

          {/* Additional Information */}
          <Box
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: 4,
              p: 5,
              mt: 8,
              textAlign: 'center',
              color: 'white',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: '-50%',
                right: '-50%',
                width: '200%',
                height: '200%',
                background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
                animation: 'pulse 4s ease-in-out infinite',
              },
              '@keyframes pulse': {
                '0%, 100%': { transform: 'scale(0.8)', opacity: 0.5 },
                '50%': { transform: 'scale(1.2)', opacity: 0.8 },
              },
            }}
          >
            <Typography variant="h4" sx={{ mb: 4, fontWeight: 700, position: 'relative', zIndex: 1 }}>
              {t('services.why_choose_title', 'Why Choose Our Services?')}
            </Typography>
            <Grid container spacing={4} sx={{ position: 'relative', zIndex: 1, justifyContent: 'center' }}>
              <Grid item xs={12} sm={6} md={4} sx={{ display: 'flex', justifyContent: 'center' }}>
                <Box
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    height: '100%',
                    width: '100%',
                    maxWidth: '400px',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.15)',
                      transform: 'scale(1.05)',
                    },
                  }}
                >
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
                    {t('services.expertise_title', 'Expertise & Experience')}
                  </Typography>
                  <Typography variant="body1">
                    {t('services.expertise_description', 'Over 20 years of experience in medical equipment services with certified technicians trained on the latest technologies.')}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={4} sx={{ display: 'flex', justifyContent: 'center' }}>
                <Box
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    height: '100%',
                    width: '100%',
                    maxWidth: '400px',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.15)',
                      transform: 'scale(1.05)',
                    },
                  }}
                >
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
                    {t('services.quality_title', 'Quality Assurance')}
                  </Typography>
                  <Typography variant="body1">
                    {t('services.quality_description', 'ISO certified processes ensuring the highest standards of service quality and equipment performance.')}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={4} sx={{ display: 'flex', justifyContent: 'center' }}>
                <Box
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    height: '100%',
                    width: '100%',
                    maxWidth: '400px',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.15)',
                      transform: 'scale(1.05)',
                    },
                  }}
                >
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
                    {t('services.satisfaction_title', 'Customer Satisfaction')}
                  </Typography>
                  <Typography variant="body1">
                    {t('services.satisfaction_description', 'Dedicated to exceeding customer expectations with responsive support and tailored service solutions.')}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Container>
      </Box>

      <Footer />
    </Box>
  );
};

export default Services;