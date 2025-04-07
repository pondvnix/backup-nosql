
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Check, AlertTriangle, Info } from "lucide-react";

interface SentenceAnalysisProps {
  words: string[];
  analysisResult: {
    energyScore: number;
    breakdown: {
      positive: number;
      negative: number;
    };
    emotionFlow: {
      quality: 'excellent' | 'good' | 'poor';
      consistency: boolean;
    };
    confidence: number;
    needsModeration: boolean;
    suggestion: string;
  } | null;
}

const SentenceAnalysis = ({
  words,
  analysisResult,
}: SentenceAnalysisProps) => {
  if (!analysisResult || words.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-center">การวิเคราะห์ประโยค</CardTitle>
        </CardHeader>
        <CardContent className="text-center text-muted-foreground">
          <Info className="h-12 w-12 mx-auto mb-2 text-primary/50" />
          เพิ่มคำเพื่อเริ่มวิเคราะห์พลังบวกของประโยค
        </CardContent>
      </Card>
    );
  }

  const {
    energyScore,
    breakdown = { positive: 0, negative: 0 },
    emotionFlow = { quality: 'good', consistency: true },
    confidence = 0.5,
    needsModeration = false,
    suggestion = "ไม่มีคำแนะนำ",
  } = analysisResult;

  // Ensure breakdown properties exist to prevent undefined errors
  const positiveCount = breakdown?.positive || 0;
  const negativeCount = breakdown?.negative || 0;

  // Normalize energy score for progress display (0-100)
  // Assuming the max score would be all positive words (words.length)
  const normalizedScore = Math.max(0, Math.min(100, ((energyScore + words.length) / (words.length * 2)) * 100));

  // Determine score text color
  let scoreColorClass = "text-amber-500";
  if (energyScore > words.length / 2) {
    scoreColorClass = "text-green-500";
  } else if (energyScore < 0) {
    scoreColorClass = "text-red-500";
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-center">การวิเคราะห์ประโยค</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">พลังบวกของประโยค</span>
            <span className={`font-bold ${scoreColorClass}`}>
              {energyScore} / {words.length}
            </span>
          </div>
          <Progress value={normalizedScore} className="h-2" />
        </div>

        <div className="grid grid-cols-2 gap-2 text-center">
          <div className="bg-green-50 p-2 rounded-md">
            <p className="text-xs text-muted-foreground">คำบวก</p>
            <p className="font-bold text-green-600">{positiveCount}</p>
          </div>
          <div className="bg-red-50 p-2 rounded-md">
            <p className="text-xs text-muted-foreground">คำลบ</p>
            <p className="font-bold text-red-600">{negativeCount}</p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">การไหลของอารมณ์</span>
            <span className={
              emotionFlow?.quality === 'excellent' 
                ? 'text-green-500' 
                : emotionFlow?.quality === 'good' 
                  ? 'text-amber-500' 
                  : 'text-red-500'
            }>
              {emotionFlow?.quality === 'excellent' 
                ? 'ดีเยี่ยม' 
                : emotionFlow?.quality === 'good' 
                  ? 'ดี' 
                  : 'ต้องปรับปรุง'}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span>ความต่อเนื่อง:</span>
            <span className={emotionFlow?.consistency ? 'text-green-500' : 'text-red-500'}>
              {emotionFlow?.consistency ? 'ดี' : 'กระโดด'}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">ความมั่นใจในการวิเคราะห์</span>
            <span>{Math.round((confidence || 0) * 100)}%</span>
          </div>
          <Progress value={(confidence || 0) * 100} className="h-2" />
        </div>

        <div className="flex items-center p-3 rounded-md bg-secondary">
          {needsModeration ? (
            <AlertTriangle className="h-5 w-5 mr-2 text-amber-500" />
          ) : (
            <Check className="h-5 w-5 mr-2 text-green-500" />
          )}
          <p className="text-sm">{suggestion}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default SentenceAnalysis;
