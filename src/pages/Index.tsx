
import { useState, useEffect } from "react";
import { Container } from "@/components/ui/container";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
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
import MotivationQuoteTable from "@/components/MotivationQuoteTable";
import WordPolarityLog from "@/components/WordPolarityLog";

const Index = () => {
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentWord, setCurrentWord] = useState("");
  const [currentContributor, setCurrentContributor] = useState("");
  const [currentSentence, setCurrentSentence] = useState("");
  const [analysisResult, setAnalysisResult] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { toast } = useToast();

  // Listen for motivational sentence events
  useEffect(() => {
    const handleSentenceGenerated = (event: CustomEvent) => {
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
        
        if (contributor) {
          setCurrentContributor(contributor);
        }
      }
    };
    
    window.addEventListener('motivationalSentenceGenerated', 
      handleSentenceGenerated as EventListener);
    
    return () => {
      window.removeEventListener('motivationalSentenceGenerated', 
        handleSentenceGenerated as EventListener);
    };
  }, [selectedWords]);

  // Update analysis when selected words change
  useEffect(() => {
    if (selectedWords.length > 0) {
      const result = analyzeSentence(selectedWords);
      setAnalysisResult(result);
    }
  }, [selectedWords]);

  // Fetch motivational sentences for the table
  const fetchSentences = () => {
    try {
      const storedSentences = localStorage.getItem('motivation-sentences');
      if (storedSentences) {
        const parsedSentences = JSON.parse(storedSentences);
        
        // Normalize scores for consistency
        return parsedSentences.map((sentence: any) => {
          // If score exists, use it; otherwise derive from polarity
          const score = sentence.score !== undefined ? sentence.score :
                        sentence.polarity === 'positive' ? 1 :
                        sentence.polarity === 'negative' ? -1 : 0;
          
          // Ensure polarity matches score
          let polarity: 'positive' | 'neutral' | 'negative';
          if (score > 0) {
            polarity = 'positive';
          } else if (score < 0) {
            polarity = 'negative';
          } else {
            polarity = 'neutral';
          }
                  
          return {
            text: sentence.sentence,
            date: new Date(sentence.timestamp),
            userId: sentence.contributor,
            word: sentence.word,
            polarity: polarity,
            score: score
          };
        });
      }
      return [];
    } catch (error) {
      console.error("Error fetching sentences:", error);
      return [];
    }
  };

  const handleAddWord = (word: string, contributor: string, template?: string) => {
    setIsLoading(true);
    
    try {
      // Add word to selected words list if not already present
      if (!selectedWords.includes(word)) {
        setSelectedWords(prev => [...prev, word]);
      }
      
      // Update current word and contributor
      setCurrentWord(word);
      setCurrentContributor(contributor);
      
      // Trigger refresh for components that depend on word updates
      setRefreshTrigger(prev => prev + 1);
      
      toast({
        title: "เพิ่มคำสำเร็จ",
        description: `เพิ่มคำ "${word}" เรียบร้อยแล้ว`,
      });
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

  // Fetch words for WordPolarityLog
  const fetchWords = () => {
    try {
      const storedWords = localStorage.getItem('encouragement-words');
      if (storedWords) {
        return JSON.parse(storedWords);
      }
      return [];
    } catch (error) {
      console.error("Error fetching words:", error);
      return [];
    }
  };

  const words = fetchWords();
  const sentences = fetchSentences();

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
              <Card>
                <CardHeader>
                  <CardTitle>เพิ่มคำของคุณ</CardTitle>
                </CardHeader>
                <CardContent>
                  <WordForm 
                    onAddWord={handleAddWord}
                    isLoading={isLoading}
                    existingWords={selectedWords}
                    showMultipleTemplates={true}
                  />
                </CardContent>
                <CardFooter className="flex justify-center border-t p-4">
                  <p className="text-xs text-muted-foreground text-center">
                    เพิ่มคำของคุณเพื่อสร้างประโยคให้กำลังใจที่มีความหมาย
                  </p>
                </CardFooter>
              </Card>
              
              <div className="w-full">
                <Leaderboard refreshTrigger={refreshTrigger} />
              </div>
            </div>
          </div>
          
          <div className="space-y-6">
            <Card className="mb-8 hover:shadow-lg transition-all duration-300 animate-fade-in">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span>บันทึกคำตามความรู้สึก</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <WordPolarityLog words={words} />
              </CardContent>
            </Card>

            <Card className="mb-8 hover:shadow-lg transition-all duration-300 animate-fade-in">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span>ประวัติประโยคกำลังใจทั้งหมด</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <MotivationQuoteTable quotes={sentences} showAllUsers={true} />
              </CardContent>
            </Card>
          </div>
        </div>
      </Container>
      
      <MobileFooter />
    </div>
  );
};

export default Index;
