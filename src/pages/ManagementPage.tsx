import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { 
  Plus, Trash, Edit, ChevronDown, ChevronUp, 
  Smile, Meh, Frown, Check, AlertTriangle, RefreshCcw,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

// Components
import Layout from "../components/Layout";
import ClearDataButtons from "../components/ClearDataButtons";
import MotivationalSentence from "../components/MotivationalSentence";

// Utils
import { 
  addWordToDatabase, 
  updateWordPolarity, 
  deleteWord, 
  hasDuplicateTemplates,
  parseTemplates,
  Template,
  TemplateSentiment,
  templateObjectsToStrings,
  stringToTemplateObjects
} from "../utils/wordModeration";
import { getWordPolarity } from "../utils/sentenceAnalysis";
import { extractSentimentFromTemplate } from "../utils/sentimentConsistency";

interface WordEntry {
  word: string;
  polarity: 'positive' | 'neutral' | 'negative';
  score: number;
  templates?: string[];
}

const ManagementPage = () => {
  const { toast } = useToast();
  const [word, setWord] = useState("");
  const [wordPolarity, setWordPolarity] = useState<'positive' | 'neutral' | 'negative'>('neutral');
  const [allWords, setAllWords] = useState<WordEntry[]>([]);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [currentEditWord, setCurrentEditWord] = useState<WordEntry | null>(null);
  const [templateText, setTemplateText] = useState("");
  const [cursorPosition, setCursorPosition] = useState<number | null>(null);
  const [textareaRef, setTextareaRef] = useState<HTMLTextAreaElement | null>(null);
  const [deleteConfirmModalOpen, setDeleteConfirmModalOpen] = useState(false);
  const [wordToDelete, setWordToDelete] = useState<string | null>(null);
  const [hasTemplateError, setHasTemplateError] = useState(false);
  const [templateErrorMessage, setTemplateErrorMessage] = useState("");
  const [templateSentiment, setTemplateSentiment] = useState<TemplateSentiment>('positive');

  useEffect(() => {
    const loadWords = () => {
      try {
        const storedData = localStorage.getItem("word-polarity-database");
        if (storedData) {
          const parsedData = JSON.parse(storedData);
          setAllWords(parsedData);
        }
      } catch (e) {
        console.error("Error loading word database:", e);
      }
    };
    
    loadWords();
    
    window.addEventListener('word-database-updated', loadWords);
    
    return () => {
      window.removeEventListener('word-database-updated', loadWords);
    };
  }, []);

  const addWord = () => {
    if (word.trim()) {
      const score = wordPolarity === 'positive' ? 1 : wordPolarity === 'negative' ? -1 : 0;
      addWordToDatabase(word.trim(), wordPolarity, score);
      
      setWord("");
      
      const updatedWords = [...allWords, { word: word.trim(), polarity: wordPolarity, score }];
      setAllWords(updatedWords);
      
      toast({
        title: "เพิ่มคำสำเร็จ",
        description: `เพิ่มคำว่า "${word.trim()}" เข้าสู่ระบบแล้ว`,
      });
    } else {
      toast({
        title: "กรุณาระบุคำ",
        description: "คำไม่สามารถเป็นค่าว่างได้",
        variant: "destructive",
      });
    }
  };

  const editWord = (word: WordEntry) => {
    setCurrentEditWord(word);
    setEditModalOpen(true);
    setHasTemplateError(false);
    setTemplateErrorMessage("");
    
    if (word.templates && word.templates.length > 0) {
      const templates = stringToTemplateObjects(word.templates);
      const templateLines = templates.map(t => {
        const sentimentPrefix = 
          t.sentiment === 'positive' ? '${บวก}' :
          t.sentiment === 'negative' ? '${ลบ}' :
          '${กลาง}';
        return `${sentimentPrefix}${t.text}`;
      });
      setTemplateText(templateLines.join(',\n'));
      
      if (templates.length > 0) {
        setTemplateSentiment(templates[0].sentiment);
      }
    } else {
      setTemplateText('');
      setTemplateSentiment('positive');
    }
  };

  const checkTemplates = (templates: Template[]): boolean => {
    if (hasDuplicateTemplates(templates)) {
      setHasTemplateError(true);
      setTemplateErrorMessage("มีแม่แบบประโยคที่ซ้ำกัน กรุณาตรวจสอบ");
      return false;
    }
    
    setHasTemplateError(false);
    setTemplateErrorMessage("");
    return true;
  };

  const confirmEdit = () => {
    if (!currentEditWord) return;

    const templates = parseTemplates(templateText);
    
    if (!checkTemplates(templates)) {
      return;
    }
    
    updateWordPolarity(
      currentEditWord.word,
      currentEditWord.polarity,
      currentEditWord.score,
      templates
    );
    
    const updatedWords = allWords.map(w => {
      if (w.word === currentEditWord.word) {
        return { 
          ...currentEditWord, 
          templates: templateObjectsToStrings(templates) 
        };
      }
      return w;
    });
    
    setAllWords(updatedWords);
    setEditModalOpen(false);
    
    toast({
      title: "อัพเดทคำสำเร็จ",
      description: `อัพเดทคำว่า "${currentEditWord.word}" เรียบร้อยแล้ว`,
    });
  };

  const confirmDelete = () => {
    if (!wordToDelete) return;
    
    deleteWord(wordToDelete);
    
    const updatedWords = allWords.filter(w => w.word !== wordToDelete);
    setAllWords(updatedWords);
    
    toast({
      title: "ลบคำสำเร็จ",
      description: `ลบคำว่า "${wordToDelete}" ออกจากระบบแล้ว`,
    });
    
    setDeleteConfirmModalOpen(false);
    setWordToDelete(null);
  };

  const getPolarityColor = (polarity: string): string => {
    switch (polarity) {
      case 'positive':
        return 'text-green-500';
      case 'negative':
        return 'text-red-500';
      default:
        return 'text-blue-500';
    }
  };
  
  const getPolarityBadge = (polarity: string): React.ReactNode => {
    switch (polarity) {
      case 'positive':
        return <Badge variant="success" className="ml-2">เชิงบวก</Badge>;
      case 'negative':
        return <Badge variant="destructive" className="ml-2">เชิงลบ</Badge>;
      default:
        return <Badge variant="secondary" className="ml-2">กลาง</Badge>;
    }
  };

  const getPolarityIcon = (polarity: string): React.ReactNode => {
    switch (polarity) {
      case 'positive':
        return <Smile className="h-4 w-4 text-green-500" />;
      case 'negative':
        return <Frown className="h-4 w-4 text-red-500" />;
      default:
        return <Meh className="h-4 w-4 text-blue-500" />;
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTemplateText(e.target.value);
    setCursorPosition(e.target.selectionStart);
    
    const templates = parseTemplates(e.target.value);
    checkTemplates(templates);
  };

  const insertWordVariable = (word: string) => {
    if (!textareaRef) return;
    
    const startPos = textareaRef.selectionStart || 0;
    const endPos = textareaRef.selectionEnd || 0;
    
    const newText = 
      templateText.substring(0, startPos) + 
      `\${${word}}` + 
      templateText.substring(endPos);
    
    setTemplateText(newText);
    
    setTimeout(() => {
      if (textareaRef) {
        const newCursorPos = startPos + `\${${word}}`.length;
        textareaRef.focus();
        textareaRef.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  };

  const insertSentimentPlaceholder = (sentiment: TemplateSentiment) => {
    if (!textareaRef) return;
    
    const startPos = textareaRef.selectionStart || 0;
    const endPos = textareaRef.selectionEnd || 0;
    
    const placeholder = 
      sentiment === 'positive' ? '${บวก}' :
      sentiment === 'negative' ? '${ลบ}' :
      '${กลาง}';
      
    const newText = 
      templateText.substring(0, startPos) + 
      placeholder + 
      templateText.substring(endPos);
    
    setTemplateText(newText);
    
    setTimeout(() => {
      if (textareaRef) {
        const newCursorPos = startPos + placeholder.length;
        textareaRef.focus();
        textareaRef.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  };

  const getSentimentInfo = (template: string): { text: string, sentiment: TemplateSentiment } => {
    if (template.startsWith('${บวก}')) {
      return { text: template.replace('${บวก}', ''), sentiment: 'positive' };
    }
    if (template.startsWith('${กลาง}')) {
      return { text: template.replace('${กลาง}', ''), sentiment: 'neutral' };
    }
    if (template.startsWith('${ลบ}')) {
      return { text: template.replace('${ลบ}', ''), sentiment: 'negative' };
    }
    return { text: template, sentiment: 'positive' };
  };

  const wordGroups = getGroupedWords();
  const groupedWordKeys = Object.keys(wordGroups).sort();

  return (
    <Layout>
      <div className="container max-w-4xl py-6 space-y-8 pb-24 md:pb-12">
        <h1 className="text-3xl font-bold text-center mb-6">จัดการระบบ</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>การจัดการคำและแม่แบบประโยค</CardTitle>
            <CardDescription>เพิ่ม แก้ไข หรือลบคำและแม่แบบประโยคในระบบ</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="border rounded-md p-4 bg-secondary/30">
              <h3 className="font-medium mb-3">เพิ่มคำใหม่</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-[3fr_2fr_1fr] gap-3">
                  <div>
                    <Label htmlFor="word">คำ</Label>
                    <Input
                      id="word"
                      placeholder="ป้อนคำที่ต้องการเพิ่ม"
                      value={word}
                      onChange={(e) => setWord(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="polarity">ความรู้สึกของคำ</Label>
                    <ToggleGroup 
                      type="single" 
                      value={wordPolarity} 
                      onValueChange={(value) => {
                        if (value) setWordPolarity(value as 'positive' | 'neutral' | 'negative');
                      }}
                      className="border rounded-md justify-start p-1"
                    >
                      <ToggleGroupItem 
                        value="positive" 
                        className={cn(
                          "flex items-center gap-1",
                          wordPolarity === 'positive' && "bg-green-50 text-green-700"
                        )}
                      >
                        <Smile className="h-4 w-4" />
                        <span>บวก</span>
                      </ToggleGroupItem>
                      <ToggleGroupItem 
                        value="neutral"
                        className={cn(
                          "flex items-center gap-1",
                          wordPolarity === 'neutral' && "bg-blue-50 text-blue-700"
                        )}
                      >
                        <Meh className="h-4 w-4" />
                        <span>กลาง</span>
                      </ToggleGroupItem>
                      <ToggleGroupItem 
                        value="negative"
                        className={cn(
                          "flex items-center gap-1",
                          wordPolarity === 'negative' && "bg-red-50 text-red-700"
                        )}
                      >
                        <Frown className="h-4 w-4" />
                        <span>ลบ</span>
                      </ToggleGroupItem>
                    </ToggleGroup>
                  </div>
                  <div className="flex items-end">
                    <Button onClick={addWord} className="w-full flex gap-2">
                      <Plus className="h-4 w-4" />
                      <span>เพิ่มคำ</span>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-medium">คำทั้งหมดในระบบ ({allWords.length} คำ)</h3>
              
              {allWords.length > 0 ? (
                <div className="border rounded-md overflow-hidden">
                  <div className="max-h-96 overflow-y-auto">
                    <table className="w-full">
                      <thead className="bg-muted/50 sticky top-0">
                        <tr>
                          <th className="text-left py-2 px-3">คำ</th>
                          <th className="text-left py-2 px-3">ความรู้สึก</th>
                          <th className="text-left py-2 px-3">แม่แบบ</th>
                          <th className="text-center py-2 px-3">จัดการ</th>
                        </tr>
                      </thead>
                      <tbody>
                        {groupedWordKeys.map((baseWord, groupIndex) => {
                          const wordGroup = wordGroups[baseWord];
                          const isGrouped = wordGroup.length > 1;
                          
                          return wordGroup.map((wordEntry, itemIndex) => (
                            <tr 
                              key={wordEntry.word} 
                              className={cn(
                                groupIndex % 2 === 0 ? "bg-secondary/30" : "bg-white",
                                isGrouped && itemIndex > 0 && "border-t border-dashed border-gray-200"
                              )}
                            >
                              <td className="py-2 px-3">
                                <div className="font-medium flex items-center">
                                  {isGrouped && itemIndex === 0 && (
                                    <Badge variant="outline" className="mr-2">
                                      กลุ่ม
                                    </Badge>
                                  )}
                                  {wordEntry.word}
                                </div>
                              </td>
                              <td className="py-2 px-3">
                                <div className="flex items-center">
                                  {getPolarityIcon(wordEntry.polarity)}
                                  <span className={`ml-2 ${getPolarityColor(wordEntry.polarity)}`}>
                                    {wordEntry.polarity === 'positive' ? 'บวก' : 
                                     wordEntry.polarity === 'negative' ? 'ลบ' : 
                                     'กลาง'}
                                  </span>
                                </div>
                              </td>
                              <td className="py-2 px-3">
                                <div className="flex flex-wrap gap-1">
                                  {wordEntry.templates && wordEntry.templates.length > 0 ? (
                                    <div className="text-sm flex flex-col gap-1">
                                      <span className="text-muted-foreground">{wordEntry.templates.length} แม่แบบ</span>
                                      <div className="flex flex-wrap gap-1">
                                        {wordEntry.templates.slice(0, 2).map((template, idx) => {
                                          const { sentiment } = getSentimentInfo(template);
                                          return (
                                            <Badge 
                                              key={idx}
                                              variant={
                                                sentiment === 'positive' ? 'success' : 
                                                sentiment === 'negative' ? 'destructive' : 'secondary'
                                              }
                                              className="text-[0.65rem] h-5 truncate max-w-24"
                                            >
                                              {sentiment === 'positive' ? 'บวก' : 
                                               sentiment === 'negative' ? 'ลบ' : 'กลาง'}
                                            </Badge>
                                          );
                                        })}
                                        {wordEntry.templates.length > 2 && (
                                          <Badge variant="outline" className="text-[0.65rem] h-5">
                                            +{wordEntry.templates.length - 2}
                                          </Badge>
                                        )}
                                      </div>
                                    </div>
                                  ) : (
                                    <span className="text-sm text-muted-foreground">ไม่มี</span>
                                  )}
                                </div>
                              </td>
                              <td className="py-2 px-3">
                                <div className="flex justify-center gap-2">
                                  <Button 
                                    size="sm" 
                                    variant="ghost"
                                    onClick={() => editWord(wordEntry)}
                                    className="h-8 w-8 p-0"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="ghost" 
                                    onClick={() => {
                                      setWordToDelete(wordEntry.word);
                                      setDeleteConfirmModalOpen(true);
                                    }}
                                    className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                                  >
                                    <Trash className="h-4 w-4" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ));
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 bg-muted/20 rounded-md">
                  <p className="text-muted-foreground">ยังไม่มีคำในระบบ</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        <ClearDataButtons />
        
        <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Edit className="h-5 w-5" />
                แก้ไขคำ: {currentEditWord?.word}
              </DialogTitle>
              <DialogDescription>
                แก้ไขความรู้สึกของคำและแม่แบบประโยค คั่นแม่แบบด้วยเครื่องหมายคอมม่า (,) หรือการขึ้นบรรทัดใหม่
              </DialogDescription>
            </DialogHeader>
            
            {currentEditWord && (
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>ความรู้สึกของคำ</Label>
                  <ToggleGroup 
                    type="single" 
                    value={currentEditWord.polarity} 
                    onValueChange={(value) => {
                      if (!value) return;
                      const polarity = value as 'positive' | 'neutral' | 'negative';
                      const score = polarity === 'positive' ? 1 : 
                                   polarity === 'negative' ? -1 : 0;
                      
                      setCurrentEditWord({...currentEditWord, polarity, score});
                    }}
                    className="border rounded-md justify-start p-1"
                  >
                    <ToggleGroupItem 
                      value="positive" 
                      className={cn(
                        "flex items-center gap-1",
                        currentEditWord.polarity === 'positive' && "bg-green-50 text-green-700"
                      )}
                    >
                      <Smile className="h-4 w-4" />
                      <span>บวก</span>
                    </ToggleGroupItem>
                    <ToggleGroupItem 
                      value="neutral"
                      className={cn(
                        "flex items-center gap-1",
                        currentEditWord.polarity === 'neutral' && "bg-blue-50 text-blue-700"
                      )}
                    >
                      <Meh className="h-4 w-4" />
                      <span>กลาง</span>
                    </ToggleGroupItem>
                    <ToggleGroupItem 
                      value="negative"
                      className={cn(
                        "flex items-center gap-1",
                        currentEditWord.polarity === 'negative' && "bg-red-50 text-red-700"
                      )}
                    >
                      <Frown className="h-4 w-4" />
                      <span>ลบ</span>
                    </ToggleGroupItem>
                  </ToggleGroup>
                </div>
                
                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="templates">
                      แม่แบบประโยค (คั่นด้วย , หรือขึ้นบรรทัดใหม่)
                    </Label>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8"
                      onClick={() => insertWordVariable(currentEditWord.word)}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      เพิ่มคำอัตโนมัติ ${"{"}คำ{"}"}
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800 border-green-200"
                      onClick={() => insertSentimentPlaceholder('positive')}
                    >
                      <Smile className="h-3 w-3 mr-1" />
                      เพิ่ม ${"{"}บวก{"}"}
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-800 border-blue-200"
                      onClick={() => insertSentimentPlaceholder('neutral')}
                    >
                      <Meh className="h-3 w-3 mr-1" />
                      เพิ่ม ${"{"}กลาง{"}"}
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 bg-red-50 text-red-700 hover:bg-red-100 hover:text-red-800 border-red-200"
                      onClick={() => insertSentimentPlaceholder('negative')}
                    >
                      <Frown className="h-3 w-3 mr-1" />
                      เพิ่ม ${"{"}ลบ{"}"}
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>ความรู้สึกแม่แบบประโยคเริ่มต้น</Label>
                    <RadioGroup 
                      value={templateSentiment}
                      onValueChange={(value) => setTemplateSentiment(value as TemplateSentiment)}
                      className="flex space-x-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="positive" id="sentiment-positive" />
                        <Label htmlFor="sentiment-positive" className="flex items-center text-green-700">
                          <Smile className="h-4 w-4 mr-1" />
                          <span>บวก</span>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="neutral" id="sentiment-neutral" />
                        <Label htmlFor="sentiment-neutral" className="flex items-center text-blue-700">
                          <Meh className="h-4 w-4 mr-1" />
                          <span>กลาง</span>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="negative" id="sentiment-negative" />
                        <Label htmlFor="sentiment-negative" className="flex items-center text-red-700">
                          <Frown className="h-4 w-4 mr-1" />
                          <span>ลบ</span>
                        </Label>
                      </div>
                    </RadioGroup>
                    <p className="text-xs text-muted-foreground">ความรู้สึกนี้จะถูกใช้กับแม่แบบประโยคใหม่ที่ไม่มีการเพิ่ม ${"{"}บวก{"}"}, ${"{"}กลาง{"}"}, หรือ ${"{"}ลบ{"}"} ไว้</p>
                  </div>
                  
                  <Textarea 
                    id="templates" 
                    placeholder={`ตัวอย่าง:\n\${บวก}${currentEditWord.word}ทำให้ชีวิตสดใส,\n\${กลาง}การมี${currentEditWord.word}ทำให้เรามีกำลังใจ,\n\${ลบ}ขาดซึ่ง${currentEditWord.word}ทำให้ท้อแท้`}
                    value={templateText}
                    onChange={handleTextareaChange}
                    rows={6}
                    ref={(ref) => setTextareaRef(ref)}
                    className={cn(
                      "font-mono text-sm",
                      hasTemplateError && "border-red-500 focus-visible:ring-red-500"
                    )}
                  />
                  
                  {hasTemplateError && (
                    <div className="text-red-500 text-sm flex items-center gap-2 mt-1">
                      <AlertCircle className="h-4 w-4" />
                      {templateErrorMessage}
                    </div>
                  )}
                  
                  <div className="text-xs text-muted-foreground flex flex-col gap-1">
                    <span>ใช้ ${"{"}คำ{"}"} สำหรับแทรกคำอัตโนมัติ เช่น ${"{" + currentEditWord.word + "}"} จะถูกแทนที่ด้วย {currentEditWord.word}</span>
                    <span>ใช้ ${"{"}บวก{"}"}, ${"{"}กลาง{"}"}, ${"{"}ลบ{"}"} เพื่อกำหนดความรู้สึกให้กับแม่แบบประโยค</span>
                    <span>ใช้เครื่องหมายคอมม่า (,) หรือการขึ้นบรรทัดใหม่เพื่อแยกแม่แบบประโยคหลายประโยค</span>
                  </div>
                </div>
              </div>
            )}
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditModalOpen(false)}>ยกเลิก</Button>
              <Button 
                onClick={confirmEdit}
                disabled={hasTemplateError}
              >
                บันทึกการเปลี่ยนแปลง
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        <Dialog open={deleteConfirmModalOpen} onOpenChange={setDeleteConfirmModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="h-5 w-5" />
                ยืนยันการลบคำ
              </DialogTitle>
            </DialogHeader>
            
            <p>คุณต้องการลบคำว่า "<strong>{wordToDelete}</strong>" ออกจากระบบหรือไม่?</p>
            <p className="text-sm text-muted-foreground">
              การกระทำนี้ไม่สามารถยกเลิกได้ และจะลบแม่แบบประโยคที่เกี่ยวข้องออกด้วย
            </p>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteConfirmModalOpen(false)}>ยกเลิก</Button>
              <Button variant="destructive" onClick={confirmDelete}>ยืนยันการลบ</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default ManagementPage;
