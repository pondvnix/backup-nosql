
// ฟังก์ชันดึงชื่อผู้ร่วมสร้าง
export const getContributorName = (): string => {
  const storedName = localStorage.getItem('contributor-name');
  return storedName || 'ไม่ระบุชื่อ';
};

// ฟังก์ชันบันทึกชื่อผู้ร่วมสร้าง
export const setContributorName = (name: string): void => {
  localStorage.setItem('contributor-name', name);
};
