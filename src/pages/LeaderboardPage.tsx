import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Medal, Trophy, Award, BarChart2, FileText } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getContributorStats } from "@/utils/wordModeration";
import { getWordPolarity } from "@/utils/sentenceAnalysis";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Cell } from "recharts";
import { useEffect, useState } from "react";
import WordPolarityLog from "@/components/WordPolarityLog";
import MobileFooter from "@/components/MobileFooter";
import MotivationQuoteTable from "@/components/MotivationQuoteTable";

const purpleColors = ['#9b87f5', '#7E69AB', '#6E59A5', '#8B5CF6', '#D6BCFA', '#E5DEFF'];
const purpleGradient = ['#9b87f5', '#7E69AB', '#6E59A5'];

const useContributorStats = () => {
  return useQuery({
    queryKey: ['contributor-stats'],
    queryFn: async () => {
      const stats = getContributorStats();
      return Object.entries(stats).map(([name, count]) => ({ name, count }));
    },
    refetchInterval: 500,
  });
};

const useWordsData = () => {
  return useQuery({
    queryKey: ['encouragement-words'],
    queryFn: async () => {
      const storedWords = localStorage.getItem('encouragement-words');
      if (!storedWords) return [];
      return JSON.parse(storedWords);
    },
    refetchInterval: 500,
  });
};

const useSentencesData = () => {
  return useQuery({
    queryKey: ['motivation-sentences'],
    queryFn: async () => {
      const storedSentences = localStorage.getItem('motivation-sentences');
      if (!storedSentences) return [];
      return JSON.parse(storedSentences);
    },
    refetchInterval: 500,
  });
};

