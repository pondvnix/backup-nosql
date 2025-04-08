
// Type definitions
export interface Template {
  text: string;
  sentiment: 'positive' | 'neutral' | 'negative';
}

export enum TemplateSentiment {
  POSITIVE = 'positive',
  NEUTRAL = 'neutral',
  NEGATIVE = 'negative'
}

export interface WordEntry {
  word: string;
  templates: string[];
  polarity?: number;
}

// ฟังก์ชันอัปเดตสถิติการใช้คำของผู้ร่วมสร้าง
export const updateContributorStats = (contributorName: string): void => {
  if (!contributorName) return;
  
  // ดึงข้อมูลสถิติจาก localStorage
  const storedData = localStorage.getItem('contributor-stats');
  let contributorStats: Record<string, number> = {};
  
  // ถ้ามีข้อมูลเดิม ให้แปลงเป็น object
  if (storedData) {
    try {
      contributorStats = JSON.parse(storedData);
    } catch (error) {
      console.error('Error parsing contributor stats:', error);
    }
  }
  
  // เพิ่มจำนวนคำที่ใช้
  contributorStats[contributorName] = (contributorStats[contributorName] || 0) + 1;
  
  // บันทึกข้อมูลลงใน localStorage
  localStorage.setItem('contributor-stats', JSON.stringify(contributorStats));
};

// ฟังก์ชันดึงสถิติการใช้คำของผู้ร่วมสร้างทั้งหมด
export const getContributorStats = (): Record<string, number> => {
  // ดึงข้อมูลสถิติจาก localStorage
  const storedData = localStorage.getItem('contributor-stats');
  
  if (storedData) {
    try {
      return JSON.parse(storedData);
    } catch (error) {
      console.error('Error parsing contributor stats:', error);
    }
  }
  
  return {};
};

// ฟังก์ชันรีเซ็ตสถิติการใช้คำของผู้ร่วมสร้างทั้งหมด
export const resetContributorStats = (): void => {
  localStorage.removeItem('contributor-stats');
};

// Word database management functions
export const getWordDatabase = (): WordEntry[] => {
  const storedData = localStorage.getItem('word-suggestions');
  if (storedData) {
    try {
      return JSON.parse(storedData);
    } catch (error) {
      console.error('Error parsing word database:', error);
      return [];
    }
  }
  return [];
};

export const updateWordDatabase = (wordEntries: WordEntry[]): void => {
  localStorage.setItem('word-suggestions', JSON.stringify(wordEntries));
};

export const addWord = (wordEntry: WordEntry): void => {
  const wordEntries = getWordDatabase();
  wordEntries.push(wordEntry);
  updateWordDatabase(wordEntries);
};

export const addWordToDatabase = (word: string, templates: string[]): void => {
  const wordEntries = getWordDatabase();
  const existingIndex = wordEntries.findIndex(entry => entry.word === word);
  
  if (existingIndex !== -1) {
    wordEntries[existingIndex].templates = templates;
  } else {
    wordEntries.push({ word, templates });
  }
  
  updateWordDatabase(wordEntries);
};

export const updateWordPolarity = (word: string, polarity: number): void => {
  const wordEntries = getWordDatabase();
  const existingIndex = wordEntries.findIndex(entry => entry.word === word);
  
  if (existingIndex !== -1) {
    wordEntries[existingIndex].polarity = polarity;
    updateWordDatabase(wordEntries);
  }
};

export const deleteWord = (word: string): void => {
  const wordEntries = getWordDatabase();
  const updatedEntries = wordEntries.filter(entry => entry.word !== word);
  updateWordDatabase(updatedEntries);
};

// Template utilities
export const templateObjectsToStrings = (templates: Template[]): string[] => {
  return templates.map(template => {
    switch (template.sentiment) {
      case 'positive':
        return `\${บวก}${template.text}`;
      case 'neutral':
        return `\${กลาง}${template.text}`;
      case 'negative':
        return `\${ลบ}${template.text}`;
      default:
        return template.text;
    }
  });
};

export const stringToTemplateObjects = (templates: string[]): Template[] => {
  return templates.map(template => {
    if (template.includes('${บวก}')) {
      return {
        text: template.replace('${บวก}', ''),
        sentiment: 'positive'
      };
    } else if (template.includes('${กลาง}')) {
      return {
        text: template.replace('${กลาง}', ''),
        sentiment: 'neutral'
      };
    } else if (template.includes('${ลบ}')) {
      return {
        text: template.replace('${ลบ}', ''),
        sentiment: 'negative'
      };
    } else {
      return {
        text: template,
        sentiment: 'neutral'
      };
    }
  });
};

// Validation utilities
export const validateWordInput = (word: string, templates: string[]): { valid: boolean; message?: string } => {
  if (!word.trim()) {
    return { valid: false, message: 'คำต้องไม่เป็นค่าว่าง' };
  }
  
  if (templates.length === 0) {
    return { valid: false, message: 'ต้องมีแม่แบบประโยคอย่างน้อย 1 รายการ' };
  }
  
  return { valid: true };
};

export const hasDuplicateTemplates = (templates: string[]): boolean => {
  const uniqueTemplates = new Set(templates);
  return uniqueTemplates.size !== templates.length;
};

export const parseTemplates = (rawTemplates: string): string[] => {
  return rawTemplates
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);
};

export const getSentimentAnalysis = (templates: string[]): { positive: number; neutral: number; negative: number } => {
  let positive = 0;
  let neutral = 0;
  let negative = 0;
  
  templates.forEach(template => {
    if (template.includes('${บวก}')) {
      positive++;
    } else if (template.includes('${กลาง}')) {
      neutral++;
    } else if (template.includes('${ลบ}')) {
      negative++;
    } else {
      neutral++;
    }
  });
  
  return { positive, neutral, negative };
};
