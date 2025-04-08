
// Create the missing wordCategorization.ts file

/**
 * Utility for categorizing words by sentiment
 */

export const filterWordsByCategory = (words: string[], category: 'positive' | 'neutral' | 'negative'): string[] => {
  // Simple list of positive, neutral, and negative words
  const positiveWords = ["สุข", "รัก", "หวัง", "ยิ้ม", "กล้า", "ฝัน", "ชนะ", "ศรัทธา", "ขอบคุณ", "เมตตา"];
  const neutralWords = ["คิด", "เวลา", "เริ่ม", "ยอมรับ", "เข้าใจ", "เรียนรู้", "ปรับตัว", "สมดุล", "ทางออก"];
  const negativeWords = ["เศร้า", "เหนื่อย", "ยาก", "กลัว", "สับสน", "ผิดหวัง", "เจ็บปวด", "ล้มเหลว"];

  switch (category) {
    case 'positive':
      return words.filter(word => positiveWords.includes(word));
    case 'negative':
      return words.filter(word => negativeWords.includes(word));
    case 'neutral':
      return words.filter(word => neutralWords.includes(word));
    default:
      return words;
  }
};
