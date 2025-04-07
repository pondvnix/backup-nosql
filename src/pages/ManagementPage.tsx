import React, { useState, useEffect } from "react";
import Header from "@/components/Header";
import MobileFooter from "@/components/MobileFooter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import MotivationQuoteTable from "@/components/MotivationQuoteTable";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import ClearDataButtons from "@/components/ClearDataButtons";
import { normalizeScoreAndPolarity } from "@/utils/sentimentConsistency";
import { Edit, Trash2 } from "lucide-react";

interface Word {
  word: string;
  polarity: 'positive' | 'neutral' | 'negative';
  score: number;
  templates?: string[];
}

interface Quote {
  text: string;
  date: Date;
  userId: string;
  word?: string;
  polarity?: 'positive' | 'neutral' | 'negative';
  score?: number;
}

interface Template {
  id: string;
  template: string;
  word: string;
}

const ManagementPage = () => {
  const [words, setWords] = useState<Word[]>([]);
  const [newWord, setNewWord] = useState('');
  const [newPolarity, setNewPolarity] = useState<'positive' | 'neutral' | 'negative'>('neutral');
  const [newScore, setNewScore] = useState<number>(0);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [newTemplate, setNewTemplate] = useState('');
  const [selectedWordForTemplate, setSelectedWordForTemplate] = useState('');
  const [templateWord, setTemplateWord] = useState('');
  const [templates, setTemplates] = useState<Template[]>([]);
  const [wordToEdit, setWordToEdit] = useState<Word | null>(null);
  const [editedPolarity, setEditedPolarity] = useState<'positive' | 'neutral' | 'negative'>('neutral');
  const [editedScore, setEditedScore] = useState<number>(0);
  const [templateToEdit, setTemplateToEdit] = useState<Template | null>(null);
  const [editedTemplate, setEditedTemplate] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    try {
      const savedWords = localStorage.getItem('word-polarity-database');
      if (savedWords) {
        const parsedWords = JSON.parse(savedWords);
        setWords(parsedWords);
        
        const extractedTemplates: Template[] = [];
        parsedWords.forEach((word: Word) => {
          if (word.templates && word.templates.length > 0) {
            word.templates.forEach((template: string) => {
              extractedTemplates.push({
                id: `${word.word}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
                template,
                word: word.word
              });
            });
          }
        });
        setTemplates(extractedTemplates);
      }
      
      const savedQuotes = localStorage.getItem('motivation-sentences');
      if (savedQuotes) {
        try {
          const parsedQuotes = JSON.parse(savedQuotes);
          
          const formattedQuotes: Quote[] = Array.isArray(parsedQuotes) 
            ? parsedQuotes.map((quote: any) => {
                const normalized = normalizeScoreAndPolarity({
                  text: quote.sentence,
                  date: quote.timestamp || new Date(),
                  userId: quote.contributor || 'Anonymous',
                  word: quote.word,
                  polarity: quote.polarity,
                  score: quote.score
                });
                
                return {
                  text: quote.sentence,
                  date: quote.timestamp || new Date(),
                  userId: quote.contributor || 'Anonymous',
                  word: quote.word,
                  polarity: normalized.polarity,
                  score: normalized.score
                };
              })
            : [{
                text: parsedQuotes.sentence,
                date: parsedQuotes.timestamp || new Date(),
                userId: parsedQuotes.contributor || 'Anonymous',
                word: parsedQuotes.word,
                polarity: parsedQuotes.polarity,
                score: parsedQuotes.score
              }];
          
          setQuotes(formattedQuotes);
        } catch (error) {
          console.error('Error parsing quotes:', error);
          setQuotes([]);
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  }, []);

  const handleAddWord = () => {
    if (!newWord.trim()) {
      toast({
        title: 'ไม่สามารถเพิ่มคำได้',
        description: 'กรุณากรอกคำที่ต้องการเพิ่ม',
        variant: 'destructive',
      });
      return;
    }
    
    let wordScore = 0;
    if (newPolarity === 'positive') wordScore = 1;
    else if (newPolarity === 'negative') wordScore = -1;
    
    const newWordObj: Word = {
      word: newWord,
      polarity: newPolarity,
      score: wordScore,
      templates: []
    };
    
    const updatedWords = [...words, newWordObj];
    setWords(updatedWords);
    localStorage.setItem('word-polarity-database', JSON.stringify(updatedWords));
    
    toast({
      title: 'เพิ่มคำสำเร็จ',
      description: `คำว่า "${newWord}" ถูกเพิ่มเรียบร้อยแล้ว`,
    });
    
    setNewWord('');
    setNewPolarity('neutral');
    setNewScore(0);
    
    window.dispatchEvent(new Event('word-database-updated'));
  };

  const handleAddTemplate = () => {
    if (!templateWord) {
      toast({
        title: 'กรุณาเลือกคำ',
        description: 'กรุณาเลือกคำที่ต้องการเพิ่มแม่แบบประโยค',
        variant: 'destructive',
      });
      return;
    }
    
    if (!newTemplate.trim()) {
      toast({
        title: 'กรุณากรอกแม่แบบประโยค',
        description: 'กรุณากรอกแม่แบบประโยคที่ต้องการเพิ่ม',
        variant: 'destructive',
      });
      return;
    }
    
    if (!newTemplate.includes(`\${${templateWord}}`)) {
      toast({
        title: 'แม่แบบประโยคไม่ถูกต้อง',
        description: `กรุณาใส่ \${${templateWord}} ในแม่แบบประโยค`,
        variant: 'destructive',
      });
      return;
    }
    
    const templateExists = templates.some(t => t.template === newTemplate);
    if (templateExists) {
      toast({
        title: 'แม่แบบประโยคนี้มีอยู่แล้ว',
        description: 'แม่แบบประโยคนี้มีอยู่ในระบบแล้ว',
        variant: 'destructive',
      });
      return;
    }
    
    const newTemplateObj: Template = {
      id: `${templateWord}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      template: newTemplate,
      word: templateWord
    };
    
    const updatedTemplates = [...templates, newTemplateObj];
    setTemplates(updatedTemplates);
    
    const updatedWords = words.map(word => {
      if (word.word === templateWord) {
        const wordTemplates = word.templates || [];
        return {
          ...word,
          templates: [...wordTemplates, newTemplate]
        };
      }
      return word;
    });
    
    setWords(updatedWords);
    localStorage.setItem('word-polarity-database', JSON.stringify(updatedWords));
    
    toast({
      title: 'เพิ่มแม่แบบประโยคสำเร็จ',
      description: `แม่แบบประโยคสำหรับคำว่า "${templateWord}" ถูกเพิ่มเรียบร้อยแล้ว`,
    });
    
    setNewTemplate('');
    setTemplateWord('');
    
    window.dispatchEvent(new Event('word-database-updated'));
  };

  const handleSelectWordForEdit = (word: Word) => {
    setWordToEdit(word);
    setEditedPolarity(word.polarity);
    setEditedScore(word.score);
  };

  const handleUpdateWord = () => {
    if (!wordToEdit) return;
    
    let updatedScore = 0;
    if (editedPolarity === 'positive') updatedScore = 1;
    else if (editedPolarity === 'negative') updatedScore = -1;
    
    const updatedWords = words.map(word => {
      if (word.word === wordToEdit.word) {
        return {
          ...word,
          polarity: editedPolarity,
          score: updatedScore
        };
      }
      return word;
    });
    
    setWords(updatedWords);
    localStorage.setItem('word-polarity-database', JSON.stringify(updatedWords));
    
    toast({
      title: 'แก้ไขคำสำเร็จ',
      description: `คำว่า "${wordToEdit.word}" ถูกแก้ไขเรียบร้อยแล้ว`,
    });
    
    setWordToEdit(null);
    setEditedPolarity('neutral');
    setEditedScore(0);
    
    window.dispatchEvent(new Event('word-database-updated'));
  };

  const handleDeleteWord = (wordToDelete: string) => {
    const updatedWords = words.filter(word => word.word !== wordToDelete);
    
    setWords(updatedWords);
    localStorage.setItem('word-polarity-database', JSON.stringify(updatedWords));
    
    const updatedTemplates = templates.filter(template => template.word !== wordToDelete);
    setTemplates(updatedTemplates);
    
    toast({
      title: 'ลบคำสำเร็จ',
      description: `คำว่า "${wordToDelete}" ถูกลบเรียบร้อยแล้ว`,
    });
    
    if (wordToEdit && wordToEdit.word === wordToDelete) {
      setWordToEdit(null);
    }
    
    window.dispatchEvent(new Event('word-database-updated'));
  };

  const handleSelectTemplateForEdit = (template: Template) => {
    setTemplateToEdit(template);
    setEditedTemplate(template.template);
  };

  const handleUpdateTemplate = () => {
    if (!templateToEdit) return;
    
    if (!editedTemplate.includes(`\${${templateToEdit.word}}`)) {
      toast({
        title: 'แม่แบบประโยคไม่ถูกต้อง',
        description: `กรุณาใส่ \${${templateToEdit.word}} ในแม่แบบประโยค`,
        variant: 'destructive',
      });
      return;
    }
    
    const templateExists = templates.some(t => 
      t.template === editedTemplate && 
      t.id !== templateToEdit.id
    );
    
    if (templateExists) {
      toast({
        title: 'แม่แบบประโยคนี้มีอยู่แล้ว',
        description: 'แม่แบบประโยคนี้มีอยู่ในระบบแล้ว',
        variant: 'destructive',
      });
      return;
    }
    
    const updatedTemplates = templates.map(template => {
      if (template.id === templateToEdit.id) {
        return {
          ...template,
          template: editedTemplate
        };
      }
      return template;
    });
    
    setTemplates(updatedTemplates);
    
    const updatedWords = words.map(word => {
      if (word.word === templateToEdit.word) {
        const oldTemplate = templateToEdit.template;
        const wordTemplates = word.templates || [];
        const templateIndex = wordTemplates.findIndex(t => t === oldTemplate);
        
        if (templateIndex !== -1) {
          const updatedTemplates = [...wordTemplates];
          updatedTemplates[templateIndex] = editedTemplate;
          return {
            ...word,
            templates: updatedTemplates
          };
        }
      }
      return word;
    });
    
    setWords(updatedWords);
    localStorage.setItem('word-polarity-database', JSON.stringify(updatedWords));
    
    toast({
      title: 'แก้ไขแม่แบบประโยคสำเร็จ',
      description: `แม่แบบประโยคถูกแก้ไขเรียบร้อยแล้ว`,
    });
    
    setTemplateToEdit(null);
    setEditedTemplate('');
    
    window.dispatchEvent(new Event('word-database-updated'));
  };

  const handleDeleteTemplate = (templateToDelete: Template) => {
    const updatedTemplates = templates.filter(template => template.id !== templateToDelete.id);
    setTemplates(updatedTemplates);
    
    const updatedWords = words.map(word => {
      if (word.word === templateToDelete.word) {
        const wordTemplates = word.templates || [];
        return {
          ...word,
          templates: wordTemplates.filter(t => t !== templateToDelete.template)
        };
      }
      return word;
    });
    
    setWords(updatedWords);
    localStorage.setItem('word-polarity-database', JSON.stringify(updatedWords));
    
    toast({
      title: 'ลบแม่แบบประโยคสำเร็จ',
      description: `แม่แบบประโยคถูกลบเรียบร้อยแล้ว`,
    });
    
    if (templateToEdit && templateToEdit.id === templateToDelete.id) {
      setTemplateToEdit(null);
    }
    
    window.dispatchEvent(new Event('word-database-updated'));
  };

  const getPolarityThai = (polarity: 'positive' | 'neutral' | 'negative') => {
    switch (polarity) {
      case 'positive':
        return 'เชิงบวก';
      case 'negative':
        return 'เชิงลบ';
      default:
        return 'กลาง';
    }
  };

  const handlePolarityChange = (polarity: 'positive' | 'neutral' | 'negative') => {
    setNewPolarity(polarity);
    
    if (polarity === 'positive') {
      setNewScore(1);
    } else if (polarity === 'negative') {
      setNewScore(-1);
    } else {
      setNewScore(0);
    }
  };

  const handleEditedPolarityChange = (polarity: 'positive' | 'neutral' | 'negative') => {
    setEditedPolarity(polarity);
    
    if (polarity === 'positive') {
      setEditedScore(1);
    } else if (polarity === 'negative') {
      setEditedScore(-1);
    } else {
      setEditedScore(0);
    }
  };

  const highlightWordInTemplate = (template: string, word: string) => {
    if (!template.includes(`\${${word}}`)) return template;
    
    return template.replace(
      `\${${word}}`, 
      `<span class="text-[#F97316] font-semibold">${word}</span>`
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20 md:pb-10">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">จัดการคำและประโยคกำลังใจ</h1>
        
        <Tabs defaultValue="templates" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="templates">แม่แบบประโยค</TabsTrigger>
            <TabsTrigger value="words">คำ</TabsTrigger>
            <TabsTrigger value="settings">ตั้งค่า</TabsTrigger>
          </TabsList>
          
          <TabsContent value="templates" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>เพิ่มแม่แบบประโยค</CardTitle>
                <CardDescription>
                  เพิ่มแม่แบบประโยคสำหรับคำที่มีอยู่ในระบบ
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="template-word">คำ</Label>
                  <Select 
                    value={templateWord} 
                    onValueChange={setTemplateWord}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="เลือกคำ" />
                    </SelectTrigger>
                    <SelectContent>
                      {words.map((word, index) => (
                        <SelectItem key={index} value={word.word}>
                          {word.word} ({getPolarityThai(word.polarity)})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="new-template">
                    แม่แบบประโยค <span className="text-sm text-muted-foreground">(ใช้ ${'{'}templateWord{'}'} เพื่อแทนที่คำในประโยค)</span>
                  </Label>
                  <Textarea
                    id="new-template"
                    value={newTemplate}
                    onChange={(e) => setNewTemplate(e.target.value)}
                    placeholder={`ตัวอย่าง: การมี\${${templateWord || 'คำ'}} ในชีวิตทำให้เรารู้สึกดีขึ้น`}
                    rows={3}
                  />
                </div>
                
                <Button onClick={handleAddTemplate} disabled={!templateWord}>เพิ่มแม่แบบประโยค</Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>แม่แบบประโยคทั้งหมด</CardTitle>
                <CardDescription>
                  รายการแม่แบบประโยคทั้งหมดที่มีในระบบ
                </CardDescription>
              </CardHeader>
              <CardContent>
                {templates.length > 0 ? (
                  <div className="space-y-6">
                    {words.filter(word => templates.some(t => t.word === word.word)).map((word) => (
                      <div key={word.word} className="space-y-2">
                        <h3 className="font-semibold">คำ: {word.word}</h3>
                        <div className="space-y-2">
                          {templates
                            .filter(template => template.word === word.word)
                            .map((template) => (
                              <div key={template.id} className="p-3 border rounded-md bg-slate-50 flex justify-between items-start">
                                <p className="mt-1" 
                                   dangerouslySetInnerHTML={{ 
                                     __html: highlightWordInTemplate(template.template, word.word) 
                                   }} 
                                />
                                <div className="flex gap-2 ml-4">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleSelectTemplateForEdit(template)}
                                  >
                                    <Edit className="h-4 w-4 mr-1" /> แก้ไข
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => handleDeleteTemplate(template)}
                                  >
                                    <Trash2 className="h-4 w-4 mr-1" /> ลบ
                                  </Button>
                                </div>
                              </div>
                            ))}
                        </div>
                        <Separator className="my-4" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground">ไม่มีแม่แบบประโยคในระบบ</p>
                )}
              </CardContent>
            </Card>
            
            {templateToEdit && (
              <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
                <Card className="w-full max-w-md mx-4">
                  <CardHeader>
                    <CardTitle>แก้ไขแม่แบบประโยค</CardTitle>
                    <CardDescription>
                      แก้ไขแม่แบบประโยคสำหรับคำ: {templateToEdit.word}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-template">
                        แม่แบบประโยค <span className="text-sm text-muted-foreground">(ใช้ ${'{'}templateToEdit.word{'}'} เพื่อแทนที่คำในประโยค)</span>
                      </Label>
                      <Textarea
                        id="edit-template"
                        value={editedTemplate}
                        onChange={(e) => setEditedTemplate(e.target.value)}
                        placeholder={`ตัวอย่าง: การมี\${${templateToEdit.word}} ในชีวิตทำให้เรารู้สึกดีขึ้น`}
                        rows={3}
                      />
                    </div>
                    
                    <div className="flex justify-end gap-2 mt-4">
                      <Button
                        variant="outline"
                        onClick={() => setTemplateToEdit(null)}
                      >
                        ยกเลิก
                      </Button>
                      <Button onClick={handleUpdateTemplate}>บันทึก</Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="words" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>เพิ่มคำใหม่</CardTitle>
                <CardDescription>
                  เพิ่มคำใหม่เพื่อใช้ในการสร้างประโยคให้กำลังใจ
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new-word">คำ</Label>
                  <Input
                    id="new-word"
                    value={newWord}
                    onChange={(e) => setNewWord(e.target.value)}
                    placeholder="ระบุคำที่ต้องการเพิ่ม"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="polarity">ความรู้สึก</Label>
                  <Select 
                    value={newPolarity} 
                    onValueChange={(value) => handlePolarityChange(value as 'positive' | 'neutral' | 'negative')}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="เลือกความรู้สึก" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="positive">เชิงบวก (+1)</SelectItem>
                      <SelectItem value="neutral">กลาง (0)</SelectItem>
                      <SelectItem value="negative">เชิงลบ (-1)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Button onClick={handleAddWord}>เพิ่มคำ</Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>คำทั้งหมด</CardTitle>
                <CardDescription>
                  รายการคำทั้งหมดที่มีในระบบ
                </CardDescription>
              </CardHeader>
              <CardContent>
                {words.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {words.map((word, index) => (
                      <div
                        key={index}
                        className="p-3 border rounded-md flex justify-between items-center"
                      >
                        <div>
                          <p className="font-medium">{word.word}</p>
                          <div className="flex items-center text-xs text-muted-foreground">
                            <span>ความรู้สึก: {getPolarityThai(word.polarity)}</span>
                            <span className="mx-1">|</span>
                            <span>คะแนน: {word.score}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSelectWordForEdit(word)}
                          >
                            <Edit className="h-4 w-4 mr-1" /> แก้ไข
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteWord(word.word)}
                          >
                            <Trash2 className="h-4 w-4 mr-1" /> ลบ
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground">ไม่มีคำในระบบ</p>
                )}
              </CardContent>
            </Card>
            
            {wordToEdit && (
              <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
                <Card className="w-full max-w-md mx-4">
                  <CardHeader>
                    <CardTitle>แก้ไขคำ: {wordToEdit.word}</CardTitle>
                    <CardDescription>
                      แก้ไขความรู้สึกและคะแนนของคำ
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-polarity">ความรู้สึก</Label>
                      <Select 
                        value={editedPolarity} 
                        onValueChange={(value) => handleEditedPolarityChange(value as 'positive' | 'neutral' | 'negative')}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="เลือกความรู้สึก" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="positive">เชิงบวก (+1)</SelectItem>
                          <SelectItem value="neutral">กลาง (0)</SelectItem>
                          <SelectItem value="negative">เชิงลบ (-1)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex justify-end gap-2 mt-4">
                      <Button
                        variant="outline"
                        onClick={() => setWordToEdit(null)}
                      >
                        ยกเลิก
                      </Button>
                      <Button onClick={handleUpdateWord}>บันทึก</Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>ประวัติประโยคกำลังใจ</CardTitle>
                <CardDescription>
                  ประโยคกำลังใจทั้งหมดที่เคยสร้าง
                </CardDescription>
              </CardHeader>
              <CardContent>
                <MotivationQuoteTable quotes={quotes} showAllUsers={true} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>ล้างข้อมูล</CardTitle>
                <CardDescription>
                  ล้างข้อมูลต่างๆ ในระบบ
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ClearDataButtons />
                <div className="mt-4">
                  <h3 className="font-medium mb-2">ล้าง Cache และ Cookies</h3>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        localStorage.clear();
                        toast({
                          title: "ล้าง Local Storage สำเร็จ",
                          description: "ข้อมูลใน Local Storage ทั้งหมดถูกล้างแล้ว",
                        });
                      }}
                    >
                      ล้าง Local Storage
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        document.cookie.split(";").forEach(function(c) {
                          document.cookie = c.replace(/^ +/, "").replace(/=.*/, 
                            "=;expires=" + new Date().toUTCString() + ";path=/");
                        });
                        toast({
                          title: "ล้าง Cookies สำเร็จ",
                          description: "Cookies ทั้งหมดถูกล้างแล้ว",
                        });
                      }}
                    >
                      ล้าง Cookies
                    </Button>
                    
                    <Button 
                      variant="destructive" 
                      onClick={() => {
                        if (window.confirm("คุณแน่ใจหรือไม่ที่จะล้างข้อมูลทั้งหมด (Cache และ Cookies)?")) {
                          localStorage.clear();
                          document.cookie.split(";").forEach(function(c) {
                            document.cookie = c.replace(/^ +/, "").replace(/=.*/, 
                              "=;expires=" + new Date().toUTCString() + ";path=/");
                          });
                          toast({
                            title: "ล้างข้อมูลทั้งหมดสำเร็จ",
                            description: "Cache และ Cookies ทั้งหมดถูกล้างแล้ว โปรดรีเฟรชหน้าเว็บ",
                          });
                          setTimeout(() => {
                            window.location.reload();
                          }, 1500);
                        }
                      }}
                    >
                      ล้างข้อมูลทั้งหมด
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      
      <MobileFooter />
    </div>
  );
};

export default ManagementPage;
