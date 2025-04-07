
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Smile, Meh, Frown, Clock, FilePlus } from "lucide-react";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

interface MotivationalSentence {
  word: string;
  sentence: string;
  contributor?: string;
  timestamp: Date | string | number;
  template?: string;
  sentiment?: 'positive' | 'neutral' | 'negative';
  score?: number;
}

const BillboardLog = () => {
  const [sentences, setSentences] = useState<MotivationalSentence[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const sentencesPerPage = 10;
  
  const loadSentences = () => {
    try {
      const stored = localStorage.getItem('motivation-sentences');
      if (stored) {
        const parsedSentences = JSON.parse(stored);
        
        // Remove duplicates and sort by timestamp (newest first)
        const uniqueSentences = removeDuplicateSentences(parsedSentences);
        const sortedSentences = uniqueSentences.sort((a, b) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        
        setSentences(sortedSentences);
      }
    } catch (error) {
      console.error("Error loading sentences:", error);
    }
  };
  
  // Improved function to remove duplicates based on word, sentence, and contributor combination
  const removeDuplicateSentences = (sentences: MotivationalSentence[]): MotivationalSentence[] => {
    const uniqueMap = new Map<string, MotivationalSentence>();
    
    sentences.forEach(sentence => {
      // Create a unique key using word, sentence content, and contributor 
      const uniqueKey = `${sentence.word}-${sentence.sentence}-${sentence.contributor || 'ไม่ระบุชื่อ'}`;
      
      if (!uniqueMap.has(uniqueKey) || 
          new Date(sentence.timestamp).getTime() > new Date(uniqueMap.get(uniqueKey)!.timestamp).getTime()) {
        // Standardize contributor name if not provided
        if (!sentence.contributor || sentence.contributor.trim() === '') {
          sentence.contributor = 'ไม่ระบุชื่อ';
        }
        uniqueMap.set(uniqueKey, sentence);
      }
    });
    
    return Array.from(uniqueMap.values());
  };
  
  useEffect(() => {
    loadSentences();
    
    const handleUpdate = () => {
      loadSentences();
    };
    
    window.addEventListener('motivationalSentenceGenerated', handleUpdate);
    window.addEventListener('motivation-billboard-updated', handleUpdate);
    
    return () => {
      window.removeEventListener('motivationalSentenceGenerated', handleUpdate);
      window.removeEventListener('motivation-billboard-updated', handleUpdate);
    };
  }, []);
  
  // Clean text by removing sentiment markers
  const cleanText = (text: string): string => {
    return text
      .replace(/\$\{บวก\}/g, '')
      .replace(/\$\{กลาง\}/g, '')
      .replace(/\$\{ลบ\}/g, '');
  };
  
  // Highlight word in sentence
  const highlightWord = (sentence: string, word: string): React.ReactNode => {
    if (!sentence || !word) return cleanText(sentence);
    
    // Clean the sentence of any sentiment markers first
    const cleanedSentence = cleanText(sentence);
    
    const parts = cleanedSentence.split(new RegExp(`(${word})`, 'gi'));
    
    return parts.map((part, index) => {
      if (part.toLowerCase() === word.toLowerCase()) {
        return (
          <span key={index} className="text-orange-500 font-semibold">
            {part}
          </span>
        );
      }
      return part;
    });
  };
  
  // Get sentiment icon based on sentiment
  const getSentimentIcon = (sentiment?: 'positive' | 'neutral' | 'negative') => {
    switch (sentiment) {
      case 'positive':
        return <Smile className="h-4 w-4 text-green-500" />;
      case 'negative':
        return <Frown className="h-4 w-4 text-red-500" />;
      default:
        return <Meh className="h-4 w-4 text-blue-500" />;
    }
  };
  
  // Get badge variant based on sentiment
  const getBadgeVariant = (sentiment?: 'positive' | 'neutral' | 'negative') => {
    switch (sentiment) {
      case 'positive':
        return 'success';
      case 'negative':
        return 'destructive';
      default:
        return 'secondary';
    }
  };
  
  // Get sentiment text in Thai
  const getSentimentText = (sentiment?: 'positive' | 'neutral' | 'negative'): string => {
    switch (sentiment) {
      case 'positive':
        return 'เชิงบวก';
      case 'negative':
        return 'เชิงลบ';
      default:
        return 'กลาง';
    }
  };
  
  // Filter sentences based on search term
  const filteredSentences = sentences.filter(sentence => 
    sentence.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sentence.sentence.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (sentence.contributor && sentence.contributor.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  // Pagination logic
  const indexOfLastSentence = currentPage * sentencesPerPage;
  const indexOfFirstSentence = indexOfLastSentence - sentencesPerPage;
  const currentSentences = filteredSentences.slice(indexOfFirstSentence, indexOfLastSentence);
  const totalPages = Math.ceil(filteredSentences.length / sentencesPerPage);
  
  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;
    
    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
      let endPage = startPage + maxPagesToShow - 1;
      
      if (endPage > totalPages) {
        endPage = totalPages;
        startPage = Math.max(1, endPage - maxPagesToShow + 1);
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }
    }
    
    return pageNumbers;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>ประวัติประโยคให้กำลังใจ</span>
          <div className="relative max-w-xs">
            <Input 
              placeholder="ค้นหา..." 
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1); // Reset to first page when searching
              }}
            />
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {filteredSentences.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ความรู้สึก</TableHead>
                    <TableHead>ผู้ให้กำลังใจ</TableHead>
                    <TableHead>คำ</TableHead>
                    <TableHead>ประโยคกำลังใจ</TableHead>
                    <TableHead>วันที่เวลา</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentSentences.map((sentence, index) => {
                    // Create a truly unique key for each row
                    const rowKey = `sentence-${index}-${sentence.word}-${sentence.timestamp}-${sentence.contributor}`;
                    return (
                    <TableRow key={rowKey}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getSentimentIcon(sentence.sentiment)}
                          <Badge variant={getBadgeVariant(sentence.sentiment)}>
                            {getSentimentText(sentence.sentiment)}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {sentence.contributor || 'ไม่ระบุชื่อ'}
                      </TableCell>
                      <TableCell className="font-medium text-primary">
                        {sentence.word}
                      </TableCell>
                      <TableCell>
                        {highlightWord(sentence.sentence, sentence.word)}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-xs">
                        {new Date(sentence.timestamp).toLocaleString('th-TH', {
                          timeZone: 'Asia/Bangkok'
                        })}
                      </TableCell>
                    </TableRow>
                  )})}
                </TableBody>
              </Table>
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-4">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                    
                    {getPageNumbers().map(number => (
                      <PaginationItem key={number}>
                        <PaginationLink 
                          isActive={currentPage === number}
                          onClick={() => setCurrentPage(number)}
                          className="cursor-pointer"
                        >
                          {number}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-6">
            <FilePlus className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
            <p className="text-muted-foreground">
              ยังไม่มีประวัติการใช้งานประโยคให้กำลังใจ
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BillboardLog;
