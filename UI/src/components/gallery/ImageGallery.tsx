import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Typography,
  IconButton,
  Checkbox,
  Button,
  CircularProgress,
  Alert,
  Fab,
  Zoom,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ColorLensIcon from '@mui/icons-material/ColorLens';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { useNavigate } from 'react-router-dom';
import { SelectedImage } from '../../types/upload.types';
import { useApp } from '../../context/AppContext';
import uploadService from '../../services/upload.service';

const GalleryContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
}));

const ImageCard = styled(Card)(({ theme }) => ({
  position: 'relative',
  borderRadius: '12px',
  transition: 'transform 0.2s, box-shadow 0.2s',
  '&:hover': {
    transform: 'scale(1.02)',
  },
  '&:hover .delete-button': {
    opacity: 1,
  },
}));

const ImageOverlay = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  opacity: 0,
  transition: 'opacity 0.2s',
  '&:hover': {
    opacity: 1,
  },
}));

const DeleteButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  top: 8,
  right: 8,
  zIndex: 1,
  color: '#fff',
  opacity: 0,
  transition: 'opacity 0.2s ease-in-out',
  backgroundColor: 'rgba(220, 53, 69, 0.8)',
  borderRadius: '4px',
  '&:hover': {
    backgroundColor: 'rgba(220, 53, 69, 1)',
    opacity: 1,
  },
}));

interface ImageGalleryProps {
  onImagesSelected: (images: SelectedImage[]) => void;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ onImagesSelected }) => {
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const { showToast, selectedImages, setSelectedImages } = useApp();
  const navigate = useNavigate();

  const handleDelete = (preview: string, event: React.MouseEvent) => {
    event.stopPropagation();
    const updatedImages = selectedImages.filter(img => img.preview !== preview);
    setSelectedImages(updatedImages);
    showToast('התמונה הוסרה', 'info');
  };

  const handleContinueToOrder = () => {
    // All images in gallery are part of the order
    onImagesSelected(selectedImages);
  };

  return (
    <GalleryContainer>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" color="primary">
          הגלריה שלי
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {selectedImages.length} תמונות מוכנות להזמנה
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {selectedImages.map((image) => (
          <Grid item xs={12} sm={6} md={4} key={image.preview}>
            <ImageCard>
              <DeleteButton
                className="delete-button"
                onClick={(event) => handleDelete(image.preview, event)}
                title="מחק תמונה"
                size="small"
              >
                <DeleteIcon fontSize="small" />
              </DeleteButton>
              <CardMedia
                component="img"
                height="200"
                image={image.preview}
                alt="תמונה שהועלתה"
              />
              <ImageOverlay>
                <Box>
                  <IconButton
                    color="inherit"
                    onClick={() => setPreviewImage(image.preview)}
                  >
                    <VisibilityIcon />
                  </IconButton>
                </Box>
              </ImageOverlay>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    מוכן להזמנה
                  </Typography>
                  <ColorLensIcon color="primary" />
                </Box>
              </CardContent>
            </ImageCard>
          </Grid>
        ))}
      </Grid>

      <Zoom in={selectedImages.length > 0}>
        <Fab
          color="primary"
          variant="extended"
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            zIndex: 1000,
          }}
          onClick={handleContinueToOrder}
        >
          <ShoppingCartIcon sx={{ mr: 1 }} />
          המשך להזמנה ({selectedImages.length})
        </Fab>
      </Zoom>

      {previewImage && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: 'rgba(0,0,0,0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1300,
          }}
          onClick={() => setPreviewImage(null)}
        >
          <img
            src={previewImage}
            alt="תצוגה מקדימה"
            style={{ maxWidth: '90%', maxHeight: '90vh' }}
          />
        </Box>
      )}

      {selectedImages.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 5 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            אין תמונות בגלריה
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/upload')}
            startIcon={<ColorLensIcon />}
          >
            העלה תמונות חדשות
          </Button>
        </Box>
      )}
    </GalleryContainer>
  );
};

export default ImageGallery;