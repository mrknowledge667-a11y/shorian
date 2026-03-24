// src/components/TrustedBrands.js
import React, { useEffect, useState } from 'react';
import { Box, Container, Typography, Skeleton, keyframes } from '@mui/material';
import { fetchBrands, fetchSiteSettings } from '../api/content';
import { useLanguage } from '../contexts/LanguageContext';

// Infinite scroll animation
const scrollLeft = keyframes`
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-50%);
  }
`;

const TrustedBrands = () => {
  const [loading, setLoading] = useState(true);
  const [brands, setBrands] = useState([]);
  const [sectionTitle, setSectionTitle] = useState('شركاؤنا');
  const { currentLanguage } = useLanguage();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [rows, settings] = await Promise.all([
          fetchBrands(),
          fetchSiteSettings(currentLanguage)
        ]);
        if (!cancelled) {
          setBrands(rows || []);
          if (settings?.brands_title) {
            setSectionTitle(settings.brands_title);
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

  const BrandCard = ({ brand }) => (
    <Box
      sx={{
        minWidth: { xs: '150px', sm: '180px', md: '220px' },
        height: { xs: '120px', sm: '140px', md: '160px' },
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'white',
        borderRadius: '16px',
        padding: 2,
        mx: 2,
        transition: 'all 0.4s ease',
        cursor: 'pointer',
        boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
        border: '2px solid transparent',
        '&:hover': {
          transform: 'scale(1.08) translateY(-5px)',
          boxShadow: '0 8px 30px rgba(46, 125, 50, 0.3)',
          borderColor: '#2E7D32',
        },
      }}
    >
      <Box
        component="img"
        src={brand.logo_url}
        alt={brand.name}
        sx={{
          maxWidth: '80%',
          maxHeight: '70%',
          width: 'auto',
          height: 'auto',
          objectFit: 'contain',
          mb: 1,
        }}
        onError={(e) => {
          if (brand.fallback_logo_url && e.target.src !== brand.fallback_logo_url) {
            e.target.src = brand.fallback_logo_url;
          } else {
            // Show placeholder icon
            e.target.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4MCIgaGVpZ2h0PSI4MCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiMyRTdEMzIiIHN0cm9rZS13aWR0aD0iMiI+PHJlY3QgeD0iMyIgeT0iMyIgd2lkdGg9IjE4IiBoZWlnaHQ9IjE4IiByeD0iMiIgcnk9IjIiLz48Y2lyY2xlIGN4PSI4LjUiIGN5PSI4LjUiIHI9IjEuNSIvPjxwb2x5bGluZSBwb2ludHM9IjIxIDE1IDEwIDE1IDMgMjEiLz48L3N2Zz4=';
          }
        }}
      />
      <Typography
        variant="body2"
        sx={{
          fontWeight: 600,
          color: '#333',
          fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' },
          textAlign: 'center',
          fontFamily: 'Cairo, Tajawal, sans-serif',
        }}
      >
        {brand.name}
      </Typography>
    </Box>
  );

  // Double the brands array for seamless infinite scroll
  const duplicatedBrands = [...brands, ...brands];

  return (
    <Box 
      sx={{ 
        py: 8, 
        backgroundColor: 'linear-gradient(135deg, #f5f7fa 0%, #e8f5e9 100%)',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #e8f5e9 100%)',
        overflow: 'hidden',
      }}
    >
      <Container maxWidth="lg">
        <Typography
          variant="h4"
          component="h2"
          sx={{
            textAlign: 'center',
            mb: 6,
            fontWeight: 700,
            color: '#2E7D32',
            fontFamily: 'Cairo, Tajawal, sans-serif',
            fontSize: { xs: '1.75rem', md: '2.25rem' },
          }}
        >
          {sectionTitle}
        </Typography>
      </Container>
      
      {/* Scrolling brands container */}
      <Box
        sx={{
          width: '100%',
          overflow: 'hidden',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100px',
            height: '100%',
            background: 'linear-gradient(to right, #f5f7fa, transparent)',
            zIndex: 2,
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            top: 0,
            right: 0,
            width: '100px',
            height: '100%',
            background: 'linear-gradient(to left, #e8f5e9, transparent)',
            zIndex: 2,
          },
        }}
      >
        <Box
          sx={{
            display: 'flex',
            animation: brands.length > 0 ? `${scrollLeft} ${brands.length * 4}s linear infinite` : 'none',
            width: 'fit-content',
            '&:hover': {
              animationPlayState: 'paused',
            },
          }}
        >
          {loading
            ? Array.from({ length: 10 }).map((_, i) => (
                <Box
                  key={`s-${i}`}
                  sx={{
                    minWidth: { xs: '150px', md: '220px' },
                    height: { xs: '120px', md: '160px' },
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'white',
                    borderRadius: '16px',
                    padding: 2,
                    mx: 2,
                    boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                  }}
                >
                  <Skeleton variant="rectangular" width="100%" height="100%" sx={{ borderRadius: '12px' }} />
                </Box>
              ))
            : duplicatedBrands.map((brand, index) => (
                <BrandCard key={`${brand.id}-${index}`} brand={brand} />
              ))}
        </Box>
      </Box>
    </Box>
  );
};

export default TrustedBrands;