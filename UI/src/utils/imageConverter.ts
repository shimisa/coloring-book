export interface ImageProcessingOptions {
  edgeDetection: boolean;
  contrast: number; // 0-100
  brightness: number; // -50 to 50
  smoothing: number; // 0-5
}

export class ImageConverter {
  static async convertToColoringPage(
    imageData: ImageData,
    options: ImageProcessingOptions
  ): Promise<ImageData> {
    // Create a new canvas to work with
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Could not get canvas context');
    }

    canvas.width = imageData.width;
    canvas.height = imageData.height;
    ctx.putImageData(imageData, 0, 0);

    // Apply initial smoothing if needed
    if (options.smoothing > 0) {
      this.applyGaussianBlur(ctx, options.smoothing);
    }

    // Convert to grayscale
    const grayscaleData = this.convertToGrayscale(ctx);
    ctx.putImageData(grayscaleData, 0, 0);

    // Adjust contrast and brightness
    this.adjustContrastAndBrightness(ctx, options.contrast, options.brightness);

    // Apply edge detection if enabled
    if (options.edgeDetection) {
      const edgeData = this.detectEdges(ctx);
      ctx.putImageData(edgeData, 0, 0);
    }

    // Return the processed image data
    return ctx.getImageData(0, 0, canvas.width, canvas.height);
  }

  private static convertToGrayscale(ctx: CanvasRenderingContext2D): ImageData {
    const imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      // Convert to grayscale using luminosity method
      const gray = 0.299 * r + 0.587 * g + 0.114 * b;
      data[i] = data[i + 1] = data[i + 2] = gray;
    }

    return imageData;
  }

  private static adjustContrastAndBrightness(
    ctx: CanvasRenderingContext2D,
    contrast: number,
    brightness: number
  ): void {
    const imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
    const data = imageData.data;
    
    // Convert contrast to a multiplier (0-2)
    const contrastFactor = (contrast / 50) + 1;
    
    // Convert brightness to offset (-255 to 255)
    const brightnessOffset = (brightness / 50) * 255;

    for (let i = 0; i < data.length; i += 4) {
      for (let j = 0; j < 3; j++) {
        let value = data[i + j];
        
        // Apply contrast
        value = ((value / 255 - 0.5) * contrastFactor + 0.5) * 255;
        
        // Apply brightness
        value += brightnessOffset;
        
        // Clamp values
        data[i + j] = Math.max(0, Math.min(255, value));
      }
    }

    ctx.putImageData(imageData, 0, 0);
  }

  private static detectEdges(ctx: CanvasRenderingContext2D): ImageData {
    const sobelX = [
      [-1, 0, 1],
      [-2, 0, 2],
      [-1, 0, 1],
    ];

    const sobelY = [
      [-1, -2, -1],
      [0, 0, 0],
      [1, 2, 1],
    ];

    const imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
    const data = imageData.data;
    const width = ctx.canvas.width;
    const height = ctx.canvas.height;
    const output = new ImageData(width, height);

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        let pixelX = 0;
        let pixelY = 0;

        // Apply Sobel operators
        for (let i = -1; i <= 1; i++) {
          for (let j = -1; j <= 1; j++) {
            const idx = ((y + i) * width + (x + j)) * 4;
            const value = data[idx]; // Using only red channel since image is grayscale

            pixelX += value * sobelX[i + 1][j + 1];
            pixelY += value * sobelY[i + 1][j + 1];
          }
        }

        // Calculate gradient magnitude
        const magnitude = Math.sqrt(pixelX * pixelX + pixelY * pixelY);
        const idx = (y * width + x) * 4;

        // Threshold the edge detection
        const edgeValue = magnitude > 128 ? 255 : 0;
        output.data[idx] = output.data[idx + 1] = output.data[idx + 2] = edgeValue;
        output.data[idx + 3] = 255;
      }
    }

    return output;
  }

  private static applyGaussianBlur(ctx: CanvasRenderingContext2D, radius: number): void {
    const imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
    const data = imageData.data;
    const width = ctx.canvas.width;
    const height = ctx.canvas.height;
    const output = new ImageData(width, height);

    // Generate Gaussian kernel
    const kernel = this.generateGaussianKernel(radius);
    const kernelSize = kernel.length;
    const halfKernel = Math.floor(kernelSize / 2);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let r = 0, g = 0, b = 0, a = 0, weightSum = 0;

        // Apply kernel
        for (let ky = -halfKernel; ky <= halfKernel; ky++) {
          for (let kx = -halfKernel; kx <= halfKernel; kx++) {
            const px = Math.min(Math.max(x + kx, 0), width - 1);
            const py = Math.min(Math.max(y + ky, 0), height - 1);
            const weight = kernel[ky + halfKernel][kx + halfKernel];
            const idx = (py * width + px) * 4;

            r += data[idx] * weight;
            g += data[idx + 1] * weight;
            b += data[idx + 2] * weight;
            a += data[idx + 3] * weight;
            weightSum += weight;
          }
        }

        // Set output pixel
        const outIdx = (y * width + x) * 4;
        output.data[outIdx] = r / weightSum;
        output.data[outIdx + 1] = g / weightSum;
        output.data[outIdx + 2] = b / weightSum;
        output.data[outIdx + 3] = a / weightSum;
      }
    }

    ctx.putImageData(output, 0, 0);
  }

  private static generateGaussianKernel(radius: number): number[][] {
    const size = Math.ceil(radius * 6);
    const kernel: number[][] = [];
    const sigma = radius;

    for (let y = 0; y < size; y++) {
      kernel[y] = [];
      for (let x = 0; x < size; x++) {
        const xDist = x - Math.floor(size / 2);
        const yDist = y - Math.floor(size / 2);
        kernel[y][x] = Math.exp(-(xDist * xDist + yDist * yDist) / (2 * sigma * sigma));
      }
    }

    return kernel;
  }
}