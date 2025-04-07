
import { analyzeSentimentFromSentence } from "./sentimentConsistency";

// ฟังก์ชั่นสำหรับดึงข้อมูลสถิติผู้ร่วมสร้างกำลังใจ
export const getContributorStats = (): Record<string, number> => {
  const contributorStats: Record<string, number> = {};
  
  try {
    // ดึงข้อมูลจาก localStorage
    const stored = localStorage.getItem('motivation-sentences');
    if (stored) {
      const sentences = JSON.parse(stored);
      
      sentences.forEach((entry: any) => {
        const contributor = entry.contributor || 'Anonymous';
        contributorStats[contributor] = (contributorStats[contributor] || 0) + 1;
      });
    }
  } catch (error) {
    console.error("Error fetching contributor stats:", error);
  }
  
  return contributorStats;
};

// ฟังก์ชั่นสำหรับจัดการกับคำที่อาจจะเป็นปัญหา
export const moderateText = (text: string): boolean => {
  // คำที่อาจจะเป็นปัญหา (เพิ่มเติมได้ตามต้องการ)
  const problematicWords = [
    'เหี้ย', 'สัส', 'ควย', 'เหี้', 'เย็ด', 'มึง', 'กู', 'ไอ้', 'fuck', 'shit', 'porn'
  ];
  
  // ตรวจสอบว่ามีคำที่อาจจะเป็นปัญหาหรือไม่
  const lowerText = text.toLowerCase();
  return problematicWords.some(word => lowerText.includes(word));
};

// ฟังก์ชั่นสำหรับวิเคราะห์ประโยคกำลังใจ
export const analyzeMotivationalSentence = (sentence: string, template?: string) => {
  // ถ้ามี template ใช้ความรู้สึกจาก template
  if (template) {
    return analyzeSentimentFromSentence("", template);
  }
  
  // ถ้าไม่มี template วิเคราะห์จากประโยค
  return analyzeSentimentFromSentence(sentence);
};

// ฟังก์ชั่นสำหรับบันทึกประโยคกำลังใจลงใน localStorage
export const saveMotivationalSentence = (
  word: string, 
  sentence: string, 
  contributor: string = 'Anonymous',
  template?: string
): boolean => {
  try {
    // ตรวจสอบว่าคำหรือประโยคมีปัญหาหรือไม่
    if (moderateText(word) || moderateText(sentence)) {
      return false;
    }
    
    // วิเคราะห์ความรู้สึกจากแม่แบบหรือประโยค
    const { sentiment, score } = analyzeMotivationalSentence(sentence, template);
    
    // สร้างรายการใหม่
    const newEntry = {
      word,
      sentence,
      contributor,
      timestamp: new Date(),
      polarity: sentiment,
      score: score,
      template: template
    };
    
    // ดึงข้อมูลเดิม (ถ้ามี)
    let existingEntries = [];
    const stored = localStorage.getItem('motivation-sentences');
    if (stored) {
      existingEntries = JSON.parse(stored);
      if (!Array.isArray(existingEntries)) {
        existingEntries = [existingEntries];
      }
    }
    
    // เพิ่มรายการใหม่
    existingEntries.push(newEntry);
    
    // บันทึกลง localStorage
    localStorage.setItem('motivation-sentences', JSON.stringify(existingEntries));
    
    // แจ้งเตือนคอมโพเนนต์อื่นๆ ว่ามีการเพิ่มประโยคใหม่
    const event = new CustomEvent('motivation-billboard-updated');
    window.dispatchEvent(event);
    
    return true;
  } catch (error) {
    console.error("Error saving motivational sentence:", error);
    return false;
  }
};
