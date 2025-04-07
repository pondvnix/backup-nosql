
import { useEffect, useState } from "react";
import Layout from "@/layouts/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import Leaderboard from "@/components/Leaderboard";
import StatsDashboard from "@/components/StatsDashboard";
import MoodReport from "@/components/MoodReport";
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
  
  const removeDuplicateSentences = (sentences: MotivationalSentence[]): MotivationalSentence[] => {
    const uniqueMap = new Map();
    
    sentences.forEach(sentence => {
      const uniqueKey = `${sentence.word}-${sentence.sentence}`;
      
      if (!uniqueMap.has(uniqueKey) || 
          new Date(sentence.timestamp).getTime() > new Date(uniqueMap.get(uniqueKey).timestamp).getTime()) {
        uniqueMap.set(uniqueKey, sentence);
      }
    });
    
    return Array.from(uniqueMap.values());
  };
  
  const normalizeScoreByPolarity = (sentences: MotivationalSentence[]): MotivationalSentence[] => {
    return sentences.map(sentence => {
      // If score is already defined, ensure it matches polarity (or fix polarity to match score)
      if (sentence.score !== undefined) {
        let expectedPolarity: 'positive' | 'neutral' | 'negative';
        
        if (sentence.score > 0) {
          expectedPolarity = 'positive';
        } else if (sentence.score < 0) {
          expectedPolarity = 'negative';
        } else {
          expectedPolarity = 'neutral';
        }
        
        // If polarity doesn't match score, update polarity to match score
        if (sentence.polarity !== expectedPolarity) {
          return { ...sentence, polarity: expectedPolarity };
        }
        
        return sentence;
      }
      
      // If no score but polarity exists, derive score from polarity
      if (sentence.polarity) {
        const normalizedScore = 
          sentence.polarity === 'positive' ? 1 : 
          sentence.polarity === 'negative' ? -1 : 0;
        
        return { ...sentence, score: normalizedScore };
      }
      
      // Default to neutral if neither score nor polarity exists
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
          
          const uniqueSentences = removeDuplicateSentences(sentences);
          
          const normalizedSentences = normalizeScoreByPolarity(uniqueSentences);
          
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

  const convertSentencesToQuotes = (sentences: MotivationalSentence[]) => {
    return sentences.map(sentence => {
      // Use the score property directly if available
      const score = sentence.score !== undefined ? sentence.score : 0;
      
      // Derive polarity from score (for consistency)
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
        userId: sentence.contributor || "",
        word: sentence.word,
        polarity: polarity,
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
