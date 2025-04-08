
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { ArrowRight, Sparkles, Search, X, History } from "lucide-react";
import { getWordSentiment } from "@/utils/sentimentAnalysis";
import { filterWordsByCategory } from "@/utils/wordCategorization";
import { addWord, getRecentWords } from "@/utils/wordModeration";
import { promptForContributorName } from "@/utils/contributorManager";
import { saveMotivationalSentence } from "@/utils/motivationSentenceManager";

interface WordSuggestionsProps {
  onWordSelect: (word: string) => void;
  selectedWords?: string[];
}

const WordSuggestions = ({ onWordSelect, selectedWords = [] }: WordSuggestionsProps) => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("positive");
  const [recentWords, setRecentWords] = useState<string[]>([]);
  
  // คำแนะนำตามประเภท
  const positiveWords = ["สุข", "รัก", "หวัง", "ยิ้ม", "กล้า", "ฝัน", "ชนะ", "ศรัทธา", "ขอบคุณ", "เมตตา"];
  const neutralWords = ["คิด", "เวลา", "เริ่ม", "ยอมรับ", "เข้าใจ", "เรียนรู้", "ปรับตัว", "สมดุล", "ทางออก"];
  const negativeWords = ["เศร้า", "เหนื่อย", "ยาก", "กลัว", "สับสน", "ผิดหวัง", "เจ็บปวด", "ล้มเหลว"];
  
  // ดึงคำล่าสุดเมื่อโหลดคอมโพเนนต์
  useEffect(() => {
    const words = getRecentWords();
    setRecentWords(words);
  }, []);

  // กรองคำตามหมวดหมู่ที่เลือก
  const filteredWords = () => {
    let words = [];
    
    switch (activeTab) {
      case "positive":
        words = positiveWords;
        break;
      case "neutral":
        words = neutralWords;
        break;
      case "negative":
        words = negativeWords;
        break;
      case "recent":
        words = recentWords;
        break;
    }
    
    if (searchTerm) {
      return words.filter(word => word.includes(searchTerm));
    }
    
    return words;
  };

  // จัดการการคลิกที่คำ
  const handleWordClick = (word: string) => {
    // บันทึกชื่อผู้ใช้ (จะแสดง prompt ถ้ายังไม่ได้ตั้งชื่อ)
    promptForContributorName();
    
    // เรียกฟังก์ชันจากคอมโพเนนต์แม่
    onWordSelect(word);
    
    // บันทึกคำลงใน localStorage
    addWord(word);
    
    // อัปเดตคำล่าสุด
    setRecentWords(getRecentWords());
    
    toast({
      title: "เลือกคำสำเร็จ",
      description: `คุณได้เลือกคำว่า "${word}"`,
    });
    
    // ดึงฟังก์ชันแสดงประโยคให้กำลังใจจาก window object (กำหนดโดย MotivationalSentence.tsx)
    if ((window as any).showMotivationalSentence) {
      (window as any).showMotivationalSentence(word);
      
      // เราไม่ต้องบันทึกประโยคตรงนี้อีกแล้ว เพราะจะจัดการในฝั่งของ MotivationalSentence.tsx
    }
  };

  // ฟังก์ชันสำหรับเพิ่มคำที่ค้นหา
  const handleAddCustomWord = () => {
    if (!searchTerm || searchTerm.trim().length === 0) {
      toast({
        title: "ไม่สามารถเพิ่มคำได้",
        description: "กรุณาป้อนคำที่ต้องการเพิ่ม",
        variant: "destructive",
      });
      return;
    }
    
    const word = searchTerm.trim();
    
    if (word.length > 10) {
      toast({
        title: "ไม่สามารถเพิ่มคำได้",
        description: "คำที่เพิ่มต้องมีความยาวไม่เกิน 10 ตัวอักษร",
        variant: "destructive",
      });
      return;
    }
    
    // เรียกฟังก์ชันจากคอมโพเนนต์แม่
    onWordSelect(word);
    
    // บันทึกคำลงใน localStorage
    addWord(word);
    
    // อัปเดตคำล่าสุด
    setRecentWords(getRecentWords());
    
    // ล้างช่องค้นหา
    setSearchTerm("");
    
    toast({
      title: "เพิ่มคำสำเร็จ",
      description: `คุณได้เพิ่มคำว่า "${word}"`,
    });
    
    // ดึงฟังก์ชันแสดงประโยคให้กำลังใจจาก window object (กำหนดโดย MotivationalSentence.tsx)
    if ((window as any).showMotivationalSentence) {
      (window as any).showMotivationalSentence(word);
    }
  };

  // ล้างคำค้นหา
  const clearSearch = () => {
    setSearchTerm("");
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-5 w-5 text-orange-500" />
            <h3 className="text-lg font-medium">คำแนะนำ</h3>
          </div>
          
          <div className="flex relative">
            <div className="relative w-full">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="ค้นหาหรือเพิ่มคำใหม่..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-8"
              />
              {searchTerm && (
                <button 
                  onClick={clearSearch}
                  className="absolute right-2 top-2.5 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            
            {searchTerm && (
              <Button 
                onClick={handleAddCustomWord}
                className="ml-2"
                size="sm"
              >
                เพิ่ม
              </Button>
            )}
          </div>
          
          <Tabs defaultValue="positive" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-4 mb-2">
              <TabsTrigger value="positive">เชิงบวก</TabsTrigger>
              <TabsTrigger value="neutral">กลาง</TabsTrigger>
              <TabsTrigger value="negative">เชิงลบ</TabsTrigger>
              <TabsTrigger value="recent" className="flex items-center gap-1">
                <History className="h-3.5 w-3.5" />
                <span>ล่าสุด</span>
              </TabsTrigger>
            </TabsList>
            
            {["positive", "neutral", "negative", "recent"].map((tab) => (
              <TabsContent key={tab} value={tab} className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {filteredWords().map((word) => (
                    <Button
                      key={word}
                      variant="outline"
                      size="sm"
                      className={`flex items-center ${
                        selectedWords.includes(word) ? "bg-primary/10 border-primary/30" : ""
                      }`}
                      onClick={() => handleWordClick(word)}
                    >
                      {word}
                      <ArrowRight className="ml-1 h-3 w-3" />
                    </Button>
                  ))}
                  
                  {filteredWords().length === 0 && (
                    <div className="w-full text-center py-2 text-muted-foreground">
                      {tab === "recent" ? "ไม่มีคำที่ใช้ล่าสุด" : `ไม่พบคำที่ตรงกับ "${searchTerm}"`}
                    </div>
                  )}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </CardContent>
    </Card>
  );
};

export default WordSuggestions;
