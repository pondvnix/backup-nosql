
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Send, Edit } from "lucide-react";
import { validateWordInput } from "@/utils/wordModeration";
import WordSuggestions from "./WordSuggestions";

interface WordFormProps {
  onAddWord: (word: string, contributor: string, template?: string) => void;
  isLoading: boolean;
  existingWords?: string[];
  disableSuggestionRefresh?: boolean;
  showMultipleTemplates?: boolean;
}

interface WordEntry {
  word: string;
  polarity: 'positive' | 'neutral' | 'negative';
  templates: string[];
  score?: number;
}

const WordForm = ({ 
  onAddWord, 
  isLoading, 
  existingWords = [], 
  disableSuggestionRefresh = false,
  showMultipleTemplates = true
}: WordFormProps) => {
  const [word, setWord] = useState("");
  const [contributor, setContributor] = useState("");
  const [inputMethod, setInputMethod] = useState<"manual" | "suggestions">("suggestions");
  const [wordDatabase, setWordDatabase] = useState<WordEntry[]>([]);
  const [usedWordTemplates, setUsedWordTemplates] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  useEffect(() => {
    const savedContributor = localStorage.getItem("contributor-name");
    if (savedContributor) {
      setContributor(savedContributor);
    }
    
    loadWordDatabase();
    loadUsedWordTemplates();
    
    const handleDatabaseUpdate = () => {
      loadWordDatabase();
    };
    
    const handleBillboardUpdate = () => {
      loadUsedWordTemplates();
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

  const loadUsedWordTemplates = () => {
    try {
      const storedSentences = localStorage.getItem('motivation-sentences');
      if (storedSentences) {
        const sentences = JSON.parse(storedSentences);
        
        const usedCombinations = new Set<string>();
        sentences.forEach((item: any) => {
          if (item.word && item.sentence) {
            usedCombinations.add(`${item.word}_${item.sentence}`);
          }
        });
        setUsedWordTemplates(usedCombinations);
      }
    } catch (e) {
      console.error("Error loading used word-templates:", e);
      setUsedWordTemplates(new Set());
    }
  };

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
    
    const trimmedWord = word.trim();
    // Standardize empty contributor as "ไม่ระบุชื่อ"
    const trimmedContributor = contributor.trim() || "ไม่ระบุชื่อ";

    const validation = validateWordInput(trimmedWord, trimmedContributor);
    
    if (!validation.isValid) {
      toast({
        title: validation.message,
        variant: "destructive",
      });
      return;
    }

    localStorage.setItem("contributor-name", trimmedContributor);
    
    const wordEntry = wordDatabase.find(entry => entry.word === trimmedWord);
    
    if (wordEntry) {
      const unusedTemplates = wordEntry.templates.filter(template => 
        !usedWordTemplates.has(`${trimmedWord}_${template}`)
      );
      
      if (unusedTemplates.length === 0) {
        toast({
          title: "ไม่พบประโยคกำลังใจที่ยังไม่ได้ใช้",
          description: "ประโยคกำลังใจสำหรับคำนี้ถูกใช้ไปหมดแล้ว กรุณาใช้คำอื่น",
          variant: "destructive",
        });
        return;
      }
      
      const template = unusedTemplates[Math.floor(Math.random() * unusedTemplates.length)];
      const sentence = template.replace(new RegExp(`\\$\\{${trimmedWord}\\}`, 'g'), trimmedWord);
      
      const newSentenceEntry = {
        word: trimmedWord,
        sentence: sentence,
        template: template,
        contributor: trimmedContributor, // Use standardized contributor name
        timestamp: new Date(),
        polarity: wordEntry.polarity,
        score: wordEntry.score || (wordEntry.polarity === 'positive' ? 1 : wordEntry.polarity === 'negative' ? -1 : 0)
      };
      
      try {
        const storedSentences = localStorage.getItem('motivation-sentences');
        const existingSentences = storedSentences ? JSON.parse(storedSentences) : [];
        const updatedSentences = [newSentenceEntry, ...existingSentences];
        localStorage.setItem('motivation-sentences', JSON.stringify(updatedSentences));
      } catch (error) {
        console.error("Error updating sentences:", error);
      }
      
      setUsedWordTemplates(prev => {
        const newSet = new Set(prev);
        newSet.add(`${trimmedWord}_${template}`);
        return newSet;
      });
      
      const sentenceEvent = new CustomEvent('motivationalSentenceGenerated', {
        detail: { 
          sentence,
          word: trimmedWord,
          contributor: trimmedContributor, // Use standardized contributor name
          template,
          polarity: wordEntry.polarity,
          score: wordEntry.score || (wordEntry.polarity === 'positive' ? 1 : wordEntry.polarity === 'negative' ? -1 : 0)
        }
      });
      window.dispatchEvent(sentenceEvent);
      
      toast({
        title: "เพิ่มคำสำเร็จ!",
        description: (
          <div className="mt-2">
            <p>คำ "<span className="text-[#F97316] font-semibold">{trimmedWord}</span>" ได้ถูกเพิ่มเข้าสู่ประโยคกำลังใจแล้ว</p>
            <p className="mt-1 font-medium">"{sentence}"</p>
          </div>
        ),
      });
    }
    
    onAddWord(trimmedWord, trimmedContributor);
    setWord("");
  };

  const handleSelectWord = (selectedWord: string, contributor: string, template?: string) => {
    // Standardize empty contributor as "ไม่ระบุชื่อ"
    const trimmedContributor = contributor.trim() || "ไม่ระบุชื่อ";
    localStorage.setItem("contributor-name", trimmedContributor);
    
    if (template) {
      setUsedWordTemplates(prev => {
        const newSet = new Set(prev);
        newSet.add(`${selectedWord}_${template}`);
        return newSet;
      });
    }
    
    // Get word entry from database to ensure we have correct polarity and score
    const wordEntry = wordDatabase.find(entry => entry.word === selectedWord);
    if (wordEntry && template) {
      const newSentenceEntry = {
        word: selectedWord,
        sentence: template.replace(new RegExp(`\\$\\{${selectedWord}\\}`, 'g'), selectedWord),
        template: template,
        contributor: trimmedContributor, // Use standardized contributor name
        timestamp: new Date(),
        polarity: wordEntry.polarity,
        score: wordEntry.score || (wordEntry.polarity === 'positive' ? 1 : wordEntry.polarity === 'negative' ? -1 : 0)
      };
      
      try {
        const storedSentences = localStorage.getItem('motivation-sentences');
        const existingSentences = storedSentences ? JSON.parse(storedSentences) : [];
        const updatedSentences = [newSentenceEntry, ...existingSentences];
        localStorage.setItem('motivation-sentences', JSON.stringify(updatedSentences));
      } catch (error) {
        console.error("Error updating sentences:", error);
      }
    }
    
    onAddWord(selectedWord, trimmedContributor, template);
  };

  const handleSelectSuggestion = (selectedWord: string, template?: string) => {
    // Standardize empty contributor as "ไม่ระบุชื่อ"
    const contributorName = contributor.trim() || "ไม่ระบุชื่อ";
    localStorage.setItem("contributor-name", contributorName);
    
    handleSelectWord(selectedWord, contributorName, template);
  };

  const isWordAvailable = (wordText: string) => {
    const wordEntry = wordDatabase.find(entry => entry.word === wordText);
    
    if (!wordEntry || !wordEntry.templates || wordEntry.templates.length === 0) {
      return false;
    }
    
    return wordEntry.templates.some(template => 
      !usedWordTemplates.has(`${wordText}_${template}`)
    );
  };

  return (
    <div className="w-full space-y-4 animate-fade-in">
      <div className="space-y-2">
        <label htmlFor="contributor" className="text-sm font-medium">
          ชื่อของคุณ
        </label>
        <Input
          id="contributor"
          value={contributor}
          onChange={(e) => setContributor(e.target.value)}
          placeholder="ใส่ชื่อหรือนามแฝงของคุณ"
          maxLength={30}
          disabled={isLoading}
          className="transition-all duration-300 hover:border-primary focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </div>

      <Tabs 
        defaultValue="suggestions" 
        value={inputMethod}
        onValueChange={(value) => setInputMethod(value as "manual" | "suggestions")}
        className="w-full"
      >
        <TabsList className="grid grid-cols-2 w-full">
          <TabsTrigger 
            value="suggestions" 
            className="flex items-center transition-all duration-300 data-[state=active]:bg-primary data-[state=active]:text-white"
          >
            <Send className="h-4 w-4 mr-2" />
            แนะนำคำ
          </TabsTrigger>
          <TabsTrigger 
            value="manual" 
            className="flex items-center transition-all duration-300 data-[state=active]:bg-primary data-[state=active]:text-white"
          >
            <Edit className="h-4 w-4 mr-2" />
            พิมพ์เอง
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="suggestions" className="mt-4 animate-fade-in">
          {contributor.trim() ? (
            <WordSuggestions
              selectedWords={existingWords}
              onWordSelect={handleSelectSuggestion}
              disableAutoRefresh={disableSuggestionRefresh}
              showMultipleTemplates={showMultipleTemplates}
            />
          ) : (
            <div className="text-center p-4 bg-muted rounded-md animate-pulse">
              กรุณาใส่ชื่อของคุณก่อนเลือกคำแนะนำ
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="manual" className="mt-4 animate-fade-in">
          <form onSubmit={handleSubmit} className="space-y-2">
            <label htmlFor="word" className="text-sm font-medium">
              คำของคุณ
            </label>
            <div className="flex w-full items-center space-x-2">
              <Input
                id="word"
                value={word}
                onChange={(e) => setWord(e.target.value)}
                placeholder="พิมพ์คำเพื่อต่อประโยคกำลังใจ"
                maxLength={30}
                disabled={isLoading}
                className="transition-all duration-300 hover:border-primary focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
              <Button 
                type="submit" 
                disabled={isLoading || !word.trim() || !contributor.trim() || !isWordAvailable(word.trim())}
                className={`transition-all duration-300 hover:scale-105 ${isLoading ? "animate-pulse" : ""}`}
                title={!isWordAvailable(word.trim()) ? "คำนี้ถูกใช้ในประโยคกำลังใจล่าสุดแล้ว" : ""}
              >
                <Send className="h-4 w-4 mr-2" />
                ส่ง
              </Button>
            </div>
            {word.trim() && (
              <div className="mt-2">
                {!isWordAvailable(word.trim()) ? (
                  <p className="text-sm text-red-600">
                    คำนี้ถูกใช้ในประโยคกำลังใจล่าสุดแล้ว กรุณาใช้คำอื่น
                  </p>
                ) : wordDatabase.some(entry => entry.word === word.trim()) ? (
                  <p className="text-sm text-green-600">
                    คำนี้มีในคลังคำแล้ว จะใช้ประโยคตามที่กำหนดไว้
                  </p>
                ) : (
                  <p className="text-sm text-amber-600">
                    คำนี้ยังไม่มีในคลังคำ จะไม่มีประโยคกำลังใจพิเศษ
                  </p>
                )}
              </div>
            )}
          </form>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WordForm;
