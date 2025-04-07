import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { RefreshCw, PlusCircle } from "lucide-react";
import { getWordPolarity } from "@/utils/sentenceAnalysis";

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

  // Load all globally used words from localStorage
  const loadGlobalUsedWords = () => {
    try {
      const storedSentences = localStorage.getItem('motivation-sentences');
      if (storedSentences) {
        const sentences = JSON.parse(storedSentences);
        const allUsedWords = sentences.map((item: any) => item.word || "");
        setGlobalUsedWords(allUsedWords.filter(Boolean));
      }
    } catch (e) {
      console.error("Error loading used words:", e);
      setGlobalUsedWords([]);
    }
  };

  // Generate a list of suggested words
  const generateSuggestions = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      // Get word database from localStorage or use default
      let wordDatabase = [];
      try {
        const storedData = localStorage.getItem("word-polarity-database");
        if (storedData) {
          wordDatabase = JSON.parse(storedData);
        }
      } catch (e) {
        console.error("Error loading word database:", e);
      }
      
      // If no words in database, use default polarity database from utils
      if (wordDatabase.length === 0) {
        const response = getWordPolarity("");
        wordDatabase = response.database || [];
      }
      
      // Filter out words that are already in existingWords or globally used
      const filteredWords = wordDatabase.filter(
        (word: any) => 
          !existingWords.includes(word.word) && 
          !globalUsedWords.includes(word.word)
      );
      
      // Shuffle and take the first few words
      const shuffled = [...filteredWords].sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, 6);
      
      setSuggestedWords(selected);
      setSelectedOption("");
      generateWordTemplateOptions(selected);
      setIsRefreshing(false);
    }, 500);
  };

  // Create combined word-template options
  const generateWordTemplateOptions = (words: Array<{
    word: string;
    polarity: 'positive' | 'neutral' | 'negative';
    templates?: string[];
  }>) => {
    const options: WordTemplateOption[] = [];

    words.forEach(wordItem => {
      if (wordItem.templates && wordItem.templates.length > 0 && showMultipleTemplates) {
        // Add each word-template combination as a separate option
        wordItem.templates.forEach(template => {
          // Create a preview of the template by replacing ${word} with the actual word
          const templatePreview = template
            .replace(new RegExp(`\\$\\{${wordItem.word}\\}`, 'g'), wordItem.word)
            .substring(0, 35) + (template.length > 35 ? '...' : '');
          
          options.push({
            word: wordItem.word,
            polarity: wordItem.polarity,
            template: template,
            displayText: `${wordItem.word} - ${templatePreview}`
          });
        });
      } else {
        // Add just the word as an option if no templates or showMultipleTemplates is false
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

  // Initialize suggestions on component mount and when global used words change
  useEffect(() => {
    loadGlobalUsedWords();
    
    const handleMotivationalSentenceGenerated = () => {
      loadGlobalUsedWords();
    };
    
    window.addEventListener('motivationalSentenceGenerated', handleMotivationalSentenceGenerated);
    window.addEventListener('motivation-billboard-updated', loadGlobalUsedWords);
    
    return () => {
      window.removeEventListener('motivationalSentenceGenerated', handleMotivationalSentenceGenerated);
      window.removeEventListener('motivation-billboard-updated', loadGlobalUsedWords);
    };
  }, []);
  
  // Generate suggestions when component mounts or global used words change
  useEffect(() => {
    generateSuggestions();
    
    // Set up auto-refresh timer if not disabled
    if (!disableAutoRefresh) {
      const refreshInterval = setInterval(generateSuggestions, 60000);
      return () => clearInterval(refreshInterval);
    }
  }, [disableAutoRefresh, existingWords, globalUsedWords]);

  // Handle option selection from radio group
  const handleOptionSelect = (optionId: string) => {
    setSelectedOption(optionId);
  };

  // Handle submit button click
  const handleSubmit = () => {
    if (selectedOption) {
      // Find the selected option
      const selectedItem = wordTemplateOptions.find(
        option => `${option.word}_${option.template || 'default'}` === selectedOption
      );
      
      if (selectedItem) {
        // Generate the actual sentence for this word and template
        let sentenceText = "";
        if (selectedItem.template) {
          sentenceText = selectedItem.template.replace(
            new RegExp(`\\$\\{${selectedItem.word}\\}`, 'g'), 
            selectedItem.word
          );
        }
        
        // Get contributor name from localStorage
        const contributor = localStorage.getItem('contributor-name') || 'ไม่ระบุชื่อ';
        
        // Save the sentence to the motivational sentences database
        storeSentenceInDatabase(selectedItem.word, sentenceText, contributor);
        
        // Add the selected word to the global used words
        setGlobalUsedWords(prev => [...prev, selectedItem.word]);
        
        // Trigger the motivational sentence event so other components can update
        const sentenceEvent = new CustomEvent('motivationalSentenceGenerated', {
          detail: { 
            sentence: sentenceText, 
            word: selectedItem.word,
            contributor: contributor,
            template: selectedItem.template
          }
        });
        window.dispatchEvent(sentenceEvent);
        
        // Pass the word and template to the parent component
        onSelectWord(selectedItem.word, selectedItem.template);
        setSelectedOption("");
        generateSuggestions();
      }
    }
  };
  
  // Store the sentence in the local database
  const storeSentenceInDatabase = (word: string, sentence: string, contributor: string) => {
    if (!sentence) return;
    
    const newEntry = {
      sentence,
      word,
      contributor: contributor || 'ไม่ระบุชื่อ',
      timestamp: new Date()
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

  // Get polarity display class
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

  // Get polarity Thai text
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
                      <span className={`text-xs px-2 py-1 rounded-full border ${getPolarityClass(option.polarity)}`}>
                        {getPolarityText(option.polarity)}
                      </span>
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
