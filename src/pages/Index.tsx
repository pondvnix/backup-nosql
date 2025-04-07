
import { useState, useEffect } from "react";
import { Container } from "@/components/ui/container";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import MobileFooter from "@/components/MobileFooter";
import Header from "@/components/Header";
import WordForm from "@/components/WordForm";
import MotivationalSentence from "@/components/MotivationalSentence";
import TomatoBox from "@/components/TomatoBox";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentWord, setCurrentWord] = useState("");
  const [currentContributor, setCurrentContributor] = useState("");
  const [currentSentence, setCurrentSentence] = useState("");
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
      
      // If a specific template is provided, we'll use it directly
      // The MotivationalSentence component will handle the actual sentence generation
      
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

  return (
    <div className="min-h-screen bg-gray-50 pb-16 md:pb-0">
      <Header />
      
      <Container className="py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8">
          <div className="space-y-8">
            <MotivationalSentence 
              selectedWords={selectedWords}
              shouldDisplay={currentSentence !== ""}
              currentSentence={currentSentence}
            />
            
            <TomatoBox 
              word={currentWord} 
              contributor={currentContributor} 
              sentence={currentSentence}
              selectedWords={selectedWords}
            />
            
            <Card className="mb-8 border overflow-hidden">
              <div className="overflow-hidden">
                <iframe
                  title="Animation"
                  src="https://lottie.host/embed/5a0b3ca9-38f4-475c-984b-5f12fd883f6a/nE3yGTbAR9.json"
                  width="100%"
                  height="300"
                  className="border-none"
                ></iframe>
              </div>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-2">เกี่ยวกับ "คำ"ลังใจ</h2>
                <p className="text-muted-foreground">
                  แพลตฟอร์มแห่งการแบ่งปันกำลังใจและแรงบันดาลใจ
                  ที่ชวนให้ทุกคนมาร่วมสร้างประโยคให้กำลังใจซึ่งกันและกัน
                  ด้วยการเลือกคำที่มีพลัง เพื่อสร้างประโยคที่จะช่วยเติมเต็มพลังใจให้ทุกคน
                </p>
              </CardContent>
            </Card>
          </div>
          
          <div className="space-y-8">
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
          </div>
        </div>
      </Container>
      
      <MobileFooter />
    </div>
  );
};

export default Index;
