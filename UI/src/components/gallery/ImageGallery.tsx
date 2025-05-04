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
import { SelectedImage } from '../../types/upload.types';
import { useApp } from '../../context/AppContext';
import uploadService from '../../services/upload.service';

const GalleryContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
}));

const ImageCard = styled(Card)(({ theme }) => ({
  position: 'relative',
  borderRadius: '12px',
  transition: 'transform 0.2s',
  '&:hover': {
    transform: 'scale(1.02)',
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

const SelectCheckbox = styled(Checkbox)(({ theme }) => ({
  position: 'absolute',
  top: 8,
  right: 8,
  zIndex: 1,
  color: '#fff',
  '&.Mui-checked': {
    color: theme.palette.primary.main,
  },
}));

interface ImageGalleryProps {
  onImagesSelected: (images: SelectedImage[]) => void;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ onImagesSelected }) => {
  const [images, setImages] = useState<SelectedImage[]>([]);
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set());
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const { showToast } = useApp();

  const handleImageSelect = (preview: string) => {
    const newSelected = new Set(selectedImages);
    
    if (newSelected.has(preview)) {
      newSelected.delete(preview);
    } else if (newSelected.size >= 10) {
      showToast('ניתן לבחור עד 10 תמונות בלבד', 'warning');
      return;
    } else {
      newSelected.add(preview);
    }
    
    setSelectedImages(newSelected);
    const selectedImageObjects = images.filter(img => newSelected.has(img.preview));
    onImagesSelected(selectedImageObjects);
  };

  const handleDelete = (preview: string) => {
    setImages(images.filter(img => img.preview !== preview));
    setSelectedImages(prev => {
      const newSelected = new Set(prev);
      newSelected.delete(preview);
      return newSelected;
    });
    showToast('התמונה הוסרה', 'info');
  };

  return (
    <GalleryContainer>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" color="primary">
          הגלריה שלי
        </Typography>
        <Typography variant="body2" color="text.secondary">
          נבחרו {selectedImages.size} תמונות מתוך {images.length}
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {images.map((image) => (
          <Grid item xs={12} sm={6} md={4} key={image.preview}>
            <ImageCard>
              <SelectCheckbox
                checked={selectedImages.has(image.preview)}
                onChange={() => handleImageSelect(image.preview)}
              />
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
                  <IconButton
                    color="inherit"
                    onClick={() => handleDelete(image.preview)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </ImageOverlay>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    מוכן להמרה
                  </Typography>
                  <ColorLensIcon color="primary" />
                </Box>
              </CardContent>
            </ImageCard>
          </Grid>
        ))}
      </Grid>

      <Zoom in={selectedImages.size > 0}>
        <Fab
          color="primary"
          variant="extended"
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            zIndex: 1000,
          }}
          onClick={() => {
            const selectedImageObjects = images.filter(img => selectedImages.has(img.preview));
            onImagesSelected(selectedImageObjects);
          }}
        >
          <ShoppingCartIcon sx={{ mr: 1 }} />
          המשך להזמנה ({selectedImages.size})
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

      {images.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 5 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            אין תמונות בגלריה
          </Typography>
          <Button
            variant="contained"
            color="primary"
            href="/upload"
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