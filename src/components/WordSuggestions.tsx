
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

interface WordSuggestion {
  word: string;
  templateIndex: number; // Track which template would be used
}

const WordSuggestions = ({
  existingWords,
  onSelectWord,
  disableAutoRefresh = false
}: WordSuggestionsProps) => {
  const [suggestions, setSuggestions] = useState<WordSuggestion[]>([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState<WordSuggestion | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [wordDatabase, setWordDatabase] = useState<WordEntry[]>([]);
  const [usedTemplates, setUsedTemplates] = useState<string[]>([]);
  const [hasUsedToday, setHasUsedToday] = useState(false); // Ensure this is defined
  const { toast } = useToast();

  // Load the word database from local storage and track used templates
  useEffect(() => {
    loadWordDatabase();
    loadUsedTemplates();
    checkIfUsedToday();
    
    // Listen for changes to the word database
    const handleDatabaseUpdate = () => {
      loadWordDatabase();
      loadUsedTemplates(); // Reload used templates when database is updated
    };
    
    // Listen for new words added to the billboard
    const handleBillboardUpdate = () => {
      loadUsedTemplates();
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

  const checkIfUsedToday = () => {
    const lastUsedDate = localStorage.getItem('last-word-used-date');
    if (lastUsedDate) {
      const lastDate = new Date(lastUsedDate);
      const today = new Date();
      
      // Check if last used date is today
      if (
        lastDate.getDate() === today.getDate() &&
        lastDate.getMonth() === today.getMonth() &&
        lastDate.getFullYear() === today.getFullYear()
      ) {
        setHasUsedToday(false); // Disable quota restriction as requested
      } else {
        setHasUsedToday(false); // Always set to false to disable quota
      }
    } else {
      setHasUsedToday(false); // Always set to false if no date found
    }
  };

  // Load used templates from billboard
  const loadUsedTemplates = () => {
    try {
      const storedSentences = localStorage.getItem('motivation-sentences');
      if (storedSentences) {
        const sentences = JSON.parse(storedSentences);
        if (Array.isArray(sentences)) {
          // Extract templates used in the billboard
          const billboardTemplates = sentences.map((item: any) => item.sentence || "");
          setUsedTemplates(billboardTemplates.filter(Boolean));
        }
      }
    } catch (e) {
      console.error("Error loading used templates:", e);
    }
  };

  // Generate suggestions and handle word loading
  const loadInitialSuggestions = () => {
    setIsRefreshing(true);
    
    // Get all words from database
    const storedData = localStorage.getItem("word-polarity-database");
    const database = storedData ? JSON.parse(storedData) : [];
    
    // Get word-template pairs that haven't been used
    const availableWordTemplates: WordSuggestion[] = [];
    
    database.forEach((entry: WordEntry) => {
      // Skip words without templates
      if (!entry.templates || entry.templates.length === 0) {
        return;
      }
      
      // Check each template for this word
      entry.templates.forEach((template, index) => {
        const processedTemplate = template.replace(/\$\{[^}]*\}/g, entry.word);
        
        // If this specific template hasn't been used, add it as an option
        if (!usedTemplates.includes(processedTemplate)) {
          availableWordTemplates.push({
            word: entry.word,
            templateIndex: index
          });
        }
      });
    });
    
    // Randomly select up to 5 word-template pairs
    const randomSuggestions = availableWordTemplates
      .sort(() => 0.5 - Math.random())
      .slice(0, 5);
    
    setTimeout(() => {
      setSuggestions(randomSuggestions);
      setSelectedSuggestion(null);
      setIsRefreshing(false);
    }, 300);
  };

  // Generate suggestions only when the component mounts or templates change
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
  }, [usedTemplates]);

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
  const generateEncouragingSentence = (suggestion: WordSuggestion): string => {
    const { word, templateIndex } = suggestion;
    
    // Find the word entry in the database
    const wordEntry = wordDatabase.find(entry => entry.word === word);
    
    if (!wordEntry || !wordEntry.templates || templateIndex >= wordEntry.templates.length) {
      // Fallback sentence if word not found in database or template index is invalid
      return `${word}คือสิ่งที่ทำให้ชีวิตมีความหมาย`;
    }
    
    // Use the specific template for this word
    const template = wordEntry.templates[templateIndex];
    return template.replace(/\$\{[^}]*\}/g, word);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Removed the hasUsedToday check as requested
    
    if (selectedSuggestion) {
      // Add the selected word to the stream
      onSelectWord(selectedSuggestion.word);
      
      // Generate encouraging sentence
      const sentence = generateEncouragingSentence(selectedSuggestion);
      
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
          word: selectedSuggestion.word,
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
          word: selectedSuggestion.word,
          contributor
        }
      });
      window.dispatchEvent(sentenceEvent);
      
      // Also dispatch billboard updated event
      window.dispatchEvent(new CustomEvent('motivation-billboard-updated'));
      
      // Set the last used date but don't update the hasUsedToday state
      localStorage.setItem('last-word-used-date', new Date().toISOString());
      // Removed setHasUsedToday(true) as requested
      
      toast({
        title: "เพิ่มคำสำเร็จ!",
        description: (
          <div className="mt-2">
            <p>คำ "<span className="text-[#F97316] font-semibold">{selectedSuggestion.word}</span>" ได้ถูกเพิ่มเข้าสู่ประโยคกำลังใจแล้ว</p>
            <p className="mt-1 font-medium">"{sentence}"</p>
            <p className="mt-2 text-sm text-muted-foreground">คุณสามารถสร้างประโยคกำลังใจได้ทุกเมื่อ</p>
          </div>
        ),
      });
    }
  };

  const getSelectedSuggestionValue = () => {
    if (!selectedSuggestion) return "";
    // Create a unique ID for each suggestion by combining word and template index
    return `${selectedSuggestion.word}-${selectedSuggestion.templateIndex}`;
  };

  const handleSuggestionChange = (value: string) => {
    const [word, templateIndex] = value.split('-');
    setSelectedSuggestion({
      word,
      templateIndex: parseInt(templateIndex, 10)
    });
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
          value={getSelectedSuggestionValue()}
          onValueChange={handleSuggestionChange}
          className="space-y-2"
        >
          {suggestions.length > 0 ? (
            suggestions.map((suggestion, index) => {
              const { word, templateIndex } = suggestion;
              const value = `${word}-${templateIndex}`;
              return (
                <div 
                  key={value} 
                  className="flex items-center space-x-2 p-2 rounded-md transition-all duration-300 hover:bg-muted cursor-pointer"
                  style={{ 
                    animationDelay: `${index * 100}ms`,
                    animation: isRefreshing ? "none" : "fadeIn 0.5s ease-out forwards" 
                  }}
                  onClick={() => handleSuggestionChange(value)}
                >
                  <RadioGroupItem 
                    value={value} 
                    id={`word-${value}`} 
                    className="transition-all duration-300"
                  />
                  <Label 
                    htmlFor={`word-${value}`} 
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
          disabled={!selectedSuggestion}
          className="w-full transition-all duration-300 hover:scale-105"
        >
          ใช้คำนี้
        </Button>
      </form>
    </div>
  );
};

export default WordSuggestions;
