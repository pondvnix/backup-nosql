// Add any missing function to the file
export const saveWordUse = (word: string): void => {
  try {
    const wordUseKey = 'word-usage-history';
    const timestamp = Date.now();
    
    let wordUsage = [];
    const stored = localStorage.getItem(wordUseKey);
    
    if (stored) {
      wordUsage = JSON.parse(stored);
    }
    
    wordUsage.push({
      word,
      timestamp
    });
    
    // Limit the history to 100 items
    if (wordUsage.length > 100) {
      wordUsage = wordUsage.slice(-100);
    }
    
    localStorage.setItem(wordUseKey, JSON.stringify(wordUsage));
  } catch (error) {
    console.error('Error saving word use:', error);
  }
};

export const getContributorName = (): string => {
  try {
    const stored = localStorage.getItem('contributor-name');
    return stored || 'ผู้ใช้';
  } catch (error) {
    console.error('Error getting contributor name:', error);
    return 'ผู้ใช้';
  }
};
