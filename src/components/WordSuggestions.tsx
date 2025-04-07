
import React, { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { UniqueValueSelector } from "@/components/ui/unique-value-selector";

interface WordSuggestionsProps {
  existingWords: string[];
  onSelectWord: (word: string) => void;
  disableAutoRefresh?: boolean;
}

interface WordEntry {
  word: string;
  polarity: 'positive' | 'neutral' | 'negative';
  templates: string[];
  score?: number;
}

const WordSuggestions = ({
  existingWords,
  onSelectWord,
  disableAutoRefresh = false
}: WordSuggestionsProps) => {
  const [selectedWord, setSelectedWord] = useState<string | undefined>(undefined);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [wordDatabase, setWordDatabase] = useState<WordEntry[]>([]);
  const [usedWords, setUsedWords] = useState<string[]>([]);
  const { toast } = useToast();

  // Load the word database from localStorage and track used templates
  useEffect(() => {
    loadWordDatabase();
    loadUsedWords();
    
    // Listen for changes to the word database
    const handleDatabaseUpdate = () => {
      loadWordDatabase();
      loadUsedWords();
    };
    
    // Listen for new words added to the billboard
    const handleBillboardUpdate = () => {
      loadUsedWords();
    };
    
    window.addEventListener('word-database-updated', handleDatabaseUpdate);
    window.addEventListener('motivationalSentenceGenerated', handleBillboardUpdate);
    window.addEventListener('motivation-billboard-updated', handleBillboardUpdate);
    
    return () => {
      window.removeEventListener('word-database-updated', handleDatabaseUpdate);
      window.removeEventListener('motivationalSentenceGenerated', handleBillboardUpdate);
      window.removeEventListener('motivation-billboard-updated', handleBillboardUpdate);
    };
  }, []);

  // Load used words from billboard
  const loadUsedWords = () => {
    try {
      const storedSentences = localStorage.getItem('motivation-sentences');
      if (storedSentences) {
        const sentences = JSON.parse(storedSentences);
        if (Array.isArray(sentences)) {
          // Extract words used in the billboard
          const billboardWords = sentences.map((item: any) => item.word || "");
          setUsedWords(billboardWords.filter(Boolean));
        }
      }
    } catch (e) {
      console.error("Error loading used words:", e);
    }
  };

  // Load the word database from localStorage
  const loadWordDatabase = () => {
    try {
      const storedData = localStorage.getItem("word-polarity-database");
      if (storedData) {
        setWordDatabase(JSON.parse(storedData));
      }
    } catch (e) {
      console.error("Error loading word database:", e);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedWord) {
      // Find the word entry in the database
      const wordEntry = wordDatabase.find(entry => entry.word === selectedWord);
      if (!wordEntry) {
        console.error("Selected word not found in database");
        return;
      }
      
      // Generate encouraging sentence
      const sentence = generateEncouragingSentence(selectedWord, wordEntry);
      
      // Get contributor name from localStorage or default to "ไม่ระบุชื่อ"
      const contributor = localStorage.getItem('contributor-name') || 'ไม่ระบุชื่อ';
      
      // Add new entry rather than replacing
      let existingEntries = [];
      try {
        const storedSentences = localStorage.getItem('motivation-sentences');
        if (storedSentences) {
          const parsed = JSON.parse(storedSentences);
          existingEntries = Array.isArray(parsed) ? parsed : [parsed];
        }
      } catch (error) {
        console.error("Error parsing stored sentences:", error);
      }
      
      // Add new entry at the beginning
      const updatedEntries = [
        {
          word: selectedWord,
          sentence: sentence,
          contributor: contributor,
          timestamp: new Date()
        },
        ...existingEntries
      ];
      
      // Store the updated entries
      localStorage.setItem('motivation-sentences', JSON.stringify(updatedEntries));
      
      // Create and dispatch a custom event for motivational sentence
      const sentenceEvent = new CustomEvent('motivationalSentenceGenerated', {
        detail: { 
          sentence,
          word: selectedWord,
          contributor
        }
      });
      window.dispatchEvent(sentenceEvent);
      
      // Also dispatch billboard updated event
      window.dispatchEvent(new CustomEvent('motivation-billboard-updated'));
      
      // Set the last used date
      localStorage.setItem('last-word-used-date', new Date().toISOString());
      
      onSelectWord(selectedWord);
      
      toast({
        title: "เพิ่มคำสำเร็จ!",
        description: (
          <div className="mt-2">
            <p>คำ "<span className="text-[#F97316] font-semibold">{selectedWord}</span>" ได้ถูกเพิ่มเข้าสู่ประโยคกำลังใจแล้ว</p>
            <p className="mt-1 font-medium">"{sentence}"</p>
            <p className="mt-2 text-sm text-muted-foreground">คุณสามารถสร้างประโยคกำลังใจได้ทุกเมื่อ</p>
          </div>
        ),
      });
      
      // Reset selection after submitting
      setSelectedWord(undefined);
    }
  };

  // Generate encouraging sentence based on word and its entry in database
  const generateEncouragingSentence = (word: string, wordEntry: WordEntry): string => {
    // Get templates for this word if available
    if (wordEntry.templates && wordEntry.templates.length > 0) {
      // Use the first template for this specific word (or random if multiple)
      const templateIndex = Math.floor(Math.random() * wordEntry.templates.length);
      // Replace any ${word} placeholders with the actual word
      return wordEntry.templates[templateIndex].replace(/\$\{[^}]*\}/g, word);
    }
    
    // Default templates based on polarity
    const positiveTemplates = [
      `การมี${word}ในชีวิตทำให้เรารู้สึกดีขึ้น`,
      `${word}คือสิ่งที่เราทุกคนต้องการ`,
      `${word}จะทำให้เราเข้มแข็งขึ้น`,
      `อย่าลืมที่จะ${word}ทุกวัน`,
      `${word}คือพลังใจที่เราสร้างได้`,
    ];
    
    const neutralTemplates = [
      `${word}เป็นส่วนหนึ่งของชีวิตที่เราต้องเรียนรู้`,
      `${word}และความพยายามจะนำไปสู่ความสำเร็จ`,
      `${word}จะทำให้เราเข้าใจตัวเองมากขึ้น`,
      `ทุกคนมี${word}ในแบบของตัวเอง`,
      `${word}เป็นสิ่งที่ทำให้ชีวิตมีความหมาย`,
    ];
    
    const negativeTemplates = [
      `แม้จะมี${word} แต่เราจะผ่านมันไปได้`,
      `${word}เป็นบทเรียนที่ทำให้เราเติบโต`,
      `อย่าให้${word}มาหยุดความฝันของเรา`,
      `${word}จะกลายเป็นแรงผลักดันให้เราไปต่อ`,
      `เราจะเปลี่ยน${word}ให้เป็นพลัง`,
    ];
    
    const templates = wordEntry.polarity === "positive" ? positiveTemplates : 
                      wordEntry.polarity === "neutral" ? neutralTemplates : 
                      negativeTemplates;
    
    // Randomly select a template
    const randomIndex = Math.floor(Math.random() * templates.length);
    return templates[randomIndex];
  };

  // Get template preview for the UniqueValueSelector
  const getTemplatePreview = (word: string): string => {
    // Find the word entry in the database
    const wordEntry = wordDatabase.find(entry => entry.word === word);
    
    if (!wordEntry || !wordEntry.templates || wordEntry.templates.length === 0) {
      return word;
    }
    
    // Get the first template and replace placeholders with the word
    const template = wordEntry.templates[0];
    const preview = template.replace(/\$\{[^}]*\}/g, word);
    
    return preview;
  };

  // Filter words from the database - limit to 6 and remove those already used
  const getAvailableWords = () => {
    // Start with all words from the database
    const allWords = wordDatabase.map(entry => ({
      value: entry.word,
      text: entry.word,
    }));
    
    // Filter out words without templates
    const wordsWithTemplates = allWords.filter(word => {
      const entry = wordDatabase.find(w => w.word === word.value);
      return entry && entry.templates && entry.templates.length > 0;
    });
    
    // Sort randomly and limit to 6 items
    return wordsWithTemplates
      .sort(() => Math.random() - 0.5)
      .slice(0, 6);
  };

  const handleWordSelect = (option: {value: string, text: string} | undefined) => {
    setSelectedWord(option?.value);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">เลือกคำแนะนำ</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setIsRefreshing(true);
            // Force re-rendering to get new words
            setTimeout(() => {
              setIsRefreshing(false);
            }, 300);
          }}
          type="button"
          disabled={isRefreshing}
          className="group transition-all duration-300 hover:bg-primary hover:text-white"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
          สร้างคำใหม่
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {wordDatabase.length > 0 ? (
          <UniqueValueSelector
            title="เลือกคำจากคลัง"
            options={getAvailableWords()}
            selected={selectedWord ? { value: selectedWord, text: selectedWord } : undefined}
            onSelect={handleWordSelect}
            usedValues={usedWords}
            className="animation-fade-in"
          />
        ) : (
          <div className="text-center p-4 text-muted-foreground">
            {isRefreshing ? 'กำลังโหลด...' : 'ไม่พบคำในคลัง กรุณาเพิ่มคำใหม่ในหน้าจัดการคำ'}
          </div>
        )}

        <Button
          type="submit"
          disabled={!selectedWord}
          className="w-full transition-all duration-300 hover:scale-105"
        >
          ใช้คำนี้
        </Button>
      </form>
    </div>
  );
};

export default WordSuggestions;
