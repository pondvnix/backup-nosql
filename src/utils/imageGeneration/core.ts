
import { getContributorName } from "../contributorManager";
import { applyTheme } from './themes';
import { drawText, drawAttribution } from './textRenderer';

// Types for image generation
export interface ImageGenerationOptions {
  text: string;          // The motivational text
  word?: string;         // The highlighted word (optional)
  contributor?: string;  // Name of contributor
  width?: number;        // Image width (pixels)
  height?: number;       // Image height (pixels)
  theme?: ImageTheme;    // Visual theme
  format?: 'png' | 'jpg' | 'svg' | 'data-url'; // Output format
}

export type ImageTheme = 'light' | 'dark' | 'colorful' | 'minimal' | 'nature';

export interface GeneratedImage {
  url: string;           // URL or data URL of the generated image
  width: number;
  height: number;
  format: string;
  timestamp: string;
}

/**
 * Generates a visual representation of a motivational sentence
 */
export const generateImage = async (options: ImageGenerationOptions): Promise<GeneratedImage> => {
  const {
    text,
    word,
    contributor = getContributorName(),
    width = 1200,
    height = 630,
    theme = 'light',
    format = 'data-url'
  } = options;
  
  // Create a canvas to draw the image
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    throw new Error('Could not create canvas context');
  }
  
  // Apply theme
  applyTheme(ctx, theme, width, height);
  
  // Draw text
  drawText(ctx, text, word, width, height, theme);
  
  // Add watermark/attribution
  drawAttribution(ctx, contributor, width, height, theme);
  
  // Convert canvas to image format
  const dataUrl = canvas.toDataURL(format === 'jpg' ? 'image/jpeg' : 'image/png');
  
  return {
    url: dataUrl,
    width,
    height,
    format: format === 'data-url' ? 'data-url' : format,
    timestamp: new Date().toISOString()
  };
};
