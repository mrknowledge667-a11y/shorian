import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Typography,
  IconButton,
  Box,
  Container,
  Menu,
  MenuItem,
  useMediaQuery,
  useTheme,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Divider,
  TextField,
  InputAdornment,
} from '@mui/material';
import {
  Search as SearchIcon,
  Menu as MenuIcon,
  Language as LanguageIcon,
} from '@mui/icons-material';
import { fetchHeaderNavItems, fetchSiteSettings, fetchActiveLanguages } from '../api/content';
import { useLoading } from '../contexts/LoadingContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useTranslation } from '../hooks/useTranslation';

const Header = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [searchValue, setSearchValue] = useState('');
  const [navItems, setNavItems] = useState([]);
  const [siteSettings, setSiteSettings] = useState({});
  const { startLoading, stopLoading } = useLoading();
  const { currentLanguage, changeLanguage, availableLanguages, setAvailableLanguages, getCurrentLanguageData } = useLanguage();
  const { t } = useTranslation();
  const searchTimeoutRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    const loadHeaderData = async () => {
      startLoading('header');
      try {
        console.log('Fetching header data...');
        const [navData, settingsData, languagesData] = await Promise.all([
          fetchHeaderNavItems(currentLanguage),
          fetchSiteSettings(currentLanguage),
          fetchActiveLanguages(),
        ]);
        
        console.log('Header nav data:', navData);
        console.log('Settings data:', settingsData);
        console.log('Languages data:', languagesData);
        
        if (!cancelled) {
          // Set languages
          if (languagesData && languagesData.length > 0) {
            setAvailableLanguages(languagesData);
          }
          
          // Set default nav items if none returned
          if (navData && navData.length > 0) {
            setNavItems(navData);
          } else {
            // Use default nav items if database is empty
            setNavItems([
              { id: 1, name: 'الرئيسية', route: '/' },
              { id: 2, name: 'الخدمات', route: '/services' },
              { id: 3, name: 'من نحن', route: '/about-us' },
              { id: 4, name: 'تواصل معنا', route: '/contact-us' },
            ]);
          }
          
          if (settingsData) {
            setSiteSettings({
              phone: settingsData.phone || '+966 XX XXX XXXX',
              contact_email: settingsData.contact_email || 'info@shorian-med.com',
            });
          }
        }
      } catch (error) {
        console.error('Error fetching header data:', error);
        // Set default nav items on error
        if (!cancelled) {
          setNavItems([
            { id: 1, name: 'الرئيسية', route: '/' },
            { id: 2, name: 'الخدمات', route: '/services' },
            { id: 3, name: 'من نحن', route: '/about-us' },
            { id: 4, name: 'تواصل معنا', route: '/contact-us' },
          ]);
        }
      } finally {
        if (!cancelled) {
          stopLoading('header');
        }
      }
    };
    
    loadHeaderData();
    
    return () => {
      cancelled = true;
      stopLoading('header'); // Ensure loading is stopped on unmount
    };
  }, [currentLanguage]); // Re-run when language changes

  const handleLanguageClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleLanguageClose = () => {
    setAnchorEl(null);
  };

  const handleLanguageSelect = (languageCode) => {
    changeLanguage(languageCode);
    handleLanguageClose();
  };

  const handleSearchChange = (event) => {
    const value = event.target.value;
    setSearchValue(value);

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // If user cleared the search and we're on search page, go back home
    if (value.trim().length === 0 && location.pathname === '/search') {
      navigate('/');
      return;
    }

    // Navigate to search page after typing 2 or more characters
    if (value.trim().length >= 2) {
      searchTimeoutRef.current = setTimeout(() => {
        navigate(`/search?q=${encodeURIComponent(value.trim())}`);
      }, 500);
    }
  };

  const handleSearchSubmit = () => {
    if (searchValue.trim().length > 0) {
      navigate(`/search?q=${encodeURIComponent(searchValue.trim())}`);
    }
  };

  const handleSearchKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleSearchSubmit();
    }
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const handleNavClick = (route) => {
    if (route && route !== '#') {
      // Check if it's an external URL
      if (route.startsWith('http://') || route.startsWith('https://')) {
        window.open(route, '_blank');
      } else {
        navigate(route);
      }
      setMobileMenuOpen(false);
    }
  };

  return (
    <>
      {/* Top Bar */}
      <Box sx={{ background: 'linear-gradient(135deg, #1565C0 0%, #0D47A1 100%)', py: 1 }}>
        <Container maxWidth="xl">
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              position: 'relative',
            }}
          >
            {/* Empty box for layout balance */}
            <Box sx={{ flex: 1 }} />
            
            {/* Centered Contact Info */}
            <Box sx={{
              textAlign: 'center',
              flex: 2,
            }}>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                {t('contact.phone_whatsapp', 'Phone/Whatsapp')}: {siteSettings.phone}
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                {t('contact.email_us', 'Email us')}: {siteSettings.contact_email}
              </Typography>
            </Box>
            
            {/* Language Selector */}
            <Box sx={{
              flex: 1,
              display: 'flex',
              justifyContent: 'flex-end'
            }}>
              <IconButton size="small" onClick={handleLanguageClick} sx={{ color: 'white' }}>
                <LanguageIcon fontSize="small" />
                <Typography variant="body2" sx={{ ml: 0.5, color: 'white' }}>
                  {getCurrentLanguageData()?.native_name || 'English'}
                </Typography>
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleLanguageClose}
              >
                {availableLanguages.map((lang) => (
                  <MenuItem
                    key={lang.code}
                    onClick={() => handleLanguageSelect(lang.code)}
                    selected={lang.code === currentLanguage}
                  >
                    {lang.native_name}
                  </MenuItem>
                ))}
              </Menu>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Main Navigation */}
      <AppBar
        position="sticky"
        sx={{
          background: 'linear-gradient(120deg, #0b6b3b 0%, #108a4d 50%, #1f9d5f 100%)',
          backgroundSize: '220% 220%',
          animation: 'headerFlow 12s ease-in-out infinite',
          boxShadow: '0 10px 24px rgba(11,107,59,0.32)',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            inset: '-40% -10% auto -10%',
            height: '220px',
            background: 'radial-gradient(circle at 30% 35%, rgba(255,255,255,0.18), transparent 55%)',
            animation: 'headerGlow 9s ease-in-out infinite',
            pointerEvents: 'none',
          },
          '@keyframes headerFlow': {
            '0%': { backgroundPosition: '0% 50%' },
            '50%': { backgroundPosition: '100% 50%' },
            '100%': { backgroundPosition: '0% 50%' },
          },
          '@keyframes headerGlow': {
            '0%': { transform: 'translateX(-6%) scale(1)', opacity: 0.65 },
            '50%': { transform: 'translateX(4%) scale(1.06)', opacity: 1 },
            '100%': { transform: 'translateX(-6%) scale(1)', opacity: 0.65 },
          },
          '@keyframes shorianMove': {
            '0%': { transform: 'translateX(100%)' },
            '100%': { transform: 'translateX(-100%)' },
          },
        }}
      >
        <Container maxWidth="xl">
          <Box sx={{ py: 3, position: 'relative', zIndex: 1 }}>
            {/* Logo - Centered */}
            <Box 
              sx={{
                textAlign: 'center',
                mb: 4.75,
                cursor: 'pointer',
                maxWidth: 760,
                mx: 'auto',
                px: { xs: 2, md: 3 },
                py: { xs: 1.5, md: 2 },
                transform: 'translateY(-6px)',
                borderRadius: 3,
                border: '1px solid rgba(255,255,255,0.28)',
                background: 'linear-gradient(180deg, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0.08) 100%)',
                backdropFilter: 'blur(3px)',
              }}
              onClick={() => navigate('/')}
            >
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 800,
                  fontSize: { xs: '2rem', md: '2.5rem' },
                  color: '#FFFFFF',
                  letterSpacing: 0,
                  lineHeight: 1.25,
                  wordBreak: 'keep-all',
                  textShadow: '0 6px 14px rgba(0,0,0,0.24)',
                }}
              >
                شريان
              </Typography>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 700,
                  fontSize: { xs: '1.2rem', md: '1.5rem' },
                  color: '#E8FFF1',
                  letterSpacing: { xs: '1px', md: '2px' },
                }}
              >
                SHORYAN MEDICAL
              </Typography>
              <Typography
                variant="subtitle1"
                sx={{
                  mt: 1,
                  mb: 0.5,
                  color: 'rgba(255,255,255,0.9)',
                  fontSize: { xs: '1.05rem', md: '1.25rem' },
                  fontWeight: 700,
                  letterSpacing: '0.5px'
                }}
              >
                شريكك الموثوق في المعدات الطبية
              </Typography>
            </Box>

            <Box
              sx={{
                mt: 0.5,
                mb: 2.5,
                height: { xs: 38, md: 40 },
                borderRadius: '999px',
                border: '1px solid rgba(255,255,255,0.35)',
                background: 'rgba(255,255,255,0.12)',
                position: 'relative',
                overflow: 'hidden',
                backdropFilter: 'blur(3px)',
              }}
            >
              <Typography
                sx={{
                  position: 'absolute',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  whiteSpace: 'nowrap',
                  color: '#FFFFFF',
                  fontWeight: 800,
                  letterSpacing: { xs: '1px', md: '1.5px' },
                  fontSize: { xs: '0.85rem', md: '0.95rem' },
                  textTransform: 'uppercase',
                  animation: 'shorianMove 13s linear infinite',
                  textShadow: '0 4px 12px rgba(0,0,0,0.22)',
                }}
              >
                SHORYAN MEDICAL • SHORYAN MEDICAL • SHORYAN MEDICAL • SHORYAN MEDICAL • SHORYAN MEDICAL
              </Typography>
            </Box>

            {/* Desktop Navigation */}
            {!isMobile ? (
              <>
                {/* Navigation Items - 2 Lines */}
                <Box sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 1.5,
                }}>
                  {/* First Line of Navigation */}
                  <Box sx={{ display: 'flex', gap: 3, alignItems: 'center' }}>
                    {navItems.slice(0, 7).map((item) => (
                      <Typography
                        key={item.id}
                        onClick={() => handleNavClick(item.route)}
                        sx={{
                          color: '#ffffff',
                          cursor: item.route && item.route !== '#' ? 'pointer' : 'default',
                          fontSize: '0.9rem',
                          fontWeight: 700,
                          '&:hover': {
                            color: '#ffffff',
                            textDecoration: item.route && item.route !== '#' ? 'underline' : 'none',
                            textDecorationThickness: '2px',
                            textUnderlineOffset: '3px',
                            opacity: item.route && item.route !== '#' ? 0.8 : 1,
                          },
                        }}
                      >
                        {item.name}
                      </Typography>
                    ))}
                  </Box>
                  
                  {/* Second Line of Navigation */}
                  <Box sx={{ display: 'flex', gap: 3, alignItems: 'center' }}>
                    {navItems.slice(7).map((item) => (
                      <Typography
                        key={item.id}
                        onClick={() => handleNavClick(item.route)}
                        sx={{
                          color: '#ffffff',
                          cursor: item.route && item.route !== '#' ? 'pointer' : 'default',
                          fontSize: '0.9rem',
                          fontWeight: 700,
                          '&:hover': {
                            color: '#ffffff',
                            textDecoration: item.route && item.route !== '#' ? 'underline' : 'none',
                            textDecorationThickness: '2px',
                            textUnderlineOffset: '3px',
                            opacity: item.route && item.route !== '#' ? 0.8 : 1,
                          },
                        }}
                      >
                        {item.name}
                      </Typography>
                    ))}
                    {/* Search Box and Cart Icon */}
                    <Box sx={{ display: 'flex', gap: 1, ml: 0.5, alignItems: 'center' }}>
                      <TextField
                        size="small"
                        placeholder={t('search.placeholder', 'Search products...')}
                        value={searchValue}
                        onChange={handleSearchChange}
                        onKeyPress={handleSearchKeyPress}
                        sx={{
                          width: '200px',
                          '& .MuiOutlinedInput-root': {
                            height: '32px',
                            backgroundColor: 'rgba(255,255,255,0.97)',
                            '& fieldset': {
                              borderColor: 'rgba(255,255,255,0.95)',
                              borderWidth: '1px',
                            },
                            '&:hover fieldset': {
                              borderColor: '#ffffff',
                              borderWidth: '2px',
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: '#ffffff',
                              borderWidth: '2px',
                            },
                          },
                        }}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                edge="end"
                                onClick={handleSearchSubmit}
                                size="small"
                                sx={{
                                  p: 0.5,
                                  color: '#0b6b3b',
                                  '&:hover': {
                                    backgroundColor: 'rgba(11, 107, 59, 0.08)',
                                  },
                                }}
                              >
                                <SearchIcon fontSize="small" />
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Box>
                  </Box>
                </Box>
              </>
            ) : (
              <>
                {/* Mobile Layout */}
                <Box sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 2,
                  mt: -2,
                }}>
                  {/* Search Box */}
                  <TextField
                    size="small"
                    placeholder={t('search.placeholder', 'Search products...')}
                    value={searchValue}
                    onChange={handleSearchChange}
                    onKeyPress={handleSearchKeyPress}
                    sx={{
                      width: '250px',
                      '& .MuiOutlinedInput-root': {
                        height: '36px',
                        backgroundColor: 'rgba(255,255,255,0.97)',
                        '& fieldset': {
                          borderColor: 'rgba(255,255,255,0.95)',
                          borderWidth: '1px',
                        },
                        '&:hover fieldset': {
                          borderColor: '#ffffff',
                          borderWidth: '2px',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#ffffff',
                          borderWidth: '2px',
                        },
                      },
                    }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            edge="end"
                            onClick={handleSearchSubmit}
                            size="small"
                            sx={{
                              p: 0.5,
                              color: '#0b6b3b',
                              '&:hover': {
                                backgroundColor: 'rgba(11, 107, 59, 0.08)',
                              },
                            }}
                          >
                            <SearchIcon />
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                  
                  {/* Menu Icon */}
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton
                      sx={{ color: '#ffffff' }}
                      onClick={() => setMobileMenuOpen(true)}
                    >
                      <MenuIcon />
                    </IconButton>
                  </Box>
                </Box>
              </>
            )}
          </Box>
        </Container>
      </AppBar>

      {/* Mobile Menu Drawer */}
      <Drawer
        anchor="right"
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      >
        <Box sx={{ width: 250 }}>
          <List>
            {navItems.map((item) => (
              <React.Fragment key={item.id}>
                <ListItem
                  button
                  onClick={() => handleNavClick(item.route)}
                  disabled={!item.route || item.route === '#'}
                  sx={{
                    '&:hover': {
                      backgroundColor: item.route && item.route !== '#' ? 'primary.main' : 'transparent',
                      color: item.route && item.route !== '#' ? 'white' : 'inherit',
                    },
                  }}
                >
                  <ListItemText primary={item.name} />
                </ListItem>
                <Divider />
              </React.Fragment>
            ))}
          </List>
        </Box>
      </Drawer>
    </>
  );
};

export default Header;