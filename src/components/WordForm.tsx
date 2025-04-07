
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
  const [usedWords, setUsedWords] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const savedContributor = localStorage.getItem("contributor-name");
    if (savedContributor) {
      setContributor(savedContributor);
    }
    
    loadWordDatabase();
    loadUsedWords();
    
    const handleDatabaseUpdate = () => {
      loadWordDatabase();
    };
    
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

  const loadUsedWords = () => {
    try {
      const storedSentences = localStorage.getItem('motivation-sentences');
      if (storedSentences) {
        const sentences = JSON.parse(storedSentences);
        const billboardWords = sentences.map((item: any) => item.word || "");
        setUsedWords(billboardWords.filter(Boolean));
      }
    } catch (e) {
      console.error("Error loading used words:", e);
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
    const trimmedContributor = contributor.trim() || "ไม่ระบุชื่อ";

    if (usedWords.includes(trimmedWord)) {
      toast({
        title: "คำนี้ถูกใช้ไปแล้ว",
        description: "คำนี้ปรากฏในประโยคกำลังใจล่าสุดแล้ว กรุณาใช้คำอื่น",
        variant: "destructive",
      });
      return;
    }

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
      const sentence = generateEncouragingSentence(trimmedWord, wordEntry);
      
      // Create a new sentence entry
      const newSentenceEntry = {
        word: trimmedWord,
        sentence: sentence,
        contributor: trimmedContributor,
        timestamp: new Date()
      };
      
      // Update the list of sentences in localStorage
      try {
        const storedSentences = localStorage.getItem('motivation-sentences');
        const existingSentences = storedSentences ? JSON.parse(storedSentences) : [];
        const updatedSentences = [newSentenceEntry, ...existingSentences];
        localStorage.setItem('motivation-sentences', JSON.stringify(updatedSentences));
      } catch (error) {
        console.error("Error updating sentences:", error);
      }
      
      const sentenceEvent = new CustomEvent('motivationalSentenceGenerated', {
        detail: { 
          sentence,
          word: trimmedWord,
          contributor: trimmedContributor
        }
      });
      window.dispatchEvent(sentenceEvent);
      
      // Add to used words
      setUsedWords(prev => [...prev, trimmedWord]);
      
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

  const generateEncouragingSentence = (word: string, wordEntry: WordEntry): string => {
    if (wordEntry.templates && wordEntry.templates.length > 0) {
      const randomIndex = Math.floor(Math.random() * wordEntry.templates.length);
      return wordEntry.templates[randomIndex].replace(new RegExp(`\\$\\{${word}\\}`, 'g'), word);
    }
    
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
    
    const randomIndex = Math.floor(Math.random() * templates.length);
    return templates[randomIndex];
  };

  const handleSelectSuggestion = (selectedWord: string, template?: string) => {
    const contributorName = contributor.trim() || "ไม่ระบุชื่อ";
    localStorage.setItem("contributor-name", contributorName);
    
    // Add to used words
    setUsedWords(prev => [...prev, selectedWord]);
    
    onAddWord(selectedWord, contributorName, template);
  };

  const isWordAvailable = (wordText: string) => {
    return !usedWords.includes(wordText);
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
              existingWords={existingWords}
              onSelectWord={handleSelectSuggestion}
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
