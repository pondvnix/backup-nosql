
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { wordPolarityDatabase } from "@/utils/sentenceAnalysis";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, Smile, Meh, Frown } from "lucide-react";
import { extractSentimentFromTemplate, analyzeSentimentFromSentence } from "@/utils/sentimentConsistency";
import { isTemplateUsed, markTemplateAsUsed, getAvailableTemplatesForWord } from "@/utils/templateTracker";

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
  
  // Initialize with provided sentence if available
  useEffect(() => {
    if (sentence) {
      setDisplaySentence(sentence);
      setShowSentence(true);
    } else if (currentSentence) {
      setDisplaySentence(currentSentence);
      setShowSentence(true);
    }
  }, [sentence, currentSentence]);
  
  // Watch for changes in selectedWords and update the generatedSentences state
  useEffect(() => {
    if (selectedWords.length > 0) {
      // Get the most recently added word
      const latestWord = selectedWords[selectedWords.length - 1];
      
      // Only generate a new sentence if we have a new word
      if (latestWord && !generatedSentences.some(s => s.word === latestWord)) {
        const newSentence = generateEncouragingSentence(latestWord);
        
        // Add the new sentence to our state
        setGeneratedSentences(prev => [
          ...prev, 
          { word: latestWord, sentence: newSentence }
        ]);
      }
    }
  }, [selectedWords]);

  // Listen for motivational sentence events from other components
  useEffect(() => {
    const handleSentenceGenerated = (event: CustomEvent) => {
      if (event.detail && event.detail.sentence) {
        setDisplaySentence(event.detail.sentence);
        setShowSentence(true);
        
        // Track the sentiment type if available
        if (event.detail.sentiment) {
          setSentimentType(event.detail.sentiment);
        }
        
        // Mark the template as used if available
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

  // Set the display sentence when explicitly triggered
  useEffect(() => {
    if (shouldDisplay) {
      setShowSentence(true);
    }
  }, [shouldDisplay]);
  
  // Generate an encouraging sentence with the selected word
  const generateEncouragingSentence = (word: string): string => {
    // Try to get custom templates from localStorage first
    let storedDatabase = [];
    try {
      const storedData = localStorage.getItem("word-polarity-database");
      if (storedData) {
        storedDatabase = JSON.parse(storedData);
      }
    } catch (e) {
      console.error("Error parsing stored word database:", e);
    }
    
    // Combine default database with stored database
    const combinedDatabase = storedDatabase.length > 0 ? storedDatabase : wordPolarityDatabase;
    
    // Find word templates
    const wordEntry = combinedDatabase.find(entry => entry.word === word);
    
    // Get templates for this word if available, otherwise use default templates
    if (wordEntry?.templates && wordEntry.templates.length > 0) {
      // Get available templates (not used yet)
      const availableTemplates = wordEntry.templates.filter(template => !isTemplateUsed(word, template));
      
      // If there are unused templates, pick one randomly
      if (availableTemplates.length > 0) {
        const randomIndex = Math.floor(Math.random() * availableTemplates.length);
        const selectedTemplate = availableTemplates[randomIndex];
        
        // Extract sentiment from the template
        const { sentiment, text } = extractSentimentFromTemplate(selectedTemplate);
        setSentimentType(sentiment);
        
        // Mark this template as used
        markTemplateAsUsed(word, selectedTemplate);
        
        return text.replace(new RegExp(`\\$\\{${word}\\}`, 'g'), word);
      }
      
      // If all templates are used, fall back to the first template
      const firstTemplate = wordEntry.templates[0];
      const { sentiment, text } = extractSentimentFromTemplate(firstTemplate);
      setSentimentType(sentiment);
      
      return text.replace(new RegExp(`\\$\\{${word}\\}`, 'g'), word);
    }
    
    // Default templates based on sentiment
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
    
    // Get all available templates
    const allTemplateTypes = [positiveTemplates, neutralTemplates, negativeTemplates];
    const allTemplates = allTemplateTypes.flat();
    
    // Filter out used templates
    const availableTemplates = allTemplates.filter(template => !isTemplateUsed(word, template));
    
    // If there are unused templates, pick one randomly
    if (availableTemplates.length > 0) {
      const randomIndex = Math.floor(Math.random() * availableTemplates.length);
      const selectedTemplate = availableTemplates[randomIndex];
      
      // Extract sentiment from the template
      const { sentiment, text } = extractSentimentFromTemplate(selectedTemplate);
      setSentimentType(sentiment);
      
      // Mark this template as used
      markTemplateAsUsed(word, selectedTemplate);
      
      // Replace word placeholder with actual word
      return text.replace(/\$\{word\}/g, word);
    }
    
    // If all templates are used, fall back to a random one
    const randomTypeIndex = Math.floor(Math.random() * allTemplateTypes.length);
    const templates = allTemplateTypes[randomTypeIndex];
    const randomIndex = Math.floor(Math.random() * templates.length);
    const selectedTemplate = templates[randomIndex];
    
    // Extract sentiment from the template
    const { sentiment, text } = extractSentimentFromTemplate(selectedTemplate);
    setSentimentType(sentiment);
    
    // Replace word placeholder with actual word
    return text.replace(/\$\{word\}/g, word);
  };

  // Highlight the selected words in the sentence
  const highlightWords = (sentence: string, words: string[]): React.ReactNode => {
    if (!sentence) return null;
    
    let parts: React.ReactNode[] = [sentence];
    
    // Highlight each word
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
            // This part doesn't match the word
            if (text) newParts.push(text);
          } else {
            // This part matches the word
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

  // Expose method to be called from WordSuggestions
  React.useEffect(() => {
    // Attach the method to window object to make it globally accessible
    (window as any).showMotivationalSentence = (word: string, contributor?: string, template?: string) => {
      let sentence = "";
      let actualTemplate = template;
      
      if (template) {
        // Use the provided template to generate the sentence
        // Extract sentiment from the template
        const { sentiment, text } = extractSentimentFromTemplate(template);
        setSentimentType(sentiment);
        
        // Replace word placeholder with actual word
        sentence = text.replace(new RegExp(`\\$\\{${word}\\}`, 'g'), word);
        
        // Mark this template as used
        markTemplateAsUsed(word, template);
      } else {
        // Get the sentence from the generated sentences or generate a new one
        const sentenceEntry = generatedSentences.find(s => s.word === word);
        sentence = sentenceEntry ? sentenceEntry.sentence : generateEncouragingSentence(word);
      }
      
      setDisplaySentence(sentence);
      setShowSentence(true);
      
      // Get contributor name from localStorage or use provided value or default
      let contributorName = localStorage.getItem('contributor-name') || contributor || 'ไม่ระบุชื่อ';
      contributorName = contributorName.trim() ? contributorName.trim() : 'ไม่ระบุชื่อ';
      
      // Generate a unique ID for this sentence
      const uniqueId = `${word}-${sentence}-${contributorName}-${Date.now()}`;
      
      // Dispatch event so other components can listen - include contributor and sentiment info
      const sentenceEvent = new CustomEvent('motivationalSentenceGenerated', {
        detail: { 
          sentence: sentence, 
          word,
          contributor: contributorName,
          template: actualTemplate,
          sentiment: sentimentType,
          id: uniqueId
        }
      });
      window.dispatchEvent(sentenceEvent);
      
      toast({
        title: "ประโยคให้กำลังใจ",
        description: `แสดงประโยคให้กำลังใจที่มีคำว่า "${word}"`,
      });
    };
    
    return () => {
      // Clean up
      delete (window as any).showMotivationalSentence;
    };
  }, [generatedSentences, toast, sentimentType]);

  // Get sentiment icon based on sentiment type
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

  // Get badge variant based on sentiment type
  const getSentimentBadgeVariant = () => {
    switch (sentimentType) {
      case 'positive':
        return 'success';
      case 'negative':
        return 'destructive';
      case 'neutral':
        return 'secondary';
      default:
        return 'secondary';
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
