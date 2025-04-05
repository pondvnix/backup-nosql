import React, { useState, useEffect } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selectedWord, setSelectedWord] = useState<string>("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [wordDatabase, setWordDatabase] = useState<WordEntry[]>([]);
  const [usedWords, setUsedWords] = useState<string[]>([]);
  const [usedTemplates, setUsedTemplates] = useState<string[]>([]);
  const [hasUsedToday, setHasUsedToday] = useState(false);
  const { toast } = useToast();

  // Load the word database from local storage and track used words
  useEffect(() => {
    loadWordDatabase();
    loadUsedWords();
    
    // Listen for changes to the word database
    const handleDatabaseUpdate = () => {
      loadWordDatabase();
      loadUsedWords(); // Reload used words when database is updated
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

  // Load used words and templates from billboard
  const loadUsedWords = () => {
    try {
      const storedSentences = localStorage.getItem('motivation-sentences');
      if (storedSentences) {
        const sentences = JSON.parse(storedSentences);
        if (Array.isArray(sentences)) {
          // Extract words used in the billboard
          const billboardWords = sentences.map((item: any) => item.word || "");
          setUsedWords(billboardWords.filter(Boolean));
          
          // Extract templates used in the billboard
          const billboardTemplates = sentences.map((item: any) => item.sentence || "");
          setUsedTemplates(billboardTemplates.filter(Boolean));
        }
      }
    } catch (e) {
      console.error("Error loading used words:", e);
    }
  };

  // Generate suggestions and handle word loading
  const loadInitialSuggestions = () => {
    setIsRefreshing(true);
    
    // Get all words from database
    const storedData = localStorage.getItem("word-polarity-database");
    const database = storedData ? JSON.parse(storedData) : [];
    
    // Filter to words that have templates and avoid used templates and used words
    const wordsWithTemplates = database.filter((entry: WordEntry) => {
      // Skip words that have already been used in sentences
      if (usedWords.includes(entry.word)) {
        return false;
      }
      
      // Check if the word has templates
      if (!entry.templates || entry.templates.length === 0) {
        return false;
      }
      
      // Check if ALL of the word's templates have been used already
      const allTemplatesUsed = entry.templates.every(template => 
        usedTemplates.includes(template)
      );
      
      // Include the word only if it has at least one unused template
      return !allTemplatesUsed;
    });
    
    // Randomly select up to 5 words from filtered list
    const randomWords = wordsWithTemplates
      .map(entry => entry.word)
      .sort(() => 0.5 - Math.random())
      .slice(0, 5);
    
    setTimeout(() => {
      setSuggestions(randomWords);
      setSelectedWord("");
      setIsRefreshing(false);
    }, 300);
  };

  // Generate suggestions only when the component mounts
  useEffect(() => {
    loadInitialSuggestions();
    
    // Listen for database updates
    const handleDatabaseUpdate = () => {
      loadInitialSuggestions();
    };
    
    window.addEventListener('word-database-updated', handleDatabaseUpdate);
    
    return () => {
      window.removeEventListener('word-database-updated', handleDatabaseUpdate);
    };
  }, [usedWords]);

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

  // Generate an encouraging sentence with the selected word
  const generateEncouragingSentence = (word: string): string => {
    // Find the word entry in the database
    const wordEntry = wordDatabase.find(entry => entry.word === word);
    
    if (!wordEntry) {
      // Fallback sentence if word not found in database
      return `${word}คือสิ่งที่ทำให้ชีวิตมีความหมาย`;
    }
    
    // Get templates for this word if available, otherwise use default templates
    if (wordEntry.templates && wordEntry.templates.length > 0) {
      // Use custom templates for this specific word, prioritizing unused ones
      const unusedTemplates = wordEntry.templates.filter(template => 
        !usedTemplates.includes(template)
      );
      
      // If we have unused templates, use one of those
      if (unusedTemplates.length > 0) {
        const randomIndex = Math.floor(Math.random() * unusedTemplates.length);
        return unusedTemplates[randomIndex].replace(new RegExp(`\\$\\{${word}\\}`, 'g'), word);
      }
      
      // If all templates are used, pick a random one anyway
      const randomIndex = Math.floor(Math.random() * wordEntry.templates.length);
      return wordEntry.templates[randomIndex].replace(new RegExp(`\\$\\{${word}\\}`, 'g'), word);
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
    
    // Find unused templates if possible
    const unusedTemplates = templates.filter(template => !usedTemplates.includes(template));
    
    if (unusedTemplates.length > 0) {
      const randomIndex = Math.floor(Math.random() * unusedTemplates.length);
      return unusedTemplates[randomIndex];
    }
    
    // If all templates are used, pick a random one anyway
    const randomIndex = Math.floor(Math.random() * templates.length);
    return templates[randomIndex];
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (hasUsedToday) {
      toast({
        title: "ขออภัย",
        description: "คุณได้ใช้โควต้าการสร้างประโยคกำลังใจวันนี้แล้ว กรุณารอจนถึงวันพรุ่งนี้",
        variant: "destructive",
      });
      return;
    }

    if (selectedWord) {
      // Add the selected word to the stream
      onSelectWord(selectedWord);
      
      // Generate encouraging sentence
      const sentence = generateEncouragingSentence(selectedWord);
      
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
      
      // Update the used words list
      setUsedWords(prev => [...prev, selectedWord]);
      
      // Mark as used for today
      localStorage.setItem('last-word-used-date', new Date().toISOString());
      setHasUsedToday(true);

      toast({
        title: "เพิ่มคำสำเร็จ!",
        description: (
          <div className="mt-2">
            <p>คำ "<span className="text-[#F97316] font-semibold">{selectedWord}</span>" ได้ถูกเพิ่มเข้าสู่ประโยคกำลังใจแล้ว</p>
            <p className="mt-1 font-medium">"{sentence}"</p>
            <p className="mt-2 text-sm text-muted-foreground">คุณสามารถสร้างประโยคกำลังใจได้อีกครั้งในวันพรุ่งนี้</p>
          </div>
        ),
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">เลือกคำแนะนำ</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={loadInitialSuggestions}
          type="button"
          disabled={isRefreshing}
          className="group transition-all duration-300 hover:bg-primary hover:text-white"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
          สร้างคำใหม่
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <RadioGroup
          value={selectedWord}
          onValueChange={setSelectedWord}
          className="space-y-2"
        >
          {suggestions.length > 0 ? (
            suggestions.map((word, index) => {
              const wordData = wordDatabase.find(entry => entry.word === word);
              return (
                <div 
                  key={word} 
                  className="flex items-center space-x-2 p-2 rounded-md transition-all duration-300 hover:bg-muted cursor-pointer"
                  style={{ 
                    animationDelay: `${index * 100}ms`,
                    animation: isRefreshing ? "none" : "fadeIn 0.5s ease-out forwards" 
                  }}
                  onClick={() => setSelectedWord(word)}
                >
                  <RadioGroupItem 
                    value={word} 
                    id={`word-${word}`} 
                    className="transition-all duration-300"
                  />
                  <Label 
                    htmlFor={`word-${word}`} 
                    className="font-medium cursor-pointer w-full flex items-center justify-between"
                  >
                    <span className="text-[#F97316]">{word}</span>
                  </Label>
                </div>
              );
            })
          ) : (
            <div className="text-center p-4 text-muted-foreground">
              {isRefreshing ? 'กำลังโหลด...' : 'ไม่พบคำแนะนำที่ยังไม่ได้ใช้ กรุณาเพิ่มคำใหม่ในหน้าจัดการคำ'}
            </div>
          )}
        </RadioGroup>

        <Button
          type="submit"
          disabled={!selectedWord || hasUsedToday}
          className="w-full transition-all duration-300 hover:scale-105"
        >
          {hasUsedToday ? 'คุณได้ใช้โควต้าวันนี้แล้ว' : 'ใช้คำนี้'}
        </Button>
        {hasUsedToday && (
          <p className="text-sm text-center text-muted-foreground">
            คุณสามารถสร้างประโยคกำลังใจได้อีกครั้งในวันพรุ่งนี้
          </p>
        )}
      </form>
    </div>
  );
};

export default WordSuggestions;
