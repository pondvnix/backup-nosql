// Type definitions for sentiment analysis
export interface SentimentAnalysisResult {
  overallSentiment: 'positive' | 'neutral' | 'negative';
  score: number;
  wordBreakdown: {
    word: string;
    sentiment: 'positive' | 'neutral' | 'negative';
    score: number;
  }[];
}

// Word polarity database - words with their sentiment values
export const wordPolarityDatabase = [
  { word: "กำลังใจ", sentiment: "positive", score: 0.8 },
  { word: "ความหวัง", sentiment: "positive", score: 0.7 },
  { word: "ความฝัน", sentiment: "positive", score: 0.6 },
  { word: "ความสุข", sentiment: "positive", score: 0.9 },
  { word: "ความรัก", sentiment: "positive", score: 0.8 },
  { word: "พลัง", sentiment: "positive", score: 0.7 },
  { word: "ศรัทธา", sentiment: "positive", score: 0.6 },
  { word: "ความเชื่อ", sentiment: "positive", score: 0.5 },
  { word: "ความเพียร", sentiment: "positive", score: 0.7 },
  { word: "ความอดทน", sentiment: "positive", score: 0.6 },
  { word: "ความสำเร็จ", sentiment: "positive", score: 0.8 },
  { word: "ความดี", sentiment: "positive", score: 0.7 },
  { word: "ความจริง", sentiment: "neutral", score: 0.0 },
  { word: "ความกล้า", sentiment: "positive", score: 0.6 },
  { word: "มิตรภาพ", sentiment: "positive", score: 0.7 },
  { word: "ครอบครัว", sentiment: "positive", score: 0.8 },
  { word: "ความสามัคคี", sentiment: "positive", score: 0.7 },
  { word: "สติปัญญา", sentiment: "positive", score: 0.6 },
  { word: "สุขภาพ", sentiment: "positive", score: 0.7 },
  { word: "การเรียนรู้", sentiment: "positive", score: 0.6 },
  { word: "การเติบโต", sentiment: "positive", score: 0.6 },
  { word: "ความเข้มแข็ง", sentiment: "positive", score: 0.7 },
  { word: "ความมุ่งมั่น", sentiment: "positive", score: 0.7 },
  { word: "ความตั้งใจ", sentiment: "positive", score: 0.6 },
  { word: "การให้อภัย", sentiment: "positive", score: 0.7 },
  { word: "ความเศร้า", sentiment: "negative", score: -0.7 },
  { word: "ความผิดหวัง", sentiment: "negative", score: -0.6 },
  { word: "ความเจ็บปวด", sentiment: "negative", score: -0.8 },
  { word: "ความกลัว", sentiment: "negative", score: -0.7 },
  { word: "ความโกรธ", sentiment: "negative", score: -0.8 },
  { word: "ความเหงา", sentiment: "negative", score: -0.6 },
  { word: "ความเหนื่อย", sentiment: "negative", score: -0.5 },
  { word: "ความท้อแท้", sentiment: "negative", score: -0.7 },
  { word: "ความสิ้นหวัง", sentiment: "negative", score: -0.9 },
  { word: "ความล้มเหลว", sentiment: "negative", score: -0.8 }
];

// Function to analyze the sentiment of a sentence or array of words
export const analyzeSentence = (input: string | string[]): SentimentAnalysisResult => {
  // Convert input to array of words if it's a string
  const words = typeof input === 'string' 
    ? input.split(/\s+/).filter(word => word.length > 0) 
    : input;
  
  // Initialize result
  const result: SentimentAnalysisResult = {
    overallSentiment: 'neutral',
    score: 0,
    wordBreakdown: []
  };
  
  // If no words, return neutral result
  if (!words || words.length === 0) {
    return result;
  }
  
  let totalScore = 0;
  
  // Analyze each word
  words.forEach(word => {
    // Find word in database
    const wordEntry = wordPolarityDatabase.find(entry => entry.word === word);
    
    let wordSentiment: 'positive' | 'neutral' | 'negative' = 'neutral';
    let wordScore = 0;
    
    if (wordEntry) {
      wordSentiment = wordEntry.sentiment;
      wordScore = wordEntry.score;
    }
    
    // Add to breakdown
    result.wordBreakdown.push({
      word,
      sentiment: wordSentiment,
      score: wordScore
    });
    
    // Add to total score
    totalScore += wordScore;
  });
  
  // Calculate average score
  const averageScore = totalScore / words.length;
  result.score = averageScore;
  
  // Determine overall sentiment
  if (averageScore > 0.1) {
    result.overallSentiment = 'positive';
  } else if (averageScore < -0.1) {
    result.overallSentiment = 'negative';
  } else {
    result.overallSentiment = 'neutral';
  }
  
  return result;
};

