
/**
 * โหลด external script ที่จำเป็น
 */
export const loadExternalScript = () => {
  const scripts = [
    {
      id: 'dom-to-image-script',
      src: 'https://cdnjs.cloudflare.com/ajax/libs/dom-to-image/2.6.0/dom-to-image.min.js'
    },
    {
      id: 'html2canvas-script',
      src: 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js'
    },
    {
      id: 'file-saver-script',
      src: 'https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2.0.5/FileSaver.min.js'
    }
  ];

  scripts.forEach(script => {
    if (!document.getElementById(script.id)) {
      const scriptElement = document.createElement('script');
      scriptElement.id = script.id;
      scriptElement.src = script.src;
      scriptElement.async = true;
      document.body.appendChild(scriptElement);
    }
  });
};

/**
 * บันทึกประโยคให้กำลังใจลง localStorage
 */
export const storeSentenceToBillboard = (sentence, contributor, word) => {
  if (!sentence || !word) return;
  
  try {
    const entry = {
      sentence,
      contributor: contributor || 'ไม่ระบุชื่อ',
      word,
      timestamp: new Date().toISOString()
    };
    
    let existingEntries = [];
    const stored = localStorage.getItem('motivation-billboard');
    if (stored) {
      existingEntries = JSON.parse(stored);
    }
    
    localStorage.setItem('motivation-billboard', 
      JSON.stringify([entry, ...existingEntries]));
      
    // Trigger event for real-time updates
    window.dispatchEvent(new CustomEvent('motivation-billboard-updated'));
    
    return true;
  } catch (error) {
    console.error('Error storing sentence:', error);
    return false;
  }
};
