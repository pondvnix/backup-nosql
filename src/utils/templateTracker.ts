
// Helper to track which word-template combinations have been used
// This prevents the same template from being shown multiple times

interface UsedTemplate {
  word: string;
  template: string;
  timestamp: number;
}

// Get all used word-template combinations
export const getUsedTemplates = (): UsedTemplate[] => {
  try {
    const stored = localStorage.getItem('used-templates');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error("Error loading used templates:", error);
  }
  return [];
};

// Check if a word-template combination has been used
export const isTemplateUsed = (word: string, template: string): boolean => {
  const usedTemplates = getUsedTemplates();
  return usedTemplates.some(item => 
    item.word.toLowerCase() === word.toLowerCase() && 
    item.template === template
  );
};

// Mark a word-template combination as used
export const markTemplateAsUsed = (word: string, template: string): void => {
  try {
    const usedTemplates = getUsedTemplates();
    
    // Check if this combination already exists
    const exists = usedTemplates.some(item => 
      item.word.toLowerCase() === word.toLowerCase() && 
      item.template === template
    );
    
    if (!exists) {
      usedTemplates.push({
        word,
        template,
        timestamp: Date.now()
      });
      
      localStorage.setItem('used-templates', JSON.stringify(usedTemplates));
      
      // Dispatch event to notify components
      const event = new CustomEvent('template-usage-updated');
      window.dispatchEvent(event);
    }
  } catch (error) {
    console.error("Error marking template as used:", error);
  }
};

// Get all used templates for a specific word
export const getUsedTemplatesForWord = (word: string): string[] => {
  const usedTemplates = getUsedTemplates();
  return usedTemplates
    .filter(item => item.word.toLowerCase() === word.toLowerCase())
    .map(item => item.template);
};

// Get all available templates for a word
export const getAvailableTemplatesForWord = (
  word: string, 
  allTemplates: string[]
): string[] => {
  const usedTemplates = getUsedTemplatesForWord(word);
  return allTemplates.filter(template => !usedTemplates.includes(template));
};
