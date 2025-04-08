
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Filter, RefreshCw, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { getAvailableTemplatesForWord } from "@/utils/templateTracker";
import { getContributorName, updateContributorStats } from "@/utils/wordModeration";

// กำหนดชนิดข้อมูลของคำที่แนะนำ
interface WordSuggestion {
  word: string;
  templates: string[];
}

interface WordSuggestionsProps {
  onWordSelect: (word: string) => void;
  selectedWords?: string[];
}

const WordSuggestions = ({ onWordSelect, selectedWords = [] }: WordSuggestionsProps) => {
  // สร้าง state สำหรับเก็บรายการคำที่แนะนำ
  const [suggestions, setSuggestions] = useState<WordSuggestion[]>([]);
  // สร้าง state สำหรับเก็บรายการคำที่แนะนำที่กรองแล้ว
  const [filteredSuggestions, setFilteredSuggestions] = useState<WordSuggestion[]>([]);
  // สร้าง state สำหรับตัวกรอง
  const [filter, setFilter] = useState<string>("all");
  // สร้าง state สำหรับตรวจสอบว่าคำถูกใช้หมดแล้วหรือยัง
  const [allWordsUsed, setAllWordsUsed] = useState<boolean>(false);
  // นำเข้า toast
  const { toast } = useToast();

  // โหลดคำแนะนำเมื่อ component ถูกโหลด
  useEffect(() => {
    loadWordSuggestions();
  }, []);

  // กรองคำแนะนำเมื่อ filter หรือ suggestions เปลี่ยนแปลง
  useEffect(() => {
    filterSuggestions();
  }, [filter, suggestions, selectedWords]);

  // โหลดคำแนะนำจาก localStorage หรือใช้คำเริ่มต้น
  const loadWordSuggestions = () => {
    try {
      // ลองโหลดคำแนะนำจาก localStorage
      const stored = localStorage.getItem("word-suggestions");
      let wordSuggestions: WordSuggestion[] = [];

      if (stored) {
        // แปลงข้อมูลจาก JSON string เป็น object
        const parsed = JSON.parse(stored);
        
        // ตรวจสอบว่าข้อมูลเป็น array หรือไม่
        if (Array.isArray(parsed)) {
          wordSuggestions = parsed.map(item => {
            // ถ้าเป็น object แต่ไม่มี templates ให้เพิ่ม templates เป็น array ว่าง
            if (typeof item === 'object' && item !== null) {
              return {
                word: item.word || '',
                templates: Array.isArray(item.templates) ? item.templates : []
              };
            }
            // ถ้าเป็น string ให้สร้าง object ใหม่
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
          }).filter(item => item.word !== ''); // กรองรายการที่ไม่มีคำออก
        } else if (typeof parsed === 'object' && parsed !== null) {
          // ถ้าเป็น object ให้แปลงเป็น array
          wordSuggestions = Object.keys(parsed).map(key => ({
            word: key,
            templates: Array.isArray(parsed[key]) ? parsed[key] : []
          }));
        }
      }

      // ถ้าไม่มีคำแนะนำในคลัง ให้ใช้คำเริ่มต้น
      if (wordSuggestions.length === 0) {
        wordSuggestions = [
          { word: "ความพยายาม", templates: ["${บวก}${ความพยายาม}คือกุญแจสู่ความสำเร็จ", "${บวก}อย่าละทิ้ง${ความพยายาม}แม้จะเจออุปสรรค"] },
          { word: "กำลังใจ", templates: ["${บวก}${กำลังใจ}คือสิ่งสำคัญในยามท้อแท้", "${กลาง}${กำลังใจ}จากคนรอบข้างมีค่ามากเพียงใด"] },
          { word: "อดทน", templates: ["${บวก}${อดทน}ไว้ ผลลัพธ์จะคุ้มค่าเสมอ", "${กลาง}การ${อดทน}คือคุณสมบัติของคนเก่ง"] },
          { word: "มิตรภาพ", templates: ["${บวก}${มิตรภาพ}แท้จริงคือสิ่งล้ำค่า", "${กลาง}${มิตรภาพ}ที่ดีต้องผ่านการทดสอบ"] },
          { word: "เติบโต", templates: ["${บวก}การ${เติบโต}ทางความคิดสำคัญกว่าอายุ", "${กลาง}การ${เติบโต}มาพร้อมกับความรับผิดชอบเสมอ"] },
          { word: "ความสุข", templates: ["${บวก}${ความสุข}เกิดจากใจที่พอเพียง", "${บวก}${ความสุข}คือสิ่งที่เราเลือกได้"] },
          { word: "ความฝัน", templates: ["${บวก}ไล่ตาม${ความฝัน}ด้วยความมุ่งมั่น", "${กลาง}${ความฝัน}จะเป็นจริงได้ต้องมีแผน"] },
          { word: "อุปสรรค", templates: ["${กลาง}${อุปสรรค}คือบทเรียนที่มีค่า", "${ลบ}${อุปสรรค}จะผ่านไปเสมอหากไม่ยอมแพ้"] },
          { word: "ความล้มเหลว", templates: ["${กลาง}${ความล้มเหลว}คือครูที่ดีที่สุด", "${ลบ}${ความล้มเหลว}เป็นเพียงจุดเริ่มต้นของความสำเร็จ"] },
          { word: "ขอบคุณ", templates: ["${บวก}การพูด${ขอบคุณ}สร้างพลังบวกให้ชีวิต", "${บวก}${ขอบคุณ}ทุกสิ่งที่เกิดขึ้นในชีวิต"] }
        ];
        
        // บันทึกคำเริ่มต้นลงใน localStorage
        localStorage.setItem("word-suggestions", JSON.stringify(wordSuggestions));
      }

      // อัปเดต state
      setSuggestions(wordSuggestions);
    } catch (error) {
      console.error("เกิดข้อผิดพลาดในการโหลดคำแนะนำ:", error);
      // แสดงข้อความแจ้งเตือน
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถโหลดคำแนะนำได้ กรุณาลองใหม่อีกครั้ง",
        variant: "destructive",
      });
    }
  };

  // กรองคำแนะนำตาม filter
  const filterSuggestions = () => {
    // หากไม่มีคำแนะนำให้กำหนดเป็น array ว่าง
    if (!Array.isArray(suggestions)) {
      setFilteredSuggestions([]);
      setAllWordsUsed(true);
      return;
    }

    // กรองคำที่ถูกเลือกแล้วออก
    let filtered = suggestions.filter(
      (suggestion) => !selectedWords.includes(suggestion.word)
    );

    // กรองคำตาม filter
    if (filter !== "all") {
      filtered = filtered.filter((suggestion) => {
        // ตรวจสอบว่ามี templates หรือไม่
        if (!suggestion.templates || suggestion.templates.length === 0) {
          return false;
        }

        // กรองตามประเภทความรู้สึก
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

    // ตรวจสอบว่าคำถูกใช้หมดแล้วหรือยัง
    if (filtered.length === 0 && suggestions.length > 0) {
      setAllWordsUsed(true);
    } else {
      setAllWordsUsed(false);
    }

    // อัปเดต state
    setFilteredSuggestions(filtered);
  };

  // ฟังก์ชันเมื่อเลือกคำ
  const handleSelectWord = (word: string, templates: string[]) => {
    // บันทึกสถิติผู้ร่วมสร้าง
    updateContributorStats(getContributorName());

    // ตรวจสอบว่ามี templates หรือไม่
    if (!templates || templates.length === 0) {
      // ถ้าไม่มี templates ให้ใช้ onWordSelect ปกติ
      onWordSelect(word);
      
      // แสดงข้อความแจ้งเตือน
      toast({
        title: "เพิ่มคำแล้ว",
        description: `เพิ่มคำ "${word}" แล้ว`,
      });
    } else {
      // สุ่มเลือก template หนึ่งจาก templates ที่ยังไม่ถูกใช้
      const availableTemplates = getAvailableTemplatesForWord(word, templates);
      
      if (availableTemplates.length > 0) {
        // สุ่มเลือก template
        const randomTemplate = availableTemplates[Math.floor(Math.random() * availableTemplates.length)];
        
        // ตรวจสอบว่ามีฟังก์ชัน showMotivationalSentence หรือไม่
        if (typeof (window as any).showMotivationalSentence === 'function') {
          // เรียกใช้ฟังก์ชันแสดงประโยคจาก MotivationalSentence component
          (window as any).showMotivationalSentence(word, getContributorName(), randomTemplate);
        } else {
          // ถ้าไม่มีฟังก์ชัน showMotivationalSentence ให้ใช้ onWordSelect ปกติ
          onWordSelect(word);
          
          // แสดงข้อความแจ้งเตือน
          toast({
            title: "เพิ่มคำแล้ว",
            description: `เพิ่มคำ "${word}" แล้ว`,
          });
        }
      } else {
        // ถ้าไม่มี template ที่ยังไม่ถูกใช้ ให้ใช้ onWordSelect ปกติ
        onWordSelect(word);
        
        // แสดงข้อความแจ้งเตือน
        toast({
          title: "เพิ่มคำแล้ว",
          description: `เพิ่มคำ "${word}" แล้ว (ไม่มีแม่แบบประโยคที่ยังไม่ถูกใช้)`,
        });
      }
    }
  };

  // รีเฟรชคำแนะนำ
  const handleRefresh = () => {
    loadWordSuggestions();
    
    // แสดงข้อความแจ้งเตือน
    toast({
      title: "รีเฟรชคำแนะนำแล้ว",
      description: "รายการคำแนะนำถูกรีเฟรชแล้ว",
    });
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
            
            <Button
              variant="outline"
              size="icon"
              onClick={handleRefresh}
              title="รีเฟรชคำแนะนำ"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
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

export default WordSuggestions;
