
// List of possible inappropriate words to filter (this is a simple example)
// In a production environment, this should be on the server side
const forbiddenWords = [
  "badword1",
  "badword2",
  // Add more words as needed
];

// Template sentiment types
export type TemplateSentiment = 'positive' | 'neutral' | 'negative';

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

// Interface for template with sentiment
export interface Template {
  text: string;
  sentiment: TemplateSentiment;
}

export const isWordAppropriate = (word: string): boolean => {
  // Convert to lowercase to make checking case-insensitive
  const lowercaseWord = word.toLowerCase();
  
  // Check if the word is in the forbidden list
  return !forbiddenWords.some(forbidden => 
    lowercaseWord === forbidden || lowercaseWord.includes(forbidden)
  );
};

/**
 * Generates a unique word by adding a suffix if the word already exists
 * @param word The base word to check
 * @param existingWords Array of existing words to check against
 * @returns A unique word with suffix if needed (e.g., "love-1", "love-2")
 */
export const generateUniqueWord = (word: string, existingWords: {word: string}[]): string => {
  // If word doesn't exist yet, return it as is
  if (!existingWords.some(existing => existing.word === word)) {
    return word;
  }
  
  // Find all instances of this word with suffixes
  const wordRegex = new RegExp(`^${word}(-\\d+)?$`);
  const matchingWords = existingWords
    .map(existing => existing.word)
    .filter(existingWord => wordRegex.test(existingWord));
  
  // Find the highest suffix number
  let highestSuffix = 0;
  matchingWords.forEach(matchingWord => {
    const suffixMatch = matchingWord.match(/-(\d+)$/);
    if (suffixMatch) {
      const suffixNum = parseInt(suffixMatch[1], 10);
      if (suffixNum > highestSuffix) {
        highestSuffix = suffixNum;
      }
    }
  });
  
  // Return word with next suffix number
  return `${word}-${highestSuffix + 1}`;
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

/**
 * Checks if template array contains duplicate templates
 * @param templates Array of templates or template objects to check
 * @returns boolean indicating if duplicates exist
 */
export const hasDuplicateTemplates = (templates: (string | Template)[]): boolean => {
  const uniqueTemplates = new Set(
    templates.map(t => typeof t === 'string' ? t.trim() : t.text.trim()).filter(t => t !== '')
  );
  return uniqueTemplates.size !== templates.filter(t => 
    typeof t === 'string' ? t.trim() !== '' : t.text.trim() !== ''
  ).length;
};

/**
 * Parse a comma-separated template string into an array of template objects with sentiment
 * @param templateText The template text to parse
 * @param defaultSentiment The default sentiment to use if not specified
 * @returns Array of template objects
 */
export const parseTemplates = (
  templateText: string,
  defaultSentiment: TemplateSentiment = 'positive'
): Template[] => {
  return templateText
    .split(/[,\n]/)  // Split by commas or newlines
    .map(t => t.trim())  // Trim whitespace
    .filter(t => t !== '')  // Remove empty entries
    .map(text => {
      // Check for sentiment placeholders
      if (text.includes('${บวก}')) {
        return { text: text.replace('${บวก}', ''), sentiment: 'positive' };
      }
      if (text.includes('${กลาง}')) {
        return { text: text.replace('${กลาง}', ''), sentiment: 'neutral' };
      }
      if (text.includes('${ลบ}')) {
        return { text: text.replace('${ลบ}', ''), sentiment: 'negative' };
      }
      return { text, sentiment: defaultSentiment };
    });
};

/**
 * Convert template objects to strings for storage compatibility
 * @param templates Array of template objects
 * @returns Array of template strings
 */
export const templateObjectsToStrings = (templates: Template[]): string[] => {
  return templates.map(template => {
    const sentimentPrefix = 
      template.sentiment === 'positive' ? '${บวก}' :
      template.sentiment === 'negative' ? '${ลบ}' :
      '${กลาง}';
    return `${sentimentPrefix}${template.text}`;
  });
};

/**
 * Convert template strings with sentiment markers to template objects
 * @param templateStrings Array of template strings with sentiment markers
 * @returns Array of template objects
 */
export const stringToTemplateObjects = (templateStrings: string[]): Template[] => {
  return templateStrings.map(text => {
    if (text.startsWith('${บวก}')) {
      return { text: text.replace('${บวก}', ''), sentiment: 'positive' };
    }
    if (text.startsWith('${กลาง}')) {
      return { text: text.replace('${กลาง}', ''), sentiment: 'neutral' };
    }
    if (text.startsWith('${ลบ}')) {
      return { text: text.replace('${ลบ}', ''), sentiment: 'negative' };
    }
    return { text, sentiment: 'positive' };
  });
};

/**
 * Add a word to the word polarity database in localStorage
 * @param word The word to add
 * @param polarity The polarity of the word (positive, neutral, negative)
 * @param score The score value associated with the polarity
 * @param templates Optional array of template objects for this word
 */
export const addWordToDatabase = (
  word: string,
  polarity: 'positive' | 'neutral' | 'negative',
  score: number,
  templates?: Template[]
): void => {
  try {
    // Get existing database from localStorage
    const storedData = localStorage.getItem("word-polarity-database");
    const database = storedData ? JSON.parse(storedData) : [];
    
    // Add new word
    database.push({
      word: word,
      polarity: polarity,
      score: score,
      templates: templates ? templateObjectsToStrings(templates) : []
    });
    
    // Save updated database back to localStorage
    localStorage.setItem("word-polarity-database", JSON.stringify(database));
    
    // Dispatch event to notify other components of the update
    window.dispatchEvent(new Event('word-database-updated'));
    
  } catch (error) {
    console.error("Error adding word to database:", error);
  }
};

/**
 * Update a word's polarity in the word database
 * @param word The word to update
 * @param polarity The new polarity value
 * @param score The new score value
 * @param templates Optional array of template objects
 */
export const updateWordPolarity = (
  word: string,
  polarity: 'positive' | 'neutral' | 'negative',
  score: number,
  templates?: Template[]
): void => {
  try {
    // Get existing database from localStorage
    const storedData = localStorage.getItem("word-polarity-database");
    if (!storedData) return;
    
    const database = JSON.parse(storedData);
    
    // Find and update the word
    const updatedDatabase = database.map((entry: any) => {
      if (entry.word === word) {
        return {
          ...entry,
          polarity: polarity,
          score: score,
          templates: templates ? templateObjectsToStrings(templates) : entry.templates || []
        };
      }
      return entry;
    });
    
    // Save updated database back to localStorage
    localStorage.setItem("word-polarity-database", JSON.stringify(updatedDatabase));
    
    // Dispatch event to notify other components of the update
    window.dispatchEvent(new Event('word-database-updated'));
    
  } catch (error) {
    console.error("Error updating word polarity:", error);
  }
};

/**
 * Delete a word from the database
 * @param word The word to delete
 */
export const deleteWord = (word: string): void => {
  try {
    // Get existing database from localStorage
    const storedData = localStorage.getItem("word-polarity-database");
    if (!storedData) return;
    
    const database = JSON.parse(storedData);
    
    // Filter out the word to delete
    const updatedDatabase = database.filter((entry: any) => entry.word !== word);
    
    // Save updated database back to localStorage
    localStorage.setItem("word-polarity-database", JSON.stringify(updatedDatabase));
    
    // Dispatch event to notify other components of the update
    window.dispatchEvent(new Event('word-database-updated'));
    
  } catch (error) {
    console.error("Error deleting word:", error);
  }
};

