
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle, RefreshCw, ChevronRight, ChevronLeft, Sparkles, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import WordForm from "@/components/WordForm";
import { getContributorName } from "@/utils/contributorManager";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import MotivationalSentence from "@/components/MotivationalSentence";
import TomatoBox from "@/components/TomatoBox";
import SentenceAnalysis from "@/components/SentenceAnalysis";
import Leaderboard from "@/components/Leaderboard";
import { analyzeSentence } from "@/utils/sentenceAnalysis";
import { areAllWordsUsed } from "@/utils/wordModeration";

interface Word {
  text: string;
  contributor: string;
}

interface MotivationalSentenceEntry {
  word: string;
  sentence: string;
  contributor?: string;
  template?: string;
  sentiment?: 'positive' | 'neutral' | 'negative';
  score?: number;
  timestamp: string | Date;
  id?: string;
  polarity?: 'positive' | 'neutral' | 'negative';
}

const fetchWords = async (): Promise<Word[]> => {
  return [];
};

const fetchSentences = async (): Promise<MotivationalSentenceEntry[]> => {
  return [];
};

const addNewWord = async ({ text, contributor }: { text: string; contributor: string }): Promise<Word> => {
  return { text, contributor };
};

interface WordStreamProps {
  onAddWord?: (word: string) => void;
}

