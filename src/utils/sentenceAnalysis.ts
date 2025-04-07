
import { analyzeSentimentFromSentence } from "./sentimentConsistency";

// ฐานข้อมูลตัวอย่างเริ่มต้น (จะไม่ใช้ข้อมูลความรู้สึกของคำแล้ว)
export const wordPolarityDatabase = [
  { word: "รัก", templates: ["${บวก}${รัก}ทำให้โลกหมุนไป", "${บวก}${รัก}คือพลังที่ยิ่งใหญ่", "${บวก}เมื่อมี${รัก}ทุกอย่างก็ดูสดใส"] },
  { word: "สุข", templates: ["${บวก}ความ${สุข}อยู่รอบตัวเรา", "${บวก}${สุข}เล็กๆ น้อยๆ ทำให้ชีวิตมีความหมาย"] },
  { word: "สู้", templates: ["${บวก}${สู้}ไปด้วยกัน เราจะผ่านมันไปได้", "${บวก}${สู้}ต่อไป อย่ายอมแพ้"] },
  { word: "หวัง", templates: ["${บวก}ความ${หวัง}ทำให้เรามีกำลังใจ", "${กลาง}${หวัง}แล้วทำ ฝันจะเป็นจริง"] },
  { word: "เหนื่อย", templates: ["${กลาง}${เหนื่อย}วันนี้ เพื่อสบายในวันหน้า", "${กลาง}เมื่อ${เหนื่อย}ได้พัก เมื่อพักแล้วลุยต่อ"] },
  { word: "ล้ม", templates: ["${กลาง}${ล้ม}แล้วลุกขึ้นใหม่", "${กลาง}การ${ล้ม}คือบทเรียน ไม่ใช่ความล้มเหลว"] },
  { word: "เสียใจ", templates: ["${ลบ}ความ${เสียใจ}จะผ่านไป พรุ่งนี้ต้องดีกว่า", "${ลบ}แม้จะ${เสียใจ} แต่อย่าท้อแท้"] },
  { word: "กลัว", templates: ["${ลบ}ความ${กลัว}เป็นเพียงอุปสรรคที่เราสร้างขึ้นเอง", "${ลบ}อย่าให้ความ${กลัว}หยุดคุณไว้"] },
  { word: "ผิดหวัง", templates: ["${ลบ}ความ${ผิดหวัง}จะทำให้เราเข้มแข็งขึ้น", "${ลบ}${ผิดหวัง}วันนี้ เพื่อเรียนรู้และเติบโตในวันหน้า"] },
];

// ฟังก์ชั่นสำหรับดึงความรู้สึกของคำจากฐานข้อมูล (อัพเดทให้ใช้ความรู้สึกจากแม่แบบแทน)
export const getWordPolarity = (word: string): { polarity: 'positive' | 'neutral' | 'negative', score: number } => {
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
      score: sentiment === 'positive' ? 1 : sentiment === 'negative' ? -1 : 0
    };
  }
  
  // ค่าเริ่มต้น หากไม่พบคำในฐานข้อมูล
  return { polarity: 'neutral', score: 0 };
};

// Function to analyze a sentence for sentiment
export const analyzeSentence = (sentence: string): { 
  polarity: 'positive' | 'neutral' | 'negative'; 
  score: number;
  database?: any;
} => {
  const result = analyzeSentimentFromSentence(sentence);
  return {
    polarity: result.sentiment,
    score: result.score
  };
};
