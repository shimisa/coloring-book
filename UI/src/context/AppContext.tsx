import React, { createContext, useContext, useState, useCallback, useTransition, startTransition, useEffect } from 'react';
import type { AlertColor } from '@mui/material';
import { authService } from '../services/auth.service';
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
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
          // Try to refresh the auth state if a user exists
          await axios.post(`${process.env.REACT_APP_API_URL || 'http://localhost:8080'}/api/user-auth/refresh`, {}, { 
            withCredentials: true 
          });
          const parsedUser = JSON.parse(savedUser);
          startTransition(() => {
            setUser(parsedUser);
            setIsAuthenticated(true);
          });
        }
      } catch (error) {
        // If refresh fails, clear the stored user data
        localStorage.removeItem('currentUser');
        startTransition(() => {
          setUser(null);
          setIsAuthenticated(false);
        });
      } finally {
        setIsInitialized(true);
      }
    };

    initializeAuth();

    const handleUserUpdate = () => {
      const savedUser = localStorage.getItem('currentUser');
      startTransition(() => {
        if (savedUser) {
          setUser(JSON.parse(savedUser));
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      });
    };

    window.addEventListener('user-update', handleUserUpdate);
    return () => {
      window.removeEventListener('user-update', handleUserUpdate);
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
    startTransition(() => {
      setToastOpen(false);
    });
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
  };

  // Dynamically import Toast component to avoid circular dependency
  const Toast = React.lazy(() => import('../components/shared/Toast'));

  return (
    <AppContext.Provider value={value}>
      {children}
      <React.Suspense fallback={null}>
        <Toast
          open={toastOpen}
          message={toastMessage}
          severity={toastSeverity}
          onClose={handleCloseToast}
          autoHideDuration={4000}
        />
      </React.Suspense>
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