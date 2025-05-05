import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  Button,
  Alert,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { useApp } from '../../context/AppContext';
import { authService } from '../../services/auth.service';

const ConfirmationContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  maxWidth: 400,
  margin: '0 auto',
  marginTop: theme.spacing(4),
  borderRadius: '12px',
}));

interface IconContainerProps {
  success?: boolean;
}

const IconContainer = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'success',
})<IconContainerProps>(({ theme, success }) => ({
  backgroundColor: success ? theme.palette.success.main : theme.palette.primary.main,
  borderRadius: '50%',
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  transition: 'background-color 0.3s ease',
}));

const EmailConfirmation = () => {
  const [isVerifying, setIsVerifying] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useApp();

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const params = new URLSearchParams(location.search);
        const token = params.get('token');
        console.log('Current URL:', window.location.href);
        console.log('Token from URL:', token);

        if (!token) {
          setError('קישור לא תקין. אנא בדקו את הקישור שנשלח אליכם במייל.');
          return;
        }

        await authService.confirmEmail(token);
        setSuccess(true);
        showToast('האימייל אומת בהצלחה! אנא התחברו למערכת', 'success');
        // Short delay before navigation to let the user see the success message
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } catch (err: any) {
        console.error('Email confirmation error details:', err);
        setError(err.message || 'שגיאה באימות האימייל. אנא נסו שוב מאוחר יותר.');
        showToast('שגיאה באימות האימייל', 'error');
      } finally {
        setIsVerifying(false);
      }
    };

    verifyEmail();
  }, [location, navigate, showToast]);

  return (
    <ConfirmationContainer>
      {isVerifying ? (
        <>
          <CircularProgress size={50} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            מאמת את האימייל...
          </Typography>
        </>
      ) : error ? (
        <>
          <IconContainer>
            <ErrorOutlineIcon sx={{ fontSize: 40, color: 'white' }} />
          </IconContainer>
          <Typography variant="h6" gutterBottom>
            שגיאה באימות
          </Typography>
          <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
            {error}
          </Alert>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/login')}
          >
            חזרה לדף ההתחברות
          </Button>
        </>
      ) : (
        <>
          <IconContainer success>
            <MarkEmailReadIcon sx={{ fontSize: 40, color: 'white' }} />
          </IconContainer>
          <Typography variant="h6" gutterBottom>
            האימייל אומת בהצלחה!
          </Typography>
          <Alert severity="success" sx={{ mt: 2, mb: 2 }}>
            החשבון שלך אומת בהצלחה. כעת תוכל להתחבר למערכת.
          </Alert>
          <Typography color="text.secondary" align="center" sx={{ mb: 2 }}>
            מיד תועברו לדף ההתחברות...
          </Typography>
        </>
      )}
    </ConfirmationContainer>
  );
};

export default EmailConfirmation;