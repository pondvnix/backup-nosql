
export interface Word {
  text: string;
  contributor: string;
}

export interface MotivationalSentenceEntry {
  word: string;
  sentence: string;
  contributor?: string;
  template?: string;
  sentiment?: 'positive' | 'neutral' | 'negative';
  score?: number;
  timestamp: string | Date;
  id?: string;
  polarity?: 'positive' | 'neutral' | 'negative';
}
