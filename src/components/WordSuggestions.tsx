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
  const { toast } = useToast();

  useEffect(() => {
    loadWordDatabase();
    loadUsedTemplates();
    checkIfUsedToday();
    
    const handleDatabaseUpdate = () => {
      loadWordDatabase();
      loadUsedTemplates();
    };
    
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
      
      if (
        lastDate.getDate() === today.getDate() &&
        lastDate.getMonth() === today.getMonth() &&
        lastDate.getFullYear() === today.getFullYear()
      ) {
        setHasUsedToday(true);
      }
    }
  };

  const loadUsedTemplates = () => {
    try {
      const storedSentences = localStorage.getItem('motivation-sentences');
      if (storedSentences) {
        const sentences = JSON.parse(storedSentences);
        if (Array.isArray(sentences)) {
          const billboardTemplates = sentences.map((item: any) => item.sentence || "");
          setUsedTemplates(billboardTemplates.filter(Boolean));
        }
      }
    } catch (e) {
      console.error("Error loading used templates:", e);
    }
  };

  const loadInitialSuggestions = () => {
    setIsRefreshing(true);
    
    const storedData = localStorage.getItem("word-polarity-database");
    const database = storedData ? JSON.parse(storedData) : [];
    
    const availableWordTemplates: WordSuggestion[] = [];
    
    database.forEach((entry: WordEntry) => {
      if (!entry.templates || entry.templates.length === 0) {
        return;
      }
      
      entry.templates.forEach((template, index) => {
        const processedTemplate = template.replace(/\$\{[^}]*\}/g, entry.word);
        
        if (!usedTemplates.includes(processedTemplate)) {
          availableWordTemplates.push({
            word: entry.word,
            templateIndex: index
          });
        }
      });
    });
    
    const randomSuggestions = availableWordTemplates
      .sort(() => 0.5 - Math.random())
      .slice(0, 5);
    
    setTimeout(() => {
      setSuggestions(randomSuggestions);
      setSelectedSuggestion(null);
      setIsRefreshing(false);
    }, 300);
  };

  useEffect(() => {
    loadInitialSuggestions();
    
    const handleDatabaseUpdate = () => {
      loadInitialSuggestions();
    };
    
    window.addEventListener('word-database-updated', handleDatabaseUpdate);
    
    return () => {
      window.removeEventListener('word-database-updated', handleDatabaseUpdate);
    };
  }, [usedTemplates]);

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

  const generateEncouragingSentence = (suggestion: WordSuggestion): string => {
    const { word, templateIndex } = suggestion;
    
    const wordEntry = wordDatabase.find(entry => entry.word === word);
    
    if (!wordEntry || !wordEntry.templates || templateIndex >= wordEntry.templates.length) {
      return `${word}คือสิ่งที่ทำให้ชีวิตมีความหมาย`;
    }
    
    const template = wordEntry.templates[templateIndex];
    return template.replace(/\$\{[^}]*\}/g, word);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedSuggestion) {
      onSelectWord(selectedSuggestion.word);
      
      const sentence = generateEncouragingSentence(selectedSuggestion);
      
      const contributor = localStorage.getItem('contributor-name') || 'ไม่ระบุชื่อ';
      
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
      
      const updatedEntries = [
        {
          word: selectedSuggestion.word,
          sentence: sentence,
          contributor: contributor,
          timestamp: new Date()
        },
        ...existingEntries
      ];
      
      localStorage.setItem('motivation-sentences', JSON.stringify(updatedEntries));
      
      const sentenceEvent = new CustomEvent('motivationalSentenceGenerated', {
        detail: { 
          sentence,
          word: selectedSuggestion.word,
          contributor
        }
      });
      window.dispatchEvent(sentenceEvent);
      
      window.dispatchEvent(new CustomEvent('motivation-billboard-updated'));
      
      localStorage.setItem('last-word-used-date', new Date().toISOString());
      setHasUsedToday(true);

      toast({
        title: "เพิ่มคำสำเร็จ!",
        description: (
          <div className="mt-2">
            <p>คำ "<span className="text-[#F97316] font-semibold">{selectedSuggestion.word}</span>" ได้ถูกเพิ่มเข้าสู่ประโยคกำลังใจแล้ว</p>
            <p className="mt-1 font-medium">"{sentence}"</p>
          </div>
        ),
      });
    }
  };

  const getSelectedSuggestionValue = () => {
    if (!selectedSuggestion) return "";
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
