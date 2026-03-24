// src/components/HeroSection.js
import React, { useEffect, useState } from 'react';
import { Box, Container, Typography, Fade } from '@mui/material';
import { fetchSiteSettings } from '../api/content';
import { useLanguage } from '../contexts/LanguageContext';

const HeroSection = () => {
  const [loading, setLoading] = useState(true);
  const { currentLanguage } = useLanguage();
  const [settings, setSettings] = useState({
    hero_title: 'معدات طبية عالية الجودة للرعاية الصحية المتميزة',
    hero_subtitle:
      'شوريان ميد - شريكك الموثوق في توفير أحدث المعدات والأجهزة الطبية',
    hero_image_url: '/head.jpg',
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchSiteSettings(currentLanguage);
        if (!cancelled && data) {
          setSettings((prev) => ({
            ...prev,
            hero_title: data.hero_title || prev.hero_title,
            hero_subtitle: data.hero_subtitle || prev.hero_subtitle,
            hero_image_url: data.hero_image_url || prev.hero_image_url,
          }));
        }
      } catch {
        // keep defaults
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [currentLanguage]);

  const bgUrl = settings.hero_image_url;

  return (
    <Box
      sx={{
        position: 'relative',
        height: { xs: '400px', md: '600px' },
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundImage: bgUrl 
          ? `url(${bgUrl})`
          : 'linear-gradient(135deg, #3B9FD9 0%, #2B7EAA 50%, #1a5276 100%)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
        },
      }}
    >
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <Fade in={!loading} timeout={1000}>
          <Typography
            variant="h3"
            component="h1"
            sx={{
              color: 'white',
              fontWeight: 700,
              textAlign: 'center',
              mb: 3,
              fontSize: { xs: '1.75rem', md: '3rem' },
              minHeight: loading ? { xs: '42px', md: '72px' } : 'auto',
            }}
          >
            {!loading && settings.hero_title}
          </Typography>
        </Fade>
        <Fade in={!loading} timeout={1200}>
          <Typography
            variant="h6"
            sx={{
              color: 'white',
              textAlign: 'center',
              maxWidth: '800px',
              mx: 'auto',
              lineHeight: 1.8,
              fontSize: { xs: '1rem', md: '1.25rem' },
              minHeight: loading ? { xs: '48px', md: '60px' } : 'auto',
            }}
          >
            {!loading && settings.hero_subtitle}
          </Typography>
        </Fade>
      </Container>
    </Box>
  );
};

export default HeroSection;