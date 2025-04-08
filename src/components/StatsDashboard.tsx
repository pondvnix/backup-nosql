import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Smile, Frown, Meh, BarChart3, Users, Calendar, TrendingUp } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell } from "recharts";
import { getMotivationalSentences } from "@/utils/motivationSentenceManager";

export interface StatsDashboardProps {
  sentences?: any[];
}

const StatsDashboard = ({ sentences: propSentences }: StatsDashboardProps) => {
  // Use provided sentences or get from local storage
  const sentences = useMemo(() => {
    if (propSentences && Array.isArray(propSentences)) {
      return propSentences;
    }
    return getMotivationalSentences();
  }, [propSentences]);

  // Calculate total sentences
  const totalSentences = useMemo(() => sentences.length, [sentences]);

  // Calculate mood distribution
  const moodDistribution = useMemo(() => {
    let positive = 0;
    let neutral = 0;
    let negative = 0;

    sentences.forEach((sentence: any) => {
      if (sentence.polarity === 'positive') positive++;
      else if (sentence.polarity === 'negative') negative++;
      else neutral++;
    });

    return { positive, neutral, negative };
  }, [sentences]);

  // Calculate top contributors
  const topContributors = useMemo(() => {
    const contributorCounts: Record<string, number> = {};

    sentences.forEach((sentence: any) => {
      const contributor = sentence.contributor || 'ไม่ระบุชื่อ';
      contributorCounts[contributor] = (contributorCounts[contributor] || 0) + 1;
    });

    const sortedContributors = Object.entries(contributorCounts)
      .sort(([, countA], [, countB]) => countB - countA)
      .slice(0, 5);

    return sortedContributors.map(([contributor, count]) => ({ contributor, count }));
  }, [sentences]);

  // Calculate sentences per day
  const sentencesPerDay = useMemo(() => {
    const dailyCounts: Record<string, number> = {};

    sentences.forEach((sentence: any) => {
      const date = new Date(sentence.timestamp).toLocaleDateString();
      dailyCounts[date] = (dailyCounts[date] || 0) + 1;
    });

    const sortedDays = Object.entries(dailyCounts)
      .sort(([dateA], [dateB]) => new Date(dateA).getTime() - new Date(dateB).getTime());

    return sortedDays.map(([date, count]) => ({ date, count }));
  }, [sentences]);

  // Data for mood distribution pie chart
  const moodPieData = useMemo(() => {
    return [
      { name: 'เชิงบวก', value: moodDistribution.positive },
      { name: 'กลาง', value: moodDistribution.neutral },
      { name: 'เชิงลบ', value: moodDistribution.negative },
    ];
  }, [moodDistribution]);

  // Colors for mood pie chart
  const moodColors = ['#4ade80', '#60a5fa', '#f87171'];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Total Sentences Card */}
      <Card className="bg-white shadow-md">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            ประโยคทั้งหมด
          </CardTitle>
          <CardDescription>จำนวนประโยคให้กำลังใจทั้งหมดในระบบ</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold text-primary">{totalSentences}</div>
        </CardContent>
      </Card>

      {/* Mood Distribution Card */}
      <Card className="bg-white shadow-md">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Smile className="h-5 w-5" />
            การกระจายความรู้สึก
          </CardTitle>
          <CardDescription>สัดส่วนของความรู้สึกในประโยคให้กำลังใจ</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={moodPieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {moodPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={moodColors[index % moodColors.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Top Contributors Card */}
      <Card className="bg-white shadow-md">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Users className="h-5 w-5" />
            ผู้ร่วมสร้างยอดนิยม
          </CardTitle>
          <CardDescription>ผู้ที่มีส่วนร่วมในการสร้างประโยคให้กำลังใจมากที่สุด</CardDescription>
        </CardHeader>
        <CardContent>
          <ul>
            {topContributors.map((contributor, index) => (
              <li key={index} className="py-2 flex items-center justify-between">
                <span>{contributor.contributor}</span>
                <span className="font-semibold">{contributor.count}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Sentences Per Day Card */}
      <Card className="bg-white shadow-md">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            ประโยคต่อวัน
          </CardTitle>
          <CardDescription>จำนวนประโยคให้กำลังใจที่สร้างในแต่ละวัน</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sentencesPerDay}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatsDashboard;
