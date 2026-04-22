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
      <Box sx={{ background: 'linear-gradient(135deg, #1565C0 0%, #0D47A1 100%)', py: 0.2 }}>
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
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.95)', fontSize: { xs: '0.74rem', md: '0.84rem' }, fontWeight: 800, lineHeight: 1.15 }}>
                {t('contact.phone_whatsapp', 'Phone/Whatsapp')}: {siteSettings.phone} | {t('contact.email_us', 'Email us')}: {siteSettings.contact_email}
              </Typography>
            </Box>
            
            {/* Language Selector */}
            <Box sx={{
              flex: 1,
              display: 'flex',
              justifyContent: 'flex-end'
            }}>
              <IconButton size="small" onClick={handleLanguageClick} sx={{ color: 'white', p: 0.45 }}>
                <LanguageIcon sx={{ fontSize: '1.05rem' }} />
                <Typography variant="body2" sx={{ ml: 0.4, color: 'white', fontSize: '0.78rem', fontWeight: 800 }}>
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
        position="static"
        sx={{
          background: 'linear-gradient(120deg, #0b6b3b 0%, #108a4d 50%, #1f9d5f 100%)',
          boxShadow: '0 2px 8px rgba(11,107,59,0.2)',
          overflow: 'hidden',
          '@keyframes shorianMove': {
            '0%': { transform: 'translateX(100%)' },
            '100%': { transform: 'translateX(-100%)' },
          },
          '&::before': {
            display: 'none',
          },
        }}
      >
        <Container maxWidth="xl">
          <Box sx={{ py: { xs: 0.65, md: 0.75 }, position: 'relative', zIndex: 1 }}>
            {/* Logo - Centered */}
            <Box 
              sx={{
                textAlign: 'center',
                mb: 0.65,
                cursor: 'pointer',
                maxWidth: 320,
                mx: 'auto',
                px: { xs: 0.7, md: 1 },
                py: { xs: 0.35, md: 0.45 },
                borderRadius: 2,
                border: '1px solid rgba(255,255,255,0.28)',
                background: 'linear-gradient(180deg, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0.08) 100%)',
                backdropFilter: 'blur(3px)',
              }}
              onClick={() => navigate('/')}
            >
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 900,
                  fontSize: { xs: '1.15rem', md: '1.35rem' },
                  color: '#FFFFFF',
                  letterSpacing: 0,
                  lineHeight: 1.1,
                  wordBreak: 'keep-all',
                  textShadow: '0 2px 7px rgba(0,0,0,0.16)',
                }}
              >
                شريان
              </Typography>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 800,
                  fontSize: { xs: '0.74rem', md: '0.86rem' },
                  color: '#E8FFF1',
                  letterSpacing: { xs: '0.5px', md: '0.9px' },
                }}
              >
                SHORYAN MEDICAL
              </Typography>
              <Typography
                variant="subtitle1"
                sx={{
                  mt: 0.15,
                  mb: 0,
                  color: 'rgba(255,255,255,0.9)',
                  fontSize: { xs: '0.64rem', md: '0.74rem' },
                  fontWeight: 700,
                  letterSpacing: '0.35px'
                }}
              >
                شريكك الموثوق في المعدات الطبية
              </Typography>
            </Box>

            <Box
              sx={{
                mt: 0,
                mb: 0.6,
                height: { xs: 18, md: 20 },
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
                  letterSpacing: { xs: '0.5px', md: '0.7px' },
                  fontSize: { xs: '0.68rem', md: '0.78rem' },
                  textTransform: 'uppercase',
                  textShadow: '0 1px 5px rgba(0,0,0,0.18)',
                  animation: 'shorianMove 12s linear infinite',
                }}
              >
                SHORYAN MEDICAL • SHORYAN MEDICAL • SHORYAN MEDICAL
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
                  gap: 0.45,
                }}>
                  {/* First Line of Navigation */}
                  <Box sx={{ display: 'flex', gap: 1.1, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
                    {navItems.slice(0, 7).map((item) => (
                      <Typography
                        key={item.id}
                        onClick={() => handleNavClick(item.route)}
                        sx={{
                          color: '#ffffff',
                          cursor: item.route && item.route !== '#' ? 'pointer' : 'default',
                          fontSize: '0.9rem',
                          fontWeight: 800,
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
                  <Box sx={{ display: 'flex', gap: 1.1, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
                    {navItems.slice(7).map((item) => (
                      <Typography
                        key={item.id}
                        onClick={() => handleNavClick(item.route)}
                        sx={{
                          color: '#ffffff',
                          cursor: item.route && item.route !== '#' ? 'pointer' : 'default',
                          fontSize: '0.9rem',
                          fontWeight: 800,
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
                    <Box sx={{ display: 'flex', gap: 0.6, ml: 0.3, alignItems: 'center' }}>
                      <TextField
                        size="small"
                        placeholder={t('search.placeholder', 'Search products...')}
                        value={searchValue}
                        onChange={handleSearchChange}
                        onKeyPress={handleSearchKeyPress}
                        sx={{
                          width: '160px',
                          '& .MuiOutlinedInput-root': {
                            height: '30px',
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
                  gap: 0.6,
                    mt: 0,
                }}>
                  {/* Search Box */}
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