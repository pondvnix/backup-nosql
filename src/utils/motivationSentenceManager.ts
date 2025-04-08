
// นิยามรูปแบบข้อมูลประโยคให้กำลังใจ
export interface MotivationalSentence {
  word: string;
  sentence: string;
  contributor?: string;
  template?: string;
  sentiment?: 'positive' | 'neutral' | 'negative';
  score?: number;
  timestamp: string | Date;
  id?: string;
}

// ฟังก์ชันบันทึกประโยคให้กำลังใจ
export const saveMotivationalSentence = (sentence: MotivationalSentence): void => {
  // ดึงข้อมูลประโยคเดิมจาก localStorage
  const storedData = localStorage.getItem('motivation-sentences');
  let sentences: MotivationalSentence[] = [];
  
  // ถ้ามีข้อมูลเดิม ให้แปลงเป็น array
  if (storedData) {
    try {
      sentences = JSON.parse(storedData);
      // ตรวจสอบว่าเป็น array หรือไม่
      if (!Array.isArray(sentences)) {
        sentences = [];
      }
    } catch (error) {
      console.error('Error parsing motivation sentences:', error);
    }
  }
  
  // สร้าง ID ที่ไม่ซ้ำกันสำหรับประโยคนี้
  const id = `${sentence.word}-${new Date().getTime()}`;
  
  // เพิ่มประโยคใหม่เข้าไปในรายการ
  sentences.push({
    ...sentence,
    id,
    timestamp: new Date().toISOString()
  });
  
  // บันทึกข้อมูลลงใน localStorage
  localStorage.setItem('motivation-sentences', JSON.stringify(sentences));
  
  // ส่ง event เพื่อแจ้งให้ component อื่น ๆ รู้ว่ามีการอัปเดตประโยค
  const sentenceEvent = new CustomEvent('motivation-billboard-updated');
  window.dispatchEvent(sentenceEvent);
};

// ฟังก์ชันดึงประโยคให้กำลังใจทั้งหมด
export const getMotivationalSentences = (): MotivationalSentence[] => {
  // ดึงข้อมูลประโยคจาก localStorage
  const storedData = localStorage.getItem('motivation-sentences');
  
  if (storedData) {
    try {
      const sentences = JSON.parse(storedData);
      // ตรวจสอบว่าเป็น array หรือไม่
      if (Array.isArray(sentences)) {
        return sentences;
      }
    } catch (error) {
      console.error('Error parsing motivation sentences:', error);
    }
  }
  
  return [];
};

// ฟังก์ชันล้างประโยคให้กำลังใจทั้งหมด
export const clearMotivationalSentences = (): void => {
  localStorage.removeItem('motivation-sentences');
  
  // ส่ง event เพื่อแจ้งให้ component อื่น ๆ รู้ว่ามีการอัปเดตประโยค
  const sentenceEvent = new CustomEvent('motivation-billboard-updated');
  window.dispatchEvent(sentenceEvent);
};
