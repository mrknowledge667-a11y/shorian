// src/components/ProductCategories.js
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
import { fetchCategories, fetchSiteSettings } from '../api/content';
import { useLanguage } from '../contexts/LanguageContext';

const ProductCategories = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [sectionTitle, setSectionTitle] = useState('Our Range of Medical Equipment');
  const { currentLanguage } = useLanguage();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [rows, settings] = await Promise.all([
          fetchCategories(currentLanguage),
          fetchSiteSettings(currentLanguage)
        ]);
        if (!cancelled) {
          setCategories(rows || []);
          if (settings?.categories_title) {
            setSectionTitle(settings.categories_title);
          }
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [currentLanguage]);

  const handleCategoryClick = (slug) => {
    navigate(`/${slug}`);
  };

  const renderCard = (category, idx) => (
    <Fade in={!loading} timeout={800 + idx * 100} key={category?.slug || idx}>
      <Card
        onClick={() => handleCategoryClick(category.slug)}
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
          image={category.image_url}
          alt={category.name}
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
          {category.name}
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
    <Box sx={{ py: 8, backgroundColor: '#f9f9f9' }}>
      <Container maxWidth="xl">
        <Typography
          variant="h4"
          component="h2"
          sx={{
            textAlign: 'center',
            mb: 6,
            fontWeight: 600,
            color: '#2c2976',
          }}
        >
          {sectionTitle}
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
                xs: 'repeat(2, 1fr)',
                sm: 'repeat(3, 1fr)',
                md: 'repeat(4, 1fr)',
                lg: 'repeat(6, 1fr)',
                xl: 'repeat(6, 1fr)',
              },
              gap: 2.5,
              maxWidth: '1800px',
              margin: '0 auto',
              px: { xs: 2, sm: 3, md: 4 },
            }}
          >
            {categories.map((category, idx) => renderCard(category, idx))}
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default ProductCategories;