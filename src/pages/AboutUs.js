// src/pages/AboutUs.js
import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  CircularProgress,
  Fade,
} from '@mui/material';
import Footer from '../components/Footer';
import GroupsIcon from '@mui/icons-material/Groups';
import TargetIcon from '@mui/icons-material/TrackChanges';
import { fetchAboutSections, fetchTeamMembers } from '../api/content';
import { useLanguage } from '../contexts/LanguageContext';
import { useTranslation } from '../hooks/useTranslation';

function InfoCard({ loading, gradient, IconEl, title, content, index }) {
  return (
    <Fade in={!loading} timeout={800 + index * 200}>
      <Card
        sx={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          overflow: 'visible',
          backgroundColor: 'white',
          borderRadius: 3,
          minHeight: '300px',
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
        <CardContent sx={{ p: 4, pt: 5, textAlign: 'center' }}>
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
              mb: 3,
              margin: '0 auto 24px',
              color: 'white',
              boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
              transition: 'all 0.3s ease',
            }}
          >
            {IconEl}
          </Box>
          <Typography variant="h5" sx={{ mb: 2, color: '#1a1a1a', fontWeight: 700 }}>
            {title}
          </Typography>
          <Typography variant="body1" sx={{ color: '#666', lineHeight: 1.8 }}>
            {content}
          </Typography>
        </CardContent>
      </Card>
    </Fade>
  );
}

const AboutUs = () => {
  const [loading, setLoading] = useState(true);
  const [mission, setMission] = useState({ title: 'Our Mission', content: '' });
  const [vision, setVision] = useState({ title: 'Our Vision', content: '' });
  const [story, setStory] = useState('');
  const [teamMembers, setTeamMembers] = useState([]);
  const { currentLanguage } = useLanguage();
  const { t, loading: translationsLoading } = useTranslation();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [sections, team] = await Promise.all([
          fetchAboutSections(currentLanguage),
          fetchTeamMembers(currentLanguage)
        ]);
        if (cancelled) return;

        // Map sections by key
        const byKey = {};
        (sections || []).forEach((s) => {
          if (s?.key) byKey[s.key] = s;
        });

        setMission({
          title: byKey['mission']?.title || 'Our Mission',
          content:
            byKey['mission']?.content ||
            'Our mission statement will appear here once configured in the admin.',
        });
        setVision({
          title: byKey['vision']?.title || 'Our Vision',
          content:
            byKey['vision']?.content ||
            'Our vision statement will appear here once configured in the admin.',
        });
        setStory(
          byKey['story']?.content ||
            'Our story will appear here once configured in the admin.'
        );
        setTeamMembers(team || []);
      } catch {
        // Keep defaults
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [currentLanguage]);

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
      <Box
        sx={{
          backgroundColor: '#f9f9f9',
          py: 6,
          textAlign: 'center',
        }}
      >
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
            {t('about.title', 'About WiMed')}
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: '#666',
              maxWidth: '600px',
              margin: '0 auto',
            }}
          >
            {t('about.subtitle', 'Leading supplier of medical equipment in the UK, dedicated to improving healthcare delivery through innovative solutions and exceptional service')}
          </Typography>
        </Container>
      </Box>

      {/* Mission & Vision Section */}
      <Box sx={{ py: 8, backgroundColor: '#f8f9fa' }}>
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
              <Grid item xs={12} md={6} sx={{ display: 'flex' }}>
                <InfoCard
                  loading={loading}
                  gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                  IconEl={<TargetIcon sx={{ fontSize: 40 }} />}
                  title={mission.title}
                  content={mission.content}
                  index={0}
                />
              </Grid>
              <Grid item xs={12} md={6} sx={{ display: 'flex' }}>
                <InfoCard
                  loading={loading}
                  gradient="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
                  IconEl={<GroupsIcon sx={{ fontSize: 40 }} />}
                  title={vision.title}
                  content={vision.content}
                  index={1}
                />
              </Grid>
            </Grid>
          )}
        </Container>
      </Box>

      {/* Company History */}
      <Box sx={{ py: 8, backgroundColor: 'white' }}>
        <Container maxWidth="lg">
          <Typography
            variant="h4"
            align="center"
            sx={{
              mb: 6,
              color: '#2c2976',
              fontWeight: 700,
            }}
          >
            {t('about.story_title', 'Our Story')}
          </Typography>
          <Box
            sx={{
              background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
              borderRadius: 4,
              p: 5,
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: '-50%',
                right: '-50%',
                width: '200%',
                height: '200%',
                background:
                  'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
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
            <Fade in={!loading} timeout={1000}>
              <Typography
                variant="body1"
                sx={{
                  color: '#1a1a1a',
                  lineHeight: 1.8,
                  maxWidth: '900px',
                  margin: '0 auto',
                  mb: 3,
                  fontSize: '1.1rem',
                  position: 'relative',
                  zIndex: 1,
                  minHeight: loading ? '72px' : 'auto',
                }}
              >
                {!loading && story}
              </Typography>
            </Fade>
          </Box>
        </Container>
      </Box>

      {/* Team Section */}
      <Box sx={{ py: 8, backgroundColor: 'white', flex: 1 }}>
        <Container maxWidth="lg">
          <Typography
            variant="h4"
            align="center"
            sx={{
              mb: 6,
              color: '#2c2976',
              fontWeight: 700,
            }}
          >
            {t('about.team_title', 'Our Leadership Team')}
          </Typography>
          <Grid container spacing={3} justifyContent="center">
            {teamMembers.map((member, index) => (
              <Fade in={!loading} timeout={800 + index * 150} key={member.id || index}>
                <Grid item xs={12} sm={6} md={3} sx={{ display: 'flex' }}>
                  <Card
                  sx={{
                    width: '100%',
                    textAlign: 'center',
                    p: 3,
                    height: '100%',
                    minHeight: '280px',
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
                      '& .avatar': {
                        transform: 'scale(1.05)',
                      },
                    },
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '5px',
                      background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                      borderRadius: '12px 12px 0 0',
                    },
                    }}
                  >
                    <Avatar
                      className="avatar"
                      src={member.image_url}
                      sx={{
                        width: 120,
                        height: 120,
                        margin: '0 auto',
                        mb: 2,
                        mt: 2,
                        transition: 'all 0.3s ease',
                        boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
                      }}
                    />
                    <Typography
                      variant="h6"
                      sx={{
                        color: '#1a1a1a',
                        fontWeight: 700,
                        mb: 1,
                      }}
                    >
                      {member.name}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#666' }}>
                      {member.position}
                    </Typography>
                  </Card>
                </Grid>
              </Fade>
            ))}
          </Grid>

          {/* Contact CTA */}
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
                background:
                  'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
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
              {t('about.cta_title', 'Partner with WiMed Today')}
            </Typography>
            <Typography variant="h6" sx={{ mb: 3, opacity: 0.95, position: 'relative', zIndex: 1 }}>
              {t('about.cta_subtitle', 'Your Trusted Medical Equipment Partner')}
            </Typography>
            <Typography
              variant="body1"
              sx={{ maxWidth: '600px', mx: 'auto', opacity: 0.9, position: 'relative', zIndex: 1 }}
            >
              {t('about.cta_description', 'Discover how our medical equipment solutions can enhance your healthcare facility. Contact us at: info@wimed.fr | +44 740 445 6671')}
            </Typography>
          </Box>
        </Container>
      </Box>

      <Footer />
    </Box>
  );
};

export default AboutUs;