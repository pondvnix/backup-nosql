
/**
 * ระบบจัดการชื่อผู้ร่วมสร้างประโยคกำลังใจ
 */

// ตัวแปรคงที่สำหรับ key ที่ใช้เก็บใน localStorage
const CONTRIBUTOR_NAME_KEY = 'contributor-name';
const DEFAULT_CONTRIBUTOR_NAME = 'ไม่ระบุชื่อ';

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
