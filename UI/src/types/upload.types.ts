export interface UploadResponse {
  originalUrl: string;
  coloringPageUrl: string;
  id: string;
}

export interface ProcessingOptions {
  edgeDetection: boolean;
  contrast: number;
  brightness: number;
  smoothing: number;
}

export interface SelectedImage {
  file: File;
  preview: string;
  processedFile?: File; // Add processed file for local storage
  isProcessed?: boolean; // Track if image has been processed locally
}