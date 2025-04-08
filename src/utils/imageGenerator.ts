
import { getContributorName } from "./contributorManager";

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

/**
 * Apply visual theme to the canvas
 */
const applyTheme = (ctx: CanvasRenderingContext2D, theme: ImageTheme, width: number, height: number) => {
  switch (theme) {
    case 'dark':
      // Dark theme with gradient
      const darkGradient = ctx.createLinearGradient(0, 0, 0, height);
      darkGradient.addColorStop(0, '#2d3748');
      darkGradient.addColorStop(1, '#1a202c');
      ctx.fillStyle = darkGradient;
      ctx.fillRect(0, 0, width, height);
      
      // Add subtle pattern
      ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
      for (let i = 0; i < width; i += 20) {
        ctx.fillRect(i, 0, 1, height);
      }
      break;
      
    case 'colorful':
      // Colorful sunset gradient
      const colorfulGradient = ctx.createLinearGradient(0, 0, width, height);
      colorfulGradient.addColorStop(0, '#ff9a9e');
      colorfulGradient.addColorStop(0.3, '#fad0c4');
      colorfulGradient.addColorStop(0.6, '#fbc2eb');
      colorfulGradient.addColorStop(1, '#a6c1ee');
      ctx.fillStyle = colorfulGradient;
      ctx.fillRect(0, 0, width, height);
      break;
      
    case 'minimal':
      // Clean white with subtle texture
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);
      
      // Add subtle dot pattern
      ctx.fillStyle = 'rgba(0, 0, 0, 0.03)';
      for (let x = 10; x < width; x += 20) {
        for (let y = 10; y < height; y += 20) {
          ctx.beginPath();
          ctx.arc(x, y, 1, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      break;
      
    case 'nature':
      // Natural green gradient
      const natureGradient = ctx.createLinearGradient(0, 0, 0, height);
      natureGradient.addColorStop(0, '#d4fc79');
      natureGradient.addColorStop(1, '#96e6a1');
      ctx.fillStyle = natureGradient;
      ctx.fillRect(0, 0, width, height);
      
      // Add leaf-like pattern in the corners
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.beginPath();
      ctx.ellipse(0, 0, width * 0.3, height * 0.3, Math.PI / 4, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.beginPath();
      ctx.ellipse(width, height, width * 0.3, height * 0.3, Math.PI / 4, 0, Math.PI * 2);
      ctx.fill();
      break;
      
    case 'light':
    default:
      // Light theme (default) - warm gradient
      const lightGradient = ctx.createLinearGradient(0, 0, 0, height);
      lightGradient.addColorStop(0, '#ffeddb');
      lightGradient.addColorStop(1, '#fff4e6');
      ctx.fillStyle = lightGradient;
      ctx.fillRect(0, 0, width, height);
      
      // Add subtle orange accent
      ctx.fillStyle = 'rgba(243, 132, 30, 0.05)';
      ctx.fillRect(0, height - 60, width, 60);
      break;
  }
  
  // Draw a subtle border
  ctx.strokeStyle = theme === 'light' || theme === 'minimal' ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)';
  ctx.lineWidth = 1;
  ctx.strokeRect(10, 10, width - 20, height - 20);
};

/**
 * Draw motivational text with highlighted word
 */
const drawText = (
  ctx: CanvasRenderingContext2D, 
  text: string, 
  highlightWord: string | undefined, 
  width: number, 
  height: number,
  theme: ImageTheme
) => {
  // Set text properties based on theme
  const isLightTheme = theme === 'light' || theme === 'minimal' || theme === 'nature';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // Default text color
  const textColor = isLightTheme ? '#1a202c' : '#ffffff';
  const highlightColor = theme === 'colorful' ? '#e03131' : '#f97316';
  
  // Use Thai font Sarabun if available
  const fontFamily = '"Sarabun", sans-serif';
  
  // Adjust text size based on length
  const textLength = text.length;
  let fontSize = Math.min(width / 15, height / 6);
  if (textLength > 100) fontSize *= 0.8;
  if (textLength > 200) fontSize *= 0.7;
  
  // Draw text shadow for better readability
  ctx.shadowColor = isLightTheme ? 'rgba(0,0,0,0.1)' : 'rgba(0,0,0,0.5)';
  ctx.shadowBlur = 5;
  ctx.shadowOffsetX = 2;
  ctx.shadowOffsetY = 2;
  
  // Split text into lines based on width
  const words = text.split(' ');
  let lines: string[] = [];
  let currentLine = words[0];
  
  ctx.font = `${fontSize}px ${fontFamily}`;
  
  for (let i = 1; i < words.length; i++) {
    const testLine = currentLine + ' ' + words[i];
    const metrics = ctx.measureText(testLine);
    if (metrics.width > width * 0.8) {
      lines.push(currentLine);
      currentLine = words[i];
    } else {
      currentLine = testLine;
    }
  }
  lines.push(currentLine);
  
  // Draw each line, with special highlight for the keyword
  const lineHeight = fontSize * 1.2;
  const textY = height / 2 - (lines.length - 1) * lineHeight / 2;
  
  lines.forEach((line, i) => {
    const y = textY + i * lineHeight;
    
    if (highlightWord && line.includes(highlightWord)) {
      // Highlight the specified word
      const parts = line.split(new RegExp(`(${highlightWord})`, 'gi'));
      let x = width / 2 - ctx.measureText(line).width / 2;
      
      parts.forEach(part => {
        if (part.toLowerCase() === highlightWord.toLowerCase()) {
          // Draw highlighted word
          const originalFillStyle = ctx.fillStyle;
          ctx.fillStyle = highlightColor;
          ctx.font = `bold ${fontSize}px ${fontFamily}`;
          ctx.fillText(part, x + ctx.measureText(part).width / 2, y);
          x += ctx.measureText(part).width;
          ctx.fillStyle = originalFillStyle;
          ctx.font = `${fontSize}px ${fontFamily}`;
        } else {
          // Draw regular text
          ctx.fillStyle = textColor;
          ctx.fillText(part, x + ctx.measureText(part).width / 2, y);
          x += ctx.measureText(part).width;
        }
      });
    } else {
      // Draw regular text
      ctx.fillStyle = textColor;
      ctx.fillText(line, width / 2, y);
    }
  });
  
  // Reset shadow
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
};

/**
 * Draw attribution and watermark
 */
const drawAttribution = (
  ctx: CanvasRenderingContext2D, 
  contributor: string, 
  width: number, 
  height: number,
  theme: ImageTheme
) => {
  const isLightTheme = theme === 'light' || theme === 'minimal' || theme === 'nature';
  const attributionColor = isLightTheme ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.7)';
  
  ctx.textAlign = 'left';
  ctx.textBaseline = 'bottom';
  ctx.font = '14px "Sarabun", sans-serif';
  ctx.fillStyle = attributionColor;
  
  const attributionText = `คำกำลังใจโดย: ${contributor}`;
  ctx.fillText(attributionText, 20, height - 20);
  
  // Add "คำลังใจ" watermark
  ctx.textAlign = 'right';
  ctx.font = 'bold 18px "Mitr", "Sarabun", sans-serif';
  ctx.fillStyle = isLightTheme ? 'rgba(249, 115, 22, 0.5)' : 'rgba(249, 115, 22, 0.7)';
  ctx.fillText('"คำ" ลังใจ', width - 20, height - 20);
};

/**
 * Generate a downloadable link for the image
 */
export const createDownloadLink = (image: GeneratedImage, fileName: string): HTMLAnchorElement => {
  const link = document.createElement('a');
  link.href = image.url;
  link.download = fileName || `คำลังใจ-${new Date().getTime()}.${image.format === 'jpg' ? 'jpg' : 'png'}`;
  return link;
};

/**
 * Save image to device
 */
export const downloadImage = (image: GeneratedImage, fileName?: string): void => {
  const link = createDownloadLink(image, fileName || `คำลังใจ-${new Date().getTime()}.${image.format === 'jpg' ? 'jpg' : 'png'}`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Share image to social media platforms
 */
export const shareImage = async (
  image: GeneratedImage, 
  platform: 'facebook' | 'twitter' | 'line' | 'copy',
  text?: string
): Promise<boolean> => {
  const shareText = text || 'คำกำลังใจจาก "คำ" ลังใจ';
  const shareUrl = window.location.href;
  
  switch (platform) {
    case 'facebook':
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
      return true;
      
    case 'twitter':
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, '_blank');
      return true;
      
    case 'line':
      window.open(`https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(shareUrl)}`, '_blank');
      return true;
      
    case 'copy':
      try {
        if (navigator.clipboard && window.ClipboardItem) {
          // Convert data URL to blob
          const res = await fetch(image.url);
          const blob = await res.blob();
          const clipboardItem = new ClipboardItem({ [blob.type]: blob });
          await navigator.clipboard.write([clipboardItem]);
          return true;
        } else if (navigator.clipboard) {
          // Fallback to copying URL if image copying not supported
          await navigator.clipboard.writeText(shareUrl);
          return true;
        }
      } catch (error) {
        console.error('Copy to clipboard failed:', error);
        return false;
      }
      return false;
      
    default:
      return false;
  }
};
