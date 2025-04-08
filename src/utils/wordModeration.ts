
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

// Add missing interfaces and types
export interface Template {
  template: string;
  sentiment: TemplateSentiment;
}

export type TemplateSentiment = 'positive' | 'neutral' | 'negative';

/**
 * Get contributor statistics from localStorage
 * @returns Record of contributor names and their contribution counts
 */
export const getContributorStats = (): Record<string, number> => {
  try {
    const storedStats = localStorage.getItem('contributor-stats');
    return storedStats ? JSON.parse(storedStats) : {};
  } catch (error) {
    console.error('Error getting contributor stats:', error);
    return {};
  }
};

/**
 * Add a word to the database with polarity information
 * @param word Word to add
 * @param polarity The sentiment polarity (positive, neutral, negative)
 * @param score The sentiment score (typically -1 to 1)
 * @param templates Array of template objects for the word
 */
export const addWordToDatabase = (
  word: string, 
  polarity: TemplateSentiment, 
  score: number, 
  templates: Template[]
): void => {
  try {
    const storedData = localStorage.getItem("word-polarity-database");
    const database = storedData ? JSON.parse(storedData) : [];
    
    // Check if word already exists
    const existingIndex = database.findIndex((entry: any) => entry.word === word);
    
    if (existingIndex >= 0) {
      database[existingIndex] = {
        ...database[existingIndex],
        polarity,
        score,
        templates
      };
    } else {
      database.push({
        word,
        polarity,
        score,
        templates
      });
    }
    
    localStorage.setItem("word-polarity-database", JSON.stringify(database));
    window.dispatchEvent(new CustomEvent('word-database-updated'));
  } catch (error) {
    console.error("Error adding word to database:", error);
  }
};

/**
 * Update word polarity in the database
 * @param word Word to update
 * @param polarity The sentiment polarity to set
 * @param score The sentiment score to set
 * @param templates Array of template objects for the word
 */
export const updateWordPolarity = (
  word: string, 
  polarity: TemplateSentiment, 
  score: number,
  templates?: Template[]
): void => {
  try {
    const storedData = localStorage.getItem("word-polarity-database");
    const database = storedData ? JSON.parse(storedData) : [];
    
    const existingIndex = database.findIndex((entry: any) => entry.word === word);
    
    if (existingIndex >= 0) {
      database[existingIndex] = {
        ...database[existingIndex],
        polarity,
        score,
        ...(templates && { templates })
      };
    } else {
      database.push({
        word,
        polarity,
        score,
        ...(templates && { templates })
      });
    }
    
    localStorage.setItem("word-polarity-database", JSON.stringify(database));
    window.dispatchEvent(new CustomEvent('word-database-updated'));
  } catch (error) {
    console.error("Error updating word polarity:", error);
  }
};

/**
 * Delete a word from the database
 * @param word Word to delete
 */
export const deleteWord = (word: string): void => {
  try {
    const storedData = localStorage.getItem("word-polarity-database");
    if (!storedData) return;
    
    const database = JSON.parse(storedData);
    const filteredDatabase = database.filter((entry: any) => entry.word !== word);
    
    localStorage.setItem("word-polarity-database", JSON.stringify(filteredDatabase));
    window.dispatchEvent(new CustomEvent('word-database-updated'));
  } catch (error) {
    console.error("Error deleting word:", error);
  }
};

/**
 * Check if there are duplicate templates in an array of templates
 * @param templates Array of templates to check
 * @returns Boolean indicating if there are duplicates
 */
export const hasDuplicateTemplates = (templates: Template[]): boolean => {
  const templateTexts = templates.map(t => t.template);
  return new Set(templateTexts).size !== templateTexts.length;
};

/**
 * Parse template strings from text input
 * @param templateText Raw template text with delimiters
 * @returns Array of template objects
 */
export const parseTemplates = (templateText: string): Template[] => {
  // Split by commas or new lines
  const templateStrings = templateText.split(/,|\n/).filter(t => t.trim().length > 0);
  
  return templateStrings.map(str => {
    const trimmed = str.trim();
    let sentiment: TemplateSentiment = 'neutral';
    let template = trimmed;
    
    if (trimmed.startsWith('${บวก}')) {
      sentiment = 'positive';
      template = trimmed.replace('${บวก}', '');
    } else if (trimmed.startsWith('${กลาง}')) {
      sentiment = 'neutral';
      template = trimmed.replace('${กลาง}', '');
    } else if (trimmed.startsWith('${ลบ}')) {
      sentiment = 'negative';
      template = trimmed.replace('${ลบ}', '');
    }
    
    return { template, sentiment };
  });
};

/**
 * Convert template objects to strings with sentiment markers
 * @param templates Array of template objects
 * @returns Array of template strings
 */
export const templateObjectsToStrings = (templates: Template[]): string[] => {
  return templates.map(template => {
    const sentimentPrefix = 
      template.sentiment === 'positive' ? '${บวก}' :
      template.sentiment === 'negative' ? '${ลบ}' :
      '${กลาง}';
      
    return `${sentimentPrefix}${template.template}`;
  });
};

/**
 * Convert template strings to template objects
 * @param templateStrings Array of template strings
 * @returns Array of template objects
 */
export const stringToTemplateObjects = (templateStrings: string[]): Template[] => {
  return templateStrings.map(str => {
    let sentiment: TemplateSentiment = 'neutral';
    let template = str;
    
    if (str.startsWith('${บวก}')) {
      sentiment = 'positive';
      template = str.replace('${บวก}', '');
    } else if (str.startsWith('${กลาง}')) {
      sentiment = 'neutral';
      template = str.replace('${กลาง}', '');
    } else if (str.startsWith('${ลบ}')) {
      sentiment = 'negative';
      template = str.replace('${ลบ}', '');
    }
    
    return { template, sentiment };
  });
};
