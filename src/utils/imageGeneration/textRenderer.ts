
import { ImageTheme } from './core';
import { getThemeColors } from './themes';

/**
 * Draw motivational text with highlighted word
 */
export const drawText = (
  ctx: CanvasRenderingContext2D, 
  text: string, 
  highlightWord: string | undefined, 
  width: number, 
  height: number,
  theme: ImageTheme
) => {
  // Set text properties based on theme
  const { textColor, highlightColor, isLightTheme } = getThemeColors(theme);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // Use Thai font Sarabun if available
  const fontFamily = '"Sarabun", sans-serif';
  
  // Adjust text size based on length
  const fontSize = calculateFontSize(text, width, height);
  
  // Draw text shadow for better readability
  applyTextShadow(ctx, isLightTheme);
  
  // Split text into lines based on width
  const lines = calculateTextLines(ctx, text, width, fontSize, fontFamily);
  
  // Draw each line, with special highlight for the keyword
  drawTextLines(
    ctx, 
    lines, 
    highlightWord, 
    width, 
    height, 
    fontSize, 
    fontFamily, 
    textColor, 
    highlightColor
  );
  
  // Reset shadow
  resetShadow(ctx);
};

/**
 * Calculate appropriate font size based on text length
 */
const calculateFontSize = (text: string, width: number, height: number): number => {
  const textLength = text.length;
  let fontSize = Math.min(width / 15, height / 6);
  if (textLength > 100) fontSize *= 0.8;
  if (textLength > 200) fontSize *= 0.7;
  return fontSize;
};

/**
 * Apply text shadow for better readability
 */
const applyTextShadow = (ctx: CanvasRenderingContext2D, isLightTheme: boolean) => {
  ctx.shadowColor = isLightTheme ? 'rgba(0,0,0,0.1)' : 'rgba(0,0,0,0.5)';
  ctx.shadowBlur = 5;
  ctx.shadowOffsetX = 2;
  ctx.shadowOffsetY = 2;
};

/**
 * Reset shadow effects
 */
const resetShadow = (ctx: CanvasRenderingContext2D) => {
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
};

/**
 * Calculate text lines based on available width
 */
const calculateTextLines = (
  ctx: CanvasRenderingContext2D, 
  text: string, 
  width: number,
  fontSize: number,
  fontFamily: string
): string[] => {
  const words = text.split(' ');
  const lines: string[] = [];
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
  
  return lines;
};

/**
 * Draw text lines with word highlighting
 */
const drawTextLines = (
  ctx: CanvasRenderingContext2D,
  lines: string[],
  highlightWord: string | undefined,
  width: number,
  height: number,
  fontSize: number,
  fontFamily: string,
  textColor: string,
  highlightColor: string
) => {
  const lineHeight = fontSize * 1.2;
  const textY = height / 2 - (lines.length - 1) * lineHeight / 2;
  
  lines.forEach((line, i) => {
    const y = textY + i * lineHeight;
    
    if (highlightWord && line.includes(highlightWord)) {
      drawHighlightedLine(ctx, line, highlightWord, width, y, fontSize, fontFamily, textColor, highlightColor);
    } else {
      // Draw regular text
      ctx.fillStyle = textColor;
      ctx.fillText(line, width / 2, y);
    }
  });
};

/**
 * Draw a line with highlighted word
 */
const drawHighlightedLine = (
  ctx: CanvasRenderingContext2D,
  line: string,
  highlightWord: string,
  width: number,
  y: number,
  fontSize: number,
  fontFamily: string,
  textColor: string,
  highlightColor: string
) => {
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
};

/**
 * Draw attribution and watermark
 */
export const drawAttribution = (
  ctx: CanvasRenderingContext2D, 
  contributor: string, 
  width: number, 
  height: number,
  theme: ImageTheme
) => {
  const { attributionColor, isLightTheme } = getThemeColors(theme);
  
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
