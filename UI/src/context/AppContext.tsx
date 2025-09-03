import React, { createContext, useContext, useState, useCallback, useTransition, startTransition, useEffect } from 'react';
import type { AlertColor } from '@mui/material';
import { CircularProgress } from '@mui/material';
import { authService } from '../services/auth.service';
import { SelectedImage } from '../types/upload.types';
import axios from 'axios';

interface ToastProps {
  open: boolean;
  message: string;
  severity: AlertColor;
  onClose: () => void;
  autoHideDuration?: number;
}

interface AppContextType {
  showToast: (message: string, severity: AlertColor) => void;
  isProcessing: boolean;
  setIsProcessing: (processing: boolean) => void;
  playSound: (soundName: 'upload-success' | 'magic-convert' | 'notification') => void;
  isAuthenticated: boolean;
  user: any | null;
  isInitialized: boolean;
  selectedImages: SelectedImage[];
  setSelectedImages: (images: SelectedImage[]) => void;
  // Toast state
  toastOpen: boolean;
  toastMessage: string;
  toastSeverity: AlertColor;
  handleCloseToast: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastSeverity, setToastSeverity] = useState<AlertColor>('info');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [selectedImages, setSelectedImages] = useState<SelectedImage[]>([]);
  const [isPending, startTransition] = useTransition();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    let initializationTimeout: NodeJS.Timeout;
    
    const initializeAuth = async () => {
      try {
        const savedUser = localStorage.getItem('currentUser');
        
        // First set the initial state from localStorage
        if (!savedUser) {
          if (mounted) {
            startTransition(() => {
              setUser(null);
              setIsAuthenticated(false);
              setIsInitialized(true);
              setIsReady(true);
            });
          }
          return;
        }

        // Parse saved user and set initial state
        const parsedUser = JSON.parse(savedUser);
        if (mounted) {
          startTransition(() => {
            setUser(parsedUser);
            setIsAuthenticated(Boolean(parsedUser?.authenticated));
          });
        }

        // Then try to refresh the auth state
        try {
          const refreshResult = await authService.refreshToken();
          if (mounted) {
            if (!refreshResult) {
              localStorage.removeItem('currentUser');
              startTransition(() => {
                setUser(null);
                setIsAuthenticated(false);
              });
            }
          }
        } catch (error) {
          if (mounted) {
            localStorage.removeItem('currentUser');
            startTransition(() => {
              setUser(null);
              setIsAuthenticated(false);
            });
          }
        } finally {
          if (mounted) {
            setIsInitialized(true);
            setIsReady(true);
          }
        }
      } catch (error) {
        if (mounted) {
          localStorage.removeItem('currentUser');
          startTransition(() => {
            setUser(null);
            setIsAuthenticated(false);
            setIsInitialized(true);
            setIsReady(true);
          });
        }
      }
    };

    // Set a small delay before initialization to ensure consistent state
    initializationTimeout = setTimeout(initializeAuth, 100);

    // Add axios response interceptor for auth errors
    const interceptor = axios.interceptors.response.use(
      response => response,
      async (error) => {
        if (error.response?.status === 401 && mounted) {
          localStorage.removeItem('currentUser');
          startTransition(() => {
            setUser(null);
            setIsAuthenticated(false);
          });
        }
        return Promise.reject(error);
      }
    );

    // Update auth state when storage changes
    const handleStorage = () => {
      if (!mounted) return;
      const savedUser = localStorage.getItem('currentUser');
      startTransition(() => {
        if (savedUser) {
          const parsedUser = JSON.parse(savedUser);
          setUser(parsedUser);
          setIsAuthenticated(Boolean(parsedUser?.authenticated));
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      });
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener('user-update', handleStorage);

    return () => {
      mounted = false;
      clearTimeout(initializationTimeout);
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('user-update', handleStorage);
      axios.interceptors.response.eject(interceptor);
    };
  }, []);

  const showToast = useCallback((message: string, severity: AlertColor) => {
    startTransition(() => {
      setToastMessage(message);
      setToastSeverity(severity);
      setToastOpen(true);
    });
  }, []);

  const handleCloseToast = useCallback(() => {
    setToastOpen(false);
  }, []);

  const playSound = useCallback((soundName: 'upload-success' | 'magic-convert' | 'notification') => {
    const audio = new Audio(`/sounds/${soundName}.mp3`);
    audio.play().catch(error => {
      console.error('Error playing sound:', error);
    });
  }, []);

  const value = {
    showToast,
    isProcessing,
    setIsProcessing,
    playSound,
    isAuthenticated,
    user,
    isInitialized,
    selectedImages,
    setSelectedImages,
    toastOpen,
    toastMessage,
    toastSeverity,
    handleCloseToast,
  };

  // Show loading state while initializing auth
  if (!isReady) {
    return <CircularProgress />;
  }

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};