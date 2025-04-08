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
  if (!word || typeof word !== 'string') {
    console.error("Invalid word:", word);
    return;
  }
  
  // Ensure templates is an array
  const safeTemplates = Array.isArray(templates) ? templates : [];
  
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
        templates: safeTemplates
      };
    } else {
      database.push({
        word,
        polarity,
        score,
        templates: safeTemplates
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
  if (!word || typeof word !== 'string') {
    console.error("Invalid word:", word);
    return;
  }
  
  try {
    const storedData = localStorage.getItem("word-polarity-database");
    const database = storedData ? JSON.parse(storedData) : [];
    
    const existingIndex = database.findIndex((entry: any) => entry.word === word);
    
    // Ensure templates is an array if provided
    const safeTemplates = templates && Array.isArray(templates) ? templates : undefined;
    
    if (existingIndex >= 0) {
      database[existingIndex] = {
        ...database[existingIndex],
        polarity,
        score,
        ...(safeTemplates && { templates: safeTemplates })
      };
    } else {
      database.push({
        word,
        polarity,
        score,
        ...(safeTemplates && { templates: safeTemplates })
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
  if (!word || typeof word !== 'string') {
    console.error("Invalid word:", word);
    return;
  }
  
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
  if (!templates || !Array.isArray(templates)) {
    return false;
  }
  
  // Filter out invalid templates and extract valid template texts
  const templateTexts = templates
    .filter(t => t && typeof t === 'object' && typeof t.template === 'string')
    .map(t => t.template);
    
  return new Set(templateTexts).size !== templateTexts.length;
};

/**
 * Parse template strings from text input
 * @param templateText Raw template text with delimiters
 * @returns Array of template objects
 */
export const parseTemplates = (templateText: string): Template[] => {
  // Ensure templateText is a string
  if (typeof templateText !== 'string') {
    console.error("Invalid templateText:", templateText);
    return [];
  }
  
  try {
    // Split by commas or new lines
    const templateStrings = templateText.split(/,|\n/).filter(t => t && typeof t === 'string' && t.trim().length > 0);
    
    return templateStrings.map(str => {
      const trimmed = str.trim();
      let sentiment: TemplateSentiment = 'neutral';
      let template = trimmed;
      
      if (trimmed.includes('${บวก}')) {
        sentiment = 'positive';
        template = trimmed.replace('${บวก}', '');
      } else if (trimmed.includes('${กลาง}')) {
        sentiment = 'neutral';
        template = trimmed.replace('${กลาง}', '');
      } else if (trimmed.includes('${ลบ}')) {
        sentiment = 'negative';
        template = trimmed.replace('${ลบ}', '');
      }
      
      return { template, sentiment };
    });
  } catch (error) {
    console.error("Error parsing templates:", error);
    return [];
  }
};

/**
 * Convert template objects to strings with sentiment markers
 * @param templates Array of template objects
 * @returns Array of template strings
 */
export const templateObjectsToStrings = (templates: Template[] | undefined): string[] => {
  // Handle null/undefined and non-array cases
  if (!templates || !Array.isArray(templates)) {
    return [];
  }
  
  // Filter out invalid templates
  return templates
    .filter(template => template && typeof template === 'object')
    .map(template => {
      if (!template || typeof template !== 'object') {
        return '';
      }
      
      // Default sentiment if not valid
      let sentimentPrefix = '${กลาง}'; 
      
      // Validate sentiment value
      if (template.sentiment === 'positive') {
        sentimentPrefix = '${บวก}';
      } else if (template.sentiment === 'negative') {
        sentimentPrefix = '${ลบ}';
      }
      
      // Ensure template.template is a string
      const templateText = typeof template.template === 'string' ? template.template : '';
      
      return `${sentimentPrefix}${templateText}`;
    })
    .filter(str => str.length > 0); // Filter out empty strings
};

/**
 * Convert template strings to template objects
 * @param templateStrings Array of template strings or single string
 * @returns Array of template objects
 */
export const stringToTemplateObjects = (templateStrings: string[] | string | null | undefined): Template[] => {
  // Handle null/undefined cases
  if (templateStrings === null || templateStrings === undefined) {
    console.warn("Received null or undefined template strings");
    return [];
  }
  
  // Convert string to array if it's a single string
  let stringsArray: string[] = [];
  
  if (typeof templateStrings === 'string') {
    stringsArray = [templateStrings];
  } else if (Array.isArray(templateStrings)) {
    // Filter out non-string values
    stringsArray = templateStrings.filter(item => typeof item === 'string');
    
    // If after filtering we have nothing, return empty array
    if (stringsArray.length === 0) {
      console.warn("No valid strings found in template strings array:", templateStrings);
      return [];
    }
  } else {
    console.warn("Invalid template strings type:", typeof templateStrings);
    return [];
  }
  
  // Map strings to template objects with proper validation
  return stringsArray
    .filter(str => typeof str === 'string') // Filter out non-string items
    .map(str => {
      // Default values
      let sentiment: TemplateSentiment = 'neutral';
      let template = str;
      
      // Check for sentiment markers
      if (str.includes('${บวก}')) {
        sentiment = 'positive';
        template = str.replace('${บวก}', '');
      } else if (str.includes('${กลาง}')) {
        sentiment = 'neutral';
        template = str.replace('${กลาง}', '');
      } else if (str.includes('${ลบ}')) {
        sentiment = 'negative';
        template = str.replace('${ลบ}', '');
      }
      
      return { template, sentiment };
    });
};

/**
 * Get the complete word database from localStorage
 * @returns Array of WordEntry objects
 */
export const getWordDatabase = (): WordEntry[] => {
  try {
    const storedData = localStorage.getItem("word-polarity-database");
    return storedData ? JSON.parse(storedData) : [];
  } catch (error) {
    console.error("Error getting word database:", error);
    return [];
  }
};

/**
 * Update the entire word database in localStorage
 * @param database Array of WordEntry objects to save
 */
export const updateWordDatabase = (database: WordEntry[]): void => {
  try {
    localStorage.setItem("word-polarity-database", JSON.stringify(database));
    window.dispatchEvent(new CustomEvent('word-database-updated'));
  } catch (error) {
    console.error("Error updating word database:", error);
  }
};

/**
 * Interface for word entries in the database
 */
export interface WordEntry {
  word: string;
  templates?: string[];
  isCustom?: boolean;
  polarity?: TemplateSentiment;
  score?: number;
}

/**
 * Analyze the sentiment of a word based on its templates
 * @param word The word to analyze
 * @returns Sentiment analysis result
 */
export const getSentimentAnalysis = (word: string): { sentiment: TemplateSentiment, score: number } => {
  try {
    const database = getWordDatabase();
    const wordEntry = database.find(entry => entry.word === word);
    
    if (wordEntry && wordEntry.polarity && typeof wordEntry.score === 'number') {
      return {
        sentiment: wordEntry.polarity,
        score: wordEntry.score
      };
    }
    
    // Default to neutral if word not found or missing sentiment data
    return {
      sentiment: 'neutral',
      score: 0
    };
  } catch (error) {
    console.error("Error analyzing sentiment:", error);
    return {
      sentiment: 'neutral',
      score: 0
    };
  }
};
