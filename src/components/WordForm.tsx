
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Filter, RefreshCw, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { getAvailableTemplatesForWord } from "@/utils/templateTracker";
import { getContributorName } from "@/utils/contributorManager";
import { updateContributorStats, validateWordInput } from "@/utils/wordModeration";

interface WordSuggestion {
  word: string;
  templates: string[];
}

interface WordFormProps {
  onAddWord: (word: string) => void;
  isLoading?: boolean;
  existingWords?: string[];
  disableSuggestionRefresh?: boolean;
}

const WordForm = ({ 
  onAddWord, 
  isLoading = false, 
  existingWords = [], 
  disableSuggestionRefresh = false 
}: WordFormProps) => {
  const [suggestions, setSuggestions] = useState<WordSuggestion[]>([]);
  const [filteredSuggestions, setFilteredSuggestions] = useState<WordSuggestion[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [allWordsUsed, setAllWordsUsed] = useState<boolean>(false);
  const [inputWord, setInputWord] = useState<string>("");
  const { toast } = useToast();

  useEffect(() => {
    loadWordSuggestions();
  }, []);

  useEffect(() => {
    filterSuggestions();
  }, [filter, suggestions, existingWords]);

  const loadWordSuggestions = () => {
    try {
      const stored = localStorage.getItem("word-suggestions");
      let wordSuggestions: WordSuggestion[] = [];

      if (stored) {
        const parsed = JSON.parse(stored);
        
        if (Array.isArray(parsed)) {
          wordSuggestions = parsed.map(item => {
            if (typeof item === 'object' && item !== null) {
              return {
                word: item.word || '',
                templates: Array.isArray(item.templates) ? item.templates : []
              };
            }
            if (typeof item === 'string') {
              return {
                word: item,
                templates: []
              };
            }
            return {
              word: '',
              templates: []
            };
          }).filter(item => item.word !== '');
        } else if (typeof parsed === 'object' && parsed !== null) {
          wordSuggestions = Object.keys(parsed).map(key => ({
            word: key,
            templates: Array.isArray(parsed[key]) ? parsed[key] : []
          }));
        }
      }

      if (wordSuggestions.length === 0) {
        wordSuggestions = [
          { word: "ความพยายาม", templates: ["${บวก}${ความพยายาม}คือกุญแจสู่ความสำเร็จ", "${บวก}อย่าละทิ้ง${ความพยายาม}แม้จะเจออุปสรรค"] },
          { word: "กำลังใจ", templates: ["${บวก}${กำลังใจ}คือสิ่งสำคัญในยามท้อแท้", "${กลาง}${กำลังใจ}จากคนรอบข้างมีค่ามากเพียงใด"] },
          { word: "อดทน", templates: ["${บวก}${อดทน}ไว้ ผลลัพธ์จะคุ้มค่าเสมอ", "${กลาง}การ${อดทน}คือคุณสมบัติของคนเก่ง"] }
        ];
        
        localStorage.setItem("word-suggestions", JSON.stringify(wordSuggestions));
      }

      setSuggestions(wordSuggestions);
    } catch (error) {
      console.error("เกิดข้อผิดพลาดในการโหลดคำแนะนำ:", error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถโหลดคำแนะนำได้ กรุณาลองใหม่อีกครั้ง",
        variant: "destructive",
      });
    }
  };

  const filterSuggestions = () => {
    if (!Array.isArray(suggestions)) {
      setFilteredSuggestions([]);
      setAllWordsUsed(true);
      return;
    }

    let filtered = suggestions.filter(
      (suggestion) => !existingWords.includes(suggestion.word)
    );

    if (filter !== "all") {
      filtered = filtered.filter((suggestion) => {
        if (!suggestion.templates || suggestion.templates.length === 0) {
          return false;
        }

        return suggestion.templates.some((template) => {
          if (filter === "positive") {
            return template.includes("${บวก}");
          } else if (filter === "neutral") {
            return template.includes("${กลาง}");
          } else if (filter === "negative") {
            return template.includes("${ลบ}");
          }
          return false;
        });
      });
    }

    if (filtered.length === 0 && suggestions.length > 0) {
      setAllWordsUsed(true);
    } else {
      setAllWordsUsed(false);
    }

    setFilteredSuggestions(filtered);
  };

  const handleSelectWord = (word: string, templates: string[]) => {
    updateContributorStats(getContributorName());

    if (!templates || templates.length === 0) {
      onAddWord(word);
      
      toast({
        title: "เพิ่มคำแล้ว",
        description: `เพิ่มคำ "${word}" แล้ว`,
      });
    } else {
      const availableTemplates = getAvailableTemplatesForWord(word, templates);
      
      if (availableTemplates.length > 0) {
        const randomTemplate = availableTemplates[Math.floor(Math.random() * availableTemplates.length)];
        
        // Call onAddWord with just the word parameter
        onAddWord(word);
        
        if (typeof (window as any).showMotivationalSentence === 'function') {
          (window as any).showMotivationalSentence(word, getContributorName(), randomTemplate);
        }
        
        toast({
          title: "เพิ่มคำแล้ว",
          description: `เพิ่มคำ "${word}" แล้ว`,
        });
      } else {
        onAddWord(word);
        
        toast({
          title: "เพิ่มคำแล้ว",
          description: `เพิ่มคำ "${word}" แล้ว (ไม่มีแม่แบบประโยคที่ยังไม่ถูกใช้)`,
        });
      }
    }
  };

  const handleRefresh = () => {
    loadWordSuggestions();
    
    toast({
      title: "รีเฟรชคำแนะนำแล้ว",
      description: "รายการคำแนะนำถูกรีเฟรชแล้ว",
    });
  };

  const handleCustomWordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputWord.trim()) {
      toast({
        title: "กรุณาระบุคำ",
        description: "โปรดระบุคำที่ต้องการเพิ่ม",
        variant: "destructive",
      });
      return;
    }
    
    if (existingWords.includes(inputWord.trim())) {
      toast({
        title: "คำซ้ำ",
        description: `คำ "${inputWord.trim()}" ถูกใช้แล้วในประโยค`,
        variant: "destructive",
      });
      return;
    }
    
    // Check if the word is valid
    const validationResult = validateWordInput(inputWord.trim(), []);
    if (!validationResult.valid) {
      toast({
        title: "คำไม่ถูกต้อง",
        description: validationResult.message || "กรุณาตรวจสอบคำที่ป้อน",
        variant: "destructive",
      });
      return;
    }
    
    updateContributorStats(getContributorName());
    onAddWord(inputWord.trim());
    
    toast({
      title: "เพิ่มคำแล้ว",
      description: `เพิ่มคำ "${inputWord.trim()}" แล้ว`,
    });
    
    setInputWord("");
  };

  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">คำแนะนำ</h3>
          
          <div className="flex gap-2">
            <div className="flex">
              <Button
                variant={filter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("all")}
                className="rounded-r-none border-r-0"
              >
                ทั้งหมด
              </Button>
              <Button
                variant={filter === "positive" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("positive")}
                className="rounded-none border-r-0 border-l-0"
              >
                บวก
              </Button>
              <Button
                variant={filter === "neutral" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("neutral")}
                className="rounded-none border-r-0 border-l-0"
              >
                กลาง
              </Button>
              <Button
                variant={filter === "negative" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("negative")}
                className="rounded-l-none border-l-0"
              >
                ลบ
              </Button>
            </div>
            
            {!disableSuggestionRefresh && (
              <Button
                variant="outline"
                size="icon"
                onClick={handleRefresh}
                title="รีเฟรชคำแนะนำ"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        
        <form className="mb-4" onSubmit={handleCustomWordSubmit}>
          <div className="flex gap-2">
            <Input
              placeholder="พิมพ์คำที่ต้องการเพิ่ม"
              value={inputWord}
              onChange={(e) => setInputWord(e.target.value)}
            />
            <Button type="submit" disabled={isLoading}>
              เพิ่ม
            </Button>
          </div>
        </form>
        
        {allWordsUsed ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>คำในคลังถูกใช้หมดแล้ว</AlertTitle>
            <AlertDescription>
              คำทั้งหมดในคลังถูกใช้แล้ว โปรดแจ้งผู้ดูแลระบบเพื่อเพิ่มคำใหม่
            </AlertDescription>
          </Alert>
        ) : (
          <div className="flex flex-wrap gap-2">
            {filteredSuggestions.map((suggestion) => (
              <Badge
                key={suggestion.word}
                variant="outline"
                className="px-3 py-1 cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                onClick={() => handleSelectWord(suggestion.word, suggestion.templates)}
              >
                {suggestion.word}
              </Badge>
            ))}
            
            {filteredSuggestions.length === 0 && !allWordsUsed && (
              <p className="text-muted-foreground">ไม่พบคำแนะนำที่ตรงกับตัวกรอง</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WordForm;
