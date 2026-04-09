import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  IconButton,
  Link,
  Divider,
  Skeleton,
} from '@mui/material';
import {
  Facebook as FacebookIcon,
  Instagram as InstagramIcon,
  YouTube as YouTubeIcon,
  Public as PublicIcon,
} from '@mui/icons-material';
import { fetchFooterSettings, fetchFooterLinks } from '../api/content';
import { useLanguage } from '../contexts/LanguageContext';
import { useTranslation } from '../hooks/useTranslation';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [loading, setLoading] = useState(true);
  const { currentLanguage } = useLanguage();
  const { t } = useTranslation();
  const [footerSettings, setFooterSettings] = useState({
    about_text: 'Over 25 years of experience in medical equipment sales and services, with more than 2,000 products. We offer products, services and solutions to public and private hospitals, medical centres and private practices.',
    facebook_url: '#',
    instagram_url: '#',
    youtube_url: '#',
    website_url: '#',
    copyright_text: '© {year}, WiMed ┃ ALL RIGHTS RESERVED ┃',
  });
  const [footerLinks, setFooterLinks] = useState([
    { label: 'Refund policy', url: '#' },
    { label: 'Privacy policy', url: '#' },
    { label: 'Terms of service', url: '#' },
    { label: 'Shipping policy', url: '#' },
    { label: 'Contact information', url: '#' },
  ]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [settingsData, linksData] = await Promise.all([
          fetchFooterSettings(currentLanguage),
          fetchFooterLinks(currentLanguage),
        ]);
        
        if (!cancelled) {
          if (settingsData) {
            setFooterSettings({
              about_text: settingsData.about_text || footerSettings.about_text,
              facebook_url: settingsData.facebook_url || footerSettings.facebook_url,
              instagram_url: settingsData.instagram_url || footerSettings.instagram_url,
              youtube_url: settingsData.youtube_url || footerSettings.youtube_url,
              website_url: settingsData.website_url || footerSettings.website_url,
              copyright_text: settingsData.copyright_text || footerSettings.copyright_text,
            });
          }
          if (linksData) {
            setFooterLinks(linksData.filter(link => link.is_active));
          }
        }
      } catch (error) {
        console.error('Error fetching footer data:', error);
        // Keep default values on error
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [currentLanguage]);

  const formatCopyright = (text) => {
    return text.replace('{year}', currentYear);
  };

  return (
    <Box
      component="footer"
      sx={{
        background: 'linear-gradient(135deg, #0b6b3b 0%, #108a4d 50%, #1f9d5f 100%)',
        color: 'white',
        mt: 'auto',
      }}
    >
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Grid container spacing={4}>
          {/* About Us */}
          <Grid item xs={12} md={6}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              {t('footer.about_us', 'About Us')}
            </Typography>
            {loading ? (
              <>
                <Skeleton variant="text" width="100%" />
                <Skeleton variant="text" width="100%" />
                <Skeleton variant="text" width="80%" />
              </>
            ) : (
              <Typography variant="body2" sx={{ lineHeight: 1.8 }}>
                {footerSettings.about_text}
              </Typography>
            )}
          </Grid>

          {/* Social Media */}
          <Grid item xs={12} md={6}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              {t('footer.follow_us', 'Follow Us')}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} variant="circular" width={40} height={40} />
                ))
              ) : (
                <>
                  {footerSettings.facebook_url && (
                    <IconButton
                      component="a"
                      href={footerSettings.facebook_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{
                        color: 'white',
                        '&:hover': {
                          backgroundColor: 'rgba(0, 150, 136, 0.3)',
                          transform: 'scale(1.1)',
                        },
                      }}
                    >
                      <FacebookIcon />
                    </IconButton>
                  )}
                  {footerSettings.instagram_url && (
                    <IconButton
                      component="a"
                      href={footerSettings.instagram_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{
                        color: 'white',
                        '&:hover': {
                          backgroundColor: 'rgba(0, 150, 136, 0.3)',
                          transform: 'scale(1.1)',
                        },
                      }}
                    >
                      <InstagramIcon />
                    </IconButton>
                  )}
                  {footerSettings.youtube_url && (
                    <IconButton
                      component="a"
                      href={footerSettings.youtube_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{
                        color: 'white',
                        '&:hover': {
                          backgroundColor: 'rgba(0, 150, 136, 0.3)',
                          transform: 'scale(1.1)',
                        },
                      }}
                    >
                      <YouTubeIcon />
                    </IconButton>
                  )}
                  {footerSettings.website_url && (
                    <IconButton
                      component="a"
                      href={footerSettings.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{
                        color: 'white',
                        '&:hover': {
                          backgroundColor: 'rgba(0, 150, 136, 0.3)',
                          transform: 'scale(1.1)',
                        },
                      }}
                    >
                      <PublicIcon />
                    </IconButton>
                  )}
                </>
              )}
            </Box>
          </Grid>
        </Grid>
      </Container>

      <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.2)' }} />

      {/* Bottom Bar */}
      <Box sx={{ py: 3, backgroundColor: '#0a4f2d' }}>
        <Container maxWidth="lg">
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <Typography variant="body2">
              {loading ? <Skeleton variant="text" width={300} /> : formatCopyright(footerSettings.copyright_text)}
            </Typography>
            <Box
              sx={{
                display: 'flex',
                gap: 2,
                flexWrap: 'wrap',
                justifyContent: 'center',
              }}
            >
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} variant="text" width={100} />
                ))
              ) : (
                footerLinks.map((link) => (
                  <Link
                    key={link.id}
                    href={link.url}
                    sx={{
                      color: 'white',
                      textDecoration: 'none',
                      fontSize: '0.875rem',
                      '&:hover': {
                        textDecoration: 'underline',
                        color: '#52c7b8',
                      },
                    }}
                  >
                    {link.label}
                  </Link>
                ))
              )}
            </Box>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default Footer;