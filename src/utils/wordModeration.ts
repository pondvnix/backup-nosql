

// List of possible inappropriate words to filter (this is a simple example)
// In a production environment, this should be on the server side
const forbiddenWords = [
  "badword1",
  "badword2",
  // Add more words as needed
];

// Default words for the management page
export const DEFAULT_WORDS = [
  {
    word: "กำลังใจ",
    polarity: "positive" as const,
    templates: ["${กำลังใจ}คือสิ่งสำคัญที่ทำให้เราเดินต่อไปได้"],
    score: 1
  },
  {
    word: "อดทน",
    polarity: "positive" as const,
    templates: ["การ${อดทน}จะนำไปสู่ความสำเร็จ"],
    score: 1
  },
  {
    word: "สู้",
    polarity: "positive" as const,
    templates: ["${สู้}ต่อไป แม้จะเหนื่อยแค่ไหนก็ตาม"],
    score: 1
  }
];

export const isWordAppropriate = (word: string): boolean => {
  // Convert to lowercase to make checking case-insensitive
  const lowercaseWord = word.toLowerCase();
  
  // Check if the word is in the forbidden list
  return !forbiddenWords.some(forbidden => 
    lowercaseWord === forbidden || lowercaseWord.includes(forbidden)
  );
};

export const validateWordInput = (
  word: string, 
  contributor: string
): { isValid: boolean; message?: string } => {
  if (!word.trim()) {
    return { isValid: false, message: "กรุณาใส่คำที่ต้องการ" };
  }

  if (!contributor.trim()) {
    return { isValid: false, message: "กรุณาใส่ชื่อของคุณ" };
  }

  // Check for multiple words (contains spaces)
  if (word.trim().includes(" ")) {
    return { 
      isValid: false, 
      message: "กรุณาใส่เพียงคำเดียว ไม่รวมช่องว่าง" 
    };
  }

  // Check for word length
  if (word.length > 30) {
    return {
      isValid: false,
      message: "คำต้องมีความยาวไม่เกิน 30 ตัวอักษร"
    };
  }

  // Check for inappropriate content
  if (!isWordAppropriate(word)) {
    return {
      isValid: false,
      message: "คำนี้ไม่เหมาะสม กรุณาใช้คำอื่น"
    };
  }

  return { isValid: true };
};

export const getContributorStats = (): Record<string, number> => {
  try {
    const storedWords = localStorage.getItem('encouragement-words');
    if (!storedWords) return {};
    
    const words = JSON.parse(storedWords);
    
    // Count words by contributor
    return words.reduce((acc: Record<string, number>, word: { contributor: string }) => {
      const contributor = word.contributor;
      acc[contributor] = (acc[contributor] || 0) + 1;
      return acc;
    }, {});
  } catch (error) {
    console.error("Error getting contributor stats:", error);
    return {};
  }
};

