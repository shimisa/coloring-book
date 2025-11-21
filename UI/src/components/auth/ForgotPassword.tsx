import React from 'react';
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
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import { useNavigate } from 'react-router-dom';
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
});

const ForgotPassword = () => {
  const navigate = useNavigate();
  const { showToast } = useApp();
  const [isEmailSent, setIsEmailSent] = React.useState(false);

  const formik = useFormik({
    initialValues: {
      email: '',
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        await authService.forgotPassword(values.email);
        setIsEmailSent(true);
        showToast('קישור לאיפוס סיסמה נשלח לכתובת האימייל שלך', 'success');
      } catch (error: any) {
        showToast(error.message || 'שגיאה בשליחת הקישור. אנא נסו שוב', 'error');
      } finally {
        setSubmitting(false);
      }
    },
  });

  if (isEmailSent) {
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
            <EmailOutlinedIcon sx={{ color: 'white' }} />
          </Box>

          <Typography component="h1" variant="h5" gutterBottom align="center">
            נשלח אימייל!
          </Typography>

          <Alert severity="success" sx={{ mb: 3, width: '100%' }}>
            שלחנו קישור לאיפוס סיסמה לכתובת האימייל שלך. 
            אנא בדקו את תיבת הדואר שלכם (כולל תיקיית הספאם) ולחצו על הקישור כדי לאפס את הסיסמה.
          </Alert>

          <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
            לא קיבלתם את האימייל? בדקו שהכתובת נכונה ונסו שוב.
          </Typography>

          <Button
            fullWidth
            variant="outlined"
            onClick={() => setIsEmailSent(false)}
            sx={{ mb: 2 }}
          >
            שלח שוב
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
          <EmailOutlinedIcon sx={{ color: 'white' }} />
        </Box>

        <Typography component="h1" variant="h5" gutterBottom>
          שכחת סיסמה?
        </Typography>

        <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
          הזינו את כתובת האימייל שלכם ונשלח לכם קישור לאיפוס הסיסמה
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
            autoFocus
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            disabled={formik.isSubmitting}
            sx={{ mt: 3, mb: 2 }}
          >
            {formik.isSubmitting ? 'שולח...' : 'שלח קישור לאיפוס סיסמה'}
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

export default ForgotPassword;
