
// Word Polarity Database (Simple version)
// In a production app, this would be loaded from a database
export interface WordPolarity {
  word: string;
  polarity: 'positive' | 'neutral' | 'negative';
  score: number;
  templates?: string[]; // Add templates to support the management page
}

// Original database example kept commented out for reference
/**
export const wordPolarityDatabase: WordPolarity[] = [
  // Positive words
  { word: "ใจ", polarity: "positive", score: 1, templates: [] },
  { word: "ก้าว", polarity: "positive", score: 1, templates: [] },
  { word: "หวัง", polarity: "positive", score: 1, templates: [] },
  { word: "ยิ้ม", polarity: "positive", score: 1, templates: [] },
  { word: "หายใจ", polarity: "positive", score: 1, templates: [] },
  { word: "เชื่อ", polarity: "positive", score: 1, templates: [] },
  { word: "เริ่มใหม่", polarity: "positive", score: 1, templates: [] },
  { word: "อ่อนโยน", polarity: "positive", score: 1, templates: [] },
  { word: "ดูแล", polarity: "positive", score: 1, templates: [] },
  { word: "ให้อุ่น", polarity: "positive", score: 1, templates: [] },
  { word: "พัก", polarity: "positive", score: 1, templates: [] },
  { word: "ค่อย ๆ", polarity: "positive", score: 1, templates: [] },
  { word: "ไปต่อ", polarity: "positive", score: 1, templates: [] },
  { word: "รัก", polarity: "positive", score: 1, templates: [] },
  { word: "สู้", polarity: "positive", score: 1, templates: [] },
  { word: "ฝัน", polarity: "positive", score: 1, templates: [] },
  { word: "เข้มแข็ง", polarity: "positive", score: 1, templates: [] },
  { word: "พรุ่งนี้", polarity: "positive", score: 1, templates: [] },
  { word: "ใหม่", polarity: "positive", score: 1, templates: [] },
  { word: "สวย", polarity: "positive", score: 1, templates: [] },
  
  // Neutral words
  { word: "และ", polarity: "neutral", score: 0, templates: [] },
  { word: "ที่", polarity: "neutral", score: 0, templates: [] },
  { word: "ของ", polarity: "neutral", score: 0, templates: [] },
  { word: "เรา", polarity: "neutral", score: 0, templates: [] },
  { word: "แล้ว", polarity: "neutral", score: 0, templates: [] },
  { word: "คน", polarity: "neutral", score: 0, templates: [] },
  { word: "ตัวเอง", polarity: "neutral", score: 0, templates: [] },
  { word: "อย่าง", polarity: "neutral", score: 0, templates: [] },
  { word: "มี", polarity: "neutral", score: 0, templates: [] },
  { word: "ทุกคน", polarity: "neutral", score: 0, templates: [] },
  
  // Negative words
  { word: "หมดหวัง", polarity: "negative", score: -1, templates: [] },
  { word: "ล้มเหลว", polarity: "negative", score: -1, templates: [] },
  { word: "เศร้า", polarity: "negative", score: -1, templates: [] },
  { word: "เจ็บปวด", polarity: "negative", score: -1, templates: [] },
  { word: "ท้อแท้", polarity: "negative", score: -1, templates: [] },
  { word: "พัง", polarity: "negative", score: -1, templates: [] },
  { word: "สิ้นหวัง", polarity: "negative", score: -1, templates: [] },
  { word: "แย่", polarity: "negative", score: -1, templates: [] },
  { word: "ผิดหวัง", polarity: "negative", score: -1, templates: [] },
  { word: "เลวร้าย", polarity: "negative", score: -1, templates: [] },
];
*/

export const wordPolarityDatabase: WordPolarity[] = [
  // Positive words
  { word: "ใจ", polarity: "positive", score: 1, templates: [] }
];


// Generate 5 random positive words that are not already in the list
export const generatePositiveWordSuggestions = (
  existingWords: string[] = []
): string[] => {
  // Prioritize words from the database first
  
  // ดึงข้อมูลจาก localStorage แทนที่จะใช้ค่าคงที่ในโค้ด
  let database: WordPolarity[] = [];
  try {
    const storedData = localStorage.getItem("word-polarity-database");
    if (storedData) {
      database = JSON.parse(storedData);
    } else {
      database = wordPolarityDatabase; // ใช้ค่าเริ่มต้นถ้าไม่มีข้อมูลใน localStorage
    }
  } catch (e) {
    console.error("Error loading word database:", e);
    database = wordPolarityDatabase;
  }
  
  const allWords = database.map(entry => entry.word);
  
  // Filter out words that are already in the sentence
  const availableWords = allWords.filter(
    word => !existingWords.includes(word)
  );
  
  // Shuffle and get 5 random words, prioritize positive words
  const positiveWords = database
    .filter(word => word.polarity === 'positive')
    .map(word => word.word)
    .filter(word => !existingWords.includes(word));
  
  const neutralWords = database
    .filter(word => word.polarity === 'neutral')
    .map(word => word.word)
    .filter(word => !existingWords.includes(word));
  
  // Shuffle both arrays
  const shuffledPositive = [...positiveWords].sort(() => 0.5 - Math.random());
  const shuffledNeutral = [...neutralWords].sort(() => 0.5 - Math.random());
  
  // Prioritize positive words, but include neutral if needed to get 5
  const result = [...shuffledPositive.slice(0, 4)];
  if (result.length < 5) {
    result.push(...shuffledNeutral.slice(0, 5 - result.length));
  }
  
  return result.slice(0, 5);
};

