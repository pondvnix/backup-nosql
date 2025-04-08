
import { analyzeSentence } from "@/utils/sentenceAnalysis";
import { Word, MotivationalSentenceEntry } from "./types";

export const fetchWords = async (): Promise<Word[]> => {
  return [];
};

export const fetchSentences = async (): Promise<MotivationalSentenceEntry[]> => {
  return [];
};

export const addNewWord = async ({ text, contributor }: { text: string; contributor: string }): Promise<Word> => {
  return { text, contributor };
};

export const removeDuplicateSentences = (sentences: MotivationalSentenceEntry[]): MotivationalSentenceEntry[] => {
  if (!Array.isArray(sentences)) {
    return [];
  }
  const uniqueIds = new Set();
  return sentences.filter(sentence => {
    if (!sentence) return false;
    const id = `${sentence.word}-${sentence.sentence}-${sentence.contributor}`;
    if (uniqueIds.has(id)) return false;
    uniqueIds.add(id);
    return true;
  });
};

export const processWordSentimentData = (words: Word[]) => {
  if (Array.isArray(words) && words.length > 0) {
    const wordTexts = words.map(word => word.text);
    const result = analyzeSentence(wordTexts);
    return { wordTexts, result };
  }
  return { wordTexts: [], result: null };
};

export const storeSentenceForBillboard = (
  sentence: string,
  word: string,
  contributor: string,
  polarity?: 'positive' | 'neutral' | 'negative',
  score?: number,
  sentiment?: 'positive' | 'neutral' | 'negative'
) => {
  if (!word) return;

  const billboardEntry = {
    sentence,
    word,
    contributor: contributor || 'ไม่ระบุชื่อ',
    timestamp: new Date(),
    polarity,
    score,
    sentiment
  };

  let existingEntries = [];
  try {
    const stored = localStorage.getItem('motivation-sentences');
    if (stored) {
      existingEntries = JSON.parse(stored);
      if (!Array.isArray(existingEntries)) {
        existingEntries = [existingEntries];
      }
    }
  } catch (error) {
    console.error("Error parsing stored sentences:", error);
    existingEntries = [];
  }

  const uniqueEntries = removeDuplicateSentences([billboardEntry, ...existingEntries]);
  localStorage.setItem('motivation-sentences', JSON.stringify(uniqueEntries));

  window.dispatchEvent(new CustomEvent('motivation-billboard-updated'));
};
