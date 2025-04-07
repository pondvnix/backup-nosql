
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
  parseTemplates
} from "../utils/wordModeration";
import { getWordPolarity } from "../utils/sentenceAnalysis";

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

  // Load all words
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
    
    // Listen for updates from other components
    window.addEventListener('word-database-updated', loadWords);
    
    return () => {
      window.removeEventListener('word-database-updated', loadWords);
    };
  }, []);

  const addWord = () => {
    if (word.trim()) {
      // Add word to database - now allowing duplicates
      const score = wordPolarity === 'positive' ? 1 : wordPolarity === 'negative' ? -1 : 0;
      addWordToDatabase(word.trim(), wordPolarity, score);
      
      // Clear input
      setWord("");
      
      // Reload words
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
    
    // Set template text from word if it exists - join with commas
    if (word.templates && word.templates.length > 0) {
      setTemplateText(word.templates.join(',\n'));
    } else {
      setTemplateText('');
    }
  };

  const checkTemplates = (templates: string[]): boolean => {
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

    // Process template text
    const templates = parseTemplates(templateText);
    
    // Check for duplicate templates
    if (!checkTemplates(templates)) {
      return;
    }
    
    // Update polarity in database
    updateWordPolarity(
      currentEditWord.word,
      currentEditWord.polarity,
      currentEditWord.score,
      templates
    );
    
    // Update state
    const updatedWords = allWords.map(w => {
      if (w.word === currentEditWord.word) {
        return { ...currentEditWord, templates };
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

  // Track textarea cursor position
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTemplateText(e.target.value);
    setCursorPosition(e.target.selectionStart);
    
    // Validate templates as user types
    const templates = parseTemplates(e.target.value);
    checkTemplates(templates);
  };

  const insertWordVariable = (word: string) => {
    if (!textareaRef) return;
    
    const startPos = textareaRef.selectionStart || 0;
    const endPos = textareaRef.selectionEnd || 0;
    
    // Insert ${word} at cursor position
    const newText = 
      templateText.substring(0, startPos) + 
      `\${${word}}` + 
      templateText.substring(endPos);
    
    setTemplateText(newText);
    
    // Set cursor position after inserted variable
    setTimeout(() => {
      if (textareaRef) {
        const newCursorPos = startPos + `\${${word}}`.length;
        textareaRef.focus();
        textareaRef.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  };

  // Group words by their base name (without suffixes)
  const getGroupedWords = () => {
    const wordGroups: Record<string, WordEntry[]> = {};

    allWords.forEach(wordEntry => {
      // Extract base word (without suffix)
      const baseWord = wordEntry.word.replace(/-\d+$/, '');
      
      if (!wordGroups[baseWord]) {
        wordGroups[baseWord] = [];
      }
      
      wordGroups[baseWord].push(wordEntry);
    });

    // Sort each group by word name
    Object.keys(wordGroups).forEach(baseWord => {
      wordGroups[baseWord].sort((a, b) => a.word.localeCompare(b.word));
    });

    return wordGroups;
  };

  const wordGroups = getGroupedWords();
  const groupedWordKeys = Object.keys(wordGroups).sort();

  return (
    <Layout>
      <div className="container max-w-4xl py-6 space-y-8 pb-24 md:pb-12">
        <h1 className="text-3xl font-bold text-center mb-6">จัดการระบบ</h1>
        
        {/* Unified Card for Word Management and Templates */}
        <Card>
          <CardHeader>
            <CardTitle>การจัดการคำและแม่แบบประโยค</CardTitle>
            <CardDescription>เพิ่ม แก้ไข หรือลบคำและแม่แบบประโยคในระบบ</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Word Addition Form */}
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
            
            {/* Word List */}
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
                                <span className="text-sm text-muted-foreground">
                                  {wordEntry.templates && wordEntry.templates.length > 0 
                                    ? `${wordEntry.templates.length} แม่แบบ` 
                                    : "ไม่มี"}
                                </span>
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
        
        {/* Edit Word Dialog */}
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
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8"
                      onClick={() => insertWordVariable(currentEditWord.word)}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      เพิ่มคำอัตโนมัติ ${"{"}คำ{"}"}
                    </Button>
                  </div>
                  <Textarea 
                    id="templates" 
                    placeholder={`ตัวอย่าง:\n${currentEditWord.word}ทำให้ชีวิตสดใส,\nการมี${currentEditWord.word}ทำให้เรามีกำลังใจ`}
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
                  
                  <p className="text-xs text-muted-foreground flex flex-col gap-1">
                    <span>ใช้ ${"{"}คำ{"}"} สำหรับแทรกคำอัตโนมัติ เช่น ${"{" + currentEditWord.word + "}"} จะถูกแทนที่ด้วย {currentEditWord.word}</span>
                    <span>ใช้เครื่องหมายคอมม่า (,) หรือการขึ้นบรรทัดใหม่เพื่อแยกแม่แบบประโยคหลายประโยค</span>
                  </p>
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
        
        {/* Delete Confirmation Dialog */}
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
