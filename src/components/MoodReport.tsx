
import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Smile, Meh, Frown, ArrowUp, ArrowDown, Sparkles, Activity } from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid, Legend } from "recharts";

interface MotivationalSentence {
  word: string;
  sentence: string;
  contributor?: string;
  timestamp: Date | string | number;
  polarity?: 'positive' | 'neutral' | 'negative';
}

interface MoodReportProps {
  sentences: MotivationalSentence[];
}

const MoodReport = ({ sentences }: MoodReportProps) => {
  // Sort sentences by timestamp
  const sortedSentences = useMemo(() => {
    return [...sentences].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }, [sentences]);

  // Get the top words by mood
  const topWordsByMood = useMemo(() => {
    const positiveWords: Record<string, number> = {};
    const neutralWords: Record<string, number> = {};
    const negativeWords: Record<string, number> = {};
    
    sentences.forEach(sentence => {
      const { word, polarity } = sentence;
      
      if (polarity === 'positive') {
        positiveWords[word] = (positiveWords[word] || 0) + 1;
      } else if (polarity === 'negative') {
        negativeWords[word] = (negativeWords[word] || 0) + 1;
      } else {
        neutralWords[word] = (neutralWords[word] || 0) + 1;
      }
    });
    
    const getTopWords = (wordsObj: Record<string, number>, count: number) => {
      return Object.entries(wordsObj)
        .map(([word, count]) => ({ word, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, count);
    };
    
    return {
      positive: getTopWords(positiveWords, 5),
      neutral: getTopWords(neutralWords, 5),
      negative: getTopWords(negativeWords, 5)
    };
  }, [sentences]);

  // Calculate trend over time (last 7 days)
  const moodTrend = useMemo(() => {
    const days = 7;
    const result = [];
    
    // Group by day
    const dayGroups: Record<string, MotivationalSentence[]> = {};
    const now = new Date();
    
    // Initialize all days (including those with no data)
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dayKey = date.toISOString().split('T')[0];
      dayGroups[dayKey] = [];
    }
    
    // Group sentences by day
    sentences.forEach(sentence => {
      const date = new Date(sentence.timestamp);
      const dayKey = date.toISOString().split('T')[0];
      
      // Only include last 7 days
      if (dayGroups[dayKey] !== undefined) {
        dayGroups[dayKey].push(sentence);
      }
    });
    
    // Calculate mood counts for each day
    for (const [day, daySentences] of Object.entries(dayGroups)) {
      const counts = {
        date: day,
        positive: 0,
        neutral: 0,
        negative: 0,
        total: daySentences.length
      };
      
      daySentences.forEach(sentence => {
        if (sentence.polarity === 'positive') counts.positive++;
        else if (sentence.polarity === 'negative') counts.negative++;
        else counts.neutral++;
      });
      
      result.push(counts);
    }
    
    return result;
  }, [sentences]);

  // Calculate overall mood statistics
  const moodStats = useMemo(() => {
    const stats = {
      positive: 0,
      neutral: 0,
      negative: 0,
      total: sentences.length,
      mostCommonMood: '',
      mostCommonCount: 0
    };
    
    sentences.forEach(sentence => {
      if (sentence.polarity === 'positive') stats.positive++;
      else if (sentence.polarity === 'negative') stats.negative++;
      else stats.neutral++;
    });
    
    // Determine most common mood
    if (stats.positive >= stats.neutral && stats.positive >= stats.negative) {
      stats.mostCommonMood = 'positive';
      stats.mostCommonCount = stats.positive;
    } else if (stats.negative >= stats.positive && stats.negative >= stats.neutral) {
      stats.mostCommonMood = 'negative';
      stats.mostCommonCount = stats.negative;
    } else {
      stats.mostCommonMood = 'neutral';
      stats.mostCommonCount = stats.neutral;
    }
    
    return stats;
  }, [sentences]);

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', { month: 'short', day: 'numeric' });
  };

  // Get mood icon
  const getMoodIcon = (mood: string) => {
    switch (mood) {
      case 'positive':
        return <Smile className="h-5 w-5 text-green-500" />;
      case 'negative':
        return <Frown className="h-5 w-5 text-red-500" />;
      default:
        return <Meh className="h-5 w-5 text-blue-500" />;
    }
  };

  // Get mood color
  const getMoodColor = (mood: string) => {
    switch (mood) {
      case 'positive':
        return '#4ade80';
      case 'negative':
        return '#f87171';
      default:
        return '#60a5fa';
    }
  };

  // Get mood name in Thai
  const getMoodName = (mood: string) => {
    switch (mood) {
      case 'positive':
        return 'เชิงบวก';
      case 'negative':
        return 'เชิงลบ';
      default:
        return 'กลาง';
    }
  };
  
  // Get mood score based on polarity
  const getMoodScore = (polarity: string | undefined): number => {
    switch (polarity) {
      case 'positive':
        return 2;  // ความรู้สึกเชิงบวก = 2 คะแนน
      case 'neutral':
        return 1;  // ความรู้สึกกลาง = 1 คะแนน
      case 'negative':
        return -1; // ความรู้สึกเชิงลบ = -1 คะแนน
      default:
        return 0;
    }
  };

  // Calculate polarity distribution for the pie chart
  const polarityData = useMemo(() => [
    { name: 'เชิงบวก', value: moodStats.positive, color: '#4ade80' },
    { name: 'กลาง', value: moodStats.neutral, color: '#60a5fa' },
    { name: 'เชิงลบ', value: moodStats.negative, color: '#f87171' }
  ], [moodStats]);

  // Get badge for mood trend
  const getMoodTrendBadge = () => {
    // Need at least 2 days of data to show trend
    if (moodTrend.length < 2) return null;
    
    const today = moodTrend[moodTrend.length - 1];
    const yesterday = moodTrend[moodTrend.length - 2];
    
    // Calculate positive ratio
    const todayRatio = today.total > 0 ? today.positive / today.total : 0;
    const yesterdayRatio = yesterday.total > 0 ? yesterday.positive / yesterday.total : 0;
    
    if (todayRatio > yesterdayRatio) {
      return (
        <Badge variant="outline" className="ml-2 bg-green-50 text-green-700 border-green-200">
          <ArrowUp className="h-3 w-3 mr-1" />
          เพิ่มขึ้น
        </Badge>
      );
    } else if (todayRatio < yesterdayRatio) {
      return (
        <Badge variant="outline" className="ml-2 bg-red-50 text-red-700 border-red-200">
          <ArrowDown className="h-3 w-3 mr-1" />
          ลดลง
        </Badge>
      );
    }
    
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Mood Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Smile className="h-8 w-8 text-green-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-green-700">ความรู้สึกเชิงบวก</p>
                  <h3 className="text-2xl font-bold text-green-800">{moodStats.positive}</h3>
                </div>
              </div>
              <p className="text-green-600 text-lg font-semibold">
                {moodStats.total > 0 ? Math.round((moodStats.positive / moodStats.total) * 100) : 0}%
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Meh className="h-8 w-8 text-blue-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-blue-700">ความรู้สึกกลาง</p>
                  <h3 className="text-2xl font-bold text-blue-800">{moodStats.neutral}</h3>
                </div>
              </div>
              <p className="text-blue-600 text-lg font-semibold">
                {moodStats.total > 0 ? Math.round((moodStats.neutral / moodStats.total) * 100) : 0}%
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-red-50 border-red-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Frown className="h-8 w-8 text-red-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-red-700">ความรู้สึกเชิงลบ</p>
                  <h3 className="text-2xl font-bold text-red-800">{moodStats.negative}</h3>
                </div>
              </div>
              <p className="text-red-600 text-lg font-semibold">
                {moodStats.total > 0 ? Math.round((moodStats.negative / moodStats.total) * 100) : 0}%
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mood Distribution and Trend */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Mood Distribution Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Sparkles className="h-5 w-5 mr-2 text-orange-500" />
              การกระจายความรู้สึก
            </CardTitle>
            <CardDescription>
              ความรู้สึกที่พบมากที่สุด: {getMoodName(moodStats.mostCommonMood)} 
              {getMoodTrendBadge()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {moodStats.total > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={polarityData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {polarityData.map((entry, index) => (
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

        {/* Mood Trend Line Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="h-5 w-5 mr-2 text-primary" />
              แนวโน้มความรู้สึก
            </CardTitle>
            <CardDescription>การเปลี่ยนแปลงความรู้สึกในรอบ 7 วัน</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {moodTrend.some(day => day.total > 0) ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={moodTrend}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={formatDate} 
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis />
                    <Tooltip 
                      formatter={(value) => [`${value} ประโยค`, '']}
                      labelFormatter={(value) => `วันที่: ${new Date(value).toLocaleDateString('th-TH')}`}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="positive"
                      name="เชิงบวก"
                      stroke="#4ade80"
                      activeDot={{ r: 8 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="neutral"
                      name="กลาง"
                      stroke="#60a5fa"
                    />
                    <Line
                      type="monotone"
                      dataKey="negative"
                      name="เชิงลบ"
                      stroke="#f87171"
                    />
                  </LineChart>
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

      {/* Top Words by Mood */}
      <Card>
        <CardHeader>
          <CardTitle>คำยอดนิยมตามความรู้สึก</CardTitle>
          <CardDescription>คำที่มีการใช้มากที่สุดแยกตามความรู้สึก</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Positive Words */}
            <div className="space-y-2">
              <div className="flex items-center mb-2">
                <Smile className="h-5 w-5 text-green-500 mr-2" />
                <h3 className="font-semibold text-green-700">คำเชิงบวก</h3>
              </div>
              {topWordsByMood.positive.length > 0 ? (
                <ul className="space-y-2">
                  {topWordsByMood.positive.map((item, index) => (
                    <li key={index} className="flex justify-between items-center bg-green-50 p-2 rounded-md">
                      <span className="font-medium">{item.word}</span>
                      <Badge variant="outline" className="bg-green-100 border-green-200 text-green-700">
                        {item.count}
                      </Badge>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">ไม่พบคำเชิงบวก</p>
              )}
            </div>

            {/* Neutral Words */}
            <div className="space-y-2">
              <div className="flex items-center mb-2">
                <Meh className="h-5 w-5 text-blue-500 mr-2" />
                <h3 className="font-semibold text-blue-700">คำกลาง</h3>
              </div>
              {topWordsByMood.neutral.length > 0 ? (
                <ul className="space-y-2">
                  {topWordsByMood.neutral.map((item, index) => (
                    <li key={index} className="flex justify-between items-center bg-blue-50 p-2 rounded-md">
                      <span className="font-medium">{item.word}</span>
                      <Badge variant="outline" className="bg-blue-100 border-blue-200 text-blue-700">
                        {item.count}
                      </Badge>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">ไม่พบคำกลาง</p>
              )}
            </div>

            {/* Negative Words */}
            <div className="space-y-2">
              <div className="flex items-center mb-2">
                <Frown className="h-5 w-5 text-red-500 mr-2" />
                <h3 className="font-semibold text-red-700">คำเชิงลบ</h3>
              </div>
              {topWordsByMood.negative.length > 0 ? (
                <ul className="space-y-2">
                  {topWordsByMood.negative.map((item, index) => (
                    <li key={index} className="flex justify-between items-center bg-red-50 p-2 rounded-md">
                      <span className="font-medium">{item.word}</span>
                      <Badge variant="outline" className="bg-red-100 border-red-200 text-red-700">
                        {item.count}
                      </Badge>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">ไม่พบคำเชิงลบ</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Sentences by Mood */}
      <Card>
        <CardHeader>
          <CardTitle>ประโยคล่าสุดตามความรู้สึก</CardTitle>
          <CardDescription>ประโยคกำลังใจล่าสุดแยกตามความรู้สึก</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ความรู้สึก</TableHead>
                <TableHead>คะแนน</TableHead>
                <TableHead>คำ</TableHead>
                <TableHead>ประโยคกำลังใจ</TableHead>
                <TableHead>ผู้ให้กำลังใจ</TableHead>
                <TableHead>วันที่</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedSentences.slice(0, 10).map((sentence, index) => (
                <TableRow key={index}>
                  <TableCell>
                    {getMoodIcon(sentence.polarity || 'neutral')}
                  </TableCell>
                  <TableCell>
                    {getMoodScore(sentence.polarity)}
                  </TableCell>
                  <TableCell className="font-medium text-primary">
                    {sentence.word}
                  </TableCell>
                  <TableCell>
                    {sentence.sentence}
                  </TableCell>
                  <TableCell>
                    {sentence.contributor || 'ไม่ระบุชื่อ'}
                  </TableCell>
                  <TableCell className="text-xs whitespace-nowrap">
                    {new Date(sentence.timestamp).toLocaleString('th-TH', {
                      timeZone: 'Asia/Bangkok'
                    })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default MoodReport;
