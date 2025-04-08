
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import WordForm from "@/components/WordForm";
import SentenceAnalysis from "@/components/SentenceAnalysis";
import { areAllWordsUsed } from "@/utils/wordModeration";

interface WordAnalysisProps {
  words: string[];
  analysisResult: any;
  onAddWord: (word: string) => void;
  isAddingWord: boolean;
}

const WordAnalysis = ({
  words,
  analysisResult,
  onAddWord,
  isAddingWord
}: WordAnalysisProps) => {
  const areAllWordsInDbUsed = areAllWordsUsed(words);
  
  return (
    <div className="space-y-6">
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
            onAddWord={onAddWord} 
            isLoading={isAddingWord} 
            existingWords={words}
            disableSuggestionRefresh={true}
          />
        </CardContent>
      </Card>

      <div className="space-y-6">
        <h3 className="text-xl font-semibold">วิเคราะห์พลังบวก</h3>
        <SentenceAnalysis 
          words={words} 
          analysisResult={analysisResult} 
        />
      </div>
    </div>
  );
};

export default WordAnalysis;
