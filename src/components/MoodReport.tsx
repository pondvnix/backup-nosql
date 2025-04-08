
import React, { useState, useEffect } from "react";
import { getMotivationalSentences } from "@/utils/motivationSentenceManager";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Smile, Meh, Frown, Heart, Clock } from "lucide-react";

export interface MoodReportProps {
  limit?: number;
  refreshKey?: number;
  sentences?: any[];
}

const MoodReport = ({ limit = 10, refreshKey = 0, sentences: providedSentences }: MoodReportProps) => {
  const [sentences, setSentences] = useState<any[]>([]);
  
  useEffect(() => {
    if (providedSentences) {
      setSentences(providedSentences.slice(0, limit));
    } else {
      const storedSentences = getMotivationalSentences();
      setSentences(storedSentences.slice(0, limit));
    }
  }, [limit, refreshKey, providedSentences]);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('th-TH', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch (e) {
      return "ไม่ระบุเวลา";
    }
  };
  
  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return <Smile className="h-4 w-4 text-green-500" />;
      case 'negative':
        return <Frown className="h-4 w-4 text-red-500" />;
      default:
        return <Meh className="h-4 w-4 text-blue-500" />;
    }
  };
  
  const getSentimentBadgeVariant = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'outline' as const;
      case 'negative':
        return 'destructive' as const;
      default:
        return 'secondary' as const;
    }
  };

  // New function to highlight the focus word in orange
  const highlightWord = (sentence: string, word: string) => {
    if (!word || !sentence) return sentence;
    
    const regex = new RegExp(`(${word})`, 'gi');
    const parts = sentence.split(regex);
    
    return parts.map((part, index) => {
      if (part.toLowerCase() === word.toLowerCase()) {
        return <span key={index} className="bg-orange-100 text-orange-800 px-1 rounded-sm">{part}</span>;
      }
      return part;
    });
  };

  return (
    <div className="space-y-4 font-sarabun">
      {sentences.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">
          ยังไม่มีประโยคให้กำลังใจ โปรดสร้างประโยคใหม่
        </p>
      ) : (
        sentences.map((entry, index) => (
          <Card key={index} className="overflow-hidden hover:shadow-md transition-shadow">
            <CardContent className="p-0">
              <div className="border-l-4 border-orange-400 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className="text-lg font-medium mb-2">
                      {highlightWord(entry.sentence, entry.word)}
                    </p>
                    
                    <div className="flex items-center text-sm text-muted-foreground gap-6">
                      <div className="flex items-center gap-1">
                        <Heart className="h-3.5 w-3.5 text-orange-500" />
                        <span className="text-orange-700">คำหลัก: {entry.word}</span>
                      </div>
                      
                      {entry.contributor && (
                        <div className="flex items-center gap-1">
                          <span className="text-muted-foreground">โดย: {entry.contributor}</span>
                        </div>
                      )}
                      
                      {entry.timestamp && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          <span>{formatDate(entry.timestamp)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {entry.sentiment && (
                    <Badge variant={getSentimentBadgeVariant(entry.sentiment)} className="flex items-center gap-1">
                      {getSentimentIcon(entry.sentiment)}
                      <span>
                        {entry.sentiment === 'positive' ? 'เชิงบวก' : 
                        entry.sentiment === 'negative' ? 'เชิงลบ' : 'กลาง'}
                      </span>
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};

export default MoodReport;
