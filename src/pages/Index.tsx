import React, { useState, useEffect, useCallback } from "react";
import Layout from "../components/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Heart, ThumbsUp, PlusCircle, ArrowRight, Smile, Meh, Frown } from "lucide-react";
import { wordPolarityDatabase } from "@/utils/sentenceAnalysis";
import { getRandomWord } from "@/utils/wordModeration";
import MotivationalSentence from "@/components/MotivationalSentence";
import MoodReport from "@/components/MoodReport";
import { saveWordContribution } from "@/utils/wordModeration";
import { getContributorName, setContributorName } from "@/utils/contributorManager";
import { updateMetaTitleAndDescription } from "@/utils/metaConfig";

const Index = () => {
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [inputWord, setInputWord] = useState("");
  const [suggestedWords, setSuggestedWords] = useState<string[]>([]);
  const [contributor, setContributor] = useState("");
  const [displaySentence, setDisplaySentence] = useState("");
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    updateMetaTitleAndDescription({
      title: 'คำลังใจ - แพลตฟอร์มสร้างกำลังใจด้วยภาษาไทย',
      description: 'แพลตฟอร์มสำหรับแชร์ข้อความให้กำลังใจและสร้างแรงบันดาลใจด้วยภาษาไทย',
      imageUrl: 'https://wpmart.co/wp-content/uploads/2024/09/cropped-Favicon_WP-1-192x192.png',
      twitterHandle: '@wordstream',
      siteUrl: window.location.origin
    });
  }, []);

  const loadSuggestedWords = useCallback(() => {
    const wordList = [];
    for (let i = 0; i < 8; i++) {
      const word = getRandomWord();
      if (word && !wordList.includes(word)) {
        wordList.push(word);
      }
    }
    setSuggestedWords(wordList);
  }, []);

  useEffect(() => {
    const savedContributor = getContributorName();
    if (savedContributor) {
      setContributor(savedContributor);
    }
  }, []);

  useEffect(() => {
    loadSuggestedWords();
  }, [loadSuggestedWords]);

  useEffect(() => {
    if (contributor) {
      setContributorName(contributor);
    }
  }, [contributor]);

  const handleWordSubmit = () => {
    if (!inputWord.trim()) {
      toast({
        title: "ข้อความว่างเปล่า",
        description: "กรุณาใส่คำก่อนทำการบันทึก",
        variant: "destructive",
      });
      return;
    }

    const success = saveWordContribution(inputWord, contributor || "ไม่ระบุชื่อ");

    if (success) {
      toast({
        title: "บันทึกคำสำเร็จ",
        description: `คำว่า "${inputWord}" ถูกบันทึกเรียบร้อยแล้ว`,
      });

      if (!selectedWords.includes(inputWord)) {
        setSelectedWords([...selectedWords, inputWord]);
        
        setTimeout(() => {
          if (typeof window !== "undefined" && (window as any).showMotivationalSentence) {
            (window as any).showMotivationalSentence(inputWord, contributor);
          }
        }, 300);
      }

      setInputWord("");
      
      loadSuggestedWords();
      
      setRefreshTrigger(prev => prev + 1);
    } else {
      toast({
        title: "บันทึกคำไม่สำเร็จ",
        description: "พบข้อผิดพลาดในการบันทึกคำ กรุณาลองใหม่อีกครั้ง",
        variant: "destructive",
      });
    }
  };

  const handleSuggestedWordClick = (word: string) => {
    if (!selectedWords.includes(word)) {
      setSelectedWords([...selectedWords, word]);
      
      setTimeout(() => {
        if (typeof window !== "undefined" && (window as any).showMotivationalSentence) {
          (window as any).showMotivationalSentence(word, contributor);
        }
      }, 300);
      
      toast({
        title: "เลือกคำสำเร็จ",
        description: `คำว่า "${word}" ถูกเลือกเรียบร้อยแล้ว`,
      });
    }
  };

  const getSentimentBadge = (word: string) => {
    const wordEntry = wordPolarityDatabase.find(entry => entry.word === word);
    const sentiment = wordEntry?.sentiment || "neutral";
    
    if (sentiment === "positive") {
      return (
        <Badge variant="success" className="absolute -top-2 -right-2 flex items-center gap-1">
          <Smile className="h-3 w-3" />
          <span className="text-xs">เชิงบวก</span>
        </Badge>
      );
    } else if (sentiment === "negative") {
      return (
        <Badge variant="destructive" className="absolute -top-2 -right-2 flex items-center gap-1">
          <Frown className="h-3 w-3" />
          <span className="text-xs">เชิงลบ</span>
        </Badge>
      );
    } else {
      return (
        <Badge variant="secondary" className="absolute -top-2 -right-2 flex items-center gap-1">
          <Meh className="h-3 w-3" />
          <span className="text-xs">กลาง</span>
        </Badge>
      );
    }
  };

  return (
    <Layout>
      <div className="space-y-8">
        <section className="text-center">
          <h1 className="text-4xl font-bold mb-2">
            <span className="text-primary">"คำ"</span>ลังใจ
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            แพลตฟอร์มสำหรับแชร์ข้อความให้กำลังใจและสร้างแรงบันดาลใจด้วยภาษาไทย
          </p>
        </section>

        <section>
          <MotivationalSentence 
            selectedWords={selectedWords} 
            shouldDisplay={!!displaySentence} 
            currentSentence={displaySentence}
          />
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PlusCircle className="h-5 w-5 text-primary" />
                เ��ิ่มคำใหม่
              </CardTitle>
              <CardDescription>
                เพิ่มคำที่คุณต้องการจะใช้ในประโยคให้กำลังใจ
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="text-sm font-medium mb-1 block">ชื่อผู้ร่วมสร้างกำลังใจ</label>
                  <Input
                    placeholder="ชื่อของคุณ"
                    value={contributor}
                    onChange={(e) => setContributor(e.target.value)}
                    className="mb-4"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">คำที่ต้องการเพิ่ม</label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="เช่น กำลังใจ, ความสุข, ความหวัง"
                      value={inputWord}
                      onChange={(e) => setInputWord(e.target.value)}
                    />
                    <Button type="button" onClick={handleWordSubmit}>เพิ่ม</Button>
                  </div>
                </div>
              </div>

              <div className="mt-6 bg-white rounded-lg border border-orange-200 p-4 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="relative flex-shrink-0 w-20 h-20 overflow-hidden rounded-md border border-orange-100">
                    <img 
                      src="https://img.th.my-best.com/product_images/ce41644a1e7e304e755ac435ea9827ee.png?ixlib=rails-4.3.1&q=70&lossless=0&w=800&h=800&fit=clip&s=ef32b4f80be0dc2e6bb165897baa6116" 
                      alt="Doikham Fruit Box" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-orange-800 mb-1">กล่องคำลังใจ</h3>
                    <p className="text-sm text-orange-700">
                      เติมคำลงในกล่อง เพื่อสร้างประโยคให้กำลังใจแก่ผู้อื่น
                    </p>
                    <div className="mt-2 flex items-center text-xs text-orange-600">
                      <Heart className="h-3 w-3 mr-1" />
                      <span>แบ่งปันความรู้สึกดีๆ ให้ทุกคน</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-primary" />
                คำแนะนำ
              </CardTitle>
              <CardDescription>
                เลือกคำที่ต้องการเพื่อสร้างประโยคให้กำลังใจ
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {suggestedWords.map((word, index) => (
                  <div key={`${word}-${index}`} className="relative">
                    <Button
                      variant="outline"
                      className="w-full h-auto py-6 flex flex-col items-center justify-center gap-2 text-base hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200 transition-colors"
                      onClick={() => handleSuggestedWordClick(word)}
                    >
                      <span className="text-[#F97316] font-semibold">{word}</span>
                    </Button>
                    {getSentimentBadge(word)}
                  </div>
                ))}
              </div>

              <div className="mt-4 flex justify-end">
                <Button 
                  variant="ghost" 
                  className="text-sm flex items-center gap-1"
                  onClick={loadSuggestedWords}
                >
                  <ThumbsUp className="h-4 w-4" />
                  สุ่มคำใหม่
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="space-y-8 w-full">
          <div className="w-full">
            <Card className="w-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-primary" />
                  ประโยคกำลังใจล่าสุด
                </CardTitle>
                <CardDescription>
                  ข้อความให้กำลังใจที่เพิ่งถูกสร้างขึ้น
                </CardDescription>
              </CardHeader>
              <CardContent>
                <MoodReport limit={5} />
              </CardContent>
            </Card>
          </div>
          
          <div className="flex justify-center">
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={() => window.location.href = "/logs"}
            >
              ดูทั้งหมด
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default Index;
