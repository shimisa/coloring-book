import axios from 'axios';
import { UploadResponse, ProcessingOptions } from '../types/upload.types';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

class UploadService {
  async uploadImage(file: File): Promise<UploadResponse> {
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await axios.post(`${API_URL}/upload/image`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error) {
      console.error('Upload error:', error);
      throw new Error('שגיאה בהעלאת התמונה. אנא נסו שוב');
    }
  }

  async processImage(
    imageId: string,
    options: ProcessingOptions
  ): Promise<UploadResponse> {
    try {
      const response = await axios.post(`${API_URL}/process/image/${imageId}`, options);
      return response.data;
    } catch (error) {
      console.error('Processing error:', error);
      throw new Error('שגיאה בעיבוד התמונה. אנא נסו שוב');
    }
  }

  async getUserImages(): Promise<UploadResponse[]> {
    try {
      const response = await axios.get(`${API_URL}/images/user`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user images:', error);
      throw new Error('שגיאה בטעינת התמונות. אנא נסו שוב');
    }
  }

  async deleteImage(imageId: string): Promise<void> {
    try {
      await axios.delete(`${API_URL}/images/${imageId}`);
    } catch (error) {
      console.error('Error deleting image:', error);
      throw new Error('שגיאה במחיקת התמונה. אנא נסו שוב');
    }
  }

  async createColoringBook(imageIds: string[]): Promise<{ bookId: string; previewUrl: string }> {
    try {
      const response = await axios.post(`${API_URL}/books/create`, { imageIds });
      return response.data;
    } catch (error) {
      console.error('Error creating coloring book:', error);
      throw new Error('שגיאה ביצירת ספר הצביעה. אנא נסו שוב');
    }
  }

  // Helper method to optimize image before upload
  async optimizeImage(file: File): Promise<File> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      img.onload = () => {
        // Max dimensions for optimization
        const MAX_WIDTH = 1920;
        const MAX_HEIGHT = 1080;

        let width = img.width;
        let height = img.height;

        // Calculate new dimensions while maintaining aspect ratio
        if (width > MAX_WIDTH) {
          height = Math.round((height * MAX_WIDTH) / width);
          width = MAX_WIDTH;
        }
        if (height > MAX_HEIGHT) {
          width = Math.round((width * MAX_HEIGHT) / height);
          height = MAX_HEIGHT;
        }

        canvas.width = width;
        canvas.height = height;

        // Draw and optimize
        ctx?.drawImage(img, 0, 0, width, height);
        
        // Convert to file
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const optimizedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              resolve(optimizedFile);
            } else {
              reject(new Error('שגיאה באופטימיזציה של התמונה'));
            }
          },
          'image/jpeg',
          0.85 // Quality setting
        );
      };

      img.onerror = () => {
        reject(new Error('שגיאה בטעינת התמונה'));
      };

      img.src = URL.createObjectURL(file);
    });
  }
}

export const uploadService = new UploadService();
export default uploadService;