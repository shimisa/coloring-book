import React, { useCallback, useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Box,
  Typography,
  Button,
  Paper,
  IconButton,
  Grid,
  Zoom,
  useTheme,
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import CollectionsIcon from '@mui/icons-material/Collections';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import uploadService from '../../services/upload.service';

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

interface UploadedImage {
  file: File;
  preview: string;
}

const ImageUploader: React.FC = () => {
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const { showToast, isAuthenticated, setSelectedImages } = useApp();
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { 
        state: { from: location },
        replace: true 
      });
    }
  }, [isAuthenticated, navigate, location]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (uploadedImages.length + acceptedFiles.length > 10) {
      showToast('ניתן להעלות עד 10 תמונות בלבד', 'error');
      return;
    }

    // Check file sizes (10MB = 10 * 1024 * 1024 bytes)
    const maxFileSize = 10 * 1024 * 1024; // 10MB
    const oversizedFiles = acceptedFiles.filter(file => file.size > maxFileSize);
    
    if (oversizedFiles.length > 0) {
      const oversizedNames = oversizedFiles.map(file => file.name).join(', ');
      showToast(`הקבצים הבאים גדולים מדי (מעל 10MB): ${oversizedNames}`, 'error');
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
        try {
          const audio = new Audio('/sounds/upload-success.mp3');
          audio.volume = 0.3;
          audio.load(); // Preload the audio
          audio.play().catch((error) => {
            console.warn('Could not play audio:', error);
          });
        } catch (error) {
          console.warn('Could not create audio:', error);
        }
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
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const handleDelete = (index: number) => {
    URL.revokeObjectURL(uploadedImages[index].preview);
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
    showToast('התמונה הוסרה', 'info');
  };

  const handleContinueToGallery = () => {
    if (uploadedImages.length === 0) {
      showToast('אנא העלו לפחות תמונה אחת', 'warning');
      return;
    }
    
    // Convert local images to SelectedImage format and store in context
    const selectedImages = uploadedImages.map(img => ({
      file: img.file,
      preview: img.preview,
      processedFile: img.file, // Use the original file as processed
      isProcessed: true // Mark as processed by default
    }));
    
    setSelectedImages(selectedImages);
    navigate('/gallery');
    showToast('התמונות נוספו לגלריה שלך! 🎨', 'success');
  };

  const handleContinueToShipping = () => {
    if (uploadedImages.length === 0) {
      showToast('אנא העלו לפחות תמונה אחת', 'warning');
      return;
    }
    
    // Prepare images for shipping
    const selectedImages = uploadedImages.map(img => ({
      file: img.file,
      preview: img.preview,
      processedFile: img.file, // Use the original file as processed
      isProcessed: true // Mark as processed by default
    }));
    
    setSelectedImages(selectedImages);
    showToast('התמונות מוכנות להזמנה!', 'success');
    navigate('/shipping');
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
          ניתן להעלות עד 10 תמונות בפורמט JPG או PNG (מקסימום 10MB לתמונה)
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
                    <Box sx={{ mt: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                      <IconButton
                        color="error"
                        onClick={() => handleDelete(index)}
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </PreviewContainer>
                </Zoom>
              </Grid>
            ))}
          </Grid>

          {/* Add the floating buttons */}
          <Box sx={{ 
            position: 'fixed',
            bottom: 16,
            right: 16,
            zIndex: 1000,
            display: 'flex',
            gap: 2,
          }}>
            <Zoom in={uploadedImages.length > 0}>
              <Button
                variant="contained"
                color="primary"
                size="large"
                onClick={handleContinueToGallery}
                sx={{
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

            <Zoom in={uploadedImages.length > 0}>
              <Button
                variant="contained"
                color="secondary"
                size="large"
                onClick={handleContinueToShipping}
                sx={{
                  borderRadius: '25px',
                  px: 4,
                  py: 1.5,
                  boxShadow: theme.shadows[4],
                }}
                startIcon={<LocalShippingIcon />}
              >
                המשך להזמנה
              </Button>
            </Zoom>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default ImageUploader;