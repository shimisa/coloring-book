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

const IconContainer = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  borderRadius: '50%',
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
}));

const EmailConfirmation = () => {
  const [isVerifying, setIsVerifying] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useApp();

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const params = new URLSearchParams(location.search);
        const token = params.get('token');

        if (!token) {
          setError('קישור לא תקין. אנא בדקו את הקישור שנשלח אליכם במייל.');
          return;
        }

        await authService.confirmEmail(token);
        showToast('האימייל אומת בהצלחה! אנא התחברו למערכת', 'success');
        // Short delay before navigation to let the user see the success message
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } catch (err) {
        setError('שגיאה באימות האימייל. אנא נסו שוב מאוחר יותר.');
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
          <IconContainer>
            <MarkEmailReadIcon sx={{ fontSize: 40, color: 'white' }} />
          </IconContainer>
          <Typography variant="h6" gutterBottom>
            האימייל אומת בהצלחה!
          </Typography>
          <Typography color="text.secondary" align="center" sx={{ mb: 2 }}>
            מיד תועברו לדף ההתחברות...
          </Typography>
        </>
      )}
    </ConfirmationContainer>
  );
};

export default EmailConfirmation;