
// Function to extract sentiment from a template string
export const extractSentimentFromTemplate = (template: string): { sentiment: 'positive' | 'neutral' | 'negative'; text: string } => {
  let sentiment: 'positive' | 'neutral' | 'negative' = 'neutral';
  let text = template;

  // Check for sentiment prefixes and remove them
  if (template.includes('${บวก}')) {
    sentiment = 'positive';
    text = template.replace('${บวก}', '');
  } else if (template.includes('${กลาง}')) {
    sentiment = 'neutral';
    text = template.replace('${กลาง}', '');
  } else if (template.includes('${ลบ}')) {
    sentiment = 'negative';
    text = template.replace('${ลบ}', '');
  }

  return { sentiment, text };
};

// Function to analyze sentiment from a sentence
export const analyzeSentimentFromSentence = (sentence: string, template?: string): { sentiment: 'positive' | 'neutral' | 'negative'; score: number } => {
  // If a template is provided, use it to determine sentiment
  if (template) {
    if (template.includes('${บวก}')) {
      return { sentiment: 'positive', score: 1 };
    } else if (template.includes('${ลบ}')) {
      return { sentiment: 'negative', score: -1 };
    } else if (template.includes('${กลาง}')) {
      return { sentiment: 'neutral', score: 0 };
    }
  }
  
  // Simple sentiment analysis for the sentence if no template or template doesn't have sentiment markers
  const positiveWords = ['ดี', 'สุข', 'รัก', 'ชอบ', 'ยิ้ม', 'สวย', 'เยี่ยม', 'ประสบความสำเร็จ', 'พลัง', 'กำลังใจ'];
  const negativeWords = ['แย่', 'เศร้า', 'เจ็บ', 'เสียใจ', 'กลัว', 'โกรธ', 'ล้มเหลว', 'ยาก', 'ปัญหา', 'ยาก'];

  // Count positive and negative words in the sentence
  let positiveCount = 0;
  let negativeCount = 0;

  positiveWords.forEach(word => {
    if (sentence.toLowerCase().includes(word.toLowerCase())) {
      positiveCount++;
    }
  });

  negativeWords.forEach(word => {
    if (sentence.toLowerCase().includes(word.toLowerCase())) {
      negativeCount++;
    }
  });

  // Calculate sentiment score
  const score = positiveCount - negativeCount;

  // Determine sentiment based on score
  let sentiment: 'positive' | 'neutral' | 'negative' = 'neutral';
  if (score > 0) {
    sentiment = 'positive';
  } else if (score < 0) {
    sentiment = 'negative';
  }

  return { sentiment, score };
};
