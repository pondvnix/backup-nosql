import { useState, useEffect, useRef } from "react";
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
import { getContributorName } from "@/utils/contributorManager";

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
  stringToTemplateObjects,
  addWord,
  getWordDatabase,
  updateWordDatabase,
  WordEntry
} from "../utils/wordModeration";
import { extractSentimentFromTemplate } from "../utils/sentimentConsistency";

const ManagementPage = () => {
  const { toast } = useToast();
  const [word, setWord] = useState("");
  const [allWords, setAllWords] = useState<WordEntry[]>([]);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [currentEditWord, setCurrentEditWord] = useState<WordEntry | null>(null);
  const [templateText, setTemplateText] = useState("");
  const [cursorPosition, setCursorPosition] = useState<number | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [deleteConfirmModalOpen, setDeleteConfirmModalOpen] = useState(false);
  const [wordToDelete, setWordToDelete] = useState<string | null>(null);
  const [hasTemplateError, setHasTemplateError] = useState(false);
  const [templateErrorMessage, setTemplateErrorMessage] = useState("");

  useEffect(() => {
    const loadWords = () => {
      try {
        const wordDatabaseData = getWordDatabase();
        setAllWords(wordDatabaseData);
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

  const addNewWord = () => {
    if (word.trim()) {
      const defaultTemplate = `${word.trim()} คือสิ่งสำคัญในชีวิต`;
      
      const contributor = getContributorName();
      
      addWordToDatabase(word.trim(), [`\${บวก}${defaultTemplate}`]);
      
      const newWordEntry: WordEntry = {
        word: word.trim(),
        templates: [`\${บวก}${defaultTemplate}`],
        isCustom: true
      };
      addWord(newWordEntry);
      
      const event = new CustomEvent('motivationalSentenceGenerated', {
        detail: {
          word: word.trim(),
          contributor: contributor,
          sentence: defaultTemplate,
          sentiment: 'positive'
        }
      });
      window.dispatchEvent(event);
      
      setWord("");
      
      const updatedWords = [...allWords, { 
        word: word.trim(), 
        templates: [`\${บวก}${defaultTemplate}`]
      }];
      
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
      const safeTemplates = Array.isArray(word.templates) 
        ? word.templates.filter(t => typeof t === 'string')
        : [];
      
      setTemplateText(safeTemplates.join(',\n'));
    } else {
      setTemplateText('');
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

    const templateStrings = parseTemplates(templateText);
    
    if (!checkTemplates(templateStrings)) {
      return;
    }
    
    const firstTemplateInfo = extractSentimentFromTemplate(templateStrings[0] || "");
    const firstTemplateSentiment = firstTemplateInfo.sentiment;
    const score = firstTemplateSentiment === 'positive' ? 1 : 
                 firstTemplateSentiment === 'negative' ? -1 : 0;
    
    updateWordPolarity(currentEditWord.word, score);
    
    const updatedWords = allWords.map(w => {
      if (w.word === currentEditWord.word) {
        return { 
          ...currentEditWord, 
          templates: templateStrings
        };
      }
      return w;
    });
    
    setAllWords(updatedWords);
    setEditModalOpen(false);
    
    const contributor = getContributorName();
    window.dispatchEvent(new CustomEvent('word-database-updated'));
    
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

  const getTemplateSentimentBadge = (templates?: string[]): React.ReactNode => {
    if (!templates || templates.length === 0) {
      return <Badge variant="secondary" className="ml-2">กลาง</Badge>;
    }
    
    const { sentiment } = extractSentimentFromTemplate(templates[0]);
    
    switch (sentiment) {
      case 'positive':
        return <Badge variant="success" className="ml-2">เชิงบวก</Badge>;
      case 'negative':
        return <Badge variant="destructive" className="ml-2">เชิงลบ</Badge>;
      default:
        return <Badge variant="secondary" className="ml-2">กลาง</Badge>;
    }
  };

  const getTemplateSentimentIcon = (templates?: string[]): React.ReactNode => {
    if (!templates || templates.length === 0) {
      return <Meh className="h-4 w-4 text-blue-500" />;
    }
    
    const { sentiment } = extractSentimentFromTemplate(templates[0]);
    
    switch (sentiment) {
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
    
    if (e.target && typeof e.target.selectionStart === 'number') {
      setCursorPosition(e.target.selectionStart);
    }
    
    const templates = parseTemplates(e.target.value);
    checkTemplates(templates);
  };

  const insertWordVariable = (word: string) => {
    if (!textareaRef || !textareaRef.current) return;
    
    const textarea = textareaRef.current;
    const startPos = textarea.selectionStart || 0;
    const endPos = textarea.selectionEnd || 0;
    
    const newText = 
      templateText.substring(0, startPos) + 
      `\${${word}}` + 
      templateText.substring(endPos);
    
    setTemplateText(newText);
    
    setTimeout(() => {
      if (textareaRef && textareaRef.current) {
        const newCursorPos = startPos + `\${${word}}`.length;
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  };

  const insertSentimentPlaceholder = (sentiment: TemplateSentiment) => {
    if (!textareaRef || !textareaRef.current) return;
    
    const textarea = textareaRef.current;
    const startPos = textarea.selectionStart || 0;
    const endPos = textarea.selectionEnd || 0;
    
    const placeholder = 
      sentiment === TemplateSentiment.POSITIVE ? '${บวก}' :
      sentiment === TemplateSentiment.NEGATIVE ? '${ลบ}' :
      '${กลาง}';
      
    const newText = 
      templateText.substring(0, startPos) + 
      placeholder + 
      templateText.substring(endPos);
    
    setTemplateText(newText);
    
    setTimeout(() => {
      if (textareaRef && textareaRef.current) {
        const newCursorPos = startPos + placeholder.length;
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  };

  const getSentimentInfo = (template: string | undefined): { text: string, sentiment: TemplateSentiment } => {
    if (!template || typeof template !== 'string') {
      return { text: '', sentiment: 'neutral' };
    }
    
    if (template.includes('${บวก}')) {
      return { text: template.replace('${บวก}', ''), sentiment: 'positive' };
    }
    if (template.includes('${กลาง}')) {
      return { text: template.replace('${กลาง}', ''), sentiment: 'neutral' };
    }
    if (template.includes('${ลบ}')) {
      return { text: template.replace('${ลบ}', ''), sentiment: 'negative' };
    }
    return { text: template, sentiment: 'positive' };
  };

  const getGroupedWords = (): Record<string, WordEntry[]> => {
    const groups: Record<string, WordEntry[]> = {};
    
    allWords.forEach(word => {
      const baseWord = word.word.replace(/-\d+$/, '');
      
      if (!groups[baseWord]) {
        groups[baseWord] = [];
      }
      
      groups[baseWord].push(word);
    });
    
    return groups;
  };

  const wordGroups = getGroupedWords();
  const groupedWordKeys = Object.keys(wordGroups).sort();

  return (
    <Layout>
      <div className="container max-w-4xl py-6 space-y-8 pb-24 md:pb-12">
        <h1 className="text-3xl font-bold text-center mb-6">จัดการระบบ</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>���ารจัดการคำและแม่แบบประโยค</CardTitle>
            <CardDescription>เพิ่ม แก้ไข หรือลบคำและแม่แบบประโยคในระบบ</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="border rounded-md p-4 bg-secondary/30">
              <h3 className="font-medium mb-3">เพิ่มคำใหม่</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3">
                  <div>
                    <Label htmlFor="word">คำ</Label>
                    <Input
                      id="word"
                      placeholder="ป้อนคำที่ต้องการเพิ่ม"
                      value={word}
                      onChange={(e) => setWord(e.target.value)}
                    />
                  </div>
                  <div className="flex items-end">
                    <Button onClick={addNewWord} className="w-full flex gap-2">
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
                          <th className="text-left py-2 px-3">ความรู้สึกแม่แบบ</th>
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
                                  {getTemplateSentimentIcon(wordEntry.templates)}
                                  <span className="ml-2">
                                    {wordEntry.templates && wordEntry.templates.length > 0 ? 
                                      getSentimentInfo(wordEntry.templates[0]).sentiment === 'positive' ? 'บวก' : 
                                      getSentimentInfo(wordEntry.templates[0]).sentiment === 'negative' ? 'ลบ' : 
                                      'กลาง'
                                      : 'กลาง'
                                    }
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
                แก้ไขแม่แบบประโยค คั่นแม่แบบด้วยเครื่องหมายคอมม่า (,) หรือการขึ้นบรรทัดใหม่
              </DialogDescription>
            </DialogHeader>
            
            {currentEditWord && (
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
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
                      onClick={() => insertSentimentPlaceholder(TemplateSentiment.POSITIVE)}
                    >
                      <Smile className="h-3 w-3 mr-1" />
                      เพิ่ม ${"{"}บวก{"}"}
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-800 border-blue-200"
                      onClick={() => insertSentimentPlaceholder(TemplateSentiment.NEUTRAL)}
                    >
                      <Meh className="h-3 w-3 mr-1" />
                      เพิ่ม ${"{"}กลาง{"}"}
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 bg-red-50 text-red-700 hover:bg-red-100 hover:text-red-800 border-red-200"
                      onClick={() => insertSentimentPlaceholder(TemplateSentiment.NEGATIVE)}
                    >
                      <Frown className="h-3 w-3 mr-1" />
                      เพิ่ม ${"{"}ลบ{"}"}
                    </Button>
                  </div>
                  
                  <div className="grid gap-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="templates">
                        แม่แบบประโยค (คั่นด้วย , หรือขึ้นบรรทัดใหม่)
                      </Label>
                    </div>
                  
                    <Textarea 
                      id="templates" 
                      placeholder={`ตัวอย่าง:\n\${บวก}${currentEditWord.word}ทำให้ชีวิตสดใส,\n\${กลาง}การมี${currentEditWord.word}ทำให้เรามีกำลังใจ,\n\${ลบ}ขาดซึ่ง${currentEditWord.word}ทำให้ท้อแท้`}
                      value={templateText}
                      onChange={handleTextareaChange}
                      rows={6}
                      ref={textareaRef}
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
                      <span>ใช้ ${"{"}คำ{"}"} สำหรับแทรกคำอัตโนมัติ เช่น ${"{" + (currentEditWord?.word || "คำ") + "}"} จะถูกแทนที่ด้วย {currentEditWord?.word || "คำ"}</span>
                      <span>ใช้ ${"{"}บวก{"}"}, ${"{"}กลาง{"}"}, ${"{"}ลบ{"}"} เพื่อกำหนดความรู้สึกให้กับแม่แบบประโยค</span>
                      <span>ใช้เครื่องหมายคอมม่า (,) หรือการขึ้นบรรทัดใหม่เพื่อแยกแม่แบบประโยคหลายประโยค</span>
                    </div>
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
