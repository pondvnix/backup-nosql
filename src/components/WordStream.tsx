import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import WordForm from "./WordForm";
import TomatoBox from "./TomatoBox";
import SentenceAnalysis from "./SentenceAnalysis";
import MotivationalSentence from "./MotivationalSentence";
import { Card, CardContent } from "@/components/ui/card";
import { analyzeSentence } from "@/utils/sentenceAnalysis";
import Leaderboard from "./Leaderboard";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { stringToTemplateObjects } from "@/utils/wordModeration";

interface Word {
  id: string;
  text: string;
  contributor: string;
  timestamp: Date;
}

interface MotivationalSentenceEntry {
  sentence: string;
  word: string;
  contributor: string;
  timestamp: Date;
  polarity?: 'positive' | 'neutral' | 'negative';
  score?: number;
  sentiment?: 'positive' | 'neutral' | 'negative';
}

const fetchWords = async (): Promise<Word[]> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const storedWords = localStorage.getItem('encouragement-words');
  if (storedWords) {
    return JSON.parse(storedWords);
  }
  
  return [];
};

const fetchSentences = async (): Promise<MotivationalSentenceEntry[]> => {
  try {
    const storedSentences = localStorage.getItem('motivation-sentences');
    if (storedSentences) {
      const sentences = JSON.parse(storedSentences);
      
      return sentences.map((sentence: MotivationalSentenceEntry) => {
        if (sentence.sentence.startsWith('${บวก}')) {
          return {
            ...sentence,
            sentence: sentence.sentence.replace('${บวก}', ''),
            sentiment: 'positive'
          };
        } else if (sentence.sentence.startsWith('${กลาง}')) {
          return {
            ...sentence,
            sentence: sentence.sentence.replace('${กลาง}', ''),
            sentiment: 'neutral'
          };
        } else if (sentence.sentence.startsWith('${ลบ}')) {
          return {
            ...sentence,
            sentence: sentence.sentence.replace('${ลบ}', ''),
            sentiment: 'negative'
          };
        }
        return sentence;
      });
    }
    return [];
  } catch (error) {
    console.error("Error fetching sentences:", error);
    return [];
  }
};

const addNewWord = async (newWord: Omit<Word, 'id' | 'timestamp'>): Promise<Word> => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const word: Word = {
    id: Date.now().toString(),
    text: newWord.text,
    contributor: newWord.contributor || "ไม่ระบุชื่อ",
    timestamp: new Date(),
  };
  
  const storedWords = localStorage.getItem('encouragement-words');
  const words = storedWords ? JSON.parse(storedWords) : [];
  const updatedWords = [...words, word];
  localStorage.setItem('encouragement-words', JSON.stringify(updatedWords));
  
  return word;
};

const WordStream = () => {
  const { toast } = useToast();
  const [lastWord, setLastWord] = useState<Word | null>(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [motivationalSentence, setMotivationalSentence] = useState<string>("");
  const [shouldDisplaySentence, setShouldDisplaySentence] = useState(false);
  const [allSentences, setAllSentences] = useState<MotivationalSentenceEntry[]>([]);
  const queryClient = useQueryClient();
  
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
    const uniqueIds = new Set();
    return sentences.filter(sentence => {
      const id = `${sentence.word}-${sentence.sentence}-${sentence.contributor}`;
      if (uniqueIds.has(id)) return false;
      uniqueIds.add(id);
      return true;
    });
  };
  
  useEffect(() => {
    if (sentences.length > 0) {
      const uniqueSentences = removeDuplicateSentences(sentences);
      setAllSentences(uniqueSentences);
    }
  }, [sentences]);
  
  useEffect(() => {
    if (words.length > 0) {
      const wordTexts = words.map(word => word.text);
      const result = analyzeSentence(wordTexts);
      setAnalysisResult(result);
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
        description: `"${newWord.text}" ได้ถูกเพิ่มเข้าสู่ประโยคกำลังใจแล้ว`,
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
  
  const handleAddWord = (text: string, contributor: string, template?: string) => {
    mutate({ text, contributor: contributor || 'ไม่ระบุชื่อ' });
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

  const wordTexts = words.map(word => word.text);

  return (
    <div className="space-y-6">
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
            onAddWord={handleAddWord} 
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
            {shouldDisplaySentence && motivationalSentence && allSentences.length > 0 && 
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
            allSentences={allSentences}
          />
        </div>
      </div>
    </div>
  );
};

export default WordStream;
