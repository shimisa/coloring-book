import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PaymentIcon from '@mui/icons-material/Payment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useApp } from '../../context/AppContext';
import shippingService, { ShippingAddress, OrderDetails, ShippingCost } from '../../services/shipping.service';
import uploadService from '../../services/upload.service';
import { UploadResponse } from '../../types/upload.types';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: '12px',
  backgroundColor: '#ffffff',
  marginBottom: theme.spacing(3),
}));

const validationSchema = Yup.object({
  fullName: Yup.string()
    .required('שם מלא הוא שדה חובה')
    .min(2, 'שם חייב להכיל לפחות 2 תווים'),
  street: Yup.string()
    .required('רחוב הוא שדה חובה')
    .min(3, 'כתובת חייבת להכיל לפחות 3 תווים'),
  city: Yup.string()
    .required('עיר היא שדה חובה')
    .min(2, 'שם העיר חייב להכיל לפחות 2 תווים'),
  zipCode: Yup.string()
    .required('מיקוד הוא שדה חובה')
    .matches(/^\d{5,7}$/, 'מיקוד לא תקין'),
  phone: Yup.string()
    .required('מספר טלפון הוא שדה חובה')
    .matches(/^(\+972|0)([23489]|5[0-9]|77)[1-9]\d{6}$/, 'מספר טלפון לא תקין'),
  email: Yup.string()
    .required('דואר אלקטרוני הוא שדה חובה')
    .email('כתובת דואר אלקטרוני לא תקינה'),
  notes: Yup.string(),
});

const steps = ['בחירת פורמט', 'פרטי משלוח', 'סיכום ותשלום'];

interface SelectedImage {
  file: File;
  preview: string;
}

interface ShippingFormProps {
  selectedImages: SelectedImage[];
  onOrderComplete: (orderId: string) => void;
}