// Helper function to get word polarity
export const getWordPolarity = (word: string): { 
  word: string;
  polarity: 'positive' | 'neutral' | 'negative';
  score: number;
  templates?: string[];
  database: WordPolarity[]; 
} => {
  // ดึงข้อมูลจาก localStorage แทนที่จะใช้ค่าคงที่ในโค้ด
  let database: WordPolarity[] = [];
  try {
    const storedData = localStorage.getItem("word-polarity-database");
    if (storedData) {
      database = JSON.parse(storedData);
    } else {
      database = wordPolarityDatabase; // ใช้ค่าเริ่มต้นถ้าไม่มีข้อมูลใน localStorage
    }
  } catch (e) {
    console.error("Error loading word database:", e);
    database = wordPolarityDatabase;
  }
  
  const foundWord = database.find(w => w.word === word);
  return {
    ...(foundWord || { word, polarity: 'neutral', score: 0 }),
    database
  };
};

// Calculate Energy Score for a sentence
export const calculateEnergySentenceScore = (words: string[]): {
  score: number;
  breakdown: {
    positive: number;
    neutral: number;
    negative: number;
  };
  confidence: number;
} => {
  let positiveCount = 0;
  let neutralCount = 0;
  let negativeCount = 0;
  let totalScore = 0;
  
  words.forEach(word => {
    const { polarity, score } = getWordPolarity(word);
    
    if (polarity === 'positive') {
      positiveCount++;
      totalScore += 1; // Updated to reflect the standard scoring (positive = 1)
    } else if (polarity === 'neutral') {
      neutralCount++;
      totalScore += 0; // Updated to reflect the standard scoring (neutral = 0)
    } else {
      negativeCount++;
      totalScore += -1; // Already matches the standard scoring (negative = -1)
    }
  });
  
  // Calculate score using the updated formula
  const energyScore = (positiveCount * 1) + (neutralCount * 0) + (negativeCount * -1);
  
  // Calculate confidence (simplified version)
  // Higher proportion of classified words = higher confidence
  const classifiedWords = positiveCount + neutralCount + negativeCount;
  const confidence = words.length > 0 ? classifiedWords / words.length : 0;
  
  return {
    score: energyScore,
    breakdown: {
      positive: positiveCount,
      neutral: neutralCount,
      negative: negativeCount
    },
    confidence
  };
};

// Check if a sentence needs moderation
export const needsModeration = (score: number): boolean => {
  return score < 0;
};

// Analyze the flow of emotions in a sentence (simplified version)
export const analyzeEmotionFlow = (words: string[]): {
  quality: 'excellent' | 'good' | 'poor';
  consistency: boolean;
} => {
  // In a real implementation, this would use Thai word embeddings
  // to measure semantic distances between words
  
  // Simple implementation: check if we have any negative words
  const polarities = words.map(word => getWordPolarity(word).polarity);
  const hasNegative = polarities.includes('negative');
  
  // Check for polarity jumps (simplified)
  let jumps = 0;
  for (let i = 1; i < polarities.length; i++) {
    if (
      (polarities[i-1] === 'positive' && polarities[i] === 'negative') ||
      (polarities[i-1] === 'negative' && polarities[i] === 'positive')
    ) {
      jumps++;
    }
  }
  
  let quality: 'excellent' | 'good' | 'poor' = 'good';
  if (jumps === 0 && !hasNegative) {
    quality = 'excellent';
  } else if (jumps > 1 || hasNegative) {
    quality = 'poor';
  }
  
  return {
    quality,
    consistency: jumps <= 1
  };
};

// Full sentence analysis
export const analyzeSentence = (words: string[]): {
  energyScore: number;
  breakdown: {
    positive: number;
    neutral: number;
    negative: number;
  };
  emotionFlow: {
    quality: 'excellent' | 'good' | 'poor';
    consistency: boolean;
  };
  confidence: number;
  needsModeration: boolean;
  suggestion: string;
} => {
  const { score, breakdown, confidence } = calculateEnergySentenceScore(words);
  const flow = analyzeEmotionFlow(words);
  const moderation = needsModeration(score);
  
  // Generate suggestion
  let suggestion = 'แสดงบนจอ Billboard';
  if (moderation) {
    suggestion = 'ส่งเข้าระบบตรวจสอบโดย Admin';
  } else if (flow.quality === 'poor') {
    suggestion = 'ตรวจสอบความต่อเนื่องของประโยค';
  }
  
  return {
    energyScore: score,
    breakdown,
    emotionFlow: flow,
    confidence,
    needsModeration: moderation,
    suggestion
  };
};
