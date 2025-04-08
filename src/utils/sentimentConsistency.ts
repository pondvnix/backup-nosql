
export function extractSentimentFromTemplate(template: string) {
  let sentiment: 'positive' | 'neutral' | 'negative' = 'neutral';
  let text = template;
  
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
  
  return { sentiment, text };
}

export function getSentimentBadgeVariant(sentiment?: 'positive' | 'neutral' | 'negative') {
  switch (sentiment) {
    case 'positive':
      return 'success' as const;
    case 'negative':
      return 'destructive' as const;
    default:
      return 'secondary' as const;
  }
}

export function getPolarityText(polarity?: 'positive' | 'neutral' | 'negative'): string {
  if (polarity === 'positive') return 'เชิงบวก';
  if (polarity === 'negative') return 'เชิงลบ';
  return 'กลาง';
}

export function analyzeSentimentFromSentence(sentence: string, template?: string) {
  if (template) {
    return extractSentimentFromTemplate(template);
  }
  
  const positivePatterns = [
    'ดี', 'สุข', 'สบาย', 'รัก', 'ชื่นชม', 'ยินดี', 'สำเร็จ', 'เก่ง', 'เยี่ยม',
    'น่ารัก', 'สนุก', 'สดใส', 'มีความสุข', 'สุดยอด', 'ชอบ', 'กำลังใจ',
    'หวัง', 'พยายาม', 'เติบโต', 'ขอบคุณ', 'มั่นใจ', 'แข็งแรง', 'ฝัน', 'ส่งเสริม'
  ];

  const negativePatterns = [
    'เศร้า', 'เสียใจ', 'ผิดหวัง', 'กลัว', 'กังวล', 'ท้อ', 'แย่', 'ล้มเหลว',
    'หมดหวัง', 'เหนื่อย', 'โกรธ', 'เจ็บปวด', 'ร้องไห้', 'หนัก', 'ยาก',
    'ลำบาก', 'ทุกข์', 'สงสาร', 'อ่อนแอ', 'อันตราย', 'อิจฉา', 'หึง'
  ];
  
  let positiveCount = 0;
  let negativeCount = 0;
  
  // Check for positive patterns
  positivePatterns.forEach(pattern => {
    if (sentence.toLowerCase().includes(pattern.toLowerCase())) {
      positiveCount++;
    }
  });
  
  // Check for negative patterns
  negativePatterns.forEach(pattern => {
    if (sentence.toLowerCase().includes(pattern.toLowerCase())) {
      negativeCount++;
    }
  });
  
  let sentiment: 'positive' | 'neutral' | 'negative' = 'neutral';
  
  if (positiveCount > negativeCount) {
    sentiment = 'positive';
  } else if (negativeCount > positiveCount) {
    sentiment = 'negative';
  }
  
  return { sentiment, text: sentence };
}
