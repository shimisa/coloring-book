import React, { useEffect } from 'react';
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
} from '@mui/material';
import { styled } from '@mui/material/styles';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { useNavigate, useLocation } from 'react-router-dom';
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
  email: Yup.string()
    .email('כתובת אימייל לא תקינה')
    .required('שדה חובה'),
  password: Yup.string()
    .min(6, 'הסיסמה חייבת להכיל לפחות 6 תווים')
    .required('שדה חובה'),
});

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast, isAuthenticated } = useApp();
  
  // Get the intended destination from location state, or default to /gallery
  const from = location.state?.from?.pathname || '/gallery';

  // If already authenticated, redirect to intended destination
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        await authService.login(values);
        showToast('התחברת בהצלחה!', 'success');
      } catch (error) {
        showToast('שגיאה בהתחברות. אנא בדקו את הפרטים ונסו שוב', 'error');
      } finally {
        setSubmitting(false);
      }
    },
  });

  // If already authenticated, don't render the login form
  if (isAuthenticated) {
    return null;
  }

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
          <LockOutlinedIcon sx={{ color: 'white' }} />
        </Box>

        <Typography component="h1" variant="h5" gutterBottom>
          כניסה לחשבון
        </Typography>

        <form onSubmit={formik.handleSubmit} style={{ width: '100%' }}>
          <TextField
            fullWidth
            margin="normal"
            id="email"
            name="email"
            label="דואר אלקטרוני"
            value={formik.values.email}
            onChange={formik.handleChange}
            error={formik.touched.email && Boolean(formik.errors.email)}
            helperText={formik.touched.email && formik.errors.email}
            dir="ltr"
          />

          <TextField
            fullWidth
            margin="normal"
            id="password"
            name="password"
            label="סיסמה"
            type="password"
            value={formik.values.password}
            onChange={formik.handleChange}
            error={formik.touched.password && Boolean(formik.errors.password)}
            helperText={formik.touched.password && formik.errors.password}
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
            {formik.isSubmitting ? 'מתחבר...' : 'כניסה'}
          </Button>

          <Box sx={{ textAlign: 'center' }}>
            <Link href="/forgot-password" variant="body2">
              שכחת סיסמה?
            </Link>
            <Box sx={{ mt: 2 }}>
              <Link href="/register" variant="body2">
                {"אין לך חשבון? הירשם עכשיו"}
              </Link>
            </Box>
          </Box>
        </form>
      </FormContainer>
    </Box>
  );
};

export default Login;