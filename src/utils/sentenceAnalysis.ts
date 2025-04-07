
import { analyzeSentimentFromSentence } from "./sentimentConsistency";

// ฐานข้อมูลตัวอย่างเริ่มต้น (จะไม่ใช้ข้อมูลความรู้สึกของคำแล้ว)
export const wordPolarityDatabase = [
  { word: "รัก", templates: ["${บวก}${รัก}ทำให้โลกหมุนไป", "${บวก}${รัก}คือพลังที่ยิ่งใหญ่", "${บวก}เมื่อมี${รัก}ทุกอย่างก็ดูสดใส"] },
  { word: "สุข", templates: ["${บวก}ความ${สุข}อยู่รอบตัวเรา", "${บวก}${สุข}เล็กๆ น้อยๆ ทำให้ชีวิตมีความหมาย"] },
  { word: "สู้", templates: ["${บวก}${สู้}ไปด้วยกัน เราจะผ่านมันไปได้", "${บวก}${สู้}ต่อไป อย่ายอมแพ้"] },
  { word: "หวัง", templates: ["${บวก}ความ${หวัง}ทำให้เรามีกำลังใจ", "${บวก}${หวัง}แล้วทำ ฝันจะเป็นจริง"] },
  { word: "เหนื่อย", templates: ["${บวก}${เหนื่อย}วันนี้ เพื่อสบายในวันหน้า", "${บวก}เมื่อ${เหนื่อย}ได้พัก เมื่อพักแล้วลุยต่อ"] },
  { word: "ล้ม", templates: ["${บวก}${ล้ม}แล้วลุกขึ้นใหม่", "${บวก}การ${ล้ม}คือบทเรียน ไม่ใช่ความล้มเหลว"] },
  { word: "เสียใจ", templates: ["${ลบ}ความ${เสียใจ}จะผ่านไป พรุ่งนี้ต้องดีกว่า", "${ลบ}แม้จะ${เสียใจ} แต่อย่าท้อแท้"] },
  { word: "กลัว", templates: ["${ลบ}ความ${กลัว}เป็นเพียงอุปสรรคที่เราสร้างขึ้นเอง", "${ลบ}อย่าให้ความ${กลัว}หยุดคุณไว้"] },
  { word: "ผิดหวัง", templates: ["${ลบ}ความ${ผิดหวัง}จะทำให้เราเข้มแข็งขึ้น", "${ลบ}${ผิดหวัง}วันนี้ เพื่อเรียนรู้และเติบโตในวันหน้า"] },
];

// ฟังก์ชั่นสำหรับดึงความรู้สึกของคำจากฐานข้อมูล (อัพเดทให้ใช้ความรู้สึกจากแม่แบบแทน)
export const getWordPolarity = (word: string): { polarity: 'positive' | 'negative', score: number } => {
  let database = [];
  
  try {
    const storedData = localStorage.getItem("word-polarity-database");
    if (storedData) {
      database = JSON.parse(storedData);
    } else {
      database = wordPolarityDatabase;
    }
  } catch (e) {
    console.error("Error parsing stored word database:", e);
    database = wordPolarityDatabase;
  }
  
  // ค้นหาคำในฐานข้อมูล
  const wordEntry = database.find((entry: any) => entry.word === word);
  
  if (wordEntry && wordEntry.templates && wordEntry.templates.length > 0) {
    // ใช้แม่แบบแรกเพื่อวิเคราะห์ความรู้สึก
    const { sentiment } = analyzeSentimentFromSentence("", wordEntry.templates[0]);
    return {
      polarity: sentiment,
      score: sentiment === 'positive' ? 1 : -1
    };
  }
  
  // ค่าเริ่มต้น หากไม่พบคำในฐานข้อมูล
  return { polarity: 'positive', score: 1 };
};

// Function to analyze a sentence for sentiment
export const analyzeSentence = (sentence: string | string[]): { 
  polarity: 'positive' | 'negative'; 
  score: number;
  breakdown: {
    positive: number;
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
  // Convert array of words to a single string if needed
  const sentenceText = Array.isArray(sentence) ? sentence.join(' ') : sentence;
  
  const result = analyzeSentimentFromSentence(sentenceText);
  
  // Count positive and negative words
  let positiveCount = 0;
  let negativeCount = 0;
  
  // If sentence is an array of words, analyze each word
  if (Array.isArray(sentence)) {
    sentence.forEach(word => {
      const wordPolarity = getWordPolarity(word);
      if (wordPolarity.polarity === 'positive') positiveCount++;
      else negativeCount++;
    });
  } else {
    // For a single string, estimate based on the overall sentiment
    const words = sentence.split(/\s+/).filter(word => word.length > 0);
    const totalWords = words.length || 1;
    
    if (result.sentiment === 'positive') {
      positiveCount = Math.ceil(totalWords * 0.8);
      negativeCount = totalWords - positiveCount;
    } else {
      negativeCount = Math.ceil(totalWords * 0.8);
      positiveCount = totalWords - negativeCount;
    }
  }
  
  // Determine quality of emotion flow
  let quality: 'excellent' | 'good' | 'poor' = 'good';
  if (positiveCount > negativeCount * 2) {
    quality = 'excellent';
  } else if (negativeCount > positiveCount) {
    quality = 'poor';
  }
  
  // Determine if there's a consistency in sentiment
  const consistency = Math.abs(positiveCount - negativeCount) > Math.min(positiveCount, negativeCount);
  
  // Calculate confidence based on clarity of sentiment
  const totalWords = positiveCount + negativeCount || 1;
  const dominantSentiment = Math.max(positiveCount, negativeCount);
  const confidence = dominantSentiment / totalWords;
  
  // Determine if moderation is needed
  const needsModeration = negativeCount > totalWords * 0.5;
  
  // Generate a suggestion based on analysis
  let suggestion = "ประโยคมีความสมดุลดี ทั้งแง่บวกและลบ";
  if (quality === 'excellent') {
    suggestion = "ประโยคมีพลังบวกสูง เหมาะแก่การสร้างกำลังใจ";
  } else if (quality === 'poor') {
    suggestion = "ควรเพิ่มคำที่มีความหมายเชิงบวกมากขึ้น";
  }
  
  return {
    polarity: result.sentiment,
    score: result.score,
    breakdown: {
      positive: positiveCount,
      negative: negativeCount
    },
    emotionFlow: {
      quality,
      consistency
    },
    confidence,
    needsModeration,
    suggestion
  };
};
