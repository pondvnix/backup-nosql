
import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { CalendarDays, Clock, ScrollText, Trophy, Award, Users, HeartHandshake } from "lucide-react";

interface MotivationalSentence {
  word: string;
  sentence: string;
  contributor?: string;
  timestamp: Date | string | number;
  polarity?: 'positive' | 'neutral' | 'negative';
}

interface StatsDashboardProps {
  sentences: MotivationalSentence[];
}

interface ContributorStats {
  [key: string]: number;
}

const StatsDashboard = ({ sentences }: StatsDashboardProps) => {
  // Calculate word counts by contributor
  const contributorWordCounts = useMemo(() => {
    const stats: ContributorStats = {};
    sentences.forEach(sentence => {
      const contributor = sentence.contributor || "ไม่ระบุชื่อ";
      stats[contributor] = (stats[contributor] || 0) + 1;
    });
    return stats;
  }, [sentences]);

  // Top contributors for chart
  const topContributorsData = useMemo(() => {
    return Object.entries(contributorWordCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [contributorWordCounts]);

  // Calculate polarity distribution
  const polarityDistribution = useMemo(() => {
    const distribution = {
      positive: 0,
      neutral: 0,
      negative: 0
    };
    
    sentences.forEach(sentence => {
      if (sentence.polarity) {
        distribution[sentence.polarity]++;
      } else {
        distribution.neutral++;
      }
    });
    
    return [
      { name: "เชิงบวก", value: distribution.positive, color: "#4ade80" },
      { name: "กลาง", value: distribution.neutral, color: "#60a5fa" },
      { name: "เชิงลบ", value: distribution.negative, color: "#f87171" }
    ];
  }, [sentences]);

  // Calculate sentence length statistics
  const sentenceLengthStats = useMemo(() => {
    if (sentences.length === 0) return { avg: 0, longest: { text: "", length: 0, contributor: "" } };
    
    let totalLength = 0;
    let longest = { text: "", length: 0, contributor: "" };
    
    sentences.forEach(sentence => {
      if (sentence.sentence) {
        const length = sentence.sentence.length;
        totalLength += length;
        
        if (length > longest.length) {
          longest = {
            text: sentence.sentence,
            length,
            contributor: sentence.contributor || "ไม่ระบุชื่อ"
          };
        }
      }
    });
    
    return {
      avg: Math.round(totalLength / sentences.length),
      longest
    };
  }, [sentences]);

  // Calculate words per day
  const wordsPerDay = useMemo(() => {
    const dayMap = new Map();
    
    sentences.forEach(sentence => {
      const date = new Date(sentence.timestamp);
      const dayKey = date.toISOString().split('T')[0];
      
      if (!dayMap.has(dayKey)) {
        dayMap.set(dayKey, 0);
      }
      
      dayMap.set(dayKey, dayMap.get(dayKey) + 1);
    });
    
    // Convert to array and sort by date
    return Array.from(dayMap.entries())
      .map(([day, count]) => ({ day, count }))
      .sort((a, b) => new Date(a.day).getTime() - new Date(b.day).getTime())
      .slice(-7); // Last 7 days
  }, [sentences]);

  // Calculate overall statistics
  const overallStats = useMemo(() => {
    const uniqueContributors = new Set(sentences.map(s => s.contributor || "ไม่ระบุชื่อ")).size;
    const uniqueWords = new Set(sentences.map(s => s.word)).size;
    
    return {
      totalSentences: sentences.length,
      uniqueContributors,
      uniqueWords,
      avgSentenceLength: sentenceLengthStats.avg
    };
  }, [sentences, sentenceLengthStats.avg]);

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="space-y-6">
      {/* Overall statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <ScrollText className="h-8 w-8 text-primary" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">ประโยคทั้งหมด</p>
                <h3 className="text-2xl font-bold">{overallStats.totalSentences}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-primary" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">ผู้ร่วมสร้าง</p>
                <h3 className="text-2xl font-bold">{overallStats.uniqueContributors}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <HeartHandshake className="h-8 w-8 text-primary" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">คำที่ใช้</p>
                <h3 className="text-2xl font-bold">{overallStats.uniqueWords}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Award className="h-8 w-8 text-primary" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">ความยาวเฉลี่ย</p>
                <h3 className="text-2xl font-bold">{overallStats.avgSentenceLength} ตัวอักษร</h3>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Longest Sentence Showcase */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Trophy className="mr-2 h-5 w-5 text-orange-500" />
            ประโยคที่ยาวที่สุด
          </CardTitle>
          <CardDescription>
            {sentenceLengthStats.longest.length} ตัวอักษร โดย {sentenceLengthStats.longest.contributor}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-orange-50 rounded-md border border-orange-100">
            <p className="text-lg italic">"{sentenceLengthStats.longest.text}"</p>
          </div>
        </CardContent>
      </Card>

      {/* Charts section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Contributors Chart */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>ผู้ร่วมสร้างกำลังใจ</CardTitle>
            <CardDescription>10 อันดับผู้ร่วมสร้างกำลังใจมากที่สุด</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {topContributorsData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={topContributorsData}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 50, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis 
                      type="category" 
                      dataKey="name" 
                      width={80}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip 
                      formatter={(value) => [`${value} คำ`, 'จำนวนคำ']}
                      labelFormatter={(value) => `ผู้ร่วมสร้าง: ${value}`}
                    />
                    <Bar dataKey="count" fill="#F97316" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <p className="text-muted-foreground">ไม่มีข้อมูลผู้ร่วมสร้าง</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Polarity Distribution Pie Chart */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>การแจกแจงความรู้สึก</CardTitle>
            <CardDescription>สัดส่วนของประโยคตามความรู้สึก</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {polarityDistribution.some(item => item.value > 0) ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={polarityDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {polarityDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} ประโยค`, 'จำนวน']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <p className="text-muted-foreground">ไม่มีข้อมูลความรู้สึก</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Word Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CalendarDays className="mr-2 h-5 w-5 text-primary" />
            แนวโน้มการเพิ่มคำ
          </CardTitle>
          <CardDescription>จำนวนคำที่เพิ่มตามวัน (7 วันล่าสุด)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            {wordsPerDay.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={wordsPerDay}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="day" 
                    tickFormatter={formatDate}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => [`${value} คำ`, 'จำนวนคำ']}
                    labelFormatter={(value) => `วันที่: ${new Date(value).toLocaleDateString('th-TH')}`}
                  />
                  <Bar dataKey="count" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="text-muted-foreground">ไม่มีข้อมูลแนวโน้ม</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatsDashboard;
