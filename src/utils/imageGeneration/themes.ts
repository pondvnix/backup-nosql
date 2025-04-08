
import { ImageTheme } from './core';

/**
 * Apply visual theme to the canvas
 */
export const applyTheme = (ctx: CanvasRenderingContext2D, theme: ImageTheme, width: number, height: number) => {
  switch (theme) {
    case 'dark':
      applyDarkTheme(ctx, width, height);
      break;
    case 'colorful':
      applyColorfulTheme(ctx, width, height);
      break;
    case 'minimal':
      applyMinimalTheme(ctx, width, height);
      break;
    case 'nature':
      applyNatureTheme(ctx, width, height);
      break;
    case 'light':
    default:
      applyLightTheme(ctx, width, height);
      break;
  }
  
  // Draw a subtle border
  ctx.strokeStyle = theme === 'light' || theme === 'minimal' ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)';
  ctx.lineWidth = 1;
  ctx.strokeRect(10, 10, width - 20, height - 20);
};

export const applyDarkTheme = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
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
};

export const applyColorfulTheme = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
  // Colorful sunset gradient
  const colorfulGradient = ctx.createLinearGradient(0, 0, width, height);
  colorfulGradient.addColorStop(0, '#ff9a9e');
  colorfulGradient.addColorStop(0.3, '#fad0c4');
  colorfulGradient.addColorStop(0.6, '#fbc2eb');
  colorfulGradient.addColorStop(1, '#a6c1ee');
  ctx.fillStyle = colorfulGradient;
  ctx.fillRect(0, 0, width, height);
};

export const applyMinimalTheme = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
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
};

export const applyNatureTheme = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
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
};

export const applyLightTheme = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
  // Light theme (default) - warm gradient
  const lightGradient = ctx.createLinearGradient(0, 0, 0, height);
  lightGradient.addColorStop(0, '#ffeddb');
  lightGradient.addColorStop(1, '#fff4e6');
  ctx.fillStyle = lightGradient;
  ctx.fillRect(0, 0, width, height);
  
  // Add subtle orange accent
  ctx.fillStyle = 'rgba(243, 132, 30, 0.05)';
  ctx.fillRect(0, height - 60, width, 60);
};

/**
 * Get theme-specific text and highlight colors
 */
export const getThemeColors = (theme: ImageTheme) => {
  const isLightTheme = theme === 'light' || theme === 'minimal' || theme === 'nature';
  const textColor = isLightTheme ? '#1a202c' : '#ffffff';
  const highlightColor = theme === 'colorful' ? '#e03131' : '#f97316';
  const attributionColor = isLightTheme ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.7)';
  
  return {
    textColor,
    highlightColor,
    attributionColor,
    isLightTheme
  };
};
