
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
 * คืนค่าชื่อที่ได้
 */
export const promptForContributorName = (): string => {
  if (hasContributorName()) {
    return getContributorName();
  }
  
  const name = window.prompt('กรุณาระบุชื่อผู้ให้กำลังใจ', '');
  
  if (name !== null && name.trim() !== '') {
    saveContributorName(name.trim());
    return name.trim();
  }
  
  return DEFAULT_CONTRIBUTOR_NAME;
};
