
import { Badge } from "@/components/ui/badge";
import MotivationalSentence from "@/components/MotivationalSentence";
import TomatoBox from "@/components/TomatoBox";
import { Word } from "../word-stream/types";

interface CurrentSentenceProps {
  wordTexts: string[];
  shouldDisplaySentence: boolean;
  motivationalSentence: string;
  lastWord: Word | null;
  sentiment?: 'positive' | 'neutral' | 'negative';
}

const CurrentSentence = ({
  wordTexts,
  shouldDisplaySentence,
  motivationalSentence,
  lastWord,
  sentiment
}: CurrentSentenceProps) => {
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
  
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold flex items-center">
        ประโยคกำลังใจปัจจุบัน
        {shouldDisplaySentence && motivationalSentence && renderSentimentBadge(sentiment)}
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
    </div>
  );
};

export default CurrentSentence;
