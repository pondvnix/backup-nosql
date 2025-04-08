
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
