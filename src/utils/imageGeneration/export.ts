
import { GeneratedImage } from './core';

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
      return shareToFacebook(shareUrl);
      
    case 'twitter':
      return shareToTwitter(shareText, shareUrl);
      
    case 'line':
      return shareToLine(shareUrl);
      
    case 'copy':
      return copyImageToClipboard(image, shareUrl);
      
    default:
      return false;
  }
};

/**
 * Share to Facebook
 */
const shareToFacebook = (url: string): boolean => {
  window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
  return true;
};

/**
 * Share to Twitter/X
 */
const shareToTwitter = (text: string, url: string): boolean => {
  window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
  return true;
};

/**
 * Share to LINE
 */
const shareToLine = (url: string): boolean => {
  window.open(`https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(url)}`, '_blank');
  return true;
};

/**
 * Copy image to clipboard
 */
const copyImageToClipboard = async (image: GeneratedImage, fallbackUrl: string): Promise<boolean> => {
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
      await navigator.clipboard.writeText(fallbackUrl);
      return true;
    }
  } catch (error) {
    console.error('Copy to clipboard failed:', error);
    return false;
  }
  return false;
};
