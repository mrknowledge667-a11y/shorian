// src/pages/PatientMonitors.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Card,
  CardMedia,
  CardContent,
  CircularProgress,
  Fade,
} from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import Footer from '../components/Footer';
import { fetchProductsByCategorySlug } from '../api/content';
import { useLanguage } from '../contexts/LanguageContext';
import { useTranslation } from '../hooks/useTranslation';

const PatientMonitors = () => {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const { currentLanguage } = useLanguage();
  const { t } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const rows = await fetchProductsByCategorySlug('patient-monitors', currentLanguage);
        if (!cancelled) setProducts(rows || []);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [currentLanguage]);

  const renderCard = (product, index) => (
    <Fade in={!loading} timeout={800 + index * 100} key={product.id}>
      <Card
        onClick={() => navigate(`/product/${product.id}`)}
        sx={{
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          borderRadius: '20px',
          overflow: 'hidden',
          background: '#3B9FD9',
          '&:hover': {
            transform: 'translateY(-5px)',
            boxShadow: '0 8px 16px rgba(0,0,0,0.15)',
          },
        }}
      >
        <Box
          sx={{
            position: 'relative',
            width: '100%',
            paddingTop: '100%',
            overflow: 'hidden',
            backgroundColor: '#f0f0f0',
            borderRadius: '20px 20px 0 0',
          }}
        >
          <CardMedia
            component="img"
            image={product.image_url}
            alt={product.name}
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        </Box>
        <CardContent
          sx={{
            backgroundColor: 'transparent',
            padding: '16px 12px',
            flexGrow: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1,
            minHeight: '80px',
            margin: 0,
            '&:last-child': {
              paddingBottom: '20px',
            },
          }}
        >
          <Typography
            variant="h6"
            component="h3"
            sx={{
              textAlign: 'center',
              fontWeight: 600,
              color: 'white',
              fontSize: { xs: '0.85rem', sm: '0.95rem', md: '1.05rem', lg: '1.1rem' },
              lineHeight: 1.5,
              display: 'inline-block',
            }}
          >
            {product.name}
          </Typography>
          <ArrowForwardIcon
            sx={{
              color: 'white',
              fontSize: { xs: '1.1rem', sm: '1.2rem', md: '1.3rem', lg: '1.4rem' },
              flexShrink: 0,
            }}
          />
        </CardContent>
      </Card>
    </Fade>
  );
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Category Section */}
      <Box sx={{ py: 8, backgroundColor: '#f9f9f9', flex: 1 }}>
        <Container maxWidth="xl">
          <Typography
            variant="h4"
            component="h1"
            sx={{
              textAlign: 'center',
              mb: 6,
              fontWeight: 600,
              color: '#2c2976',
            }}
          >
            {t('category.patient_monitors.title', 'Patient Monitoring Equipment')}
          </Typography>

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
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: 'repeat(2, 1fr)', // 2 columns on mobile
                  sm: 'repeat(3, 1fr)', // 3 columns on small screens
                  md: 'repeat(4, 1fr)', // 4 columns on medium screens
                  lg: 'repeat(6, 1fr)', // 6 columns on large screens
                  xl: 'repeat(6, 1fr)', // 6 columns on extra large screens
                },
                gap: 2.5,
                maxWidth: '1800px',
                margin: '0 auto',
                px: { xs: 2, sm: 3, md: 4 },
              }}
            >
              {products.map((p, index) => renderCard(p, index))}
            </Box>
          )}
        </Container>
      </Box>
      
      <Footer />
    </Box>
  );
};

export default PatientMonitors;