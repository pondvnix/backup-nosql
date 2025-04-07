
import { useEffect, useState } from "react";
import Layout from "@/layouts/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import Leaderboard from "@/components/Leaderboard";
import StatsDashboard from "@/components/StatsDashboard";
import MoodReport from "@/components/MoodReport";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Smile, Meh, Frown } from "lucide-react";
import MotivationQuoteTable from "@/components/MotivationQuoteTable";

interface MotivationalSentence {
  word: string;
  sentence: string;
  template?: string;
  contributor?: string;
  timestamp: Date | string | number;
  polarity?: 'positive' | 'neutral' | 'negative';
  score?: number;
}

const LeaderboardPage = () => {
  const [sentences, setSentences] = useState<MotivationalSentence[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // ปรับปรุงวิธีการกรองข้อมูลซ้ำซ้อนโดยใช้ Map เพื่อเก็บข้อมูลล่าสุดของแต่ละประโยค
  const removeDuplicateSentences = (sentences: MotivationalSentence[]): MotivationalSentence[] => {
    const uniqueMap = new Map();
    
    sentences.forEach(sentence => {
      // สร้าง unique key จากข้อมูลหลัก - ปรับปรุงให้รัดกุมขึ้น
      const uniqueKey = `${sentence.word}-${sentence.sentence}`;
      
      // เก็บข้อมูลล่าสุดของแต่ละประโยค (ตามวันที่)
      if (!uniqueMap.has(uniqueKey) || 
          new Date(sentence.timestamp).getTime() > new Date(uniqueMap.get(uniqueKey).timestamp).getTime()) {
        uniqueMap.set(uniqueKey, sentence);
      }
    });
    
    // แปลงจาก Map กลับเป็น Array
    return Array.from(uniqueMap.values());
  };
  
  // ตรวจสอบและกำหนดค่า score ตามมาตรฐาน (positive=1, neutral=0, negative=-1)
  const normalizeScoreByPolarity = (sentences: MotivationalSentence[]): MotivationalSentence[] => {
    return sentences.map(sentence => {
      // ถ้ามีค่า score อยู่แล้ว ให้ใช้ค่านั้น
      if (sentence.score !== undefined) return sentence;
      
      // ถ้าไม่มี score แต่มี polarity ให้กำหนดค่า score ตามมาตรฐาน
      if (sentence.polarity) {
        const normalizedScore = 
          sentence.polarity === 'positive' ? 1 : 
          sentence.polarity === 'negative' ? -1 : 0;
        
        return { ...sentence, score: normalizedScore };
      }
      
      // กรณีไม่มีทั้ง score และ polarity ให้กำหนดเป็นกลาง
      return { ...sentence, polarity: 'neutral', score: 0 };
    });
  };
  
  useEffect(() => {
    const fetchSentences = () => {
      try {
        const stored = localStorage.getItem('motivation-sentences');
        if (stored) {
          const parsedData = JSON.parse(stored);
          const sentences = Array.isArray(parsedData) ? parsedData : [parsedData];
          
          // กรองข้อมูลซ้ำซ้อน
          const uniqueSentences = removeDuplicateSentences(sentences);
          
          // ตรวจสอบและกำหนดค่า score ตามมาตรฐาน
          const normalizedSentences = normalizeScoreByPolarity(uniqueSentences);
          
          // Sort by timestamp (newest first)
          const sortedSentences = normalizedSentences.sort((a, b) => {
            const timeA = new Date(a.timestamp).getTime();
            const timeB = new Date(b.timestamp).getTime();
            return timeB - timeA;
          });
          
          setSentences(sortedSentences);
        }
      } catch (error) {
        console.error("Error fetching sentences:", error);
      }
    };

    fetchSentences();
    
    const handleUpdate = () => {
      fetchSentences();
      setRefreshTrigger(prev => prev + 1);
    };
    
    window.addEventListener('motivationalSentenceGenerated', handleUpdate);
    window.addEventListener('word-database-updated', handleUpdate);
    window.addEventListener('motivation-billboard-updated', handleUpdate);
    
    const intervalId = setInterval(fetchSentences, 2000);
    
    return () => {
      clearInterval(intervalId);
      window.removeEventListener('motivationalSentenceGenerated', handleUpdate);
      window.removeEventListener('word-database-updated', handleUpdate);
      window.removeEventListener('motivation-billboard-updated', handleUpdate);
    };
  }, []);

  // Convert MotivationalSentence to the Quote format expected by MotivationQuoteTable
  const convertSentencesToQuotes = (sentences: MotivationalSentence[]) => {
    return sentences.map(sentence => {
      // ตรวจสอบว่ามีค่า score หรือไม่ ถ้าไม่มีให้ใช้ค่า polarity มากำหนด
      const score = sentence.score !== undefined ? sentence.score : 
                  sentence.polarity === 'positive' ? 1 :
                  sentence.polarity === 'negative' ? -1 : 0;
      
      return {
        text: sentence.sentence,
        date: new Date(sentence.timestamp),
        userId: sentence.contributor || "",
        word: sentence.word,
        // ตรวจสอบว่ามีค่า polarity หรือไม่ ถ้าไม่มีให้ใช้ค่า score มากำหนด
        polarity: sentence.polarity || (score > 0 ? 'positive' : score < 0 ? 'negative' : 'neutral'),
        score: score
      };
    });
  };

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6 text-center">อันดับและสถิติ</h1>
        
        <Tabs defaultValue="datatable" className="w-full">
          <TabsList className="grid grid-cols-4 mb-6">
            <TabsTrigger value="datatable">ตารางข้อมูล</TabsTrigger>
            <TabsTrigger value="overview">ภาพรวม</TabsTrigger>
            <TabsTrigger value="stats">รายงานละเอียด</TabsTrigger>
            <TabsTrigger value="moods">บันทึกตามความรู้สึก</TabsTrigger>
          </TabsList>
          
          <TabsContent value="datatable" className="space-y-6 animate-fade-in">
            <Card>
              <CardHeader>
                <CardTitle className="text-center">ตารางประโยคกำลังใจ</CardTitle>
              </CardHeader>
              <CardContent>
                <MotivationQuoteTable quotes={convertSentencesToQuotes(sentences)} showAllUsers={true} />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="overview" className="space-y-6 animate-fade-in">
            <Leaderboard 
              refreshTrigger={refreshTrigger} 
              allSentences={sentences}
            />
          </TabsContent>
          
          <TabsContent value="stats" className="space-y-6 animate-fade-in">
            <StatsDashboard sentences={sentences} />
          </TabsContent>
          
          <TabsContent value="moods" className="space-y-6 animate-fade-in">
            <MoodReport sentences={sentences} />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default LeaderboardPage;
