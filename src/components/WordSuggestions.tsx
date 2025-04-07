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
  const [selectedWord, setSelectedWord] = useState<string>("");
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [isRefreshing, setIsRefreshing] = useState(false);

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
      
      // Filter out words that are already in existingWords
      const filteredWords = wordDatabase.filter(
        (word: any) => !existingWords.includes(word.word)
      );
      
      // Shuffle and take the first few words
      const shuffled = [...filteredWords].sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, 6);
      
      setSuggestedWords(selected);
      setSelectedWord("");
      setSelectedTemplate("");
      setIsRefreshing(false);
    }, 500);
  };

  // Initialize suggestions on component mount
  useEffect(() => {
    generateSuggestions();
    
    // Set up auto-refresh timer if not disabled
    if (!disableAutoRefresh) {
      const refreshInterval = setInterval(generateSuggestions, 60000);
      return () => clearInterval(refreshInterval);
    }
  }, [disableAutoRefresh, existingWords]);

  // Handle template selection
  const handleTemplateSelect = (template: string) => {
    setSelectedTemplate(template);
  };

  // Handle word selection from radio group
  const handleWordSelect = (word: string) => {
    setSelectedWord(word);
    
    // Find templates for the selected word
    const wordEntry = suggestedWords.find(w => w.word === word);
    if (wordEntry && wordEntry.templates && wordEntry.templates.length > 0) {
      setSelectedTemplate(wordEntry.templates[0]);
    } else {
      setSelectedTemplate("");
    }
  };

  // Handle submit button click
  const handleSubmit = () => {
    if (selectedWord) {
      onSelectWord(selectedWord, selectedTemplate);
      setSelectedWord("");
      setSelectedTemplate("");
      generateSuggestions();
    }
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

        {suggestedWords.length > 0 ? (
          <div className="space-y-4">
            <RadioGroup
              value={selectedWord}
              onValueChange={handleWordSelect}
              className="space-y-2"
            >
              {suggestedWords.map((suggestion) => (
                <div 
                  key={suggestion.word}
                  className={`flex items-center space-x-2 p-2 rounded-md border ${
                    selectedWord === suggestion.word 
                      ? 'border-primary bg-primary/5' 
                      : 'border-gray-200 hover:border-primary/50'
                  } transition-all duration-300`}
                >
                  <RadioGroupItem value={suggestion.word} id={suggestion.word} />
                  <Label 
                    htmlFor={suggestion.word} 
                    className="flex flex-1 justify-between items-center cursor-pointer"
                  >
                    <span className="font-medium">{suggestion.word}</span>
                    <span className={`text-xs px-2 py-1 rounded-full border ${getPolarityClass(suggestion.polarity)}`}>
                      {getPolarityText(suggestion.polarity)}
                    </span>
                  </Label>
                </div>
              ))}
            </RadioGroup>
            
            {selectedWord && showMultipleTemplates && (
              <div className="mt-4 space-y-2">
                <h4 className="text-sm font-medium">ประโยคตัวอย่าง:</h4>
                <RadioGroup 
                  value={selectedTemplate} 
                  onValueChange={handleTemplateSelect}
                  className="space-y-2"
                >
                  {suggestedWords
                    .find(w => w.word === selectedWord)?.templates?.map((template, idx) => {
                      const filledTemplate = template.replace(
                        new RegExp(`\\$\\{${selectedWord}\\}`, 'g'), 
                        selectedWord
                      );
                      
                      return (
                        <div 
                          key={idx} 
                          className={`flex items-center space-x-2 p-2 rounded-md border ${
                            selectedTemplate === template 
                              ? 'border-primary bg-primary/5' 
                              : 'border-gray-200 hover:border-primary/50'
                          } transition-all duration-300`}
                        >
                          <RadioGroupItem value={template} id={`template-${idx}`} />
                          <Label 
                            htmlFor={`template-${idx}`} 
                            className="text-sm cursor-pointer"
                          >
                            {filledTemplate}
                          </Label>
                        </div>
                      );
                    }) || []}
                </RadioGroup>
              </div>
            )}
            
            <Button 
              onClick={handleSubmit} 
              disabled={!selectedWord}
              className="w-full mt-4 gap-2"
            >
              <PlusCircle className="h-4 w-4" />
              ใช้คำนี้
            </Button>
          </div>
        ) : (
          <div className="text-center p-4 text-muted-foreground animate-pulse">
            กำลังโหลดคำแนะนำ...
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WordSuggestions;
