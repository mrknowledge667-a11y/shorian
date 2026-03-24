import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Snackbar,
  Alert,
  CircularProgress,
  Fade,
} from '@mui/material';
import Footer from '../components/Footer';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { fetchContactBlocks, fetchSiteSettings } from '../api/content';
import { useLanguage } from '../contexts/LanguageContext';
import { useTranslation } from '../hooks/useTranslation';

const ContactUs = () => {
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [contactBlocks, setContactBlocks] = useState([]);
  const [siteSettings, setSiteSettings] = useState(null);
  const { currentLanguage } = useLanguage();
  const { t, loading: translationsLoading } = useTranslation();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [blocks, settings] = await Promise.all([
          fetchContactBlocks(currentLanguage),
          fetchSiteSettings(currentLanguage)
        ]);
        
        if (!cancelled) {
          setContactBlocks(blocks || []);
          setSiteSettings(settings || null);
        }
      } catch (error) {
        console.error('Error fetching contact data:', error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [currentLanguage]);

  // Map contact blocks to display format
  const getContactInfo = () => {
    const blockMap = {};
    contactBlocks.forEach(block => {
      blockMap[block.key] = block;
    });

    const iconMap = {
      address: <LocationOnIcon sx={{ fontSize: 40 }} />,
      phone: <PhoneIcon sx={{ fontSize: 40 }} />,
      whatsapp: <WhatsAppIcon sx={{ fontSize: 40 }} />,
      email: <EmailIcon sx={{ fontSize: 40 }} />,
      hours: <AccessTimeIcon sx={{ fontSize: 40 }} />,
    };

    const gradientMap = {
      address: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      phone: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      whatsapp: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      email: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      hours: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    };

    // Default contact info with fallbacks from site settings
    const defaultInfo = [
      {
        key: 'address',
        icon: iconMap.address,
        title: t('contact.address_title', 'Address'),
        content: ['123 Medical Street', 'London, UK', 'SW1A 1AA'],
        gradient: gradientMap.address,
      },
      {
        key: 'phone',
        icon: iconMap.phone,
        title: t('contact.phone_title', 'Phone'),
        content: siteSettings?.phone ? [siteSettings.phone] : ['+44 740 445 6671'],
        gradient: gradientMap.phone,
      },
      {
        key: 'whatsapp',
        icon: iconMap.whatsapp,
        title: t('contact.whatsapp_title', 'WhatsApp'),
        content: siteSettings?.phone ? [siteSettings.phone] : ['+44 740 445 6671'],
        gradient: gradientMap.whatsapp,
      },
      {
        key: 'email',
        icon: iconMap.email,
        title: t('contact.email_title', 'Email'),
        content: siteSettings?.contact_email ? [siteSettings.contact_email] : ['info@wimed.fr'],
        gradient: gradientMap.email,
      },
      {
        key: 'hours',
        icon: iconMap.hours,
        title: t('contact.hours_title', 'Business Hours'),
        content: [
          t('contact.hours_weekdays', 'Monday - Friday: 9:00 AM - 6:00 PM'),
          t('contact.hours_saturday', 'Saturday: 10:00 AM - 4:00 PM'),
          t('contact.hours_sunday', 'Sunday: Closed')
        ],
        gradient: gradientMap.hours,
      },
    ];

    // Override with contact blocks if available
    return defaultInfo.map(item => {
      const block = blockMap[item.key];
      if (block) {
        return {
          ...item,
          title: block.title || item.title,
          content: block.content_lines && block.content_lines.length > 0 ? block.content_lines : item.content,
        };
      }
      return item;
    });
  };

  const contactInfo = loading ? [] : getContactInfo();
 
   // Interactive helpers
   const isInteractiveKey = (key) => ['address', 'phone', 'whatsapp', 'email'].includes(key);
 
   const getPrimaryValue = (arr) => (Array.isArray(arr) && arr.length > 0 ? String(arr[0]).trim() : '');
 
   const buildInteraction = (info) => {
     switch (info.key) {
       case 'address': {
         const addressString = (info.content || []).join(', ');
         const url = siteSettings?.map_embed_url
           ? siteSettings.map_embed_url.replace('/embed?', '/?')
           : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addressString)}`;
         return { url, target: '_blank' };
       }
       case 'phone': {
         const raw = getPrimaryValue(info.content);
         const tel = `tel:${raw.replace(/\s+/g, '')}`;
         return { url: tel };
       }
       case 'whatsapp': {
         const raw = getPrimaryValue(info.content);
         const wa = raw.replace(/[^\d]/g, '');
         const url = `https://wa.me/${wa}`;
         return { url, target: '_blank' };
       }
       case 'email': {
         const email = getPrimaryValue(info.content);
         const url = `mailto:${email}`;
         return { url };
       }
       default:
         return null;
     }
   };
 
   const handleInteraction = (info) => {
     const action = buildInteraction(info);
     if (!action?.url) return;
     if (action.target === '_blank') {
       window.open(action.url, '_blank', 'noopener,noreferrer');
     } else {
       window.location.href = action.url;
     }
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
      <Box sx={{
        backgroundColor: '#f9f9f9',
        py: 6,
        textAlign: 'center',
      }}>
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            component="h1"
            sx={{
              fontWeight: 700,
              color: '#2c2976',
              mb: 2,
            }}
          >
            {t('contact.title', 'Contact Us')}
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: '#666',
              maxWidth: '600px',
              margin: '0 auto',
            }}
          >
            {t('contact.subtitle', 'Get in touch with our team for inquiries, support, or to discuss your medical equipment needs')}
          </Typography>
        </Container>
      </Box>

      {/* Contact Section */}
      <Box sx={{ py: 8, flex: 1, backgroundColor: '#f8f9fa' }}>
        <Container maxWidth="lg">
          {/* Contact Information Grid */}
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
            <Grid container spacing={3} sx={{ mb: 6, justifyContent: 'center' }}>
              {contactInfo.map((info, index) => (
                <Fade in={!loading} timeout={800 + index * 150} key={index}>
                  <Grid item xs={12} sm={6} md={4} sx={{ display: 'flex' }}>
                    <Card
                      onClick={() => isInteractiveKey(info.key) && handleInteraction(info)}
                      role={isInteractiveKey(info.key) ? 'button' : undefined}
                      tabIndex={isInteractiveKey(info.key) ? 0 : -1}
                      onKeyDown={(e) => {
                        if (isInteractiveKey(info.key) && (e.key === 'Enter' || e.key === ' ')) {
                          e.preventDefault();
                          handleInteraction(info);
                        }
                      }}
                  sx={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    overflow: 'visible',
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
                      background: info.gradient,
                      borderRadius: '12px 12px 0 0',
                    },
                  }}
                >
                  <CardContent sx={{
                    p: 4,
                    pt: 5,
                    flexGrow: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    minHeight: '280px'
                  }}>
                    {/* Icon Container */}
                    <Box
                      className="icon-box"
                      sx={{
                        width: 80,
                        height: 80,
                        borderRadius: '20px',
                        background: info.gradient,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mb: 3,
                        color: 'white',
                        boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
                        transition: 'all 0.3s ease',
                      }}
                    >
                      {info.icon}
                    </Box>
                    
                    {/* Content */}
                    <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <Typography
                        variant="h6"
                        sx={{
                          color: '#1a1a1a',
                          fontWeight: 700,
                          mb: 2,
                          fontSize: '1.2rem',
                        }}
                      >
                        {info.title}
                      </Typography>
                      
                      <Box sx={{ mt: 'auto' }}>
                        {info.content.map((line, idx) => (
                          <Typography
                            key={idx}
                            variant="body2"
                            sx={{
                              color: isInteractiveKey(info.key) && info.key !== 'hours' ? 'primary.main' : '#666',
                              mb: 0.5,
                              lineHeight: 1.6,
                              fontSize: '0.95rem',
                              cursor: isInteractiveKey(info.key) && info.key !== 'hours' ? 'pointer' : 'default',
                              '&:hover': isInteractiveKey(info.key) && info.key !== 'hours' ? { textDecoration: 'underline' } : {},
                            }}
                            onClick={(e) => {
                              if (isInteractiveKey(info.key) && info.key !== 'hours') {
                                e.stopPropagation();
                                handleInteraction(info);
                              }
                            }}
                          >
                            {line}
                          </Typography>
                        ))}
                      </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Fade>
              ))}
            </Grid>
          )}

          {/* Quick Response Section */}
          <Box
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: 4,
              p: 5,
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
                '0%, 100%': {
                  transform: 'scale(0.8)',
                  opacity: 0.5,
                },
                '50%': {
                  transform: 'scale(1.2)',
                  opacity: 0.8,
                },
              },
            }}
          >
            <Typography variant="h4" sx={{ mb: 2, fontWeight: 700, position: 'relative', zIndex: 1 }}>
              {t('contact.cta_title', 'Get in Touch Today')}
            </Typography>
            <Typography variant="h6" sx={{ mb: 3, opacity: 0.95, position: 'relative', zIndex: 1 }}>
              {t('contact.cta_subtitle', 'Quick Response Guarantee')}
            </Typography>
            <Typography variant="body1" sx={{ maxWidth: '600px', mx: 'auto', opacity: 0.9, position: 'relative', zIndex: 1 }}>
              {t('contact.cta_description', 'We aim to respond to all inquiries within 24 hours during business days. For urgent matters, please call us directly and we\'ll assist you immediately.')}
            </Typography>
          </Box>

        </Container>
      </Box>

      {/* Success Snackbar */}
      <Snackbar
        open={showSuccess}
        autoHideDuration={6000}
        onClose={() => setShowSuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setShowSuccess(false)} 
          severity="success"
          sx={{ width: '100%' }}
        >
          {t('contact.success_message', 'Thank you for your message! We\'ll get back to you soon.')}
        </Alert>
      </Snackbar>
      
      <Footer />
    </Box>
  );
};

export default ContactUs;