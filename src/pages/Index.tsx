
import { useState, useEffect, useCallback } from "react";
import { Container } from "@/components/ui/container";
import { Card, CardContent } from "@/components/ui/card";
import MobileFooter from "@/components/MobileFooter";
import Header from "@/components/Header";
import WordForm from "@/components/WordForm";
import MotivationalSentence from "@/components/MotivationalSentence";
import TomatoBox from "@/components/TomatoBox";
import { useToast } from "@/hooks/use-toast";
import SentenceAnalysis from "@/components/SentenceAnalysis";
import Leaderboard from "@/components/Leaderboard";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { analyzeSentence } from "@/utils/sentenceAnalysis";
import { standardizeContributorName } from "@/utils/wordModeration";

const Index = () => {
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentWord, setCurrentWord] = useState("");
  const [currentContributor, setCurrentContributor] = useState("");
  const [currentSentence, setCurrentSentence] = useState("");
  const [analysisResult, setAnalysisResult] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { toast } = useToast();

  // ปรับปรุงให้ใช้ useCallback สำหรับฟังก์ชันที่ถูกใช้ใน dependencies
  const handleSentenceGenerated = useCallback((event: CustomEvent) => {
    if (event.detail) {
      const { word, sentence, contributor } = event.detail;
      
      if (word && !selectedWords.includes(word)) {
        setSelectedWords(prev => [...prev, word]);
      }
      
      if (sentence) {
        setCurrentSentence(sentence);
      }
      
      if (word) {
        setCurrentWord(word);
      }
      
      // ปรับปรุงการจัดการ contributor เพื่อให้มั่นใจว่าจะถูกส่งไปอย่างถูกต้อง
      if (contributor) {
        // ใช้การทำให้ชื่อเป็นมาตรฐานและบันทึกลงใน localStorage เพื่อความต่อเนื่อง
        const safeContributor = standardizeContributorName(contributor);
        setCurrentContributor(safeContributor);
        localStorage.setItem('contributor-name', safeContributor);
      }
    }
  }, [selectedWords]);
  
  // Listen for motivational sentence events with useCallback
  useEffect(() => {
    window.addEventListener('motivationalSentenceGenerated', handleSentenceGenerated as EventListener);
    
    return () => {
      window.removeEventListener('motivationalSentenceGenerated', handleSentenceGenerated as EventListener);
    };
  }, [handleSentenceGenerated]);

  // Update analysis when selected words change
  useEffect(() => {
    if (selectedWords.length > 0) {
      // Pass the array of words directly to analyzeSentence
      const result = analyzeSentence(selectedWords);
      setAnalysisResult(result);
    }
  }, [selectedWords]);

  const handleAddWord = (word: string, contributor: string, template?: string) => {
    setIsLoading(true);
    
    try {
      // Add word to selected words list if not already present
      if (!selectedWords.includes(word)) {
        setSelectedWords(prev => [...prev, word]);
      }
      
      // Standardize contributor name และบันทึกลงใน localStorage
      const safeContributor = standardizeContributorName(contributor);
      localStorage.setItem('contributor-name', safeContributor);
      
      // Update current word and contributor
      setCurrentWord(word);
      setCurrentContributor(safeContributor);
      
      // Trigger refresh for components that depend on word updates
      // ใช้ debounce โดยการทำ timeout เพื่อไม่ให้ trigger event บ่อยเกินไป
      const timeoutId = setTimeout(() => {
        setRefreshTrigger(prev => prev + 1);
      }, 300);
      
      toast({
        title: "เพิ่มคำสำเร็จ",
        description: `เพิ่มคำ "${word}" เรียบร้อยแล้ว`,
      });
      
      // สร้าง event เพื่อแจ้งเตือนคอมโพเนนต์อื่นๆ
      if (template) {
        const event = new CustomEvent('motivationalSentenceGenerated', {
          detail: {
            word,
            contributor: safeContributor,
            template
          }
        });
        window.dispatchEvent(event);
      }
      
      // ล้าง timeout เมื่อคอมโพเนนต์ถูกทำลาย
      return () => clearTimeout(timeoutId);
    } catch (error) {
      console.error("Error adding word:", error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถเพิ่มคำได้ในขณะนี้",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-16 md:pb-0">
      <Header />
      
      <Container className="py-8">
        <div className="space-y-6">
          <Alert variant="destructive" className="bg-amber-50 border-amber-200">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-700">
              การเพิ่มคำใหม่เข้าสู่ระบบสามารถทำได้ในหน้า "จัดการคำลังใจ" เท่านั้น กรุณาเลือกจากคำที่มีอยู่แล้วในระบบ
            </AlertDescription>
          </Alert>

          <Card className="hover:shadow-md transition-all duration-300">
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold mb-4 text-center font-mitr">
                ร่วมสร้างประโยคกำลังใจด้วยกัน
              </h2>
              <p className="text-center text-muted-foreground mb-4">
                เลือกหนึ่งคำเพื่อต่อเติมประโยคกำลังใจให้ยาวที่สุด
              </p>
              <WordForm 
                onAddWord={handleAddWord} 
                isLoading={isLoading} 
                existingWords={selectedWords}
                showMultipleTemplates={true}
              />
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6">
              <h3 className="text-xl font-semibold">ประโยคกำลังใจปัจจุบัน</h3>
              
              <MotivationalSentence 
                selectedWords={selectedWords} 
                shouldDisplay={currentSentence !== ""}
                currentSentence={currentSentence}
              />
              
              {currentWord && (
                <div className="space-y-4 animate-fade-in">
                  <h3 className="text-xl font-semibold">คำล่าสุดของคุณ</h3>
                  <TomatoBox 
                    word={currentWord} 
                    contributor={currentContributor} 
                    sentence={currentSentence}
                    selectedWords={selectedWords}
                  />
                </div>
              )}
              
              <div className="space-y-6">
                <h3 className="text-xl font-semibold">วิเคราะห์พลังบวก</h3>
                <SentenceAnalysis 
                  words={selectedWords} 
                  analysisResult={analysisResult} 
                />
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="w-full">
                <Leaderboard refreshTrigger={refreshTrigger} />
              </div>
            </div>
          </div>
        </div>
      </Container>
      
      <MobileFooter />
    </div>
  );
};

export default Index;
