
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge"; 
import { RefreshCw, PlusCircle, Smile, Meh, Frown } from "lucide-react";
import { getWordPolarity, wordPolarityDatabase } from "@/utils/sentenceAnalysis";
import { extractSentimentFromTemplate } from "@/utils/sentimentConsistency";
import { cn } from "@/lib/utils";

interface WordSuggestionsProps {
  existingWords?: string[];
  onSelectWord: (word: string, template?: string) => void;
  disableAutoRefresh?: boolean;
  showMultipleTemplates?: boolean;
}

interface WordTemplateOption {
  word: string;
  polarity: 'positive' | 'neutral' | 'negative';
  template?: string;
  displayText: string;
  sentiment?: 'positive' | 'neutral' | 'negative'; // Template sentiment
}

const WordSuggestions = ({
  existingWords = [],
  onSelectWord,
  disableAutoRefresh = false,
  showMultipleTemplates = true,
}: WordSuggestionsProps) => {
  const [suggestedWords, setSuggestedWords] = useState<Array<{
    word: string;
    polarity: 'positive' | 'neutral' | 'negative';
    templates?: string[];
  }>>([]);
  const [wordTemplateOptions, setWordTemplateOptions] = useState<WordTemplateOption[]>([]);
  const [selectedOption, setSelectedOption] = useState<string>("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [globalUsedWords, setGlobalUsedWords] = useState<string[]>([]);
  const [usedWordTemplates, setUsedWordTemplates] = useState<Set<string>>(new Set());

  const loadUsedWordsAndTemplates = () => {
    try {
      const storedSentences = localStorage.getItem('motivation-sentences');
      if (storedSentences) {
        const sentences = JSON.parse(storedSentences);
        
        const allUsedWords = sentences.map((item: any) => item.word || "");
        setGlobalUsedWords(allUsedWords.filter(Boolean));
        
        const usedCombinations = new Set<string>();
        sentences.forEach((item: any) => {
          if (item.word && item.sentence) {
            usedCombinations.add(`${item.word}_${item.sentence}`);
          }
        });
        setUsedWordTemplates(usedCombinations);
      }
    } catch (e) {
      console.error("Error loading used words and templates:", e);
      setGlobalUsedWords([]);
      setUsedWordTemplates(new Set());
    }
  };

  const generateSuggestions = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      let wordDatabase = [];
      try {
        const storedData = localStorage.getItem("word-polarity-database");
        if (storedData) {
          wordDatabase = JSON.parse(storedData);
        } else {
          wordDatabase = wordPolarityDatabase;
        }
      } catch (e) {
        console.error("Error loading word database:", e);
        wordDatabase = wordPolarityDatabase;
      }
      
      const filteredWords = wordDatabase.filter((wordEntry: any) => {
        if (!wordEntry.templates || wordEntry.templates.length === 0) {
          return false;
        }
        
        const hasUnusedTemplates = wordEntry.templates.some((template: string) => {
          return !usedWordTemplates.has(`${wordEntry.word}_${template}`);
        });
        
        return hasUnusedTemplates;
      });
      
      const shuffled = [...filteredWords].sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, 6);
      
      setSuggestedWords(selected);
      setSelectedOption("");
      generateWordTemplateOptions(selected);
      setIsRefreshing(false);
    }, 500);
  };

  const generateWordTemplateOptions = (words: Array<{
    word: string;
    polarity: 'positive' | 'neutral' | 'negative';
    templates?: string[];
  }>) => {
    const options: WordTemplateOption[] = [];

    words.forEach(wordItem => {
      if (wordItem.templates && wordItem.templates.length > 0 && showMultipleTemplates) {
        wordItem.templates.forEach(template => {
          if (usedWordTemplates.has(`${wordItem.word}_${template}`)) {
            return;
          }
          
          const { sentiment } = extractSentimentFromTemplate(template);
          
          const templatePreview = template
            .replace(new RegExp(`\\$\\{${wordItem.word}\\}`, 'g'), wordItem.word)
            .replace(/\$\{บวก\}|\$\{กลาง\}|\$\{ลบ\}/g, '')
            .substring(0, 35) + (template.length > 35 ? '...' : '');
          
          options.push({
            word: wordItem.word,
            polarity: wordItem.polarity,
            template: template,
            displayText: `${wordItem.word} - ${templatePreview}`,
            sentiment: sentiment
          });
        });
      } else if (!showMultipleTemplates) {
        options.push({
          word: wordItem.word,
          polarity: wordItem.polarity,
          displayText: wordItem.word
        });
      }
    });

    setWordTemplateOptions(options);
    setIsRefreshing(false);
  };

  useEffect(() => {
    loadUsedWordsAndTemplates();
    
    const handleMotivationalSentenceGenerated = () => {
      loadUsedWordsAndTemplates();
    };
    
    window.addEventListener('motivationalSentenceGenerated', handleMotivationalSentenceGenerated);
    window.addEventListener('motivation-billboard-updated', loadUsedWordsAndTemplates);
    
    return () => {
      window.removeEventListener('motivationalSentenceGenerated', handleMotivationalSentenceGenerated);
      window.removeEventListener('motivation-billboard-updated', loadUsedWordsAndTemplates);
    };
  }, []);
  
  useEffect(() => {
    generateSuggestions();
    
    if (!disableAutoRefresh) {
      const refreshInterval = setInterval(generateSuggestions, 60000);
      return () => clearInterval(refreshInterval);
    }
  }, [disableAutoRefresh, existingWords, globalUsedWords, usedWordTemplates]);

  const handleOptionSelect = (optionId: string) => {
    setSelectedOption(optionId);
  };

  const handleSubmit = () => {
    if (selectedOption) {
      const selectedItem = wordTemplateOptions.find(
        option => `${option.word}_${option.template || 'default'}` === selectedOption
      );
      
      if (selectedItem) {
        let sentenceText = "";
        if (selectedItem.template) {
          sentenceText = selectedItem.template
            .replace(new RegExp(`\\$\\{${selectedItem.word}\\}`, 'g'), selectedItem.word)
            .replace(/\$\{บวก\}|\$\{กลาง\}|\$\{ลบ\}/g, '');
        }
        
        const contributor = localStorage.getItem('contributor-name') || 'ไม่ระบุชื่อ';
        
        storeSentenceInDatabase(selectedItem.word, sentenceText, contributor, selectedItem.template);
        
        setUsedWordTemplates(prev => {
          const newSet = new Set(prev);
          newSet.add(`${selectedItem.word}_${selectedItem.template || 'default'}`);
          return newSet;
        });
        
        const sentenceEvent = new CustomEvent('motivationalSentenceGenerated', {
          detail: { 
            sentence: sentenceText, 
            word: selectedItem.word,
            contributor: contributor,
            template: selectedItem.template,
            sentiment: selectedItem.sentiment
          }
        });
        window.dispatchEvent(sentenceEvent);
        
        onSelectWord(selectedItem.word, selectedItem.template);
        setSelectedOption("");
        generateSuggestions();
      }
    }
  };

  const storeSentenceInDatabase = (word: string, sentence: string, contributor: string, template?: string) => {
    if (!sentence) return;
    
    let sentiment;
    if (template) {
      const sentimentInfo = extractSentimentFromTemplate(template);
      sentiment = sentimentInfo.sentiment;
    }
    
    const newEntry = {
      sentence,
      word,
      contributor: contributor || 'ไม่ระบุชื่อ',
      timestamp: new Date(),
      template,
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
    
    const updatedEntries = [newEntry, ...existingEntries];
    localStorage.setItem('motivation-sentences', JSON.stringify(updatedEntries));
    
    window.dispatchEvent(new CustomEvent('motivation-billboard-updated'));
  };

  const getPolarityClass = (polarity: string) => {
    switch (polarity) {
      case 'positive':
        return 'text-green-600 border-green-200';
      case 'negative':
        return 'text-red-600 border-red-200';
      default:
        return 'text-blue-600 border-blue-200';
    }
  };

  const getPolarityText = (polarity: string) => {
    switch (polarity) {
      case 'positive':
        return 'เชิงบวก';
      case 'negative':
        return 'เชิงลบ';
      default:
        return 'กลาง';
    }
  };

  const getSentimentIcon = (sentiment?: 'positive' | 'neutral' | 'negative') => {
    switch (sentiment) {
      case 'positive':
        return <Smile className="h-3 w-3 mr-1" />;
      case 'negative':
        return <Frown className="h-3 w-3 mr-1" />;
      case 'neutral':
        return <Meh className="h-3 w-3 mr-1" />;
      default:
        return null;
    }
  };

  return (
    <Card className="w-full">
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-md font-medium">คำแนะนำ</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={generateSuggestions}
            disabled={isRefreshing}
            className="gap-1"
          >
            <RefreshCw className={`h-3 w-3 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="text-xs">สุ่มใหม่</span>
          </Button>
        </div>

        {wordTemplateOptions.length > 0 ? (
          <div className="space-y-4">
            <RadioGroup
              value={selectedOption}
              onValueChange={handleOptionSelect}
              className="space-y-2"
            >
              {wordTemplateOptions.map((option) => {
                const optionId = `${option.word}_${option.template || 'default'}`;
                const badgeVariant = option.sentiment === 'positive' ? 'success' : 
                                    option.sentiment === 'negative' ? 'destructive' : 'secondary';
                
                return (
                  <div 
                    key={optionId}
                    className={`flex items-center space-x-2 p-2 rounded-md border ${
                      selectedOption === optionId 
                        ? 'border-primary bg-primary/5' 
                        : 'border-gray-200 hover:border-primary/50'
                    } transition-all duration-300`}
                  >
                    <RadioGroupItem value={optionId} id={optionId} />
                    <Label 
                      htmlFor={optionId} 
                      className="flex flex-1 justify-between items-center cursor-pointer"
                    >
                      <span className="font-medium">
                        {option.displayText}
                      </span>
                      <div className="flex gap-1">
                        {option.sentiment && (
                          <Badge variant={badgeVariant} className="flex items-center text-xs">
                            {getSentimentIcon(option.sentiment)}
                            {option.sentiment === 'positive' ? 'บวก' : 
                             option.sentiment === 'negative' ? 'ลบ' : 'กลาง'}
                          </Badge>
                        )}
                        <span className={`text-xs px-2 py-1 rounded-full border ${getPolarityClass(option.polarity)}`}>
                          คำ{getPolarityText(option.polarity)}
                        </span>
                      </div>
                    </Label>
                  </div>
                );
              })}
            </RadioGroup>
            
            <Button 
              onClick={handleSubmit} 
              disabled={!selectedOption}
              className="w-full mt-4 gap-2"
            >
              <PlusCircle className="h-4 w-4" />
              ใช้คำนี้
            </Button>
          </div>
        ) : (
          <div className="text-center p-4 text-muted-foreground">
            {isRefreshing ? (
              <div className="animate-pulse">กำลังโหลดคำแนะนำ...</div>
            ) : (
              <div>ไม่พบคำแนะนำที่ยังไม่ถูกใช้ กรุณากดปุ่ม "สุ่มใหม่"</div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WordSuggestions;