const ShippingForm: React.FC<ShippingFormProps> = ({
  selectedImages,
  onOrderComplete,
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [orderDetails, setOrderDetails] = useState<OrderDetails>({
    imageIds: [], // This will be populated when we upload the images
    bookFormat: 'A4',
    paperType: 'standard',
    quantity: 1,
    price: 0,
  });
  const [shippingCost, setShippingCost] = useState<ShippingCost>({
    basePrice: 0,
    giftPackagingPrice: 0,
    total: 0
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useApp();

  const formik = useFormik<ShippingAddress>({
    initialValues: {
      fullName: '',
      street: '',
      city: '',
      zipCode: '',
      phone: '',
      email: '',
      notes: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setIsSubmitting(true);
        const order = await shippingService.createOrder(values, orderDetails);
        showToast('ההזמנה התקבלה בהצלחה! 🎉', 'success');
        onOrderComplete(order.id);
      } catch (error) {
        showToast('אירעה שגיאה בעת שליחת ההזמנה', 'error');
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  const handleNext = () => {
    if (activeStep === steps.length - 1) {
      handleSubmitOrder();
    } else {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleSubmitOrder = async () => {
    setIsSubmitting(true);
    try {
      // First upload all images
      const uploadPromises = selectedImages.map(async (image) => {
        const optimizedImage = await uploadService.optimizeImage(image.file);
        return await uploadService.uploadImage(optimizedImage);
      });

      const uploadedImages: UploadResponse[] = await Promise.all(uploadPromises);
      
      // Now create the order with the uploaded image IDs
      const order = await shippingService.createOrder(formik.values, {
        ...orderDetails,
        imageIds: uploadedImages.map(img => img.id)
      });

      showToast('ההזמנה התקבלה בהצלחה!', 'success');
      onOrderComplete(order.id);
    } catch (error) {
      showToast('אירעה שגיאה בעת שליחת ההזמנה', 'error');
      console.error('Order submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOrderDetailsChange = (field: keyof OrderDetails, value: any) => {
    setOrderDetails((prev) => ({ ...prev, [field]: value }));
    // Recalculate shipping cost when order details change
    shippingService.calculateShipping({ ...orderDetails, [field]: value })
      .then((cost) => {
        setOrderDetails((prev) => ({ ...prev, price: cost }));
      })
      .catch(() => {
        showToast('שגיאה בחישוב עלות המשלוח', 'error');
      });
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 2 }}>
      <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {/* Format Selection Step */}
      {activeStep === 0 && (
        <StyledPaper>
          <Typography variant="h5" gutterBottom color="primary">
            <ShoppingCartIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            בחרו את פורמט ספר הצביעה
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormControl component="fieldset">
                <Typography variant="subtitle1" gutterBottom>
                  גודל ספר
                </Typography>
                <RadioGroup
                  value={orderDetails.bookFormat}
                  onChange={(e) => handleOrderDetailsChange('bookFormat', e.target.value)}
                >
                  <FormControlLabel
                    value="A4"
                    control={<Radio />}
                    label="A4 - גדול (29.7 x 21 ס״מ)"
                  />
                  <FormControlLabel
                    value="A5"
                    control={<Radio />}
                    label="A5 - בינוני (21 x 14.8 ס״מ)"
                  />
                </RadioGroup>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl component="fieldset">
                <Typography variant="subtitle1" gutterBottom>
                  סוג נייר
                </Typography>
                <RadioGroup
                  value={orderDetails.paperType}
                  onChange={(e) => handleOrderDetailsChange('paperType', e.target.value)}
                >
                  <FormControlLabel
                    value="standard"
                    control={<Radio />}
                    label="רגיל - 100 גרם"
                  />
                  <FormControlLabel
                    value="premium"
                    control={<Radio />}
                    label="פרימיום - 120 גרם, איכות גבוהה"
                  />
                </RadioGroup>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="כמות"
                type="number"
                value={orderDetails.quantity}
                onChange={(e) => handleOrderDetailsChange('quantity', parseInt(e.target.value))}
                InputProps={{ inputProps: { min: 1, max: 10 } }}
              />
            </Grid>
          </Grid>
        </StyledPaper>
      )}

      {/* Shipping Details Step */}
      {activeStep === 1 && (
        <StyledPaper>
          <Typography variant="h5" gutterBottom color="primary">
            <LocalShippingIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            פרטי משלוח
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="שם מלא"
                {...formik.getFieldProps('fullName')}
                error={formik.touched.fullName && Boolean(formik.errors.fullName)}
                helperText={formik.touched.fullName && formik.errors.fullName}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="רחוב ומספר בית"
                {...formik.getFieldProps('street')}
                error={formik.touched.street && Boolean(formik.errors.street)}
                helperText={formik.touched.street && formik.errors.street}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="עיר"
                {...formik.getFieldProps('city')}
                error={formik.touched.city && Boolean(formik.errors.city)}
                helperText={formik.touched.city && formik.errors.city}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="מיקוד"
                {...formik.getFieldProps('zipCode')}
                error={formik.touched.zipCode && Boolean(formik.errors.zipCode)}
                helperText={formik.touched.zipCode && formik.errors.zipCode}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="טלפון"
                {...formik.getFieldProps('phone')}
                error={formik.touched.phone && Boolean(formik.errors.phone)}
                helperText={formik.touched.phone && formik.errors.phone}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="דואר אלקטרוני"
                type="email"
                {...formik.getFieldProps('email')}
                error={formik.touched.email && Boolean(formik.errors.email)}
                helperText={formik.touched.email && formik.errors.email}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="הערות למשלוח"
                multiline
                rows={3}
                {...formik.getFieldProps('notes')}
              />
            </Grid>
          </Grid>
        </StyledPaper>
      )}

      {/* Order Summary and Payment Step */}
      {activeStep === 2 && (
        <StyledPaper>
          <Typography variant="h5" gutterBottom color="primary">
            <PaymentIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            סיכום הזמנה ותשלום
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="מספר כרטיס אשראי"
                type="tel"
                inputProps={{ maxLength: 16, pattern: '[0-9]*' }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="תוקף"
                placeholder="MM/YY"
                inputProps={{ maxLength: 5 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="CVV"
                type="tel"
                inputProps={{ maxLength: 4, pattern: '[0-9]*' }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="ת.ז. בעל הכרטיס"
                type="tel"
                inputProps={{ maxLength: 9, pattern: '[0-9]*' }}
              />
            </Grid>
          </Grid>

          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              סיכום הזמנה
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography>
                  סה"כ לתשלום: ₪{(orderDetails.price + shippingCost.total).toFixed(2)}
                </Typography>
              </Grid>
            </Grid>
          </Box>
        </StyledPaper>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
        <Button
          onClick={handleBack}
          disabled={activeStep === 0 || isSubmitting}
        >
          חזרה
        </Button>
        <Button
          variant="contained"
          onClick={handleNext}
          disabled={isSubmitting}
          endIcon={isSubmitting ? <CircularProgress size={20} /> : null}
        >
          {activeStep === steps.length - 1 ? 'סיום והזמנה' : 'המשך'}
        </Button>
      </Box>
    </Box>
  );
};

export default ShippingForm;