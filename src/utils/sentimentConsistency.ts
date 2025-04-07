
export interface SentimentItem {
  word?: string;
  sentence?: string;
  sentiment?: 'positive' | 'neutral' | 'negative'; // Template sentiment
  contributor?: string;
  timestamp?: Date | string | number;
  templates?: string[];
  [key: string]: any;
}

/**
 * Gets the appropriate badge variant based on template sentiment
 */
export const getSentimentBadgeVariant = (item: SentimentItem): 'success' | 'destructive' | 'secondary' => {
  // Check template sentiment
  if (item.sentiment) {
    if (item.sentiment === 'positive') return 'success';
    if (item.sentiment === 'negative') return 'destructive';
    if (item.sentiment === 'neutral') return 'secondary';
  }
  
  // Default to neutral if no sentiment is provided
  return 'secondary';
};

/**
 * Gets the polarity text in Thai based on sentiment
 */
export const getPolarityText = (item: SentimentItem): string => {
  // Check template sentiment
  if (item.sentiment) {
    if (item.sentiment === 'positive') return 'เชิงบวก';
    if (item.sentiment === 'negative') return 'เชิงลบ';
    if (item.sentiment === 'neutral') return 'กลาง';
  }
  
  // Default to neutral if no sentiment is provided
  return 'กลาง';
};

/**
 * Extracts sentiment from a template string
 * @param template The template string
 * @returns The sentiment and cleaned template without sentiment marker
 */
export const extractSentimentFromTemplate = (template: string): { 
  text: string, 
  sentiment: 'positive' | 'neutral' | 'negative' 
} => {
  if (template.startsWith('${บวก}')) {
    return { text: template.replace('${บวก}', ''), sentiment: 'positive' };
  }
  if (template.startsWith('${กลาง}')) {
    return { text: template.replace('${กลาง}', ''), sentiment: 'neutral' };
  }
  if (template.startsWith('${ลบ}')) {
    return { text: template.replace('${ลบ}', ''), sentiment: 'negative' };
  }
  return { text: template, sentiment: 'positive' }; // Default sentiment
};

/**
 * Highlights a word in a template string with an orange color
 * @param template The template string containing ${word} placeholder
 * @param word The word to highlight
 * @returns HTML string with the word highlighted in orange
 */
export const highlightWordInTemplate = (template: string, word: string): string => {
  if (!template.includes(`\${${word}}`)) return template;
  
  return template.replace(
    `\${${word}}`, 
    `<span class="text-[#F97316] font-semibold">${word}</span>`
  );
};

/**
 * Inserts the word placeholder at cursor position in a textarea
 * @param textarea The textarea element
 * @param word The word to insert as placeholder
 */
export const insertWordPlaceholder = (textarea: HTMLTextAreaElement, word: string): void => {
  const startPos = textarea.selectionStart;
  const endPos = textarea.selectionEnd;
  const textBefore = textarea.value.substring(0, startPos);
  const textAfter = textarea.value.substring(endPos);
  
  // Insert the word placeholder at cursor position
  textarea.value = `${textBefore}\${${word}}${textAfter}`;
  
  // Set cursor position after the inserted placeholder
  const newCursorPos = startPos + `\${${word}}`.length;
  textarea.selectionStart = newCursorPos;
  textarea.selectionEnd = newCursorPos;
  
  // Focus the textarea
  textarea.focus();
};

/**
 * Inserts a sentiment marker at cursor position in a textarea
 * @param textarea The textarea element
 * @param sentiment The sentiment marker to insert (positive, neutral, negative)
 */
export const insertSentimentMarker = (
  textarea: HTMLTextAreaElement, 
  sentiment: 'positive' | 'neutral' | 'negative'
): void => {
  const startPos = textarea.selectionStart;
  const endPos = textarea.selectionEnd;
  const textBefore = textarea.value.substring(0, startPos);
  const textAfter = textarea.value.substring(endPos);
  
  // Get the appropriate marker
  const marker = 
    sentiment === 'positive' ? '${บวก}' :
    sentiment === 'negative' ? '${ลบ}' :
    '${กลาง}';
  
  // Insert the sentiment marker at cursor position
  textarea.value = `${textBefore}${marker}${textAfter}`;
  
  // Set cursor position after the inserted marker
  const newCursorPos = startPos + marker.length;
  textarea.selectionStart = newCursorPos;
  textarea.selectionEnd = newCursorPos;
  
  // Focus the textarea
  textarea.focus();
};
