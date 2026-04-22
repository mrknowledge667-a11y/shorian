// src/admin/Dashboard.js
import React, { useMemo, useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  CssBaseline,
  Divider,
  Button,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Home as HomeIcon,
  BrandingWatermark as BrandingIcon,
  Category as CategoryIcon,
  Inventory2 as ProductsIcon,
  MiscellaneousServices as ServicesIcon,
  Info as AboutIcon,
  ContactMail as ContactIcon,
  ViewList as CollapsibleIcon,
  Logout as LogoutIcon,
  Menu as MenuIcon,
  Copyright as CopyrightIcon,
  Translate as TranslateIcon,
  ShoppingCart as OrdersIcon,
  ImageSearch as ProductDetailsIcon,
  SmartToy as ChatbotIcon,
  Article as BlogIcon,
  Category as BlogCategoryIcon,
  LocalOffer as BlogTagIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { signOut } from '../api/supabaseClient';
import { AdminLanguageProvider } from '../contexts/AdminLanguageContext';

const drawerWidth = 260;

const navItems = [
  { label: 'Overview', icon: <DashboardIcon />, path: '/admin' },
  { label: 'Languages', icon: <TranslateIcon />, path: '/admin/languages' },
  { label: 'Landing Settings', icon: <HomeIcon />, path: '/admin/landing' },
  { label: 'Header Navigation', icon: <MenuIcon />, path: '/admin/header' },
  { label: 'Footer Settings', icon: <CopyrightIcon />, path: '/admin/footer' },
  { label: 'Brands', icon: <BrandingIcon />, path: '/admin/brands' },
  { label: 'Categories', icon: <CategoryIcon />, path: '/admin/categories' },
  { label: 'Products', icon: <ProductsIcon />, path: '/admin/products' },
  { label: 'Product Details', icon: <ProductDetailsIcon />, path: '/admin/product-details' },
  { label: 'Orders', icon: <OrdersIcon />, path: '/admin/orders' },
  { label: 'Services', icon: <ServicesIcon />, path: '/admin/services' },
  { label: 'About Us', icon: <AboutIcon />, path: '/admin/about' },
  { label: 'Contact Us', icon: <ContactIcon />, path: '/admin/contact' },
  { label: 'Collapsible', icon: <CollapsibleIcon />, path: '/admin/collapsible' },
  { label: 'Chatbot Settings', icon: <ChatbotIcon />, path: '/admin/chatbot' },
  { label: 'Blog Posts', icon: <BlogIcon />, path: '/admin/blog-posts' },
  { label: 'Blog Categories', icon: <BlogCategoryIcon />, path: '/admin/blog-categories' },
  { label: 'Blog Tags', icon: <BlogTagIcon />, path: '/admin/blog-tags' },
];

function Dashboard() {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const activeIndex = useMemo(
    () => navItems.findIndex((n) => n.path === location.pathname),
    [location.pathname]
  );

  const handleNav = (path) => {
    navigate(path);
    if (!isDesktop) {
      setMobileOpen(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/admin/login', { replace: true });
  };

  return (
    <AdminLanguageProvider>
      <Box sx={{ display: 'flex', minHeight: '100vh', width: '100%' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        color="default"
        elevation={1}
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: 'white',
        }}
      >
        <Toolbar>
          {!isDesktop && (
            <IconButton
              color="primary"
              edge="start"
              onClick={() => setMobileOpen(true)}
              sx={{ mr: 1 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700, color: 'primary.main' }}>
            WiMed Admin
          </Typography>
          <Button
            startIcon={<LogoutIcon />}
            color="primary"
            variant="outlined"
            onClick={handleLogout}
          >
            Sign Out
          </Button>
        </Toolbar>
      </AppBar>

      <Drawer
        variant={isDesktop ? 'permanent' : 'temporary'}
        open={isDesktop ? true : mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          width: isDesktop ? drawerWidth : 0,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto' }}>
          <List>
            {navItems.map((item, index) => (
              <ListItemButton
                key={item.path}
                selected={index === activeIndex}
                onClick={() => handleNav(item.path)}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            ))}
          </List>
          <Divider />
          <List>
            <ListItemButton
              onClick={() => {
                navigate('/');
                if (!isDesktop) {
                  setMobileOpen(false);
                }
              }}
            >
              <ListItemIcon>
                <HomeIcon />
              </ListItemIcon>
              <ListItemText primary="Back to Site" />
            </ListItemButton>
          </List>
        </Box>
      </Drawer>

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            minWidth: 0,
            maxWidth: 'none',
            width: '100%',
            p: { xs: 1, sm: 1.5, md: 2.5 },
          }}
        >
          <Toolbar />
          <Box
            sx={{
              width: '100%',
              maxWidth: 'none',
              mx: 0,
              border: '3px solid #108a4d',
              borderRadius: 3,
              backgroundColor: '#ffffff',
              boxShadow: '0 0 0 1px rgba(16,138,77,0.16), 0 8px 22px rgba(16,138,77,0.08)',
              p: { xs: 0.9, sm: 1.25, md: 2 },
            }}
          >
            <Outlet />
          </Box>
        </Box>
      </Box>
    </AdminLanguageProvider>
  );
}

export default Dashboard;