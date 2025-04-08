
// Create the missing sentimentAnalysis.ts file

/**
 * A simple utility to analyze word sentiment
 */

export const getWordSentiment = (word: string): { sentiment: 'positive' | 'neutral' | 'negative'; score: number } => {
  // Simple list of positive, neutral, and negative words
  const positiveWords = ["สุข", "รัก", "หวัง", "ยิ้ม", "กล้า", "ฝัน", "ชนะ", "ศรัทธา", "ขอบคุณ", "เมตตา"];
  const neutralWords = ["คิด", "เวลา", "เริ่ม", "ยอมรับ", "เข้าใจ", "เรียนรู้", "ปรับตัว", "สมดุล", "ทางออก"];
  const negativeWords = ["เศร้า", "เหนื่อย", "ยาก", "กลัว", "สับสน", "ผิดหวัง", "เจ็บปวด", "ล้มเหลว"];

  if (positiveWords.includes(word)) {
    return { sentiment: 'positive', score: 1 };
  } else if (negativeWords.includes(word)) {
    return { sentiment: 'negative', score: -1 };
  }
  
  return { sentiment: 'neutral', score: 0 };
};
