import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Link,
  Grid,
  FormControlLabel,
  Checkbox,
  Alert,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { authService } from '../../services/auth.service';

const FormContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  maxWidth: 600,
  margin: '0 auto',
  marginTop: theme.spacing(4),
  borderRadius: '12px',
}));

const validationSchema = Yup.object({
  firstName: Yup.string()
    .required('שדה חובה')
    .min(2, 'השם חייב להכיל לפחות 2 תווים'),
  lastName: Yup.string()
    .required('שדה חובה')
    .min(2, 'שם המשפחה חייב להכיל לפחות 2 תווים'),
  email: Yup.string()
    .email('כתובת אימייל לא תקינה')
    .required('שדה חובה'),
  password: Yup.string()
    .min(6, 'הסיסמה חייבת להכיל לפחות 6 תווים')
    .matches(/[a-z]/, 'הסיסמה חייבת להכיל לפחות אות קטנה אחת')
    .matches(/[A-Z]/, 'הסיסמה חייבת להכיל לפחות אות גדולה אחת')
    .matches(/[0-9]/, 'הסיסמה חייבת להכיל לפחות ספרה אחת')
    .required('שדה חובה'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'הסיסמאות אינן תואמות')
    .required('שדה חובה'),
  acceptTerms: Yup.boolean()
    .oneOf([true], 'עליך לאשר את תנאי השימוש'),
});

const Register = () => {
  const navigate = useNavigate();
  const { showToast } = useApp();
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [resendEmailMessage, setResendEmailMessage] = useState<string | null>(null);

  const formik = useFormik({
    initialValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      acceptTerms: false,
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const { confirmPassword, acceptTerms, ...registrationData } = values;
        await authService.register(registrationData);
        setRegistrationComplete(true);
        showToast('נרשמת בהצלחה! אנא בדוק את תיבת האימייל שלך לאימות החשבון', 'success');
      } catch (error: any) {
        if (error.message.includes('Email already exists')) {
          setResendEmailMessage(error.message);
          showToast('אימייל אימות חדש נשלח לכתובת שהזנת', 'info');
        } else {
          showToast(error.message || 'שגיאה בהרשמה. אנא בדקו את הפרטים ונסו שוב', 'error');
        }
      } finally {
        setSubmitting(false);
      }
    },
  });

  if (resendEmailMessage) {
    return (
      <Box sx={{ p: 3 }}>
        <FormContainer>
          <Box
            sx={{
              backgroundColor: 'info.main',
              borderRadius: '50%',
              p: 1,
              mb: 2,
            }}
          >
            <MarkEmailReadIcon sx={{ color: 'white' }} />
          </Box>

          <Typography component="h1" variant="h5" gutterBottom>
            אימות אימייל נדרש
          </Typography>

          <Typography align="center" sx={{ mb: 3 }}>
            כתובת האימייל כבר רשומה במערכת, אך טרם אומתה.
            <br />
            שלחנו אליך אימייל חדש עם קישור לאימות החשבון.
          </Typography>

          <Alert severity="info" sx={{ mb: 2 }}>
            במידה ולא קיבלת את האימייל, בדוק את תיקיית הספאם
          </Alert>

          <Button
            fullWidth
            variant="contained"
            color="primary"
            onClick={() => navigate('/login')}
          >
            חזרה לדף ההתחברות
          </Button>
        </FormContainer>
      </Box>
    );
  }

  if (registrationComplete) {
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
            <MarkEmailReadIcon sx={{ color: 'white' }} />
          </Box>

          <Typography component="h1" variant="h5" gutterBottom>
            ההרשמה הושלמה בהצלחה!
          </Typography>

          <Typography align="center" sx={{ mb: 3 }}>
            שלחנו לך אימייל עם קישור לאימות החשבון.
            <br />
            אנא בדוק את תיבת האימייל שלך והקלק על הקישור כדי להשלים את תהליך ההרשמה.
          </Typography>

          <Alert severity="info" sx={{ mb: 2 }}>
            במידה ולא קיבלת את האימייל, בדוק את תיקיית הספאם
          </Alert>

          <Button
            fullWidth
            variant="contained"
            color="primary"
            onClick={() => navigate('/login')}
          >
            חזרה לדף ההתחברות
          </Button>
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
          <PersonAddIcon sx={{ color: 'white' }} />
        </Box>

        <Typography component="h1" variant="h5" gutterBottom>
          הרשמה לאתר
        </Typography>

        <form onSubmit={formik.handleSubmit} style={{ width: '100%' }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="firstName"
                name="firstName"
                label="שם פרטי"
                value={formik.values.firstName}
                onChange={formik.handleChange}
                error={formik.touched.firstName && Boolean(formik.errors.firstName)}
                helperText={formik.touched.firstName && formik.errors.firstName}
                dir="rtl"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="lastName"
                name="lastName"
                label="שם משפחה"
                value={formik.values.lastName}
                onChange={formik.handleChange}
                error={formik.touched.lastName && Boolean(formik.errors.lastName)}
                helperText={formik.touched.lastName && formik.errors.lastName}
                dir="rtl"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="email"
                name="email"
                label="דואר אלקטרוני"
                value={formik.values.email}
                onChange={formik.handleChange}
                error={formik.touched.email && Boolean(formik.errors.email)}
                helperText={formik.touched.email && formik.errors.email}
                dir="ltr"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
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
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="confirmPassword"
                name="confirmPassword"
                label="אימות סיסמה"
                type="password"
                value={formik.values.confirmPassword}
                onChange={formik.handleChange}
                error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
                helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
                dir="ltr"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    name="acceptTerms"
                    color="primary"
                    checked={formik.values.acceptTerms}
                    onChange={formik.handleChange}
                  />
                }
                label="אני מסכים/ה לתנאי השימוש ומדיניות הפרטיות"
              />
              {formik.touched.acceptTerms && formik.errors.acceptTerms && (
                <Typography color="error" variant="caption" display="block">
                  {formik.errors.acceptTerms}
                </Typography>
              )}
            </Grid>
          </Grid>

          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            disabled={formik.isSubmitting}
            sx={{ mt: 3, mb: 2 }}
          >
            {formik.isSubmitting ? 'נרשם...' : 'הרשמה'}
          </Button>

          <Box sx={{ textAlign: 'center' }}>
            <Link href="/login" variant="body2">
              {"כבר יש לך חשבון? התחבר/י כאן"}
            </Link>
          </Box>
        </form>
      </FormContainer>
    </Box>
  );
};

export default Register;