const WordStream = ({ onAddWord }: WordStreamProps) => {
  const { toast } = useToast();
  const [lastWord, setLastWord] = useState<Word | null>(null);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);
  const [motivationalSentence, setMotivationalSentence] = useState<string>("");
  const [shouldDisplaySentence, setShouldDisplaySentence] = useState<boolean>(false);
  const [allSentences, setAllSentences] = useState<MotivationalSentenceEntry[]>([]);
  const [areAllWordsInDbUsed, setAreAllWordsInDbUsed] = useState<boolean>(false);
  const queryClient = useQueryClient();

  const handleNewWord = (word: string) => {
    if (onAddWord) {
      onAddWord(word);
    }
  };

  const { data: words = [], isLoading: isLoadingWords } = useQuery({
    queryKey: ['encouragement-words'],
    queryFn: fetchWords,
    refetchInterval: 1000,
  });

  const { data: sentences = [] } = useQuery({
    queryKey: ['motivation-sentences'],
    queryFn: fetchSentences,
    refetchInterval: 1000,
  });

  const removeDuplicateSentences = (sentences: MotivationalSentenceEntry[]): MotivationalSentenceEntry[] => {
    if (!Array.isArray(sentences)) {
      return [];
    }
    const uniqueIds = new Set();
    return sentences.filter(sentence => {
      if (!sentence) return false;
      const id = `${sentence.word}-${sentence.sentence}-${sentence.contributor}`;
      if (uniqueIds.has(id)) return false;
      uniqueIds.add(id);
      return true;
    });
  };

  useEffect(() => {
    if (Array.isArray(sentences) && sentences.length > 0) {
      const uniqueSentences = removeDuplicateSentences(sentences);
      setAllSentences(uniqueSentences);
    }
  }, [sentences]);

  useEffect(() => {
    if (Array.isArray(words) && words.length > 0) {
      const wordTexts = words.map(word => word.text);
      const result = analyzeSentence(wordTexts);
      setAnalysisResult(result);
      
      // Check if all words in the database have been used
      setAreAllWordsInDbUsed(areAllWordsUsed(wordTexts));
    }
  }, [words]);

  useEffect(() => {
    const handleDatabaseUpdate = () => {
      queryClient.invalidateQueries({ queryKey: ['encouragement-words'] });
      queryClient.invalidateQueries({ queryKey: ['motivation-sentences'] });
      setRefreshTrigger(prev => prev + 1);
    };

    window.addEventListener('word-database-updated', handleDatabaseUpdate);
    window.addEventListener('motivation-billboard-updated', handleDatabaseUpdate);

    return () => {
      window.removeEventListener('word-database-updated', handleDatabaseUpdate);
      window.removeEventListener('motivation-billboard-updated', handleDatabaseUpdate);
    };
  }, [queryClient]);

  useEffect(() => {
    const handleSentenceGenerated = (event: CustomEvent) => {
      if (event.detail && event.detail.sentence) {
        let sentence = event.detail.sentence;
        let sentiment: 'positive' | 'neutral' | 'negative' | undefined = undefined;

        if (sentence.startsWith('${บวก}')) {
          sentiment = 'positive';
          sentence = sentence.replace('${บวก}', '');
        } else if (sentence.startsWith('${กลาง}')) {
          sentiment = 'neutral';
          sentence = sentence.replace('${กลาง}', '');
        } else if (sentence.startsWith('${ลบ}')) {
          sentiment = 'negative';
          sentence = sentence.replace('${ลบ}', '');
        }

        setMotivationalSentence(sentence);
        setShouldDisplaySentence(true);

        storeSentenceForBillboard(
          sentence,
          event.detail.word,
          event.detail.contributor,
          event.detail.polarity,
          event.detail.score,
          sentiment
        );
      }
    };

    window.addEventListener('motivationalSentenceGenerated', 
      handleSentenceGenerated as EventListener);

    return () => {
      window.removeEventListener('motivationalSentenceGenerated', 
        handleSentenceGenerated as EventListener);
    };
  }, []);

  const storeSentenceForBillboard = (
    sentence: string,
    word: string,
    contributor: string,
    polarity?: 'positive' | 'neutral' | 'negative',
    score?: number,
    sentiment?: 'positive' | 'neutral' | 'negative'
  ) => {
    if (!word) return;

    const billboardEntry = {
      sentence,
      word,
      contributor: contributor || 'ไม่ระบุชื่อ',
      timestamp: new Date(),
      polarity,
      score,
      sentiment
    };

    let existingEntries = [];
    try {
      const stored = localStorage.getItem('motivation-sentences');
      if (stored) {
        existingEntries = JSON.parse(stored);
        if (!Array.isArray(existingEntries)) {
          existingEntries = [existingEntries];
        }
      }
    } catch (error) {
      console.error("Error parsing stored sentences:", error);
      existingEntries = [];
    }

    const uniqueEntries = removeDuplicateSentences([billboardEntry, ...existingEntries]);
    localStorage.setItem('motivation-sentences', JSON.stringify(uniqueEntries));

    window.dispatchEvent(new CustomEvent('motivation-billboard-updated'));
    queryClient.invalidateQueries({ queryKey: ['motivation-sentences'] });
  };

  const { mutate, isPending: isAddingWord } = useMutation({
    mutationFn: addNewWord,
    onSuccess: (newWord) => {
      queryClient.setQueryData(['encouragement-words'], (old: Word[] = []) => [...old, newWord]);
      setLastWord(newWord);

      setRefreshTrigger(prev => prev + 1);

      queryClient.invalidateQueries({ queryKey: ['contributor-stats'] });

      toast({
        title: "เพิ่มคำสำเร็จ!",
        description: `"${newWord.text}" ได้ถูกเพิ่มเข้าสู่ประโยคกำลังใจแล้ว`
      });
    },
    onError: (error) => {
      console.error("Error adding word:", error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถเพิ่มคำได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง",
        variant: "destructive",
      });
    },
  });

  const handleAddWord = (text: string, contributor: string) => {
    mutate({ text, contributor: contributor || 'ไม่ระบุชื่อ' });
    if (onAddWord) onAddWord(text);
  };

  const renderSentimentBadge = (sentiment?: 'positive' | 'neutral' | 'negative') => {
    if (!sentiment) return null;

    let variant: 'success' | 'destructive' | 'secondary' = 'secondary';
    let text = 'กลาง';

    if (sentiment === 'positive') {
      variant = 'success';
      text = 'บวก';
    } else if (sentiment === 'negative') {
      variant = 'destructive';
      text = 'ลบ';
    }

    return (
      <Badge variant={variant} className="ml-2 text-xs">
        {text}
      </Badge>
    );
  };

  const wordTexts = Array.isArray(words) ? words.map(word => word.text) : [];

  return (
    <div className="space-y-6 font-sarabun">
      {areAllWordsInDbUsed && (
        <Alert variant="destructive" className="bg-red-50 border-red-200">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-700">
            คำทั้งหมดในคลังถูกใช้แล้ว โปรดแจ้งผู้ดูแลระบบเพื่อเพิ่มคำใหม่
          </AlertDescription>
        </Alert>
      )}
      
      <Alert variant="destructive" className="bg-amber-50 border-amber-200">
        <AlertCircle className="h-4 w-4 text-amber-600" />
        <AlertDescription className="text-amber-700">
          การเพิ่มคำใหม่เข้าสู่ระบบสามารถทำได้ในหน้า "จัดการคำลังใจ" เท่านั้น กรุณาเลือกจากคำที่มีอยู่แล้วในระบบ
        </AlertDescription>
      </Alert>

      <Card className="hover:shadow-md transition-all duration-300">
        <CardContent className="p-6">
          <h2 className="text-2xl font-bold mb-4 text-center font-mitr">
            ร่วมสร้างประโยคกำลังใจด้วยกัน
          </h2>
          <p className="text-center text-muted-foreground mb-4">
            เลือกหนึ่งคำเพื่อต่อเติมประโยคกำลังใจให้ยาวที่สุด
          </p>
          <WordForm 
            onAddWord={handleNewWord} 
            isLoading={isAddingWord} 
            existingWords={wordTexts}
            disableSuggestionRefresh={true}
          />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6">
        <div className="space-y-6">
          <h3 className="text-xl font-semibold flex items-center">
            ประโยคกำลังใจปัจจุบัน
            {shouldDisplaySentence && motivationalSentence && Array.isArray(allSentences) && allSentences.length > 0 && 
              renderSentimentBadge(allSentences[0].sentiment)}
          </h3>
          
          <MotivationalSentence 
            selectedWords={wordTexts} 
            shouldDisplay={shouldDisplaySentence}
            currentSentence={motivationalSentence}
          />
          
          {lastWord && (
            <div className="space-y-4 animate-fade-in">
              <h3 className="text-xl font-semibold">คำล่าสุดของคุณ</h3>
              <TomatoBox 
                word={lastWord.text} 
                contributor={lastWord.contributor} 
                sentence={motivationalSentence}
                selectedWords={wordTexts}
              />
            </div>
          )}
          
          <div className="space-y-6">
            <h3 className="text-xl font-semibold">วิเคราะห์พลังบวก</h3>
            <SentenceAnalysis 
              words={wordTexts} 
              analysisResult={analysisResult} 
            />
          </div>
        </div>
        
        <div className="w-full">
          <Leaderboard 
            refreshTrigger={refreshTrigger} 
            allSentences={Array.isArray(allSentences) ? allSentences : []}
          />
        </div>
      </div>
    </div>
  );
};

export default WordStream;
