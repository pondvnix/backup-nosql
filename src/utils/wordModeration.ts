// Export the addWord and getRecentWords functions if they're not already exported

/**
 * Add a word to the recent words list in localStorage
 * @param word Word to add to recent words list
 */
export const addWord = (word: string): void => {
  try {
    const recentWordsKey = 'recent-words';
    const recentWords = getRecentWords();
    
    // Remove the word if it already exists to avoid duplicates
    const filteredWords = recentWords.filter(w => w !== word);
    
    // Add the word to the beginning of the array
    const updatedWords = [word, ...filteredWords].slice(0, 10); // Keep only the 10 most recent
    
    // Save to localStorage
    localStorage.setItem(recentWordsKey, JSON.stringify(updatedWords));
  } catch (error) {
    console.error('Error adding word to recent list:', error);
  }
};

/**
 * Get list of recent words from localStorage
 * @returns Array of recent words
 */
export const getRecentWords = (): string[] => {
  try {
    const recentWordsKey = 'recent-words';
    const stored = localStorage.getItem(recentWordsKey);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error getting recent words:', error);
    return [];
  }
};

// Keep any other existing exports from wordModeration.ts
export const validateWordInput = (word: string, contributor: string): { isValid: boolean; message: string } => {
  if (!word.trim()) {
    return { isValid: false, message: "กรุณาระบุคำที่ต้องการเพิ่ม" };
  }
  
  if (!contributor.trim()) {
    return { isValid: false, message: "กรุณาระบุชื่อผู้เพิ่มคำ" };
  }
  
  if (word.trim().length > 10) {
    return { isValid: false, message: "คำต้องมีความยาวไม่เกิน 10 ตัวอักษร" };
  }
  
  return { isValid: true, message: "คำผ่านการตรวจสอบแล้ว" };
};

/**
 * Standardize contributor name
 * @param name Contributor name to standardize
 * @returns Standardized contributor name
 */
export const standardizeContributorName = (name: string): string => {
  const trimmedName = name.trim();
  return trimmedName || "ไม่ระบุชื่อ";
};
