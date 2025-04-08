import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { wordPolarityDatabase } from "@/utils/sentenceAnalysis";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, Smile, Meh, Frown } from "lucide-react";
import { extractSentimentFromTemplate, analyzeSentimentFromSentence } from "@/utils/sentimentConsistency";
import { isTemplateUsed, markTemplateAsUsed, getAvailableTemplatesForWord } from "@/utils/templateTracker";
import { saveMotivationalSentence, getMotivationalSentences } from "@/utils/motivationSentenceManager";
import { getContributorName } from "@/utils/contributorManager";

interface MotivationalSentenceProps {
  selectedWords: string[];
  shouldDisplay?: boolean;
  currentSentence?: string;
  sentence?: string;
}

const MotivationalSentence = ({ 
  selectedWords,
  shouldDisplay = false,
  currentSentence = "",
  sentence = ""
}: MotivationalSentenceProps) => {
  const [displaySentence, setDisplaySentence] = useState<string>("");
  const [sentimentType, setSentimentType] = useState<'positive' | 'neutral' | 'negative'>('positive');
  const [generatedSentences, setGeneratedSentences] = useState<{word: string, sentence: string, contributor?: string, template?: string}[]>([]);
  const [showSentence, setShowSentence] = useState(shouldDisplay);
  const { toast } = useToast();
  
  useEffect(() => {
    if (sentence) {
      setDisplaySentence(sentence);
      setShowSentence(true);
    } else if (currentSentence) {
      setDisplaySentence(currentSentence);
      setShowSentence(true);
    }
  }, [sentence, currentSentence]);
  
  useEffect(() => {
    if (selectedWords.length > 0) {
      const latestWord = selectedWords[selectedWords.length - 1];
      
      if (latestWord && !generatedSentences.some(s => s.word === latestWord)) {
        const newSentence = generateEncouragingSentence(latestWord);
        
        setGeneratedSentences(prev => [
          ...prev, 
          { word: latestWord, sentence: newSentence }
        ]);
      }
    }
  }, [selectedWords]);
  
  useEffect(() => {
    const handleSentenceGenerated = (event: CustomEvent) => {
      if (event.detail && event.detail.sentence) {
        setDisplaySentence(event.detail.sentence);
        setShowSentence(true);
        
        if (event.detail.sentiment) {
          setSentimentType(event.detail.sentiment);
        }
        
        if (event.detail.word && event.detail.template) {
          markTemplateAsUsed(event.detail.word, event.detail.template);
        }
      }
    };
    
    window.addEventListener('motivationalSentenceGenerated', 
      handleSentenceGenerated as EventListener);
    
    return () => {
      window.removeEventListener('motivationalSentenceGenerated', 
        handleSentenceGenerated as EventListener);
    };
  }, []);
  
  useEffect(() => {
    if (shouldDisplay) {
      setShowSentence(true);
    }
  }, [shouldDisplay]);
  
  const generateEncouragingSentence = (word: string): string => {
    let storedDatabase = [];
    try {
      const storedData = localStorage.getItem("word-polarity-database");
      if (storedData) {
        storedDatabase = JSON.parse(storedData);
      }
    } catch (e) {
      console.error("Error parsing stored word database:", e);
    }
    
    const combinedDatabase = storedDatabase.length > 0 ? storedDatabase : wordPolarityDatabase;
    
    const wordEntry = combinedDatabase.find(entry => entry.word === word);
    
    if (wordEntry?.templates && wordEntry.templates.length > 0) {
      const availableTemplates = wordEntry.templates.filter(template => !isTemplateUsed(word, template));
      
      if (availableTemplates.length > 0) {
        const randomIndex = Math.floor(Math.random() * availableTemplates.length);
        const selectedTemplate = availableTemplates[randomIndex];
        
        const { sentiment, text } = extractSentimentFromTemplate(selectedTemplate);
        setSentimentType(sentiment);
        
        markTemplateAsUsed(word, selectedTemplate);
        
        return text.replace(new RegExp(`\\$\\{${word}\\}`, 'g'), word);
      }
      
      const firstTemplate = wordEntry.templates[0];
      const { sentiment, text } = extractSentimentFromTemplate(firstTemplate);
      setSentimentType(sentiment);
      
      return text.replace(new RegExp(`\\$\\{${word}\\}`, 'g'), word);
    }
    
    const positiveTemplates = [
      "${บวก}การมี${word}ในชีวิตทำให้เรารู้สึกดีขึ้น",
      "${บวก}${word}คือสิ่งที่เราทุกคนต้องการ",
      "${บวก}${word}จะทำให้เราเข้มแข็งขึ้น",
      "${บวก}อย่าลืมที่จะ${word}ทุกวัน",
      "${บวก}${word}คือพลังใจที่เราสร้างได้",
    ];
    
    const neutralTemplates = [
      "${กลาง}${word}เป็นส่วนหนึ่งของชีวิตที่เราต้องเรียนรู้",
      "${กลาง}${word}และความพยายามจะนำไปสู่ความสำเร็จ",
      "${กลาง}${word}จะทำให้เราเข้าใจตัวเองมากขึ้น",
      "${กลาง}ทุกคนมี${word}ในแบบของตัวเอง",
    ];
    
    const negativeTemplates = [
      "${ลบ}แม้จะมี${word} แต่เราจะผ่านมันไปได้",
      "${ลบ}${word}เป็นบทเรียนที่ทำให้เราเติบโต",
      "${ลบ}อย่าให้${word}มาหยุดความฝันของเรา",
    ];
    
    const allTemplateTypes = [positiveTemplates, neutralTemplates, negativeTemplates];
    const allTemplates = allTemplateTypes.flat();
    
    const availableTemplates = allTemplates.filter(template => !isTemplateUsed(word, template));
    
    if (availableTemplates.length > 0) {
      const randomIndex = Math.floor(Math.random() * availableTemplates.length);
      const selectedTemplate = availableTemplates[randomIndex];
      
      const { sentiment, text } = extractSentimentFromTemplate(selectedTemplate);
      setSentimentType(sentiment);
      
      markTemplateAsUsed(word, selectedTemplate);
      
      return text.replace(/\$\{word\}/g, word);
    }
    
    const randomTypeIndex = Math.floor(Math.random() * allTemplateTypes.length);
    const templates = allTemplateTypes[randomTypeIndex];
    const randomIndex = Math.floor(Math.random() * templates.length);
    const selectedTemplate = templates[randomIndex];
    
    const { sentiment, text } = extractSentimentFromTemplate(selectedTemplate);
    setSentimentType(sentiment);
    
    return text.replace(/\$\{word\}/g, word);
  };

  const highlightWords = (sentence: string, words: string[]): React.ReactNode => {
    if (!sentence) return null;
    
    let parts: React.ReactNode[] = [sentence];
    
    words.forEach(word => {
      const newParts: React.ReactNode[] = [];
      
      parts.forEach(part => {
        if (typeof part !== 'string') {
          newParts.push(part);
          return;
        }
        
        const splitText = part.split(new RegExp(`(${word})`, 'gi'));
        
        splitText.forEach((text, i) => {
          if (i % 2 === 0) {
            if (text) newParts.push(text);
          } else {
            newParts.push(
              <span key={`${word}-${i}`} className="text-[#F97316] font-semibold">
                {text}
              </span>
            );
          }
        });
      });
      
      parts = newParts;
    });
    
    return parts;
  };

  React.useEffect(() => {
    (window as any).showMotivationalSentence = (word: string, contributor?: string, template?: string) => {
      let sentence = "";
      let actualTemplate = template;
      
      if (template) {
        const { sentiment, text } = extractSentimentFromTemplate(template);
        setSentimentType(sentiment);
        
        sentence = text.replace(new RegExp(`\\$\\{${word}\\}`, 'g'), word);
        
        markTemplateAsUsed(word, template);
      } else {
        const sentenceEntry = generatedSentences.find(s => s.word === word);
        sentence = sentenceEntry ? sentenceEntry.sentence : generateEncouragingSentence(word);
      }
      
      setDisplaySentence(sentence);
      setShowSentence(true);
      
      const contributorName = contributor || getContributorName();
      
      const timestamp = new Date().toISOString();
      
      const motivationalSentence = {
        word,
        sentence,
        contributor: contributorName,
        template: actualTemplate,
        sentiment: sentimentType,
        timestamp
      };
      
      saveMotivationalSentence(motivationalSentence);
      
      const sentenceEvent = new CustomEvent('motivationalSentenceGenerated', {
        detail: { 
          sentence, 
          word,
          contributor: contributorName,
          template: actualTemplate,
          sentiment: sentimentType,
          timestamp
        }
      });
      window.dispatchEvent(sentenceEvent);
      
      toast({
        title: "ประโยคให้กำลังใจ",
        description: `แสดงประโยคให้กำลังใจที่มีคำว่า "${word}"`,
      });
    };
    
    return () => {
      delete (window as any).showMotivationalSentence;
    };
  }, [generatedSentences, toast, sentimentType]);
  
  const getSentimentIcon = () => {
    switch (sentimentType) {
      case 'positive':
        return <Smile className="h-4 w-4 text-green-500" />;
      case 'negative':
        return <Frown className="h-4 w-4 text-red-500" />;
      case 'neutral':
        return <Meh className="h-4 w-4 text-blue-500" />;
      default:
        return null;
    }
  };

  const getSentimentBadgeVariant = () => {
    switch (sentimentType) {
      case 'positive':
        return 'success' as const;
      case 'negative':
        return 'destructive' as const;
      case 'neutral':
        return 'secondary' as const;
      default:
        return 'secondary' as const;
    }
  };

  return (
    <Card className="mb-4 hover:shadow-md transition-all duration-300">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="h-5 w-5 text-orange-500" />
          <h3 className="text-lg font-medium">ประโยคให้กำลังใจ</h3>
          
          {showSentence && displaySentence && (
            <Badge variant={getSentimentBadgeVariant()} className="flex items-center gap-1 ml-auto">
              {getSentimentIcon()}
              <span>
                {sentimentType === 'positive' ? 'เชิงบวก' : 
                 sentimentType === 'negative' ? 'เชิงลบ' : 'กลาง'}
              </span>
            </Badge>
          )}
        </div>
        
        {showSentence && displaySentence ? (
          <div className="bg-orange-50 p-4 rounded-md border border-orange-100">
            <p className="text-2xl opacity-100 animate-fade-in leading-relaxed" style={{ fontFamily: 'Sarabun', fontSize: '24px', fontWeight:'bold' }}>
              {highlightWords(displaySentence, selectedWords)}
            </p>
          </div>
        ) : (
          <p className="text-muted-foreground mb-3">
            เลือกคำแนะนำและกดปุ่ม "ใช้คำนี้" เพื่อสร้างประโยคให้กำลังใจ
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default MotivationalSentence;
