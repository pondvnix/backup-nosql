export interface SentimentItem {
  word?: string;
  sentence?: string;
  polarity?: 'positive' | 'neutral' | 'negative';
  score?: number;
  contributor?: string;
  timestamp?: Date | string | number;
  sentiment?: 'positive' | 'neutral' | 'negative'; // Template sentiment
  [key: string]: any;
}

/**
 * Ensures consistent polarity and score values across the application
 * This utility normalizes scores and polarities to avoid discrepancies
 */
export const normalizeScoreAndPolarity = (item: SentimentItem): SentimentItem => {
  let score = item.score;
  let polarity = item.polarity;
  
  // If we have a score but no polarity, derive polarity from score
  if (score !== undefined && !polarity) {
    if (score > 0) polarity = 'positive';
    else if (score < 0) polarity = 'negative';
    else polarity = 'neutral';
  }
  // If we have polarity but no score, derive score from polarity
  else if (polarity && score === undefined) {
    if (polarity === 'positive') score = 1;
    else if (polarity === 'negative') score = -1;
    else score = 0;
  }
  // If we have neither, set defaults
  else if (polarity === undefined && score === undefined) {
    polarity = 'neutral';
    score = 0;
  }
  
  // Ensure consistency between score and polarity
  // If score is positive, polarity should be positive, etc.
  if (score !== undefined) {
    if (score > 0 && polarity !== 'positive') {
      polarity = 'positive';
    } else if (score < 0 && polarity !== 'negative') {
      polarity = 'negative';
    } else if (score === 0 && polarity !== 'neutral') {
      polarity = 'neutral';
    }
  }
  
  return {
    ...item,
    polarity,
    score
  };
};

/**
 * Normalizes an array of sentiment items
 */
export const normalizeItemsConsistency = (items: SentimentItem[]): SentimentItem[] => {
  return items.map(normalizeScoreAndPolarity);
};

/**
 * Gets the appropriate badge variant based on score, polarity, or template sentiment
 */
export const getSentimentBadgeVariant = (item: SentimentItem): 'success' | 'destructive' | 'secondary' => {
  // Check template sentiment first if available
  if (item.sentiment) {
    if (item.sentiment === 'positive') return 'success';
    if (item.sentiment === 'negative') return 'destructive';
    if (item.sentiment === 'neutral') return 'secondary';
  }
  
  // Fall back to score/polarity
  const normalized = normalizeScoreAndPolarity(item);
  
  if (normalized.score! > 0) return 'success';
  if (normalized.score! < 0) return 'destructive';
  return 'secondary';
};

/**
 * Gets the polarity text in Thai based on sentiment or polarity
 */
export const getPolarityText = (item: SentimentItem): string => {
  // Check template sentiment first if available
  if (item.sentiment) {
    if (item.sentiment === 'positive') return 'เชิงบวก';
    if (item.sentiment === 'negative') return 'เชิงลบ';
    if (item.sentiment === 'neutral') return 'กลาง';
  }
  
  // Fall back to score/polarity
  const normalized = normalizeScoreAndPolarity(item);
  
  if (normalized.score! > 0) return 'เชิงบวก';
  if (normalized.score! < 0) return 'เชิงลบ';
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