// Function to get sentiment color based on sentiment value
export const getSentimentColor = (sentiment: 'positive' | 'neutral' | 'negative'): string => {
  switch (sentiment) {
    case 'positive':
      return 'text-green-600';
    case 'negative':
      return 'text-red-600';
    default:
      return 'text-gray-600';
  }
};

// Function to get sentiment background color based on sentiment value
export const getSentimentBgColor = (sentiment: 'positive' | 'neutral' | 'negative'): string => {
  switch (sentiment) {
    case 'positive':
      return 'bg-green-100';
    case 'negative':
      return 'bg-red-100';
    default:
      return 'bg-gray-100';
  }
};

// Function to get sentiment border color based on sentiment value
export const getSentimentBorderColor = (sentiment: 'positive' | 'neutral' | 'negative'): string => {
  switch (sentiment) {
    case 'positive':
      return 'border-green-300';
    case 'negative':
      return 'border-red-300';
    default:
      return 'border-gray-300';
  }
};

// Function to get Thai sentiment label
export const getSentimentLabel = (sentiment: 'positive' | 'neutral' | 'negative'): string => {
  switch (sentiment) {
    case 'positive':
      return 'เชิงบวก';
    case 'negative':
      return 'เชิงลบ';
    default:
      return 'เป็นกลาง';
  }
};

// Function to generate a template for a word based on its sentiment
export const generateTemplateForWord = (word: string): string => {
  const wordEntry = wordPolarityDatabase.find(entry => entry.word === word);
  const sentiment = wordEntry?.sentiment || 'neutral';
  
  // Templates based on sentiment
  const positiveTemplates = [
    `${word}ทำให้ชีวิตมีความหมายมากขึ้น`,
    `${word}เป็นสิ่งที่ทำให้เรามีความสุข`,
    `${word}ช่วยให้เราผ่านพ้นอุปสรรคไปได้`,
    `${word}คือสิ่งที่ทำให้เราเติบโตขึ้น`,
    `${word}เป็นพลังที่ทำให้เราก้าวต่อไป`
  ];
  
  const neutralTemplates = [
    `${word}เป็นส่วนหนึ่งของชีวิต`,
    `${word}ทำให้เราได้เรียนรู้`,
    `${word}เป็นสิ่งที่เราต้องเข้าใจ`,
    `${word}ทำให้เรารู้จักตัวเองมากขึ้น`,
    `${word}เป็นประสบการณ์ที่มีค่า`
  ];
  
  const negativeTemplates = [
    `แม้จะมี${word}แต่เราก็ต้องสู้ต่อไป`,
    `${word}ทำให้เราเข้มแข็งขึ้น`,
    `${word}เป็นบทเรียนที่มีค่า`,
    `${word}จะผ่านไปเสมอ อย่ายอมแพ้`,
    `${word}ไม่ได้อยู่กับเราตลอดไป`
  ];
  
  // Select random template based on sentiment
  let templates;
  if (sentiment === 'positive') {
    templates = positiveTemplates;
  } else if (sentiment === 'negative') {
    templates = negativeTemplates;
  } else {
    templates = neutralTemplates;
  }
  
  const randomIndex = Math.floor(Math.random() * templates.length);
  return templates[randomIndex];
};
