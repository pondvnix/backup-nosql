
interface MetaConfig {
  title: string;
  description: string;
  imageUrl?: string;
  twitterHandle?: string;
  siteUrl?: string;
}

export const updateMetaTitleAndDescription = (config: MetaConfig): void => {
  // Update title tag
  document.title = config.title || 'คำลังใจ - แพลตฟอร์มสร้างกำลังใจด้วยภาษาไทย';
  
  // Find meta tags or create them if they don't exist
  const updateOrCreateMetaTag = (name: string, content: string) => {
    // Try to find by name
    let meta = document.querySelector(`meta[name="${name}"]`);
    if (!meta) {
      // Try to find by property for Open Graph tags
      meta = document.querySelector(`meta[property="${name}"]`);
    }
    
    if (meta) {
      // Update existing tag
      meta.setAttribute('content', content);
    } else {
      // Create new tag - first determine if it's a property or name attribute
      const isOgTag = name.startsWith('og:');
      const isTwitterTag = name.startsWith('twitter:');
      const attribute = isOgTag || isTwitterTag ? 'property' : 'name';
      
      // Create meta element
      const newMeta = document.createElement('meta');
      newMeta.setAttribute(attribute, name);
      newMeta.setAttribute('content', content);
      document.head.appendChild(newMeta);
    }
  };
  
  // Update description
  updateOrCreateMetaTag('description', config.description);
  
  // Update Open Graph tags
  updateOrCreateMetaTag('og:title', config.title);
  updateOrCreateMetaTag('og:description', config.description);
  
  if (config.imageUrl) {
    updateOrCreateMetaTag('og:image', config.imageUrl);
  }
  
  if (config.siteUrl) {
    updateOrCreateMetaTag('og:url', config.siteUrl);
  }
  
  // Update Twitter card tags
  updateOrCreateMetaTag('twitter:card', 'summary_large_image');
  
  if (config.twitterHandle) {
    updateOrCreateMetaTag('twitter:site', config.twitterHandle);
    updateOrCreateMetaTag('twitter:creator', config.twitterHandle);
  }
  
  updateOrCreateMetaTag('twitter:title', config.title);
  updateOrCreateMetaTag('twitter:description', config.description);
  
  if (config.imageUrl) {
    updateOrCreateMetaTag('twitter:image', config.imageUrl);
  }
};

export const getEncodedMetaInfo = () => {
  // เข้ารหัสข้อมูล
  const encodeData = (data: string) => {
    return btoa(data);
  };

  // ถอดรหัสข้อมูล
  const decodeData = (encoded: string) => {
    return atob(encoded);
  };

  const metaInfo = {
    title: encodeData("Word Stream Encouragement"),
    description: encodeData("Word-Stream-Encouragement"),
    author: encodeData("pond-dev"),
    twitterHandle: encodeData("@pond_dev"),
    imageUrl: encodeData("https://wpmart.co/wp-content/uploads/2024/09/cropped-Favicon_WP-1-192x192.png")
  };

  return {
    getDecodedValue: (key: keyof typeof metaInfo) => decodeData(metaInfo[key])
  };
};
