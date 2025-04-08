
/**
 * ระบบจัดการชื่อผู้ร่วมสร้างประโยคกำลังใจ
 */

// ตัวแปรคงที่สำหรับ key ที่ใช้เก็บใน localStorage
const CONTRIBUTOR_NAME_KEY = 'contributor-name';
const DEFAULT_CONTRIBUTOR_NAME = 'ไม่ระบุชื่อ';
const WORD_USAGE_KEY = 'word-usage-stats';

/**
 * บันทึกชื่อผู้ร่วมสร้างลงใน localStorage
 */
export const saveContributorName = (name: string): void => {
  if (!name || name.trim() === '') {
    localStorage.removeItem(CONTRIBUTOR_NAME_KEY);
    return;
  }
  
  localStorage.setItem(CONTRIBUTOR_NAME_KEY, name.trim());
};

/**
 * ดึงชื่อผู้ร่วมสร้างจาก localStorage
 * ถ้าไม่มีจะคืนค่า default
 */
export const getContributorName = (): string => {
  const storedName = localStorage.getItem(CONTRIBUTOR_NAME_KEY);
  return storedName && storedName.trim() !== '' ? storedName.trim() : DEFAULT_CONTRIBUTOR_NAME;
};

/**
 * ตรวจสอบว่ามีการตั้งชื่อผู้ร่วมสร้างหรือไม่
 */
export const hasContributorName = (): boolean => {
  const storedName = localStorage.getItem(CONTRIBUTOR_NAME_KEY);
  return storedName !== null && storedName.trim() !== '';
};

/**
 * แสดง dialog ให้ผู้ใช้ป้อนชื่อผู้ร่วมสร้าง (ถ้ายังไม่มี)
 * คืนค่าชื่อที่ได้ - ปรับปรุงให้ไม่แสดง popup และใช้ชื่อ default แทน
 */
export const promptForContributorName = (): string => {
  // ไม่มีการแสดง popup อีกต่อไป เนื่องจากมีการระบุชื่อในส่วนอื่นแล้ว
  // แทนที่จะถาม ให้นำชื่อที่มีอยู่แล้วมาใช้หรือใช้ค่า default
  return getContributorName();
};

/**
 * บันทึกประวัติการใช้คำ
 * @param word คำที่ต้องการบันทึกการใช้
 */
export const saveWordUse = (word: string): void => {
  if (!word || word.trim() === '') {
    return;
  }
  
  try {
    // Get existing usage stats
    const storedStats = localStorage.getItem(WORD_USAGE_KEY);
    const stats = storedStats ? JSON.parse(storedStats) : {};
    
    // Update the count for this word
    const normWord = word.trim().toLowerCase();
    stats[normWord] = (stats[normWord] || 0) + 1;
    
    // Save updated stats
    localStorage.setItem(WORD_USAGE_KEY, JSON.stringify(stats));
    
    // Dispatch an event that a word was used
    const event = new CustomEvent('word-used', { detail: { word: normWord } });
    window.dispatchEvent(event);
  } catch (error) {
    console.error("Error saving word usage:", error);
  }
};

/**
 * ดึงสถิติการใช้คำ
 * @returns Object ที่มี key เป็นคำและ value เป็นจำนวนครั้งที่ใช้
 */
export const getWordUsageStats = (): Record<string, number> => {
  try {
    const storedStats = localStorage.getItem(WORD_USAGE_KEY);
    return storedStats ? JSON.parse(storedStats) : {};
  } catch (error) {
    console.error("Error getting word usage stats:", error);
    return {};
  }
};
