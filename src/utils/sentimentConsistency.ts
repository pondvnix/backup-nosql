
// ฟังก์ชันวิเคราะห์ sentiment จากประโยค
export const analyzeSentimentFromSentence = (
  sentence: string,
  template?: string
): { sentiment: 'positive' | 'neutral' | 'negative'; score: number } => {
  // ถ้ามี template ให้วิเคราะห์จาก template ก่อน
  if (template) {
    const { sentiment } = extractSentimentFromTemplate(template);
    
    // กำหนดคะแนนตามเกณฑ์
    let score: number;
    switch (sentiment) {
      case 'positive':
        score = 2;  // ความรู้สึกเชิงบวก = 2 คะแนน
        break;
      case 'neutral':
        score = 1;  // ความรู้สึกกลาง = 1 คะแนน
        break;
      case 'negative':
        score = -1; // ความรู้สึกเชิงลบ = -1 คะแนน
        break;
      default:
        score = 0;
    }
    
    return { sentiment, score };
  }
  
  // วิเคราะห์จากประโยคโดยตรง
  if (sentence.includes('${บวก}')) {
    return { sentiment: 'positive', score: 2 };
  } else if (sentence.includes('${ลบ}')) {
    return { sentiment: 'negative', score: -1 };
  } else if (sentence.includes('${กลาง}')) {
    return { sentiment: 'neutral', score: 1 };
  }
  
  // ถ้าไม่มีตัวบ่งชี้ใด ๆ ให้เป็น neutral
  return { sentiment: 'neutral', score: 1 };
};

// ฟังก์ชันดึง sentiment จาก template
export const extractSentimentFromTemplate = (
  template: string
): { sentiment: 'positive' | 'neutral' | 'negative'; text: string } => {
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
};

// ฟังก์ชันแปลง sentiment เป็นคำไทย
export const getPolarityText = (sentiment?: 'positive' | 'neutral' | 'negative'): string => {
  switch (sentiment) {
    case 'positive':
      return 'เชิงบวก';
    case 'negative':
      return 'เชิงลบ';
    default:
      return 'กลาง';
  }
};

// ฟังก์ชันแปลง sentiment เป็น badge variant
export const getSentimentBadgeVariant = (sentiment?: 'positive' | 'neutral' | 'negative'): "success" | "destructive" | "secondary" | "default" | "outline" | "warning" | "info" => {
  switch (sentiment) {
    case 'positive':
      return 'success';
    case 'negative':
      return 'destructive';
    default:
      return 'secondary';
  }
};
