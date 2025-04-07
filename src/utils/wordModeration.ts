import { analyzeSentimentFromSentence } from "./sentimentConsistency";

// Define TemplateSentiment as a string type for better TypeScript compatibility
export type TemplateSentiment = 'positive' | 'neutral' | 'negative';

// Template interface for word templates
export interface Template {
  template: string;
  sentiment: TemplateSentiment;
}

// Helper function to standardize contributor names - ปรับปรุงเพื่อรับรองว่าชื่อจะไม่เป็นค่าว่างหรือ undefined
export const standardizeContributorName = (contributor?: string): string => {
  // ตรวจสอบว่าเป็น null หรือ undefined
  if (contributor === null || contributor === undefined) {
    return 'ไม่ระบุชื่อ';
  }
  
  // ตรวจสอบว่าเป็นสตริงที่มีความยาวมากกว่า 0 หรือไม่
  const trimmedContributor = contributor.trim();
  return trimmedContributor.length > 0 ? trimmedContributor : 'ไม่ระบุชื่อ';
};

// ฟังก์ชั่นตรวจสอบความถูกต้องของคำที่ป้อนเข้ามา
export const validateWordInput = (word: string, contributor: string): { isValid: boolean, message: string } => {
  if (!word.trim()) {
    return { isValid: false, message: "กรุณาใส่คำที่ต้องการ" };
  }
  
  // ตรวจสอบว่าคำที่ใส่มีคำหยาบหรือไม่
  if (moderateText(word)) {
    return { isValid: false, message: "คำนี้ไม่เหมาะสม กรุณาใช้คำอื่น" };
  }
  
  return { isValid: true, message: "คำถูกต้อง" };
};

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
  contributor: string = 'ไม่ระบุชื่อ',
  template?: string
): boolean => {
  try {
    // ตรวจสอบว่าคำหรือประโยคมีปัญหาหรือไม่
    if (moderateText(word) || moderateText(sentence)) {
      return false;
    }
    
    // วิเคราะห์ความรู้สึกจากแม่แบบหรือประโยค
    const { sentiment, score } = analyzeMotivationalSentence(sentence, template);
    
    // Standardize contributor - แก้ไขการใช้งานเพื่อไม่ให้มีชื่อว่าง
    const safeContributor = standardizeContributorName(contributor);
    
    // สร้างรายการใหม่
    const timestamp = new Date();
    const uniqueId = `${word}-${sentence}-${safeContributor}-${timestamp.getTime()}`;
    
    const newEntry = {
      word,
      sentence,
      contributor: safeContributor,
      timestamp,
      polarity: sentiment,
      score: score,
      template: template,
      id: uniqueId
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
    
    // Check for duplicates before adding - using a more stringent check
    const isDuplicate = existingEntries.some(
      (entry: any) => entry.word === word && 
                     entry.sentence === sentence && 
                     standardizeContributorName(entry.contributor) === safeContributor
    );
    
    // เพิ่มรายการใหม่ถ้าไม่ซ้ำ
    if (!isDuplicate) {
      existingEntries.push(newEntry);
      
      // บันทึกลง localStorage
      localStorage.setItem('motivation-sentences', JSON.stringify(existingEntries));
      
      // แจ้งเตือนคอมโพเนนต์อื่นๆ ว่ามีการเพิ่มประโยคใหม่
      const event = new CustomEvent('motivation-billboard-updated');
      window.dispatchEvent(event);
      
      return true;
    }
    
    return false;
  } catch (error) {
    console.error("Error saving motivational sentence:", error);
    return false;
  }
};

// ฟังก์ชั่นสำหรับเพิ่มคำใหม่ลงในฐานข้อมูล
export const addWordToDatabase = (
  word: string,
  sentiment: TemplateSentiment = 'neutral',
  score: number = 0,
  templates: Template[] = []
): boolean => {
  try {
    // ดึงข้อมูลเดิม
    let database = [];
    const storedData = localStorage.getItem("word-polarity-database");
    if (storedData) {
      database = JSON.parse(storedData);
    }
    
    // แปลง Template[] เป็น string[] ที่มีรูปแบบถูกต้อง
    const templateStrings = templateObjectsToStrings(templates);
    
    // ตรวจสอบว่ามีคำนี้อยู่แล้วหรือไม่
    const existingWordIndex = database.findIndex((entry: any) => entry.word === word);
    
    if (existingWordIndex !== -1) {
      // หากมีคำนี้อยู่แล้ว ให้อัปเดต templates
      database[existingWordIndex].templates = templateStrings;
    } else {
      // หากยังไม่มีคำนี้ ให้เพิ่มใหม่
      database.push({
        word,
        templates: templateStrings
      });
    }
    
    // บันทึกลงใน localStorage
    localStorage.setItem("word-polarity-database", JSON.stringify(database));
    
    // แจ้งเตือนคอมโพเนนต์อื่นๆ
    const event = new CustomEvent('word-database-updated');
    window.dispatchEvent(event);
    
    return true;
  } catch (error) {
    console.error("Error adding word to database:", error);
    return false;
  }
};

// ฟังก์ชั่นสำหรับอัปเดตความ��ู้สึกของคำ
export const updateWordPolarity = (
  word: string, 
  sentiment: TemplateSentiment = 'neutral',
  score: number = 0, 
  templates: Template[] = []
): boolean => {
  return addWordToDatabase(word, sentiment, score, templates);
};

// ฟังก์ชั่นสำหรับลบคำออกจากฐานข้อมูล
export const deleteWord = (word: string): boolean => {
  try {
    // ดึงข้อมูลเดิม
    const storedData = localStorage.getItem("word-polarity-database");
    if (storedData) {
      let database = JSON.parse(storedData);
      
      // ลบคำที่ต้องการ
      database = database.filter((entry: any) => entry.word !== word);
      
      // บันทึกกลับลงใน localStorage
      localStorage.setItem("word-polarity-database", JSON.stringify(database));
      
      // แจ้งเตือนคอมโพเนนต์อื่นๆ
      const event = new CustomEvent('word-database-updated');
      window.dispatchEvent(event);
      
      return true;
    }
    return false;
  } catch (error) {
    console.error("Error deleting word from database:", error);
    return false;
  }
};

// ตรวจสอบว่ามีแม่แบบซ้ำกันหรือไม่
export const hasDuplicateTemplates = (templates: Template[]): boolean => {
  const uniqueTemplates = new Set(templates.map(t => t.template));
  return uniqueTemplates.size !== templates.length;
};

// แปลงสตริงเทมเพลตให้เป็นอ็อบเจกต์
export const stringToTemplateObjects = (templates: string[]): Template[] => {
  return templates.map(template => {
    if (template.includes("${บวก}")) {
      return {
        template: template.replace(/\$\{บวก\}/g, ''),
        sentiment: 'positive'
      };
    } else if (template.includes("${ลบ}")) {
      return {
        template: template.replace(/\$\{ลบ\}/g, ''),
        sentiment: 'negative'
      };
    } else {
      return {
        template: template.replace(/\$\{กลาง\}/g, ''),
        sentiment: 'neutral'
      };
    }
  });
};

// แปลงอ็อบเจกต์เทมเพลตให้เป็นสตริง
export const templateObjectsToStrings = (templates: Template[]): string[] => {
  return templates.map(template => {
    switch (template.sentiment) {
      case 'positive':
        return `\${บวก}${template.template}`;
      case 'negative':
        return `\${ลบ}${template.template}`;
      case 'neutral':
      default:
        return `\${กลาง}${template.template}`;
    }
  });
};

// แยกวิเคราะห์ templates จากข้อความ
export const parseTemplates = (templatesString: string): Template[] => {
  if (!templatesString.trim()) {
    return [];
  }
  
  // แยกตามบรรทัดและคอมม่า
  const templateStrings = templatesString
    .split(/[\n,]+/)
    .map(line => line.trim())
    .filter(line => line !== '');
  
  return templateStrings.map(templateString => {
    let sentiment: TemplateSentiment = 'neutral';
    let template = templateString;
    
    if (templateString.includes('${บวก}')) {
      sentiment = 'positive';
      template = templateString.replace(/\$\{บวก\}/g, '');
    } else if (templateString.includes('${ลบ}')) {
      sentiment = 'negative';
      template = templateString.replace(/\$\{ลบ\}/g, '');
    } else if (templateString.includes('${กลาง}')) {
      sentiment = 'neutral';
      template = templateString.replace(/\$\{กลาง\}/g, '');
    }
    
    return { sentiment, template };
  });
};
