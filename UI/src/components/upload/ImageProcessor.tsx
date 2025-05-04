import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Slider,
  Switch,
  Typography,
  Paper,
  Button,
  CircularProgress,
} from '@mui/material';
import { ImageConverter, ImageProcessingOptions } from '../../utils/imageConverter';
import { useApp } from '../../context/AppContext';

interface ImageProcessorProps {
  imageUrl: string;
  onProcessingComplete: (processedImageData: ImageData) => void;
}

const ImageProcessor: React.FC<ImageProcessorProps> = ({
  imageUrl,
  onProcessingComplete,
}) => {
  const { showToast, playSound } = useApp();
  const [options, setOptions] = useState<ImageProcessingOptions>({
    edgeDetection: true,
    contrast: 50,
    brightness: 0,
    smoothing: 2,
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const image = new Image();
    image.src = imageUrl;
    image.onload = () => {
      if (canvasRef.current && previewCanvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
          canvasRef.current.width = image.width;
          canvasRef.current.height = image.height;
          ctx.drawImage(image, 0, 0);
          updatePreview();
        }
      }
    };
  }, [imageUrl]);

  const updatePreview = async () => {
    if (!canvasRef.current || !previewCanvasRef.current) return;

    setIsProcessing(true);
    try {
      const ctx = canvasRef.current.getContext('2d');
      if (!ctx) return;

      const imageData = ctx.getImageData(
        0,
        0,
        canvasRef.current.width,
        canvasRef.current.height
      );

      playSound('magic-convert');
      
      const processedData = await ImageConverter.convertToColoringPage(
        imageData,
        options
      );

      const previewCtx = previewCanvasRef.current.getContext('2d');
      if (previewCtx) {
        previewCanvasRef.current.width = processedData.width;
        previewCanvasRef.current.height = processedData.height;
        previewCtx.putImageData(processedData, 0, 0);
      }

      onProcessingComplete(processedData);
      showToast('תמונה עובדה בהצלחה!', 'success');
    } catch (error) {
      showToast('אירעה שגיאה בעיבוד התמונה', 'error');
      console.error('Error processing image:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleOptionChange = (
    option: keyof ImageProcessingOptions,
    value: number | boolean
  ) => {
    setOptions((prev) => ({
      ...prev,
      [option]: value,
    }));
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 2 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          הגדרות עיבוד תמונה
        </Typography>

        <Box sx={{ mb: 2 }}>
          <Typography>זיהוי קצוות</Typography>
          <Switch
            checked={options.edgeDetection}
            onChange={(e) => handleOptionChange('edgeDetection', e.target.checked)}
          />
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography>ניגודיות</Typography>
          <Slider
            value={options.contrast}
            min={0}
            max={100}
            onChange={(_, value) => handleOptionChange('contrast', value as number)}
          />
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography>בהירות</Typography>
          <Slider
            value={options.brightness}
            min={-50}
            max={50}
            onChange={(_, value) => handleOptionChange('brightness', value as number)}
          />
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography>החלקה</Typography>
          <Slider
            value={options.smoothing}
            min={0}
            max={5}
            step={0.5}
            onChange={(_, value) => handleOptionChange('smoothing', value as number)}
          />
        </Box>

        <Button
          variant="contained"
          onClick={updatePreview}
          disabled={isProcessing}
          sx={{ mt: 2 }}
        >
          {isProcessing ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            'עבד תמונה'
          )}
        </Button>
      </Paper>

      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <Box>
          <Typography variant="subtitle1" gutterBottom>
            תמונה מקורית
          </Typography>
          <canvas
            ref={canvasRef}
            style={{
              maxWidth: '100%',
              height: 'auto',
              border: '1px solid #ccc',
            }}
          />
        </Box>
        <Box>
          <Typography variant="subtitle1" gutterBottom>
            תצוגה מקדימה
          </Typography>
          <canvas
            ref={previewCanvasRef}
            style={{
              maxWidth: '100%',
              height: 'auto',
              border: '1px solid #ccc',
            }}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default ImageProcessor;