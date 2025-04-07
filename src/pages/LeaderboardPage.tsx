
import { useEffect, useState } from "react";
import Layout from "@/layouts/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import Leaderboard from "@/components/Leaderboard";
import StatsDashboard from "@/components/StatsDashboard";
import MoodReport from "@/components/MoodReport";
import { getWordPolarity } from "@/utils/sentenceAnalysis";

interface MotivationalSentence {
  word: string;
  sentence: string;
  template?: string;
  contributor?: string;
  timestamp: Date | string | number;
  polarity?: 'positive' | 'neutral' | 'negative';
}

const LeaderboardPage = () => {
  const [sentences, setSentences] = useState<MotivationalSentence[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  useEffect(() => {
    const fetchSentences = () => {
      try {
        const stored = localStorage.getItem('motivation-sentences');
        if (stored) {
          const parsedData = JSON.parse(stored);
          const sentences = Array.isArray(parsedData) ? parsedData : [parsedData];
          
          // Process sentences to add polarity if not present
          const processedSentences = sentences.map((sentence: MotivationalSentence) => {
            if (!sentence.polarity && sentence.word) {
              const { polarity } = getWordPolarity(sentence.word);
              return {
                ...sentence,
                polarity
              };
            }
            return sentence;
          });
          
          setSentences(processedSentences);
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

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6 text-center">อันดับและสถิติ</h1>
        
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="overview">ภาพรวม</TabsTrigger>
            <TabsTrigger value="stats">รายงานละเอียด</TabsTrigger>
            <TabsTrigger value="moods">บันทึกตามความรู้สึก</TabsTrigger>
          </TabsList>
          
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
