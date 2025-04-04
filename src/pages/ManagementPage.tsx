import Header from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Trash2, Plus, Download, Upload, RefreshCw, Heart, FileSpreadsheet } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import MobileFooter from "@/components/MobileFooter";
import BillboardLog from "@/components/BillboardLog";
import QuoteManagementTable from "@/components/QuoteManagementTable";
import WordSuggestions from "@/components/WordSuggestions";

const ManagementPage = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [templateInput, setTemplateInput] = useState<string>("");
  const [contributorName, setContributorName] = useState<string>("");
  const [activeTab, setActiveTab] = useState<string>("words");
  const [editingWord, setEditingWord] = useState<any>(null);
  
  useEffect(() => {
    const savedContributor = localStorage.getItem("contributor-name");
    if (savedContributor) {
      setContributorName(savedContributor);
    }
  }, []);
  
  const { data: words = [], isLoading } = useQuery({
    queryKey: ['encouragement-words'],
    queryFn: async () => {
      const storedWords = localStorage.getItem('encouragement-words');
      if (!storedWords) return [];
      return JSON.parse(storedWords);
    },
  });
  
  const { data: sentences = [] } = useQuery({
    queryKey: ['motivation-sentences'],
    queryFn: async () => {
      const storedSentences = localStorage.getItem('motivation-sentences');
      if (!storedSentences) return [];
      return JSON.parse(storedSentences);
    },
  });
  
  const quotes = sentences.map((sentence: any) => ({
    text: sentence.sentence,
    date: new Date(sentence.timestamp),
    userId: sentence.contributor
  }));
  
  const { data: wordDatabase = [], refetch: refetchWordDatabase } = useQuery({
    queryKey: ['word-polarity-database'],
    queryFn: async () => {
      const storedData = localStorage.getItem("word-polarity-database");
      if (!storedData) return [];
      return JSON.parse(storedData);
    },
  });
  
  const getTemplateForWord = (word: string): string => {
    const entry = wordDatabase.find((entry: any) => entry.word === word);
    if (entry?.templates && entry.templates.length > 0) {
      return entry.templates[0];
    }
    return "";
  };
  
  const { mutate: deleteWord } = useMutation({
    mutationFn: async (id: string) => {
      const storedWords = localStorage.getItem('encouragement-words');
      if (!storedWords) return;
      
      const words = JSON.parse(storedWords);
      const updatedWords = words.filter((word: any) => word.id !== id);
      
      localStorage.setItem('encouragement-words', JSON.stringify(updatedWords));
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['encouragement-words'] });
      
      toast({
        title: "คำถูกลบแล้ว",
        description: "คำได้ถูกลบออกจากระบบเรียบร้อยแล้ว",
      });
      
      window.dispatchEvent(new CustomEvent('word-database-updated'));
    },
  });
  
  const saveTemplate = (word: string, template: string) => {
    if (!template.trim()) {
      toast({
        title: "ต้องระบุประโยคกำลังใจ",
        description: "กรุณาระบุประโยคกำลังใจสำหรับคำนี้",
        variant: "destructive",
      });
      return;
    }
    
    let database = [];
    try {
      const storedData = localStorage.getItem("word-polarity-database");
      if (storedData) {
        database = JSON.parse(storedData);
      }
    } catch (e) {
      console.error("Error parsing word database:", e);
    }
    
    const existingEntryIndex = database.findIndex((entry: any) => entry.word === word);
    
    if (existingEntryIndex !== -1) {
      database[existingEntryIndex].templates = [template];
    } else {
      database.push({
        word: word,
        polarity: "positive",
        score: 2,
        templates: [template]
      });
    }
    
    localStorage.setItem("word-polarity-database", JSON.stringify(database));
    
    refetchWordDatabase();
    
    toast({
      title: "บันทึกประโยคกำลังใจสำเร็จ",
      description: `ประโยคกำลังใจสำหรับคำ "${word}" ถูกบันทึกแล้ว`,
    });
    
    setTemplateInput("");
    
    window.dispatchEvent(new CustomEvent('word-database-updated'));
  };
  
  const deleteSelected = () => {
    if (selectedItems.length === 0) return;
    
    selectedItems.forEach(id => {
      deleteWord(id);
    });
    
    setSelectedItems([]);
  };
  
  const toggleSelectItem = (id: string) => {
    setSelectedItems(prev => 
      prev.includes(id) 
        ? prev.filter(itemId => itemId !== id)
        : [...prev, id]
    );
  };
  
  const exportData = () => {
    const data = {
      words,
      sentences,
      wordDatabase,
      timestamp: new Date().toISOString(),
      version: "1.0"
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `คำลังใจ-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "ส่งออกข้อมูลสำเร็จ",
      description: "ข้อมูลทั้งหมดได้ถูกส่งออกเป็นไฟล์ JSON แล้ว",
    });
  };
  
  const clearAllData = () => {
    if (confirm("คุณแน่ใจหรือไม่ที่จะลบข้อมูลทั้งหมด? การกระทำนี้ไม่สามารถย้อนกลับได้")) {
      localStorage.removeItem('encouragement-words');
      localStorage.removeItem('motivation-sentences');
      localStorage.removeItem('word-polarity-database');
      
      queryClient.invalidateQueries();
      
      window.dispatchEvent(new CustomEvent('word-database-updated'));
      window.dispatchEvent(new CustomEvent('motivation-billboard-updated'));
      
      toast({
        title: "ลบข้อมูลทั้งหมดสำเร็จ",
        description: "ข้อมูลทั้งหมดได้ถูกลบออกจากระบบแล้ว",
        variant: "destructive",
      });
    }
  };
  
  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target?.result as string);
        
        if (importedData.words) {
          localStorage.setItem('encouragement-words', JSON.stringify(importedData.words));
        }
        
        if (importedData.sentences) {
          localStorage.setItem('motivation-sentences', JSON.stringify(importedData.sentences));
        }
        
        if (importedData.wordDatabase) {
          localStorage.setItem('word-polarity-database', JSON.stringify(importedData.wordDatabase));
        }
        
        queryClient.invalidateQueries();
        
        window.dispatchEvent(new CustomEvent('word-database-updated'));
        window.dispatchEvent(new CustomEvent('motivation-billboard-updated'));
        
        toast({
          title: "นำเข้าข้อมูลสำเร็จ",
          description: "ข้อมูลได้ถูกนำเข้าสู่ระบบเรียบร้อยแล้ว",
        });
      } catch (error) {
        toast({
          title: "เกิดข้อผิดพลาด",
          description: "ไม่สามารถนำเข้าข้อมูลได้ โปรดตรวจสอบไฟล์ของคุณ",
          variant: "destructive",
        });
      }
    };
    reader.readAsText(file);
    
    event.target.value = '';
  };
  
  const addNewWord = (word: string, contributor: string) => {
    if (!word || !contributor) {
      toast({
        title: "ข้อมูลไม่ครบถ้วน",
        description: "กรุณากรอกข้อมูลให้ครบทุกช่อง",
        variant: "destructive",
      });
      return;
    }
    
    const existingWords = words.map((w: any) => w.text.toLowerCase());
    if (existingWords.includes(word.toLowerCase())) {
      toast({
        title: "คำซ้ำ",
        description: "คำนี้มีอยู่ในระบบแล้ว",
        variant: "destructive",
      });
      return;
    }
    
    const newWord = {
      id: Date.now().toString(),
      text: word,
      contributor,
      timestamp: new Date(),
    };
    
    const updatedWords = [...words, newWord];
    localStorage.setItem('encouragement-words', JSON.stringify(updatedWords));
    
    queryClient.setQueryData(['encouragement-words'], updatedWords);
    
    window.dispatchEvent(new CustomEvent('word-database-updated'));
    
    toast({
      title: "คำใหม่ถูกเพิ่มแล้ว",
      description: `"${word}" ได้ถูกเพิ่มเข้าสู่ระบบแล้ว`,
    });
    
    localStorage.setItem("contributor-name", contributor);
  };
  
  const handleUseWord = (word: string) => {
    if (!contributorName) {
      toast({
        title: "โปรดระบุชื่อของคุณ",
        description: "กรุณาระบุชื่อของคุณก่อนเลือกคำ",
        variant: "destructive",
      });
      return;
    }
    
    const wordObj = words.find((w: any) => w.text === word);
    if (!wordObj) return;
    
    const template = getTemplateForWord(word);
    if (!template) {
      toast({
        title: "ยังไม่มีประโยคกำลังใจ",
        description: `คำ "${word}" ยังไม่มีประโยคกำลังใจกำหนดไว้ โปรดกำหนดก่อนใช้งาน`,
        variant: "destructive",
      });
      return;
    }
    
    const newSentence = {
      word,
      sentence: template,
      contributor: contributorName,
      timestamp: new Date()
    };
    
    let existingEntries = [];
    try {
      const storedSentences = localStorage.getItem('motivation-sentences');
      if (storedSentences) {
        existingEntries = JSON.parse(storedSentences);
        if (!Array.isArray(existingEntries)) {
          existingEntries = [existingEntries];
        }
      }
    } catch (error) {
      console.error("Error parsing stored sentences:", error);
    }
    
    const updatedEntries = [newSentence, ...existingEntries];
    localStorage.setItem('motivation-sentences', JSON.stringify(updatedEntries));
    
    queryClient.invalidateQueries({ queryKey: ['motivation-sentences'] });
    
    const sentenceEvent = new CustomEvent('motivationalSentenceGenerated', {
      detail: { 
        sentence: template,
        word,
        contributor: contributorName
      }
    });
    window.dispatchEvent(sentenceEvent);
    
    window.dispatchEvent(new CustomEvent('motivation-billboard-updated'));
    
    toast({
      title: "สร้างประโยคกำลังใจสำเร็จ",
      description: (
        <div className="mt-2">
          <p>คำ "<span className="text-[#F97316] font-semibold">{word}</span>" ได้ถูกใช้สร้างประโยคกำลังใจ</p>
          <p className="mt-1 font-medium">"{template}"</p>
        </div>
      ),
    });
    
    setActiveTab("quotes");
  };

  const exportMotivationToCSV = () => {
    if (!sentences || sentences.length === 0) {
      toast({
        title: "ไม่พบข้อมูล",
        description: "ไม่มีประโยคกำลังใจในระบบที่จะส่งออก",
        variant: "destructive",
      });
      return;
    }
    
    let csvContent = "ประโยค,คำ,ผู้สร้าง,วันที่\n";
    
    sentences.forEach((sentence: any) => {
      const date = new Date(sentence.timestamp).toLocaleString('th-TH');
      const escapedSentence = `"${sentence.sentence.replace(/"/g, '""')}"`;
      csvContent += `${escapedSentence},${sentence.word},${sentence.contributor || 'ไม่ระบุชื่อ'},${date}\n`;
    });
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ประโยคกำลังใจ-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "ส่งออกข้อมูลสำเร็จ",
      description: "ประวัติประโยคกำลังใจได้ถูกส่งออกเป็นไฟล์ CSV แล้ว",
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-orange-50 to-white pb-16 md:pb-0">
      <Header />
      
      <main className="flex-1 container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center mb-8">
            <Heart className="h-6 w-6 text-primary mr-2" />
            <h1 className="text-3xl md:text-4xl font-bold font-mitr">
              เพิ่มคำใหม่
            </h1>
          </div>
          
          <Tabs defaultValue="words" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="words">จัดการคำ</TabsTrigger>
              <TabsTrigger value="quotes">ประโยคกำลังใจ</TabsTrigger>
              <TabsTrigger value="billboard">ประวัติประโยคกำลังใจ</TabsTrigger>
              <TabsTrigger value="system">Settings</TabsTrigger>
            </TabsList>
            
            <TabsContent value="words" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>เพิ่มคำใหม่</CardTitle>
                  <CardDescription>
                    เพิ่มคำใหม่เข้าสู่ระบบโดยตรง พร้อมกำหนด Template ประโยคให้กำลังใจ
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    const text = formData.get('word') as string;
                    const polarity = formData.get('polarity') as string;
                    const template = formData.get('template') as string;
                    
                    const score = polarity === 'positive' ? 2 : 
                                polarity === 'neutral' ? 1 : -1;
                    
                    if (!text || !template || !polarity) {
                      toast({
                        title: "ข้อมูลไม่ครบถ้วน",
                        description: "กรุณากรอกข้อมูลให้ครบทุกช่อง",
                        variant: "destructive",
                      });
                      return;
                    }

                    if (editingWord) {
                      const storedData = localStorage.getItem("word-polarity-database");
                      let database = storedData ? JSON.parse(storedData) : [];
                      database = database.map((w: any) => 
                        w.word === editingWord.word
                          ? {
                              word: text,
                              polarity,
                              score,
                              templates: [template]
                            }
                          : w
                      );
                      
                      localStorage.setItem("word-polarity-database", JSON.stringify(database));
                      
                      queryClient.invalidateQueries({ queryKey: ['word-polarity-database'] });
                      
                      window.dispatchEvent(new CustomEvent('word-database-updated'));
                      
                      toast({
                        title: "คำถูกอัพเดทแล้ว",
                        description: `"${text}" ได้ถูกอัพเดทในระบบแล้ว`,
                      });

                      setEditingWord(null);
                    } else {
                      let database = [];
                      const storedData = localStorage.getItem("word-polarity-database");
                      if (storedData) {
                        database = JSON.parse(storedData);
                      }
                      
                      database.push({
                        word: text,
                        polarity,
                        score,
                        templates: [template]
                      });
                      
                      localStorage.setItem("word-polarity-database", JSON.stringify(database));
                      
                      queryClient.invalidateQueries({ queryKey: ['word-polarity-database'] });
                      
                      window.dispatchEvent(new CustomEvent('word-database-updated'));
                      
                      toast({
                        title: "คำใหม่ถูกเพิ่มแล้ว",
                        description: `"${text}" ได้ถูกเพิ่มเข้าสู่ระบบแล้ว`,
                      });
                    }
                    
                    e.currentTarget.reset();
                  }}>
                    <div className="grid gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="word">คำ</Label>
                        <Input 
                          id="word" 
                          name="word" 
                          placeholder="ใส่คำใหม่" 
                          defaultValue={editingWord?.word || ''}
                          required 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="polarity">ความรู้สึก</Label>
                        <select 
                          id="polarity" 
                          name="polarity" 
                          className="w-full px-3 py-2 border rounded-md"
                          defaultValue={editingWord?.polarity || ''}
                          required
                        >
                          <option value="">เลือกความรู้สึก</option>
                          <option value="positive">เชิงบวก (2 คะแนน)</option>
                          <option value="neutral">กลาง (1 คะแนน)</option>
                          <option value="negative">เชิงลบ (-1 คะแนน)</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="template">ประโยคกำลังใจ</Label>
                        <Textarea 
                          id="template" 
                          name="template" 
                          placeholder="ระบุประโยคกำลังใจสำหรับคำนี้" 
                          defaultValue={editingWord?.templates?.[0] || ''}
                          rows={2}
                          required
                        />
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">
                            หมายเหตุ: ใส่คำในรูปแบบ '{'{word}'}' เพื่อให้คำนั้นถูกไฮไลท์เป็นสีส้มในหน้าหลัก
                          </p>
                          <p className="text-xs text-orange-600">
                            ตัวอย่าง: ถ้าคำคือ "สู้" และต้องการไฮไลท์คำนี้ ให้พิมพ์ประโยค "{'{word}'} ต่อไปอย่างไม่ย่อท้อ" 
                            <br/>
                            ผลลัพธ์ในหน้าหลัก: <span className="text-[#F97316] font-semibold">สู้</span> ต่อไปอย่างไม่ย่อท้อ
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button type="submit" className="flex items-center gap-1">
                          <Plus className="h-4 w-4" />
                          <span>{editingWord ? 'อัพเดทคำ' : 'เพิ่มคำ'}</span>
                        </Button>
                        {editingWord && (
                          <Button 
                            type="button" 
                            variant="outline"
                            onClick={() => {
                              setEditingWord(null);
                              document.querySelector('form')?.reset();
                            }}
                          >
                            ยกเลิก
                          </Button>
                        )}
                      </div>
                    </div>
                  </form>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>คลังคำศัพท์</CardTitle>
                  <CardDescription>
                    รายการคำทั้งหมดในระบบ
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>คำ</TableHead>
                          <TableHead>ความรู้สึก</TableHead>
                          <TableHead>คะแนน</TableHead>
                          <TableHead>ประโยคกำลังใจ</TableHead>
                          <TableHead>ผู้สร้าง</TableHead>
                          <TableHead className="text-right">จัดการ</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {wordDatabase.map((entry: any) => {
                          const word = words.find((w: any) => w.text === entry.word);
                          return (
                            <TableRow key={entry.word}>
                              <TableCell className="font-medium">{entry.word}</TableCell>
                              <TableCell>
                                {entry.polarity === 'positive' ? 'เชิงบวก' : 
                                 entry.polarity === 'neutral' ? 'กลาง' : 'เชิงลบ'}
                              </TableCell>
                              <TableCell>{entry.score}</TableCell>
                              <TableCell className="max-w-[300px] truncate">
                                {entry.templates?.[0]}
                              </TableCell>
                              <TableCell>{word?.contributor || '-'}</TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => {
                                      setEditingWord({
                                        ...entry,
                                        contributor: word?.contributor
                                      });
                                      document.querySelector('form')?.scrollIntoView({ behavior: 'smooth' });
                                    }}
                                  >
                                    แก้ไข
                                  </Button>
                                  <Button 
                                    variant="destructive" 
                                    size="sm"
                                    onClick={() => {
                                      if (word) {
                                        deleteWord(word.id);
                                      }
                                      const database = wordDatabase.filter((w: any) => w.word !== entry.word);
                                      localStorage.setItem("word-polarity-database", JSON.stringify(database));
                                      queryClient.invalidateQueries({ queryKey: ['word-polarity-database'] });
                                    }}
                                  >
                                    ลบ
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="quotes" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>ประโยคกำลังใจทั้งหมด</CardTitle>
                  <CardDescription>
                    ประโยคกำลังใจที่ถูกสร้างโดยผู้ใช้ทั้งหมดในระบบ
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <QuoteManagementTable quotes={quotes} />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="billboard" className="space-y-4">
              <BillboardLog />
            </TabsContent>
            
            <TabsContent value="system" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Settings</CardTitle>
                  <CardDescription>
                    จัดการการตั้งค่าระบบ
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Export Data (JSON)</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">
                          ส่งออกข้อมูลทั้งหมดในระบบเป็นไฟล์ JSON
                        </p>
                        <Button onClick={exportData} className="w-full flex items-center gap-1">
                          <Download className="h-4 w-4" />
                          <span>Export JSON</span>
                        </Button>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Import Data (JSON)</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">
                          นำเข้าข้อมูลจากไฟล์ JSON
                        </p>
                        <div className="flex items-center gap-2">
                          <Input 
                            id="importFile" 
                            type="file" 
                            accept=".json" 
                            onChange={handleImport}
                            className="hidden"
                          />
                          <Button 
                            onClick={() => document.getElementById('importFile')?.click()}
                            className="w-full flex items-center gap-1"
                          >
                            <Upload className="h-4 w-4" />
                            <span>Import JSON</span>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Export ประวัติประโยคกำลังใจ (CSV)</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        ส่งออกประวัติประโยคกำลังใจทั้งหมดเป็นไฟล์ CSV
                      </p>
                      <Button 
                        onClick={exportMotivationToCSV} 
                        className="w-full flex items-center gap-1"
                      >
                        <FileSpreadsheet className="h-4 w-4" />
                        <span>Export ประวัติประโยคกำลังใจ (CSV)</span>
                      </Button>
                    </CardContent>
                  </Card>
                  
                  <Separator />
                  
                  <Card className="border-destructive">
                    <CardHeader>
                      <CardTitle className="text-base text-destructive">Reset ระบบ</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        ลบข้อมูลทั้งหมดในระบบ การกระทำนี้ไม่สามารถเรียกคืนได้
                      </p>
                      <Button 
                        variant="destructive" 
                        onClick={clearAllData}
                        className="w-full flex items-center gap-1"
                      >
                        <RefreshCw className="h-4 w-4" />
                        <span>Reset ระบบ</span>
                      </Button>
                    </CardContent>
                  </Card>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <footer className="bg-white py-6 border-t hidden md:block">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground">
            &copy; {new Date().getFullYear()} "คำ"ลังใจ - 
            โครงการสร้างกำลังใจร่วมกัน
          </p>
        </div>
      </footer>
      
      <MobileFooter />
    </div>
  );
};

export default ManagementPage;