const LeaderboardPage = () => {
  const { data: contributors = [] } = useContributorStats();
  const { data: words = [] } = useWordsData();
  const { data: sentences = [] } = useSentencesData();
  const [stats, setStats] = useState({
    totalWords: 0,
    totalContributors: 0,
    completeSequences: 0,
    longestWord: 0,
    positiveWords: 0,
    neutralWords: 0,
    negativeWords: 0,
    totalSentences: 0,
    totalScore: 0,
    averageScore: 0,
    dailyContributions: [] as Array<{date: string, count: number}>,
  });
  const queryClient = useQueryClient();
  
  useEffect(() => {
    const refreshData = () => {
      queryClient.invalidateQueries({ queryKey: ['contributor-stats'] });
      queryClient.invalidateQueries({ queryKey: ['encouragement-words'] });
      queryClient.invalidateQueries({ queryKey: ['motivation-sentences'] });
    };
    
    refreshData();
    
    window.addEventListener('word-database-updated', refreshData);
    window.addEventListener('motivationalSentenceGenerated', refreshData);
    window.addEventListener('motivation-billboard-updated', refreshData);
    
    const intervalId = setInterval(refreshData, 500);
    
    return () => {
      clearInterval(intervalId);
      window.removeEventListener('word-database-updated', refreshData);
      window.removeEventListener('motivationalSentenceGenerated', refreshData);
      window.removeEventListener('motivation-billboard-updated', refreshData);
    };
  }, [queryClient]);
  
  useEffect(() => {
    if (words.length > 0) {
      const uniqueContributors = new Set(words.map((word: any) => word.contributor));
      const longestWordLength = Math.max(...words.map((word: any) => word.text.length));
      
      let positiveWords = 0;
      let neutralWords = 0;
      let negativeWords = 0;
      let totalScore = 0;
      
      const dateMap = new Map<string, number>();
      const today = new Date();
      const last7Days = Array.from({length: 7}, (_, i) => {
        const date = new Date();
        date.setDate(today.getDate() - (6 - i));
        return date.toISOString().split('T')[0];
      });
      
      last7Days.forEach(date => {
        dateMap.set(date, 0);
      });
      
      words.forEach((word: any) => {
        const { polarity, score } = getWordPolarity(word.text);
        if (polarity === 'positive') positiveWords++;
        else if (polarity === 'neutral') neutralWords++;
        else if (polarity === 'negative') negativeWords++;
        
        totalScore += score;
        
        const wordDate = new Date(word.timestamp).toISOString().split('T')[0];
        if (last7Days.includes(wordDate)) {
          dateMap.set(wordDate, (dateMap.get(wordDate) || 0) + 1);
        }
      });
      
      const dailyContributions = Array.from(dateMap.entries()).map(([date, count]) => ({
        date: new Date(date).toLocaleDateString('th-TH', {day: 'numeric', month: 'short'}),
        count
      }));
      
      setStats({
        totalWords: words.length,
        totalContributors: uniqueContributors.size,
        completeSequences: Math.floor(words.length / 5),
        longestWord: longestWordLength,
        positiveWords,
        neutralWords,
        negativeWords,
        totalSentences: sentences.length,
        totalScore,
        averageScore: words.length ? Math.round((totalScore / words.length) * 10) / 10 : 0,
        dailyContributions,
      });
    }
  }, [words, sentences]);
  
  const sortedContributors = [...contributors].sort((a, b) => b.count - a.count);
  
  const chartData = sortedContributors.slice(0, 5).map((contributor, index) => ({
    name: contributor.name,
    คำ: contributor.count,
    fill: purpleGradient[index % purpleGradient.length]
  }));

  const polarityChartData = [
    { name: 'เชิงบวก (2 คะแนน)', value: stats.positiveWords, fill: '#9b87f5' },
    { name: 'กลาง (1 คะแนน)', value: stats.neutralWords, fill: '#7E69AB' },
    { name: 'เชิงลบ (-1 คะแนน)', value: stats.negativeWords, fill: '#6E59A5' },
  ];

  const generateSequenceData = () => {
    if (!words.length) return [];
    
    const sequences = [];
    let currentSequence = [];
    let currentContributors = [];
    
    for (let i = 0; i < words.length; i++) {
      currentSequence.push(words[i].text);
      currentContributors.push(words[i].contributor);
      
      if ((i + 1) % 5 === 0 || i === words.length - 1) {
        sequences.push({
          sequence: currentSequence.join(" "),
          contributors: [...new Set(currentContributors)],
          date: new Date(words[i].timestamp).toISOString().split('T')[0],
        });
        currentSequence = [];
        currentContributors = [];
      }
    }
    
    return sequences.sort((a, b) => b.sequence.length - a.sequence.length).slice(0, 2);
  };
  
  const longestSequences = generateSequenceData();

  const formattedSentences = sentences.map((sentence: any) => ({
    text: sentence.sentence,
    date: new Date(sentence.timestamp),
    userId: sentence.contributor,
    word: sentence.word
  }));

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-orange-50 to-white pb-16 md:pb-0">
      <Header />
      
      <main className="flex-1 container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-center mb-12 font-mitr animate-fade-in">
            อันดับกำลังใจ
          </h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <Card className="hover:shadow-lg transition-all duration-300 animate-fade-in">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  <span>ผู้ร่วมสร้างกำลังใจมากที่สุด</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {sortedContributors.slice(0, 5).map((contributor, index) => (
                    <div
                      key={contributor.name}
                      className="flex items-center justify-between p-3 rounded-md bg-secondary hover:bg-secondary/80 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        {index === 0 ? (
                          <Medal className="h-6 w-6 text-yellow-500" />
                        ) : index === 1 ? (
                          <Medal className="h-6 w-6 text-gray-400" />
                        ) : index === 2 ? (
                          <Medal className="h-6 w-6 text-amber-700" />
                        ) : (
                          <span className="font-bold w-6 h-6 flex items-center justify-center bg-primary/10 text-primary rounded-full">
                            {index + 1}
                          </span>
                        )}
                        <span className="font-medium">{contributor.name}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {contributor.count} คำ
                      </span>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={chartData}
                      margin={{ top: 20, right: 20, left: 20, bottom: 40 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-15} textAnchor="end" interval={0} height={60} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="คำ">
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-lg transition-all duration-300 animate-fade-in">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-primary" />
                  <span>ประโยคกำลังใจที่ยาวที่สุด</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {longestSequences.map((sequence, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold w-6 h-6 flex items-center justify-center bg-primary text-primary-foreground rounded-full">
                          {index + 1}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {sequence.date}
                        </span>
                      </div>
                      <div className="p-4 bg-secondary rounded-md hover:bg-secondary/80 transition-colors">
                        <p className="font-medium break-words">
                          "{sequence.sequence}"
                        </p>
                        <div className="mt-2 text-sm text-muted-foreground">
                          <span>ผู้ร่วมสร้าง: </span>
                          {sequence.contributors.join(", ")}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card className="mb-8 hover:shadow-lg transition-all duration-300 animate-fade-in">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart2 className="h-5 w-5" />
                <span>สถิติรวม</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-secondary rounded-md p-4 text-center hover:bg-secondary/80 transition-colors">
                  <p className="text-2xl font-bold">{stats.totalWords}</p>
                  <p className="text-sm text-muted-foreground">คำทั้งหมด</p>
                </div>
                <div className="bg-secondary rounded-md p-4 text-center hover:bg-secondary/80 transition-colors">
                  <p className="text-2xl font-bold">{stats.totalContributors}</p>
                  <p className="text-sm text-muted-foreground">ผู้ร่วมสร้าง</p>
                </div>
                <div className="bg-secondary rounded-md p-4 text-center hover:bg-secondary/80 transition-colors">
                  <p className="text-2xl font-bold">{stats.totalSentences}</p>
                  <p className="text-sm text-muted-foreground">ประโยคกำลังใจ</p>
                </div>
                <div className="bg-secondary rounded-md p-4 text-center hover:bg-secondary/80 transition-colors">
                  <p className="text-2xl font-bold">{stats.totalScore}</p>
                  <p className="text-sm text-muted-foreground">คะแนนรวม</p>
                </div>
              </div>
              
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={polarityChartData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-15} textAnchor="end" height={60} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" name="จำนวนคำ">
                      {polarityChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <Card className="mb-8 hover:shadow-lg transition-all duration-300 animate-fade-in">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
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
                <FileText className="h-5 w-5" />
                <span>ประวัติประโยคกำลังใจทั้งหมด</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <MotivationQuoteTable quotes={formattedSentences} showAllUsers={true} />
            </CardContent>
          </Card>
        </div>
      </main>
      
      <footer className="bg-white py-6 border-t hidden md:block">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground">
            &copy; {new Date().getFullYear()} "คำ"ลังใจ - 
            โครงการสร้างกำลังใจร่วมกัน
          </p>
        </div>
      </footer>
      
      <MobileFooter />
    </div>
  );
};

export default LeaderboardPage;
