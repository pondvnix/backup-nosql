import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Edit, MoreHorizontal } from "lucide-react";
import WordAddModal from "./WordAddModal";
import WordEditModal from "./WordEditModal";
import WordConfirmDeleteModal from "./WordConfirmDeleteModal";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { 
  getWordDatabase, 
  updateWordDatabase, 
  getSentimentAnalysis,
  WordEntry,
  addWord
} from "@/utils/wordModeration";
import { wordPolarityDatabase as defaultWordDatabase } from "@/utils/sentenceAnalysis";

const WordManagement = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedWord, setSelectedWord] = useState<WordEntry | null>(null);
  const [wordDatabase, setWordDatabase] = useState<WordEntry[]>([]);
  const [filteredWords, setFilteredWords] = useState<WordEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    const loadDatabase = () => {
      try {
        const dbFromStorage = getWordDatabase();
        
        let database: WordEntry[] = [];
        if (dbFromStorage && Array.isArray(dbFromStorage) && dbFromStorage.length > 0) {
          database = dbFromStorage;
        } else {
          database = defaultWordDatabase.map(entry => ({
            word: entry.word,
            sentiment: entry.sentiment as "positive" | "neutral" | "negative",
            score: entry.score,
            isCustom: false,
            templates: [`${entry.word} เป็นสิ่งที่สำคัญในชีวิต`],
          }));
        }
        
        setWordDatabase(database);
        filterWords(database, searchQuery);
      } catch (error) {
        console.error("Error loading word database:", error);
        toast({
          title: "เกิดข้อผิดพลาด",
          description: "ไม่สามารถโหลดฐานข้อมูลคำได้",
          variant: "destructive"
        });
      }
    };
    
    loadDatabase();
    
    const handleDatabaseUpdated = () => {
      loadDatabase();
    };
    
    window.addEventListener('word-database-updated', handleDatabaseUpdated);
    
    return () => {
      window.removeEventListener('word-database-updated', handleDatabaseUpdated);
    };
  }, [toast, searchQuery]);

  const filterWords = (db: WordEntry[], query: string) => {
    if (!query.trim()) {
      setFilteredWords(db);
      return;
    }
    
    const filtered = db.filter(entry => 
      entry.word.toLowerCase().includes(query.toLowerCase())
    );
    
    setFilteredWords(filtered);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    filterWords(wordDatabase, query);
  };

  const saveDatabase = (newDatabase: WordEntry[]) => {
    try {
      updateWordDatabase(newDatabase);
      setWordDatabase(newDatabase);
      filterWords(newDatabase, searchQuery);
      
      window.dispatchEvent(new CustomEvent('word-database-updated'));
    } catch (error) {
      console.error("Error saving word database:", error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถบันทึกฐานข้อมูลคำได้",
        variant: "destructive"
      });
    }
  };

  const handleAddWord = (newWord: WordEntry) => {
    const exists = wordDatabase.some(entry => entry.word.toLowerCase() === newWord.word.toLowerCase());
    
    if (exists) {
      toast({
        title: "คำนี้มีอยู่แล้ว",
        description: `คำว่า "${newWord.word}" มีในฐานข้อมูลแล้ว`,
        variant: "destructive"
      });
      return;
    }
    
    const updatedDatabase = [
      ...wordDatabase,
      { 
        ...newWord,
        isCustom: true
      }
    ];
    
    saveDatabase(updatedDatabase);
    
    toast({
      title: "เพิ่มคำสำเร็จ",
      description: `เพิ่มคำว่า "${newWord.word}" เข้าสู่ฐานข้อมูลแล้ว`,
    });
    
    const wordEntry: WordEntry = {
      word: newWord.word,
      templates: newWord.templates || []
    };
    addWord(wordEntry);
    
    setIsAddModalOpen(false);
  };

  const handleEditWord = (updatedWord: WordEntry) => {
    if (!selectedWord) return;
    
    if (updatedWord.word.toLowerCase() !== selectedWord.word.toLowerCase()) {
      const exists = wordDatabase.some(entry => 
        entry.word.toLowerCase() === updatedWord.word.toLowerCase() && 
        entry.word.toLowerCase() !== selectedWord.word.toLowerCase()
      );
      
      if (exists) {
        toast({
          title: "คำนี้มีอยู่แล้ว",
          description: `คำว่า "${updatedWord.word}" มีในฐานข้อมูลแล้ว`,
          variant: "destructive"
        });
        return;
      }
    }
    
    const updatedDatabase = wordDatabase.map(entry => 
      entry.word.toLowerCase() === selectedWord.word.toLowerCase() 
        ? { ...updatedWord, isCustom: entry.isCustom || true }
        : entry
    );
    
    saveDatabase(updatedDatabase);
    
    toast({
      title: "แก้ไขคำสำเร็จ",
      description: `แก้ไขคำว่า "${selectedWord.word}" ��ป็น "${updatedWord.word}" แล้ว`,
    });
    
    setIsEditModalOpen(false);
    setSelectedWord(null);
  };

  const handleDeleteWord = () => {
    if (!selectedWord) return;
    
    const updatedDatabase = wordDatabase.filter(entry => 
      entry.word.toLowerCase() !== selectedWord.word.toLowerCase()
    );
    
    saveDatabase(updatedDatabase);
    
    toast({
      title: "ลบคำสำเร็จ",
      description: `ลบคำว่า "${selectedWord.word}" ออกจากฐานข้อมูลแล้ว`,
    });
    
    setIsDeleteModalOpen(false);
    setSelectedWord(null);
  };

  const totalWords = wordDatabase.length;
  const customWords = wordDatabase.filter(word => word.isCustom).length;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>จัดการคำ</span>
            <Button onClick={() => setIsAddModalOpen(true)}>
              <Plus className="h-4 w-4 mr-1" />
              เพิ่มคำใหม่
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <Badge variant="outline" className="bg-primary/10">
                  ทั้งหมด: {totalWords} คำ
                </Badge>
                <Badge variant="outline" className="bg-secondary/20">
                  คำที่เพิ่มเอง: {customWords} คำ
                </Badge>
              </div>
              <div className="relative">
                <Input 
                  placeholder="ค้นหาคำ..." 
                  value={searchQuery}
                  onChange={handleSearch}
                  className="max-w-xs"
                />
              </div>
            </div>
            
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>คำ</TableHead>
                    <TableHead className="hidden md:table-cell">จำนวนแม่แบบประโยค</TableHead>
                    <TableHead className="hidden md:table-cell">ประเภท</TableHead>
                    <TableHead className="w-[80px] text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredWords.length > 0 ? (
                    filteredWords.map((entry, index) => (
                      <TableRow key={`${entry.word}-${index}`}>
                        <TableCell className="font-medium">{entry.word}</TableCell>
                        <TableCell className="hidden md:table-cell">
                          {Array.isArray(entry.templates) ? entry.templates.length : 0}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {entry.isCustom ? 
                            <Badge variant="secondary">เพิ่มเอง</Badge> : 
                            <Badge variant="outline">ค่าเริ่มต้น</Badge>
                          }
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem 
                                onClick={() => {
                                  setSelectedWord(entry);
                                  setIsEditModalOpen(true);
                                }}
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                แก้ไข
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => {
                                  setSelectedWord(entry);
                                  setIsDeleteModalOpen(true);
                                }}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                ลบ
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center">
                        {searchQuery ? 
                          <p className="text-muted-foreground">ไม่พบคำที่ตรงกับการค้นหา</p> : 
                          <p className="text-muted-foreground">ยังไม่มีคำในฐานข้อมูล</p>
                        }
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>

      <WordAddModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onSave={handleAddWord} 
      />

      <WordEditModal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        onSave={handleEditWord} 
        word={selectedWord} 
      />

      <WordConfirmDeleteModal 
        isOpen={isDeleteModalOpen} 
        onClose={() => setIsDeleteModalOpen(false)} 
        onConfirm={handleDeleteWord} 
        word={selectedWord?.word || ""} 
      />
    </div>
  );
};

export default WordManagement;
