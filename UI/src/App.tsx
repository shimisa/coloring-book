import React, { Suspense, useState, useEffect, useTransition } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Box, Container, CssBaseline, CircularProgress } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import rtlPlugin from 'stylis-plugin-rtl';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import { prefixer } from 'stylis';
import { AppProvider, useApp } from './context/AppContext';
import { SelectedImage } from './types/upload.types';

// Lazy load components
const Header = React.lazy(() => import('./components/layout/Header'));
const Footer = React.lazy(() => import('./components/layout/Footer'));
const Login = React.lazy(() => import('./components/auth/Login'));
const Register = React.lazy(() => import('./components/auth/Register'));
const EmailConfirmation = React.lazy(() => import('./components/auth/EmailConfirmation'));
const ImageUploader = React.lazy(() => import('./components/upload/ImageUploader'));
const ImageGallery = React.lazy(() => import('./components/gallery/ImageGallery'));
const ShippingForm = React.lazy(() => import('./components/shipping/ShippingForm'));
const Toast = React.lazy(() => import('./components/shared/Toast'));
const Home = React.lazy(() => import('./pages/Home'));

// Create RTL cache and theme
const cacheRtl = createCache({
  key: 'muirtl',
  stylisPlugins: [prefixer, rtlPlugin],
});

const theme = createTheme({
  direction: 'rtl',
  typography: {
    fontFamily: 'Rubik, Arial, sans-serif',
  },
  palette: {
    primary: {
      main: '#4CAF50',
      light: '#81C784',
      dark: '#388E3C',
    },
    secondary: {
      main: '#FFC107',
      light: '#FFD54F',
      dark: '#FFA000',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        rounded: {
          borderRadius: '12px',
        },
      },
    },
  },
});

const LoadingFallback = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
    <CircularProgress />
  </Box>
);

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isInitialized } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const [hasRedirected, setHasRedirected] = useState(false);

  useEffect(() => {
    if (isInitialized && !isAuthenticated && !hasRedirected) {
      setHasRedirected(true); // Prevent multiple redirects
      navigate('/login', { 
        replace: true,
        state: { from: location.pathname === '/login' ? '/' : location }
      });
    }
  }, [isAuthenticated, isInitialized, navigate, location, hasRedirected]);

  if (!isInitialized) {
    return <LoadingFallback />;
  }

  return isAuthenticated ? <>{children}</> : null;
};

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isInitialized } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    if (!isInitialized) {
      return; // Wait for auth state to be initialized
    }

    if (!isRedirecting) {
      if (!isAuthenticated) {
        setIsRedirecting(true);
        navigate('/login', { 
          replace: true,
          state: { from: location }
        });
      }
    }
  }, [isAuthenticated, navigate, location, isRedirecting, isInitialized]);

  if (!isInitialized) {
    return <LoadingFallback />;
  }

  return isAuthenticated ? <>{children}</> : null;
};

const AppContent: React.FC = () => {
  const [isPending, startTransition] = useTransition();
  const navigate = useNavigate();
  const { showToast, selectedImages, setSelectedImages, toastOpen, toastMessage, toastSeverity, handleCloseToast } = useApp();

  const handleImagesSelected = (images: SelectedImage[]) => {
    if (images.length === 0) {
      navigate('/upload');
      return;
    }
    startTransition(() => {
      setSelectedImages(images);
      navigate('/shipping');
    });
  };

  const handleOrderComplete = (orderId: string) => {
    startTransition(() => {
      setSelectedImages([]);
      showToast('ההזמנה הושלמה בהצלחה!', 'success');
      navigate('/gallery');
    });
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column',
      minHeight: '100vh',
      backgroundColor: '#f5f5f5'
    }}>
      <CssBaseline />
      <Header />
      
      <Container component="main" sx={{ flex: 1, py: 4 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/register/confirm-email" element={<EmailConfirmation />} />
          <Route path="/confirm-email" element={<EmailConfirmation />} />
          <Route
            path="/upload"
            element={
              <PrivateRoute>
                <ImageUploader />
              </PrivateRoute>
            }
          />
          <Route
            path="/gallery"
            element={
              <PrivateRoute>
                <ImageGallery onImagesSelected={handleImagesSelected} />
              </PrivateRoute>
            }
          />
          <Route
            path="/shipping"
            element={
              <ProtectedRoute>
                <ShippingForm 
                  selectedImages={selectedImages}
                  onOrderComplete={handleOrderComplete}
                />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Container>

      <Footer />
      
      <Suspense fallback={null}>
        <Toast
          open={toastOpen}
          message={toastMessage}
          severity={toastSeverity}
          onClose={handleCloseToast}
          autoHideDuration={4000}
        />
      </Suspense>
    </Box>
  );
};

function App() {
  return (
    <CacheProvider value={cacheRtl}>
      <ThemeProvider theme={theme}>
        <AppProvider>
          <Suspense fallback={<LoadingFallback />}>
            <AppContent />
          </Suspense>
        </AppProvider>
      </ThemeProvider>
    </CacheProvider>
  );
}

export default App;