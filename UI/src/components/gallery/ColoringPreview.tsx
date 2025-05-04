import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Button,
  Grid,
  Stepper,
  Step,
  StepLabel,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import { UploadResponse } from '../../types/upload.types';

const PreviewContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  margin: theme.spacing(2),
  borderRadius: '12px',
  backgroundColor: '#ffffff',
  minHeight: '500px',
  display: 'flex',
  flexDirection: 'column',
}));

const PageContainer = styled(Box)(({ theme }) => ({
  flex: 1,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  position: 'relative',
  margin: theme.spacing(2),
  backgroundColor: '#f8f8f8',
  borderRadius: '8px',
  boxShadow: 'inset 0 0 10px rgba(0,0,0,0.1)',
}));

const NavigationButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  top: '50%',
  transform: 'translateY(-50%)',
  backgroundColor: 'rgba(255,255,255,0.8)',
  '&:hover': {
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
}));

const PreviewImage = styled('img')({
  maxWidth: '100%',
  maxHeight: '60vh',
  objectFit: 'contain',
  borderRadius: '4px',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
});

interface ColoringPreviewProps {
  images: UploadResponse[];
  onProceedToShipping: () => void;
}

const ColoringPreview: React.FC<ColoringPreviewProps> = ({
  images,
  onProceedToShipping,
}) => {
  const [currentPage, setCurrentPage] = useState(0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(0, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(images.length - 1, prev + 1));
  };

  return (
    <PreviewContainer>
      <Typography variant="h5" align="center" color="primary" gutterBottom>
        תצוגה מקדימה של ספר הצביעה
      </Typography>

      <Stepper activeStep={currentPage} alternativeLabel sx={{ mb: 3 }}>
        {images.map((_, index) => (
          <Step key={index}>
            <StepLabel>עמוד {index + 1}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <PageContainer>
        {currentPage > 0 && (
          <NavigationButton
            onClick={handlePreviousPage}
            sx={{ left: theme.spacing(1) }}
          >
            <NavigateBeforeIcon />
          </NavigationButton>
        )}

        <PreviewImage
          src={images[currentPage].coloringPageUrl}
          alt={`עמוד ${currentPage + 1}`}
        />

        {currentPage < images.length - 1 && (
          <NavigationButton
            onClick={handleNextPage}
            sx={{ right: theme.spacing(1) }}
          >
            <NavigateNextIcon />
          </NavigationButton>
        )}
      </PageContainer>

      <Box sx={{ mt: 3 }}>
        <Grid container spacing={2} justifyContent="center">
          <Grid item xs={12} sm={6}>
            <Typography align="center" color="text.secondary" gutterBottom>
              עמוד {currentPage + 1} מתוך {images.length}
            </Typography>
          </Grid>
        </Grid>

        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={onProceedToShipping}
            startIcon={<LocalShippingIcon />}
            sx={{ minWidth: isMobile ? '100%' : 200 }}
          >
            המשך להזמנה
          </Button>
        </Box>

        <Typography
          variant="body2"
          color="text.secondary"
          align="center"
          sx={{ mt: 2 }}
        >
          * הספר כולל {images.length} דפי צביעה באיכות גבוהה על נייר מיוחד
        </Typography>
      </Box>
    </PreviewContainer>
  );
};

export default ColoringPreview;