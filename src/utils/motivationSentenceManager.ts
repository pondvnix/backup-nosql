
/**
 * ระบบจัดการประโยคกำลังใจ
 */

import { getContributorName, promptForContributorName } from './contributorManager';

// ตัวแปรคงที่สำหรับ key ที่ใช้เก็บใน localStorage
const MOTIVATION_SENTENCES_KEY = 'motivation-sentences';

// กำหนดรูปแบบข้อมูลของประโยคกำลังใจ
export interface MotivationalSentence {
  word: string;
  sentence: string;
  contributor?: string;
  timestamp: string | number | Date;
  template?: string;
  sentiment?: 'positive' | 'neutral' | 'negative';
  score?: number;
  id?: string;
}

/**
 * สร้าง ID ที่ไม่ซ้ำสำหรับประโยคให้กำลังใจ
 */
export const generateUniqueId = (sentence: MotivationalSentence): string => {
  const timestamp = new Date(sentence.timestamp).getTime();
  const contributor = sentence.contributor || 'unknown';
  return `${sentence.word}-${contributor}-${timestamp}`;
};

/**
 * บันทึกประโยคให้กำลังใจลงใน localStorage
 */
export const saveMotivationalSentence = (sentence: MotivationalSentence): void => {
  const sentences = getMotivationalSentences();
  
  // ตรวจสอบให้แน่ใจว่ามีการระบุผู้สร้าง
  if (!sentence.contributor || sentence.contributor.trim() === '') {
    sentence.contributor = promptForContributorName();
  }
  
  // ตรวจสอบให้แน่ใจว่ามี timestamp
  if (!sentence.timestamp) {
    sentence.timestamp = new Date().toISOString();
  }
  
  // สร้าง ID ที่ไม่ซ้ำ
  sentence.id = generateUniqueId(sentence);
  
  // ตรวจสอบว่าไม่มีประโยคซ้ำก่อนที่จะบันทึก
  const isDuplicate = sentences.some(existing => 
    existing.id === sentence.id || 
    (existing.word === sentence.word && 
     existing.sentence === sentence.sentence && 
     existing.contributor === sentence.contributor)
  );
  
  if (!isDuplicate) {
    sentences.push(sentence);
    localStorage.setItem(MOTIVATION_SENTENCES_KEY, JSON.stringify(sentences));
    
    // ส่งเหตุการณ์แจ้งเตือนว่ามีการอัปเดต
    dispatchSentenceUpdateEvent();
  }
};

/**
 * ดึงประโยคให้กำลังใจทั้งหมดจาก localStorage
 */
export const getMotivationalSentences = (): MotivationalSentence[] => {
  try {
    const stored = localStorage.getItem(MOTIVATION_SENTENCES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Error reading motivation sentences from localStorage:", error);
    return [];
  }
};

/**
 * ล้างประโยคให้กำลังใจทั้งหมดใน localStorage
 */
export const clearMotivationalSentences = (): void => {
  localStorage.removeItem(MOTIVATION_SENTENCES_KEY);
  dispatchSentenceUpdateEvent();
};

/**
 * ส่งเหตุการณ์แจ้งเตือนว่ามีการอัปเดตข้อมูล
 */
export const dispatchSentenceUpdateEvent = (): void => {
  window.dispatchEvent(new CustomEvent('motivation-billboard-updated'));
};
