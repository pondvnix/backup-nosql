
// ฟังก์ชั่นสำหรับดึงข้อมูลความรู้สึกจากแม่แบบประโยค
export function extractSentimentFromTemplate(template: string): { sentiment: 'positive' | 'neutral' | 'negative', text: string } {
  let sentiment: 'positive' | 'neutral' | 'negative' = 'neutral';
  let text = template;
  
  // ตรวจสอบว่าแม่แบบมีการระบุความรู้สึกหรือไม่
  if (template.includes('${บวก}')) {
    sentiment = 'positive';
    text = template.replace(/\$\{บวก\}/g, '');
  } else if (template.includes('${ลบ}')) {
    sentiment = 'negative';
    text = template.replace(/\$\{ลบ\}/g, '');
  } else if (template.includes('${กลาง}')) {
    sentiment = 'neutral';
    text = template.replace(/\$\{กลาง\}/g, '');
  }
  
  // ลบช่องว่างที่เกินมา
  text = text.replace(/\s+/g, ' ').trim();
  
  return { sentiment, text };
}

// ฟังก์ชั่นวิเคราะห์ความรู้สึกจากแม่แบบประโยคและประโยคที่สร้าง
export function analyzeSentimentFromSentence(sentence: string, template?: string): { 
  sentiment: 'positive' | 'neutral' | 'negative',
  score: number 
} {
  // หากมีแม่แบบ ให้ใช้ความรู้สึกจากแม่แบบ
  if (template) {
    const { sentiment } = extractSentimentFromTemplate(template);
    return {
      sentiment,
      score: sentiment === 'positive' ? 1 : sentiment === 'negative' ? -1 : 0
    };
  }
  
  // หากไม่มีแม่แบบ ให้วิเคราะห์จากประโยคด้วยตัวเอง (อย่างง่าย)
  const positiveWords = ['ดี', 'เยี่ยม', 'สุข', 'รัก', 'พลัง', 'สำเร็จ', 'ชนะ', 'สู้', 'เข้มแข็ง', 'สบาย'];
  const negativeWords = ['แย่', 'เสียใจ', 'ผิดหวัง', 'เจ็บปวด', 'กลัว', 'กังวล', 'โกรธ', 'เศร้า'];
  
  let positiveCount = 0;
  let negativeCount = 0;
  
  for (const word of positiveWords) {
    if (sentence.includes(word)) positiveCount++;
  }
  
  for (const word of negativeWords) {
    if (sentence.includes(word)) negativeCount++;
  }
  
  // ตัดสินใจจากคำที่พบ
  if (positiveCount > negativeCount) {
    return { sentiment: 'positive', score: 1 };
  } else if (negativeCount > positiveCount) {
    return { sentiment: 'negative', score: -1 };
  } else {
    return { sentiment: 'neutral', score: 0 };
  }
}

// Helper functions for UI display
export function getSentimentBadgeVariant(sentiment: 'positive' | 'neutral' | 'negative'): string {
  switch (sentiment) {
    case 'positive':
      return 'success';
    case 'negative':
      return 'destructive';
    case 'neutral':
    default:
      return 'secondary';
  }
}

export function getPolarityText(sentiment: 'positive' | 'neutral' | 'negative'): string {
  switch (sentiment) {
    case 'positive':
      return 'เชิงบวก';
    case 'negative':
      return 'เชิงลบ';
    case 'neutral':
    default:
      return 'กลาง';
  }
}
