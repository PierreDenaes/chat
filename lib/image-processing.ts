import { ProcessedImageData } from '@/types/openai';

export const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB limit for OpenAI Vision
export const COMPRESSION_QUALITY = 0.8;
export const MAX_DIMENSION = 1024; // Max width/height for processing

export interface ImageCompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp';
}

export async function compressImage(
  file: File,
  options: ImageCompressionOptions = {}
): Promise<ProcessedImageData> {
  const {
    maxWidth = MAX_DIMENSION,
    maxHeight = MAX_DIMENSION,
    quality = COMPRESSION_QUALITY,
    format = 'jpeg'
  } = options;

  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    if (!ctx) {
      reject(new Error('Canvas context not available'));
      return;
    }

    img.onload = () => {
      // Calculate new dimensions while maintaining aspect ratio
      let { width, height } = img;
      
      if (width > maxWidth || height > maxHeight) {
        const aspectRatio = width / height;
        
        if (width > height) {
          width = Math.min(width, maxWidth);
          height = width / aspectRatio;
        } else {
          height = Math.min(height, maxHeight);
          width = height * aspectRatio;
        }
      }

      canvas.width = width;
      canvas.height = height;

      // Draw and compress
      ctx.drawImage(img, 0, 0, width, height);
      
      const mimeType = `image/${format}`;
      const dataUrl = canvas.toDataURL(mimeType, quality);
      
      // Remove data URL prefix to get base64 data
      const base64Data = dataUrl.split(',')[1];
      
      // Calculate compressed size
      const sizeInBytes = Math.ceil(base64Data.length * 0.75); // base64 is ~33% larger than binary
      
      if (sizeInBytes > MAX_IMAGE_SIZE) {
        reject(new Error(`Compressed image still too large: ${sizeInBytes} bytes`));
        return;
      }

      resolve({
        base64Data,
        format,
        size: sizeInBytes,
        width: Math.round(width),
        height: Math.round(height)
      });
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
}

export async function processImageForAnalysis(file: File): Promise<ProcessedImageData> {
  // Validate file type
  if (!file.type.startsWith('image/')) {
    throw new Error('File must be an image');
  }

  // Validate file size
  if (file.size > MAX_IMAGE_SIZE) {
    console.log('Image too large, compressing...');
    return compressImage(file);
  }

  // Convert to base64 for smaller images
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = () => {
      const result = reader.result as string;
      const base64Data = result.split(',')[1];
      const format = file.type.split('/')[1] as 'jpeg' | 'png' | 'webp';
      
      // Get image dimensions
      const img = new Image();
      img.onload = () => {
        resolve({
          base64Data,
          format,
          size: file.size,
          width: img.width,
          height: img.height
        });
      };
      img.onerror = () => reject(new Error('Failed to get image dimensions'));
      img.src = result;
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

export function validateImageFile(file: File): { valid: boolean; error?: string } {
  // Check file type
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Only JPEG, PNG, and WebP images are supported'
    };
  }

  // Check file size (before compression)
  const maxUploadSize = 20 * 1024 * 1024; // 20MB upload limit
  if (file.size > maxUploadSize) {
    return {
      valid: false,
      error: 'Image file is too large (max 20MB)'
    };
  }

  return { valid: true };
}

export function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.width, height: img.height });
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };
    
    img.src = url;
  });
}