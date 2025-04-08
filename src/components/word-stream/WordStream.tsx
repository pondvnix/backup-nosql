
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import Leaderboard from "@/components/Leaderboard";
import { 
  fetchWords, 
  fetchSentences, 
  addNewWord, 
  removeDuplicateSentences,
  processWordSentimentData,
  storeSentenceForBillboard
} from "./WordStreamUtils";
import WordAnalysis from "./WordAnalysis";
import CurrentSentence from "./CurrentSentence";
import { Word, MotivationalSentenceEntry } from "./types";
import { areAllWordsUsed } from "@/utils/wordModeration";

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

  useEffect(() => {
    if (Array.isArray(sentences) && sentences.length > 0) {
      const uniqueSentences = removeDuplicateSentences(sentences);
      setAllSentences(uniqueSentences);
    }
  }, [sentences]);

  useEffect(() => {
    const { wordTexts, result } = processWordSentimentData(words);
    if (result) {
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

  const handleAddWord = (text: string) => {
    const contributor = 'ไม่ระบุชื่อ';
    mutate({ text, contributor });
    if (onAddWord) onAddWord(text);
  };

  const wordTexts = Array.isArray(words) ? words.map(word => word.text) : [];
  const currentSentiment = Array.isArray(allSentences) && allSentences.length > 0 ? allSentences[0].sentiment : undefined;

  return (
    <div className="space-y-6 font-sarabun">
      <WordAnalysis 
        words={wordTexts} 
        analysisResult={analysisResult} 
        onAddWord={handleNewWord} 
        isAddingWord={isAddingWord} 
      />

      <div className="grid grid-cols-1 gap-6">
        <div className="space-y-6">
          <CurrentSentence 
            wordTexts={wordTexts}
            shouldDisplaySentence={shouldDisplaySentence}
            motivationalSentence={motivationalSentence}
            lastWord={lastWord}
            sentiment={currentSentiment}
          />
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
