
import { useState, useEffect, useMemo } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UniqueValueSelector } from "@/components/ui/unique-value-selector";
import { RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getWordPolarity } from "@/utils/sentenceAnalysis";

interface WordOption {
  text: string;
  value: string;
  template?: string;
  preview?: string;
}

interface WordSuggestionsProps {
  existingWords?: string[];
  onSelectWord: (word: string, template?: string) => void;
  disableAutoRefresh?: boolean;
  showMultipleTemplates?: boolean;
}

const WordSuggestions = ({
  existingWords = [],
  onSelectWord,
  disableAutoRefresh = false,
  showMultipleTemplates = true, // Default to showing multiple templates
}: WordSuggestionsProps) => {
  const [selectedOption, setSelectedOption] = useState<WordOption | undefined>();
  const [allWordOptions, setAllWordOptions] = useState<WordOption[]>([]);
  const [refreshCounter, setRefreshCounter] = useState(0);
  const { toast } = useToast();

  // Get all available words with templates
  const getAvailableWords = () => {
    try {
      // Try to get custom word database from localStorage
      const storedData = localStorage.getItem("word-polarity-database");
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        
        // Create options for each word and template combination
        const options: WordOption[] = [];
        
        parsedData.forEach((item: any) => {
          const word = item.word;
          
          if (showMultipleTemplates && item.templates && item.templates.length > 0) {
            // Create an option for each template
            item.templates.forEach((template: string, index: number) => {
              // Create a preview of the template by replacing placeholders
              const preview = template.replace(new RegExp(`\\$\\{${word}\\}`, 'g'), word);
              
              options.push({
                text: word,
                value: `${word}-template-${index}`,
                template: template,
                preview: preview
              });
            });
          } else {
            // Just add the word without template specifics
            options.push({
              text: word,
              value: word
            });
          }
        });
        
        return options;
      }
    } catch (e) {
      console.error("Error parsing word database:", e);
    }
    
    return [];
  };

  // Get a list of random words
  const getRandomWords = (
    count: number,
    allOptions: WordOption[],
    existingWords: string[]
  ): WordOption[] => {
    // Filter out existing words
    const filteredOptions = allOptions.filter(
      (option) => !existingWords.includes(option.text)
    );
    
    if (filteredOptions.length === 0) return [];
    
    // Shuffle and select random words
    const shuffled = [...filteredOptions].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };

  // Update word options when refreshCounter changes
  useEffect(() => {
    const allOptions = getAvailableWords();
    setAllWordOptions(allOptions);
    
    const randomOptions = getRandomWords(6, allOptions, existingWords);
    
    if (randomOptions.length > 0) {
      // Auto-select the first option
      setSelectedOption(randomOptions[0]);
    } else {
      setSelectedOption(undefined);
    }
  }, [refreshCounter, existingWords]);

  // Auto-refresh suggestions every 10 seconds if enabled
  useEffect(() => {
    if (disableAutoRefresh) return;
    
    const intervalId = setInterval(() => {
      setRefreshCounter((prev) => prev + 1);
    }, 10000);
    
    return () => clearInterval(intervalId);
  }, [disableAutoRefresh]);

  // Handle refresh button click
  const handleRefresh = () => {
    setRefreshCounter((prev) => prev + 1);
    toast({
      title: "รีเฟรชคำแนะนำสำเร็จ",
      description: "แสดงคำแนะนำใหม่จากคลังคำทั้งหมดแล้ว",
    });
  };

  // Handle word selection
  const handleWordSelect = (option: WordOption | undefined) => {
    setSelectedOption(option);
  };

  // Handle use this word button click
  const handleUseWord = () => {
    if (!selectedOption) return;
    
    // Call window.showMotivationalSentence with the selected word and template
    if (typeof window !== "undefined" && window.showMotivationalSentence) {
      window.showMotivationalSentence(selectedOption.text, undefined, selectedOption.template);
    }
    
    // Call onSelectWord with the word and template
    onSelectWord(selectedOption.text, selectedOption.template);
    
    toast({
      title: "เลือกคำสำเร็จ",
      description: `คำ "${selectedOption.text}" ถูกเลือกแล้ว`,
    });
    
    // Reset selection after use
    setSelectedOption(undefined);
    
    // Refresh suggestions
    setRefreshCounter((prev) => prev + 1);
  };

  // Use a function to customize how options are displayed in the selector
  const renderOptionLabel = (option: WordOption) => {
    if (option.preview) {
      return (
        <div>
          <div className="font-bold">{option.text}</div>
          <div className="text-xs text-muted-foreground truncate max-w-[200px]">
            {option.preview}
          </div>
        </div>
      );
    }
    return option.text;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>คำแนะนำสำหรับคุณ</span>
          <Button
            variant="outline"
            size="icon"
            onClick={handleRefresh}
            className="h-8 w-8"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <UniqueValueSelector
          options={allWordOptions}
          selected={selectedOption}
          onSelect={handleWordSelect}
          title="เลือกคำที่คุณต้องการ"
          renderOptionLabel={renderOptionLabel}
        />
      </CardContent>
      <CardFooter>
        <Button
          onClick={handleUseWord}
          disabled={!selectedOption}
          className="w-full"
        >
          ใช้คำนี้
        </Button>
      </CardFooter>
    </Card>
  );
};

export default WordSuggestions;
