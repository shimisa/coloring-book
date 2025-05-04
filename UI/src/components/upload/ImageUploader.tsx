import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Box,
  Typography,
  Button,
  LinearProgress,
  Paper,
  IconButton,
  Grid,
  Zoom,
  useTheme,
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import CollectionsIcon from '@mui/icons-material/Collections';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import uploadService from '../../services/upload.service';
import { SelectedImage } from '../../types/upload.types';

const float = keyframes`
  0% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
  100% {
    transform: translateY(0px);
  }
`;

const UploadBox = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  textAlign: 'center',
  backgroundColor: '#f8f8ff',
  border: '3px dashed #4CAF50',
  borderRadius: '16px',
  cursor: 'pointer',
  transition: 'all 0.3s ease-in-out',
  '&:hover': {
    borderColor: theme.palette.primary.main,
    transform: 'scale(1.01)',
  },
}));

const AnimatedIcon = styled(CloudUploadIcon)(({ theme }) => ({
  fontSize: 60,
  color: theme.palette.primary.main,
  animation: `${float} 3s ease-in-out infinite`,
}));

const PreviewContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  position: 'relative',
  borderRadius: '12px',
  overflow: 'hidden',
  transition: 'transform 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-4px)',
  },
}));

const PreviewImage = styled('img')({
  width: '100%',
  height: '200px',
  objectFit: 'cover',
  borderRadius: '8px',
});

const ProcessingOverlay = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(255, 255, 255, 0.9)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '12px',
}));

interface UploadedImage {
  file: File;
  preview: string;
  processing?: boolean;
  converted?: boolean;
}

const ImageUploader: React.FC = () => {
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const { showToast, setIsProcessing } = useApp();
  const theme = useTheme();
  const navigate = useNavigate();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (uploadedImages.length + acceptedFiles.length > 10) {
      showToast('ניתן להעלות עד 10 תמונות בלבד', 'error');
      return;
    }

    try {
      const newImages: UploadedImage[] = [];

      for (const file of acceptedFiles) {
        const optimizedImage = await uploadService.optimizeImage(file);
        newImages.push({
          file: optimizedImage,
          preview: URL.createObjectURL(file)
        });
      }

      setUploadedImages(prev => [...prev, ...newImages]);
      
      if (acceptedFiles.length > 0) {
        showToast('התמונות נוספו בהצלחה! 🎨', 'success');
        const audio = new Audio('/sounds/upload-success.mp3');
        audio.volume = 0.3;
        audio.play().catch(() => {});
      }
    } catch (error) {
      showToast('שגיאה בהוספת התמונות', 'error');
    }
  }, [showToast, uploadedImages.length]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png']
    },
    maxFiles: 10,
  });

  const handleDelete = (index: number) => {
    URL.revokeObjectURL(uploadedImages[index].preview);
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
    showToast('התמונה הוסרה', 'info');
  };

  const handleConvert = async (index: number) => {
    try {
      setUploadedImages(prev => prev.map((img, i) => 
        i === index ? { ...img, processing: true } : img
      ));
      setIsProcessing(true);

      const optimizedImage = await uploadService.optimizeImage(uploadedImages[index].file);
      const response = await uploadService.uploadImage(optimizedImage);

      setUploadedImages(prev => prev.map((img, i) => 
        i === index ? { 
          ...img, 
          processing: false,
          converted: true,
        } : img
      ));

      showToast('התמונה הומרה בהצלחה! 🎨', 'success');
      
      // Play a magic sound effect
      const audio = new Audio('/sounds/magic-convert.mp3');
      audio.volume = 0.3;
      audio.play().catch(() => {});

    } catch (error) {
      showToast('שגיאה בהמרת התמונה', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleContinue = () => {
    const convertedImages = uploadedImages.filter(img => img.converted);
    if (convertedImages.length === 0) {
      showToast('אנא המירו לפחות תמונה אחת לדף צביעה', 'warning');
      return;
    }
    navigate('/gallery');
    showToast('התמונות נוספו לגלריה שלך! 🎨', 'success');
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" align="center" gutterBottom color="primary">
        העלאת תמונות משפחתיות
      </Typography>

      <Typography variant="body1" align="center" sx={{ mb: 3 }}>
        בחרו את התמונות האהובות עליכם והפכו אותן לדפי צביעה מהנים!
      </Typography>

      <UploadBox {...getRootProps()}>
        <input {...getInputProps()} />
        <AnimatedIcon />
        {isDragActive ? (
          <Typography variant="h6" sx={{ mt: 2 }}>
            שחררו את התמונות כאן 🎨
          </Typography>
        ) : (
          <Typography variant="h6" sx={{ mt: 2 }}>
            גררו תמונות לכאן, או לחצו לבחירת קבצים 📸
          </Typography>
        )}
        <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
          ניתן להעלות עד 10 תמונות בפורמט JPG או PNG
        </Typography>
      </UploadBox>

      {uploadedImages.length > 0 && (
        <Box sx={{ mt: 4 }}>
          <Grid container spacing={3}>
            {uploadedImages.map((image, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Zoom in={true} style={{ transitionDelay: `${index * 100}ms` }}>
                  <PreviewContainer>
                    <PreviewImage
                      src={image.preview}
                      alt={`תמונה ${index + 1}`}
                    />
                    {image.processing && (
                      <ProcessingOverlay>
                        <AutoFixHighIcon
                          sx={{
                            fontSize: 40,
                            color: theme.palette.primary.main,
                            animation: `${float} 1s ease-in-out infinite`,
                          }}
                        />
                        <Typography variant="body2" sx={{ mt: 2 }}>
                          מעבד את התמונה...
                        </Typography>
                        <LinearProgress
                          sx={{ width: '80%', mt: 1 }}
                          color="primary"
                        />
                      </ProcessingOverlay>
                    )}
                    <Box sx={{ mt: 1, display: 'flex', justifyContent: 'space-between' }}>
                      <IconButton
                        color="error"
                        onClick={() => handleDelete(index)}
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => handleConvert(index)}
                        disabled={image.processing || image.converted}
                        startIcon={<AutoFixHighIcon />}
                        size="small"
                      >
                        {image.converted ? 'הומר בהצלחה' : 'המר לדף צביעה'}
                      </Button>
                    </Box>
                  </PreviewContainer>
                </Zoom>
              </Grid>
            ))}
          </Grid>

          {/* Add the floating continue button */}
          <Zoom in={uploadedImages.some(img => img.converted)}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={handleContinue}
              sx={{
                position: 'fixed',
                bottom: 16,
                right: 16,
                zIndex: 1000,
                borderRadius: '25px',
                px: 4,
                py: 1.5,
                boxShadow: theme.shadows[4],
              }}
              startIcon={<CollectionsIcon />}
            >
              המשך לגלריה
            </Button>
          </Zoom>
        </Box>
      )}
    </Box>
  );
};

export default ImageUploader;