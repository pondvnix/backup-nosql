import { useEffect } from 'react';
import { getEncodedMetaInfo } from '../utils/metaConfig';
import { loadExternalScript } from '../utils/scriptLoader';

export const MetaTags = () => {
  useEffect(() => {
    const metaInfo = getEncodedMetaInfo();

    // โหลด external script
    loadExternalScript();

    // อัพเดท meta tags ด้วย JavaScript
    document.title = metaInfo.getDecodedValue('title');
    
    // อัพเดท meta description
    const descriptionMeta = document.querySelector('meta[name="description"]');
    if (descriptionMeta) {
      descriptionMeta.setAttribute('content', metaInfo.getDecodedValue('description'));
    }

    // อัพเดท og tags
    const ogTitleMeta = document.querySelector('meta[property="og:title"]');
    if (ogTitleMeta) {
      ogTitleMeta.setAttribute('content', metaInfo.getDecodedValue('title'));
    }

    const ogDescriptionMeta = document.querySelector('meta[property="og:description"]');
    if (ogDescriptionMeta) {
      ogDescriptionMeta.setAttribute('content', metaInfo.getDecodedValue('description'));
    }

    const ogImageMeta = document.querySelector('meta[property="og:image"]');
    if (ogImageMeta) {
      ogImageMeta.setAttribute('content', metaInfo.getDecodedValue('imageUrl'));
    }

    // อัพเดท Twitter tags
    const twitterImageMeta = document.querySelector('meta[name="twitter:image"]');
    if (twitterImageMeta) {
      twitterImageMeta.setAttribute('content', metaInfo.getDecodedValue('imageUrl'));
    }

    const twitterSiteMeta = document.querySelector('meta[name="twitter:site"]');
    if (twitterSiteMeta) {
      twitterSiteMeta.setAttribute('content', metaInfo.getDecodedValue('twitterHandle'));
    }
  }, []);

  return null;
}; 