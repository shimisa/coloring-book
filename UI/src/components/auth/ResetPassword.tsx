import React, { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Link,
  Alert,
  CircularProgress,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import LockResetIcon from '@mui/icons-material/LockReset';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { authService } from '../../services/auth.service';

const FormContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  maxWidth: 400,
  margin: '0 auto',
  marginTop: theme.spacing(4),
  borderRadius: '12px',
}));

const validationSchema = Yup.object({
  newPassword: Yup.string()
    .min(6, 'הסיסמה חייבת להכיל לפחות 6 תווים')
    .required('שדה חובה'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('newPassword')], 'הסיסמאות אינן תואמות')
    .required('שדה חובה'),
});

const ResetPassword = () => {
  const navigate = useNavigate();
  const { showToast } = useApp();
  const [searchParams] = useSearchParams();
  const [token, setToken] = useState<string | null>(null);
  const [isTokenValid, setIsTokenValid] = useState<boolean | null>(null);
  const [isPasswordReset, setIsPasswordReset] = useState(false);

  useEffect(() => {
    const tokenFromUrl = searchParams.get('token');
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
      setIsTokenValid(true); // We'll validate on submit
    } else {
      setIsTokenValid(false);
      showToast('קישור לא תקין או חסר', 'error');
    }
  }, [searchParams, showToast]);

  const formik = useFormik({
    initialValues: {
      newPassword: '',
      confirmPassword: '',
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      if (!token) {
        showToast('קישור לא תקין', 'error');
        return;
      }

      try {
        await authService.resetPassword(token, values.newPassword);
        setIsPasswordReset(true);
        showToast('הסיסמה שונתה בהצלחה!', 'success');
      } catch (error: any) {
        showToast(error.message || 'שגיאה באיפוס הסיסמה. אנא נסו שוב', 'error');
        if (error.message?.includes('תקין') || error.message?.includes('פג תוקפו')) {
          setIsTokenValid(false);
        }
      } finally {
        setSubmitting(false);
      }
    },
  });

  // Loading state while checking token
  if (isTokenValid === null) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Invalid token
  if (isTokenValid === false) {
    return (
      <Box sx={{ p: 3 }}>
        <FormContainer>
          <Box
            sx={{
              backgroundColor: 'error.main',
              borderRadius: '50%',
              p: 1,
              mb: 2,
            }}
          >
            <LockResetIcon sx={{ color: 'white' }} />
          </Box>

          <Typography component="h1" variant="h5" gutterBottom align="center">
            קישור לא תקין
          </Typography>

          <Alert severity="error" sx={{ mb: 3, width: '100%' }}>
            הקישור לאיפוס הסיסמה אינו תקין או שפג תוקפו. 
            אנא בקשו קישור חדש לאיפוס סיסמה.
          </Alert>

          <Button
            fullWidth
            variant="contained"
            onClick={() => navigate('/forgot-password')}
            sx={{ mb: 2 }}
          >
            בקש קישור חדש
          </Button>

          <Link 
            component="button" 
            type="button"
            onClick={() => navigate('/login')} 
            variant="body2"
            sx={{ cursor: 'pointer', textDecoration: 'underline' }}
          >
            חזרה לכניסה
          </Link>
        </FormContainer>
      </Box>
    );
  }

  // Password successfully reset
  if (isPasswordReset) {
    return (
      <Box sx={{ p: 3 }}>
        <FormContainer>
          <Box
            sx={{
              backgroundColor: 'success.main',
              borderRadius: '50%',
              p: 1,
              mb: 2,
            }}
          >
            <LockResetIcon sx={{ color: 'white' }} />
          </Box>

          <Typography component="h1" variant="h5" gutterBottom align="center">
            הסיסמה שונתה בהצלחה!
          </Typography>

          <Alert severity="success" sx={{ mb: 3, width: '100%' }}>
            הסיסמה שלכם שונתה בהצלחה. 
            כעת תוכלו להתחבר עם הסיסמה החדשה.
          </Alert>

          <Button
            fullWidth
            variant="contained"
            onClick={() => navigate('/login')}
          >
            התחבר עכשיו
          </Button>
        </FormContainer>
      </Box>
    );
  }

  // Reset password form
  return (
    <Box sx={{ p: 3 }}>
      <FormContainer>
        <Box
          sx={{
            backgroundColor: 'primary.main',
            borderRadius: '50%',
            p: 1,
            mb: 2,
          }}
        >
          <LockResetIcon sx={{ color: 'white' }} />
        </Box>

        <Typography component="h1" variant="h5" gutterBottom>
          איפוס סיסמה
        </Typography>

        <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
          הזינו את הסיסמה החדשה שלכם
        </Typography>

        <form onSubmit={formik.handleSubmit} style={{ width: '100%' }}>
          <TextField
            fullWidth
            margin="normal"
            id="newPassword"
            name="newPassword"
            label="סיסמה חדשה"
            type="password"
            value={formik.values.newPassword}
            onChange={formik.handleChange}
            error={formik.touched.newPassword && Boolean(formik.errors.newPassword)}
            helperText={formik.touched.newPassword && formik.errors.newPassword}
            dir="ltr"
            autoFocus
          />

          <TextField
            fullWidth
            margin="normal"
            id="confirmPassword"
            name="confirmPassword"
            label="אישור סיסמה חדשה"
            type="password"
            value={formik.values.confirmPassword}
            onChange={formik.handleChange}
            error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
            helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
            dir="ltr"
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            disabled={formik.isSubmitting}
            sx={{ mt: 3, mb: 2 }}
          >
            {formik.isSubmitting ? 'מעדכן סיסמה...' : 'עדכן סיסמה'}
          </Button>

          <Box sx={{ textAlign: 'center' }}>
            <Link 
              component="button" 
              type="button"
              onClick={() => navigate('/login')} 
              variant="body2"
              sx={{ cursor: 'pointer', textDecoration: 'underline' }}
            >
              חזרה לכניסה
            </Link>
          </Box>
        </form>
      </FormContainer>
    </Box>
  );
};

export default ResetPassword;
