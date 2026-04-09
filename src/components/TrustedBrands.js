// src/components/TrustedBrands.js
import React, { useEffect, useState } from 'react';
import { Box, Container, Typography, keyframes } from '@mui/material';
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

// Default partners with professional medical company logos
const defaultPartners = [
  { id: 1, name: 'شركة المعدات الطبية', logo_url: 'https://via.placeholder.com/180x100/1565C0/FFFFFF?text=Medical+Co' },
  { id: 2, name: 'مستشفيات الرياض', logo_url: 'https://via.placeholder.com/180x100/2E7D32/FFFFFF?text=Riyadh+Hospitals' },
  { id: 3, name: 'الشركة السعودية للأجهزة', logo_url: 'https://via.placeholder.com/180x100/0288D1/FFFFFF?text=Saudi+Medical' },
  { id: 4, name: 'مجموعة الصحة', logo_url: 'https://via.placeholder.com/180x100/43A047/FFFFFF?text=Health+Group' },
  { id: 5, name: 'التقنية الطبية', logo_url: 'https://via.placeholder.com/180x100/1565C0/FFFFFF?text=MedTech' },
  { id: 6, name: 'الرعاية المتكاملة', logo_url: 'https://via.placeholder.com/180x100/2E7D32/FFFFFF?text=Care+Plus' },
  { id: 7, name: 'مؤسسة الشفاء', logo_url: 'https://via.placeholder.com/180x100/0288D1/FFFFFF?text=Al+Shifa' },
  { id: 8, name: 'المركز الطبي الحديث', logo_url: 'https://via.placeholder.com/180x100/43A047/FFFFFF?text=Modern+Medical' },
];

const TrustedBrands = () => {
  const [brands, setBrands] = useState(defaultPartners);
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
          if (rows && rows.length > 0) {
            setBrands(rows);
          }
          if (settings?.brands_title) {
            setSectionTitle(settings.brands_title);
          }
        }
      } catch (error) {
        console.log('Using default partners');
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
          boxShadow: '0 8px 30px rgba(21, 101, 192, 0.3)',
          borderColor: '#1565C0',
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
          borderRadius: '8px',
        }}
        onError={(e) => {
          if (brand.fallback_logo_url && e.target.src !== brand.fallback_logo_url) {
            e.target.src = brand.fallback_logo_url;
          } else {
            e.target.src = `https://via.placeholder.com/180x100/1565C0/FFFFFF?text=${encodeURIComponent(brand.name || 'Partner')}`;
          }
        }}
      />
      <Typography
        variant="body2"
        sx={{
          fontWeight: 600,
          color: '#1A237E',
          fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' },
          textAlign: 'center',
          fontFamily: 'Cairo, Tajawal, sans-serif',
        }}
      >
        {brand.name}
      </Typography>
    </Box>
  );

  const duplicatedBrands = [...brands, ...brands];

  return (
    <Box 
      sx={{ 
        py: 8, 
        background: 'linear-gradient(135deg, #E3F2FD 0%, #E8F5E9 50%, #E1F5FE 100%)',
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
            background: 'linear-gradient(135deg, #1565C0 0%, #2E7D32 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            fontFamily: 'Cairo, Tajawal, sans-serif',
            fontSize: { xs: '1.75rem', md: '2.25rem' },
            position: 'sticky',
            top: { xs: 72, md: 92 },
            zIndex: 3,
            py: 1,
            '&::before': {
              content: '""',
              position: 'absolute',
              inset: '-6px -18px',
              borderRadius: '999px',
              backgroundImage: "url('/wimed_icon.svg')",
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center',
              backgroundSize: '28px 28px',
              backgroundAttachment: 'fixed',
              opacity: 0.1,
              zIndex: -1,
            },
          }}
        >
          {sectionTitle}
        </Typography>
      </Container>
      
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
            background: 'linear-gradient(to right, #E3F2FD, transparent)',
            zIndex: 2,
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            top: 0,
            right: 0,
            width: '100px',
            height: '100%',
            background: 'linear-gradient(to left, #E1F5FE, transparent)',
            zIndex: 2,
          },
        }}
      >
        <Box
          sx={{
            display: 'flex',
            animation: `${scrollLeft} ${brands.length * 4}s linear infinite`,
            width: 'fit-content',
            '&:hover': {
              animationPlayState: 'paused',
            },
          }}
        >
          {duplicatedBrands.map((brand, index) => (
            <BrandCard key={`${brand.id}-${index}`} brand={brand} />
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default TrustedBrands;
