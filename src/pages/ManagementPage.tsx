
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

const ManagementPage = () => {
  const [words, setWords] = useState<Word[]>([]);
  const [newWord, setNewWord] = useState('');
  const [newPolarity, setNewPolarity] = useState<'positive' | 'neutral' | 'negative'>('neutral');
  const [newScore, setNewScore] = useState<number>(0);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [name, setName] = useState('');
  const [newTemplate, setNewTemplate] = useState('');
  const [selectedWordForTemplate, setSelectedWordForTemplate] = useState('');
  const [templateWord, setTemplateWord] = useState('');
  const [templates, setTemplates] = useState<{[key: string]: string[]}>({});
  const [wordToEdit, setWordToEdit] = useState<Word | null>(null);
  const [editedPolarity, setEditedPolarity] = useState<'positive' | 'neutral' | 'negative'>('neutral');
  const [editedScore, setEditedScore] = useState<number>(0);
  const { toast } = useToast();

  // Load words from localStorage
  useEffect(() => {
    try {
      const savedName = localStorage.getItem('contributor-name');
      if (savedName) {
        setName(savedName);
      }
      
      const savedWords = localStorage.getItem('word-polarity-database');
      if (savedWords) {
        const parsedWords = JSON.parse(savedWords);
        setWords(parsedWords);
        
        // Extract templates
        const extractedTemplates: {[key: string]: string[]} = {};
        parsedWords.forEach((word: Word) => {
          if (word.templates && word.templates.length > 0) {
            extractedTemplates[word.word] = word.templates;
          }
        });
        setTemplates(extractedTemplates);
      }
      
      const savedQuotes = localStorage.getItem('motivation-sentences');
      if (savedQuotes) {
        try {
          const parsedQuotes = JSON.parse(savedQuotes);
          
          // Normalize data structure
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

  // Save contributor name
  const saveName = () => {
    if (name.trim()) {
      localStorage.setItem('contributor-name', name);
      toast({
        title: 'บันทึกชื่อสำเร็จ',
        description: `ชื่อ "${name}" ถูกบันทึกเรียบร้อยแล้ว`,
      });
    }
  };

  // Handle adding new word
  const handleAddWord = () => {
    if (!newWord.trim()) {
      toast({
        title: 'ไม่สามารถเพิ่มคำได้',
        description: 'กรุณากรอกคำที่ต้องการเพิ่ม',
        variant: 'destructive',
      });
      return;
    }
    
    // Check if word already exists
    const existingWord = words.find(w => w.word === newWord);
    if (existingWord) {
      toast({
        title: 'คำนี้มีอยู่แล้ว',
        description: `คำว่า "${newWord}" มีอยู่ในระบบแล้ว`,
        variant: 'destructive',
      });
      return;
    }
    
    // Create new word object
    const normalizedScore = newPolarity === 'positive' ? 1 : 
                           newPolarity === 'negative' ? -1 : 0;
    
    const newWordObj: Word = {
      word: newWord,
      polarity: newPolarity,
      score: newScore !== undefined ? newScore : normalizedScore,
      templates: []
    };
    
    // Update state and localStorage
    const updatedWords = [...words, newWordObj];
    setWords(updatedWords);
    localStorage.setItem('word-polarity-database', JSON.stringify(updatedWords));
    
    // Notify user
    toast({
      title: 'เพิ่มคำสำเร็จ',
      description: `คำว่า "${newWord}" ถูกเพิ่มเรียบร้อยแล้ว`,
    });
    
    // Reset form
    setNewWord('');
    setNewPolarity('neutral');
    setNewScore(0);
    
    // Dispatch event to notify other components
    window.dispatchEvent(new Event('word-database-updated'));
  };

  // Handle adding new template
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
    
    // Check if template includes the word
    if (!newTemplate.includes(`\${${templateWord}}`)) {
      toast({
        title: 'แม่แบบประโยคไม่ถูกต้อง',
        description: `กรุณาใส่ \${${templateWord}} ในแม่แบบประโยค`,
        variant: 'destructive',
      });
      return;
    }
    
    // Update templates state
    const updatedTemplates = { ...templates };
    if (!updatedTemplates[templateWord]) {
      updatedTemplates[templateWord] = [];
    }
    updatedTemplates[templateWord].push(newTemplate);
    setTemplates(updatedTemplates);
    
    // Update words state
    const updatedWords = words.map(word => {
      if (word.word === templateWord) {
        return {
          ...word,
          templates: updatedTemplates[templateWord]
        };
      }
      return word;
    });
    
    setWords(updatedWords);
    localStorage.setItem('word-polarity-database', JSON.stringify(updatedWords));
    
    // Notify user
    toast({
      title: 'เพิ่มแม่แบบประโยคสำเร็จ',
      description: `แม่แบบประโยคสำหรับคำว่า "${templateWord}" ถูกเพิ่มเรียบร้อยแล้ว`,
    });
    
    // Reset form
    setNewTemplate('');
    setTemplateWord('');
    
    // Dispatch event to notify other components
    window.dispatchEvent(new Event('word-database-updated'));
  };

  // Handle word selection for editing
  const handleSelectWordForEdit = (word: Word) => {
    setWordToEdit(word);
    setEditedPolarity(word.polarity);
    setEditedScore(word.score);
  };

  // Handle updating word
  const handleUpdateWord = () => {
    if (!wordToEdit) return;
    
    // Update the word
    const updatedWords = words.map(word => {
      if (word.word === wordToEdit.word) {
        return {
          ...word,
          polarity: editedPolarity,
          score: editedScore
        };
      }
      return word;
    });
    
    setWords(updatedWords);
    localStorage.setItem('word-polarity-database', JSON.stringify(updatedWords));
    
    // Notify user
    toast({
      title: 'แก้ไขคำสำเร็จ',
      description: `คำว่า "${wordToEdit.word}" ถูกแก้ไขเรียบร้อยแล้ว`,
    });
    
    // Reset form
    setWordToEdit(null);
    setEditedPolarity('neutral');
    setEditedScore(0);
    
    // Dispatch event to notify other components
    window.dispatchEvent(new Event('word-database-updated'));
  };

  // Handle deleting word
  const handleDeleteWord = (wordToDelete: string) => {
    // Remove the word
    const updatedWords = words.filter(word => word.word !== wordToDelete);
    
    setWords(updatedWords);
    localStorage.setItem('word-polarity-database', JSON.stringify(updatedWords));
    
    // Also remove from templates
    const updatedTemplates = { ...templates };
    delete updatedTemplates[wordToDelete];
    setTemplates(updatedTemplates);
    
    // Notify user
    toast({
      title: 'ลบคำสำเร็จ',
      description: `คำว่า "${wordToDelete}" ถูกลบเรียบร้อยแล้ว`,
    });
    
    // Close edit modal if we're deleting the word being edited
    if (wordToEdit && wordToEdit.word === wordToDelete) {
      setWordToEdit(null);
    }
    
    // Dispatch event to notify other components
    window.dispatchEvent(new Event('word-database-updated'));
  };

  // Map polarity to Thai translation
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

  // Handle polarity change and update score accordingly
  const handlePolarityChange = (polarity: 'positive' | 'neutral' | 'negative') => {
    setNewPolarity(polarity);
    
    // Set default score based on polarity
    if (polarity === 'positive') {
      setNewScore(1);
    } else if (polarity === 'negative') {
      setNewScore(-1);
    } else {
      setNewScore(0);
    }
  };

  // Handle edited polarity change and update score accordingly  
  const handleEditedPolarityChange = (polarity: 'positive' | 'neutral' | 'negative') => {
    setEditedPolarity(polarity);
    
    // Set default score based on polarity
    if (polarity === 'positive') {
      setEditedScore(1);
    } else if (polarity === 'negative') {
      setEditedScore(-1);
    } else {
      setEditedScore(0);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20 md:pb-10">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">จัดการคำและประโยคกำลังใจ</h1>
        
        <Tabs defaultValue="name" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="name">ชื่อผู้ให้กำลังใจ</TabsTrigger>
            <TabsTrigger value="words">คำ</TabsTrigger>
            <TabsTrigger value="templates">แม่แบบประโยค</TabsTrigger>
            <TabsTrigger value="settings">ตั้งค่า</TabsTrigger>
          </TabsList>
          
          {/* Name Tab */}
          <TabsContent value="name" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>ตั้งค่าชื่อผู้ให้กำลังใจ</CardTitle>
                <CardDescription>
                  ชื่อของคุณจะปรากฏเมื่อคุณสร้างประโยคให้กำลังใจ
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">ชื่อผู้ให้กำลังใจ</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="ระบุชื่อของคุณ"
                  />
                </div>
                <Button onClick={saveName}>บันทึกชื่อ</Button>
              </CardContent>
            </Card>
            
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
          </TabsContent>
          
          {/* Words Tab */}
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
                
                <div className="grid grid-cols-2 gap-4">
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
                        <SelectItem value="positive">เชิงบวก</SelectItem>
                        <SelectItem value="neutral">กลาง</SelectItem>
                        <SelectItem value="negative">เชิงลบ</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="score">คะแนน</Label>
                    <Input
                      id="score"
                      type="number"
                      value={newScore}
                      onChange={(e) => setNewScore(Number(e.target.value))}
                      placeholder="คะแนน"
                    />
                  </div>
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
                            แก้ไข
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteWord(word.word)}
                          >
                            ลบ
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
            
            {/* Edit Word Modal */}
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
                    <div className="grid grid-cols-2 gap-4">
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
                            <SelectItem value="positive">เชิงบวก</SelectItem>
                            <SelectItem value="neutral">กลาง</SelectItem>
                            <SelectItem value="negative">เชิงลบ</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="edit-score">คะแนน</Label>
                        <Input
                          id="edit-score"
                          type="number"
                          value={editedScore}
                          onChange={(e) => setEditedScore(Number(e.target.value))}
                          placeholder="คะแนน"
                        />
                      </div>
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
          
          {/* Templates Tab */}
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
                {Object.keys(templates).length > 0 ? (
                  <div className="space-y-4">
                    {Object.entries(templates).map(([word, wordTemplates]) => (
                      <div key={word} className="space-y-2">
                        <h3 className="font-semibold">คำ: {word}</h3>
                        <div className="space-y-2 pl-4">
                          {wordTemplates.map((template, idx) => (
                            <div key={idx} className="p-2 border rounded-md bg-slate-50">
                              <p>{template.replace(`\${${word}}`, word)}</p>
                            </div>
                          ))}
                        </div>
                        <Separator className="my-2" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground">ไม่มีแม่แบบประโยคในระบบ</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-4">
            <ClearDataButtons />
          </TabsContent>
        </Tabs>
      </main>
      
      <MobileFooter />
    </div>
  );
};

export default ManagementPage;
