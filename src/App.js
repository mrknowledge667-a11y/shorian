import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { LoadingProvider } from './contexts/LoadingContext';
import { LanguageProvider } from './contexts/LanguageContext';
import LoadingSpinner from './components/LoadingSpinner';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import ProductCategories from './components/ProductCategories';
import NewArrivals from './components/NewArrivals';
import MapLocation from './components/MapLocation';
import TrustedBrands from './components/TrustedBrands';
import CollapsibleContent from './components/CollapsibleContent';
import Footer from './components/Footer';
import PageTransition from './components/PageTransition';
import FloatingActions from './components/FloatingActions';

// Import category pages
import Anaesthesia from './pages/Anaesthesia';
import EndoscopyLaparoscopy from './pages/EndoscopyLaparoscopy';
import Electrosurgical from './pages/Electrosurgical';
import Ventilators from './pages/Ventilators';
import Endoscopes from './pages/Endoscopes';
import PatientMonitors from './pages/PatientMonitors';
import ScrollToTop from './components/ScrollToTop';
import DynamicProductPage from './pages/DynamicProductPage';

// Import new pages
import Services from './pages/Services';
import AboutUs from './pages/AboutUs';
import ContactUs from './pages/ContactUs';
import Search from './pages/Search';
import ProductDetails from './pages/ProductDetails';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';

/* Admin imports */
import AdminLogin from './admin/Login';
import ProtectedRoute from './admin/ProtectedRoute';
import AdminDashboard from './admin/Dashboard';
import AdminOverview from './admin/pages/Overview';
import AdminLanding from './admin/pages/LandingSettings';
import AdminHeader from './admin/pages/Header';
import AdminFooter from './admin/pages/Footer';
import AdminBrands from './admin/pages/Brands';
import AdminCategories from './admin/pages/Categories';
import AdminProducts from './admin/pages/Products';
import AdminServices from './admin/pages/Services';
import AdminAbout from './admin/pages/About';
import AdminContact from './admin/pages/Contact';
import AdminCollapsible from './admin/pages/Collapsible';
import AdminLanguages from './admin/pages/Languages';
import AdminOrders from './admin/pages/Orders';
import AdminProductDetails from './admin/pages/ProductDetails';
import AdminChatbotSettings from './admin/pages/ChatbotSettings';
import AdminBlogPosts from './admin/pages/BlogPosts';
import AdminBlogCategories from './admin/pages/BlogCategories';
import AdminBlogTags from './admin/pages/BlogTags';

const theme = createTheme({
  direction: document.documentElement.dir === 'rtl' ? 'rtl' : 'ltr',
  palette: {
    primary: {
      main: '#1565C0', // Deep Medical Blue
      light: '#42A5F5',
      dark: '#0D47A1',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#2E7D32', // Healthcare Green
      light: '#4CAF50',
      dark: '#1B5E20',
      contrastText: '#FFFFFF',
    },
    info: {
      main: '#0288D1', // Sky Blue
      light: '#03A9F4',
      dark: '#01579B',
    },
    success: {
      main: '#43A047', // Fresh Green
      light: '#66BB6A',
      dark: '#2E7D32',
    },
    text: {
      primary: '#1A237E', // Deep Blue-Indigo
      secondary: '#455A64',
    },
    background: {
      default: '#FAFBFC',
      paper: '#FFFFFF',
    },
  },
  typography: {
    fontFamily: '"Cairo", "Tajawal", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 600,
    },
  },
});

// Home page component
const HomePage = () => {
  return (
    <>
      <HeroSection />
      <ProductCategories />
      <NewArrivals />
      <TrustedBrands />
      <CollapsibleContent />
      <MapLocation />
      <Footer />
    </>
  );
};

 // Component to conditionally render Header
const AppContent = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isProductDetailsRoute = location.pathname.startsWith('/product/');

  return (
    <>
      <ScrollToTop />
      {!isAdminRoute && <FloatingActions />}
      {!isAdminRoute && !isProductDetailsRoute && <Header />}
      <PageTransition>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/search" element={<Search />} />
          {/* Keep existing routes for backward compatibility */}
          <Route path="/anaesthesia" element={<Anaesthesia />} />
          <Route path="/endoscopy-laparoscopy" element={<EndoscopyLaparoscopy />} />
          <Route path="/electrosurgical" element={<Electrosurgical />} />
          <Route path="/ventilators" element={<Ventilators />} />
          <Route path="/endoscopes" element={<Endoscopes />} />
          <Route path="/patient-monitors" element={<PatientMonitors />} />
          <Route path="/services" element={<Services />} />
          <Route path="/about-us" element={<AboutUs />} />
          <Route path="/contact-us" element={<ContactUs />} />
          <Route path="/product/:productId" element={<ProductDetails />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          
          {/* Dynamic route for custom navigation items - catches any unmatched route */}
          <Route path="/:slug" element={<DynamicProductPage />} />

          {/* Admin routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminOverview />} />
            <Route path="languages" element={<AdminLanguages />} />
            <Route path="landing" element={<AdminLanding />} />
            <Route path="header" element={<AdminHeader />} />
            <Route path="footer" element={<AdminFooter />} />
            <Route path="brands" element={<AdminBrands />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="product-details" element={<AdminProductDetails />} />
            <Route path="services" element={<AdminServices />} />
            <Route path="about" element={<AdminAbout />} />
            <Route path="contact" element={<AdminContact />} />
            <Route path="collapsible" element={<AdminCollapsible />} />
            <Route path="chatbot" element={<AdminChatbotSettings />} />
            <Route path="blog-posts" element={<AdminBlogPosts />} />
            <Route path="blog-categories" element={<AdminBlogCategories />} />
            <Route path="blog-tags" element={<AdminBlogTags />} />
          </Route>
        </Routes>
      </PageTransition>
    </>
  );
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LoadingProvider>
        <LanguageProvider>
          <Router>
            <AppContent />
            <LoadingSpinner />
          </Router>
        </LanguageProvider>
      </LoadingProvider>
    </ThemeProvider>
  );
}

export default App;
