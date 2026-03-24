// src/components/MapLocation.js
import React, { useEffect, useState, useMemo } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Skeleton,
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { fetchSiteSettings, fetchContactBlocks } from '../api/content';
import { useLanguage } from '../contexts/LanguageContext';
import { useTranslation } from '../hooks/useTranslation';

function ContactRow({ icon, title, children, loading }) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'flex-start',
        flex: '1 1 25%',
        minWidth: { xs: '200px', sm: '220px', md: 'auto' },
      }}
    >
      {icon}
      <Box>
        <Typography
          variant="body1"
          sx={{
            fontWeight: 600,
            mb: 0.5,
            fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem', lg: '1.2rem' },
          }}
        >
          {loading ? <Skeleton width={120} /> : title}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem', lg: '1.1rem' },
            lineHeight: 1.4,
          }}
        >
          {loading ? (
            <>
              <Skeleton width={180} />
              <Skeleton width={160} />
              <Skeleton width={140} />
            </>
          ) : (
            children
          )}
        </Typography>
      </Box>
    </Box>
  );
}

const MapLocation = () => {
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState(null);
  const [blocks, setBlocks] = useState([]);
  const { currentLanguage } = useLanguage();
  const { t } = useTranslation();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [s, b] = await Promise.all([
          fetchSiteSettings(),
          fetchContactBlocks(currentLanguage)
        ]);
        if (!cancelled) {
          setSettings(s || null);
          setBlocks(Array.isArray(b) ? b : []);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [currentLanguage]);

  const blockByKey = useMemo(() => {
    const map = {};
    for (const b of blocks) map[b.key] = b;
    return map;
  }, [blocks]);

  const addressBlock = blockByKey['address'];
  const emailBlock = blockByKey['email'];
  const phoneBlock = blockByKey['phone'];
  const hoursBlock = blockByKey['hours'];

  // Default map for Tanta, Ali Moubarak Street, Egypt
  const mapSrc = settings?.map_embed_url || 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3433.8!2d31.0!3d30.79!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14f7c8f0d3e3a0e7%3A0x1234567890abcdef!2sTanta%2C%20Gharbia%20Governorate%2C%20Egypt!5e0!3m2!1sen!2seg!4v1679900000000!5m2!1sen!2seg';

  return (
    <Box sx={{ py: { xs: 4, md: 8 }, backgroundColor: '#ffffff' }}>
      <Container maxWidth={false}>
        <Typography
          variant="h4"
          component="h2"
          sx={{
            textAlign: 'center',
            mb: 6,
            fontWeight: 600,
            color: '#2c2976',
            fontSize: { xs: '1.75rem', md: '2.5rem' },
          }}
        >
          {t('map.title', 'Visit Our Medical Center')}
        </Typography>

        {/* Map Section - Full Width on Desktop */}
        <Box sx={{ px: { xs: 2, sm: 3, md: 4, lg: 6 }, mb: 6 }}>
          <Paper
            elevation={3}
            sx={{
              borderRadius: '16px',
              overflow: 'hidden',
              width: '100%',
              height: {
                xs: '400px',
                sm: '500px',
                md: '600px',
                lg: '700px',
                xl: '800px',
              },
              '@media (min-width: 1200px)': {
                height: '75vh',
                minHeight: '700px',
                maxHeight: '900px',
              },
              '@media (min-width: 1600px)': {
                height: '80vh',
                minHeight: '800px',
                maxHeight: '1000px',
              },
            }}
          >
            {loading ? (
              <Skeleton variant="rectangular" width="100%" height="100%" />
            ) : (
              <iframe
                src={mapSrc}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Medical Center Location"
              />
            )}
          </Paper>
        </Box>

        {/* Contact Information Section - Centered Below Map */}
        <Box sx={{ px: { xs: 2, sm: 3, md: 4, lg: 6 } }}>
          <Paper
            elevation={3}
            sx={{
              p: { xs: 3, sm: 4, md: 5, lg: 6 },
              borderRadius: '16px',
              width: '100%',
              background:
                'linear-gradient(135deg, rgba(0, 150, 136, 0.05) 0%, rgba(0, 150, 136, 0.1) 100%)',
            }}
          >
            <Typography
              variant="h5"
              sx={{
                fontWeight: 600,
                mb: 4,
                color: '#2c2976',
                fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem' },
                textAlign: 'center',
              }}
            >
              {t('map.contact_info_title', 'Contact Information')}
            </Typography>

            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'stretch',
                gap: { xs: 1, sm: 2, md: 3, lg: 4 },
                flexWrap: 'nowrap',
                overflowX: { xs: 'auto', md: 'visible' },
                pb: { xs: 2, md: 0 },
                '&::-webkit-scrollbar': {
                  height: '6px',
                  display: { xs: 'block', md: 'none' },
                },
                '&::-webkit-scrollbar-thumb': {
                  backgroundColor: 'rgba(0,0,0,0.2)',
                  borderRadius: '3px',
                },
              }}
            >
              <ContactRow
                icon={
                  <LocationOnIcon
                    sx={{
                      color: 'primary.main',
                      mr: { xs: 1.5, md: 2 },
                      mt: 0.5,
                      fontSize: { xs: 20, sm: 24, md: 28, lg: 32 },
                      flexShrink: 0,
                    }}
                  />
                }
                title={addressBlock?.title || t('map.address', 'Address')}
                loading={loading}
              >
                {(addressBlock?.content_lines && addressBlock.content_lines.length > 0
                  ? addressBlock.content_lines
                  : []
                ).map((line, idx) => (
                  <span key={idx}>
                    {line}
                    <br />
                  </span>
                ))}
              </ContactRow>

              <ContactRow
                icon={
                  <EmailIcon
                    sx={{
                      color: 'primary.main',
                      mr: { xs: 1.5, md: 2 },
                      mt: 0.5,
                      fontSize: { xs: 20, sm: 24, md: 28, lg: 32 },
                      flexShrink: 0,
                    }}
                  />
                }
                title={emailBlock?.title || t('map.email', 'Email')}
                loading={loading}
              >
                {(emailBlock?.content_lines && emailBlock.content_lines.length > 0
                  ? emailBlock.content_lines
                  : settings?.contact_email
                  ? [settings.contact_email]
                  : []
                ).join(', ')}
              </ContactRow>

              <ContactRow
                icon={
                  <PhoneIcon
                    sx={{
                      color: 'primary.main',
                      mr: { xs: 1.5, md: 2 },
                      mt: 0.5,
                      fontSize: { xs: 20, sm: 24, md: 28, lg: 32 },
                      flexShrink: 0,
                    }}
                  />
                }
                title={phoneBlock?.title || t('map.phone', 'Phone')}
                loading={loading}
              >
                {(phoneBlock?.content_lines && phoneBlock.content_lines.length > 0
                  ? phoneBlock.content_lines
                  : settings?.phone
                  ? [settings.phone]
                  : []
                ).join(', ')}
              </ContactRow>

              <ContactRow
                icon={
                  <AccessTimeIcon
                    sx={{
                      color: 'primary.main',
                      mr: { xs: 1.5, md: 2 },
                      mt: 0.5,
                      fontSize: { xs: 20, sm: 24, md: 28, lg: 32 },
                      flexShrink: 0,
                    }}
                  />
                }
                title={hoursBlock?.title || t('map.working_hours', 'Working Hours')}
                loading={loading}
              >
                {(hoursBlock?.content_lines || []).map((line, idx) => (
                  <span key={idx}>
                    {line}
                    <br />
                  </span>
                ))}
              </ContactRow>
            </Box>

            <Box
              sx={{
                mt: 4,
                p: { xs: 2.5, sm: 3 },
                backgroundColor: 'primary.main',
                borderRadius: '12px',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  backgroundColor: 'primary.dark',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 12px rgba(0, 150, 136, 0.3)',
                },
              }}
              onClick={() =>
                window.open(
                  'https://www.google.com/maps',
                  '_blank'
                )
              }
            >
              <Typography
                variant="h6"
                sx={{
                  color: 'white',
                  fontWeight: 600,
                  fontSize: { xs: '1.1rem', sm: '1.25rem' },
                }}
              >
                {t('map.get_directions', 'Get Directions')}
              </Typography>
            </Box>
          </Paper>
        </Box>
      </Container>
    </Box>
  );
};

export default MapLocation;