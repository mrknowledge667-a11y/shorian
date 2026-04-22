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
      'شريان ميد - شريكك الموثوق في توفير أحدث المعدات والأجهزة الطبية',
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
          : 'linear-gradient(135deg, #1565C0 0%, #0D47A1 30%, #1B5E20 70%, #2E7D32 100%)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(135deg, rgba(21,101,192,0.6) 0%, rgba(13,71,161,0.5) 50%, rgba(27,94,32,0.6) 100%)',
        },
        '@keyframes shoryanHeroPulse': {
          '0%, 100%': {
            opacity: 0.85,
            transform: 'translateY(-3.2cm) scale(1)',
          },
          '50%': {
            opacity: 1,
            transform: 'translateY(calc(-3.2cm - 4px)) scale(1.02)',
          },
        },
      }}
    >
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <Fade in={!loading} timeout={900}>
          <Typography
            variant="h2"
            component="h2"
            sx={{
              color: '#0b6b3b',
              fontWeight: 900,
              textAlign: 'center',
              mb: 1.5,
              letterSpacing: { xs: '1px', md: '3px' },
              fontSize: { xs: '2rem', md: '3.6rem' },
              textTransform: 'uppercase',
              textShadow: '0 4px 12px rgba(0,0,0,0.18)',
              background: 'rgba(255,255,255,0.9)',
              border: '2px solid #0b6b3b',
              borderRadius: '16px',
              display: 'table',
              mx: 'auto',
              px: { xs: 1.6, md: 3 },
              py: { xs: 0.35, md: 0.6 },
              boxShadow: '0 8px 22px rgba(11,107,59,0.28)',
              animation: 'shoryanHeroPulse 3.8s ease-in-out infinite',
            }}
          >
            SHORYAN MEDICAL
          </Typography>
        </Fade>

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