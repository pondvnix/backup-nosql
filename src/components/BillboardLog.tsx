import React, { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Smile, Meh, Frown, FilePlus } from "lucide-react";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { getMotivationalSentences, MotivationalSentence } from "@/utils/motivationSentenceManager";
import { getSentimentBadgeVariant, getPolarityText } from "@/utils/sentimentConsistency";

const BillboardLog = () => {
  const [sentences, setSentences] = useState<MotivationalSentence[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const sentencesPerPage = 10;
  
  const loadSentences = useCallback(() => {
    try {
      const loadedSentences = getMotivationalSentences();
      
      const validSentences = Array.isArray(loadedSentences) ? loadedSentences.filter(sentence => 
        sentence && typeof sentence === 'object'
      ) : [];
      
      const sortedSentences = [...validSentences].sort((a, b) => {
        const timeA = new Date(a.timestamp || 0).getTime();
        const timeB = new Date(b.timestamp || 0).getTime();
        return timeB - timeA;
      });
      
      setSentences(sortedSentences);
    } catch (error) {
      console.error("Error loading sentences:", error);
      setSentences([]);
    }
  }, []);
  
  useEffect(() => {
    loadSentences();
    
    const handleUpdate = () => {
      loadSentences();
    };
    
    window.addEventListener('motivationalSentenceGenerated', handleUpdate);
    window.addEventListener('motivation-billboard-updated', handleUpdate);
    
    const intervalId = setInterval(handleUpdate, 5000);
    
    return () => {
      clearInterval(intervalId);
      window.removeEventListener('motivationalSentenceGenerated', handleUpdate);
      window.removeEventListener('motivation-billboard-updated', handleUpdate);
    };
  }, [loadSentences]);
  
  const cleanText = (text: string | undefined): string => {
    if (!text || typeof text !== 'string') {
      return '';
    }
    
    return text
      .replace(/\$\{บวก\}/g, '')
      .replace(/\$\{กลาง\}/g, '')
      .replace(/\$\{ลบ\}/g, '');
  };
  
  const highlightWord = (sentence: string | undefined, word: string | undefined): React.ReactNode => {
    if (!sentence || !word || typeof sentence !== 'string' || typeof word !== 'string') {
      return cleanText(sentence || '');
    }
    
    const cleanedSentence = cleanText(sentence);
    
    try {
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
    } catch (error) {
      console.error("Error highlighting word:", error);
      return cleanedSentence;
    }
  };
  
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
  
  const filteredSentences = sentences.filter(sentence => {
    if (!searchTerm || typeof searchTerm !== 'string') return true;
    if (!sentence || typeof sentence !== 'object') return false;
    
    const word = typeof sentence.word === 'string' ? sentence.word.toLowerCase() : '';
    const sentenceText = typeof sentence.sentence === 'string' ? sentence.sentence.toLowerCase() : '';
    const contributor = typeof sentence.contributor === 'string' ? sentence.contributor.toLowerCase() : '';
    const search = searchTerm.toLowerCase();
    
    return word.includes(search) || sentenceText.includes(search) || contributor.includes(search);
  });
  
  const indexOfLastSentence = currentPage * sentencesPerPage;
  const indexOfFirstSentence = indexOfLastSentence - sentencesPerPage;
  const currentSentences = filteredSentences.slice(indexOfFirstSentence, indexOfLastSentence);
  const totalPages = Math.ceil(filteredSentences.length / sentencesPerPage);
  
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
                setCurrentPage(1);
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
                    if (!sentence || typeof sentence !== 'object') {
                      return null;
                    }
                    
                    const key = sentence.id || `sentence-${index}-${typeof sentence.timestamp === 'object' ? 
                      new Date(sentence.timestamp).getTime() : 
                      typeof sentence.timestamp === 'number' ? 
                        sentence.timestamp : 
                        index}`;
                        
                    return (
                      <TableRow key={key}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getSentimentIcon(sentence.sentiment)}
                            <Badge variant={getSentimentBadgeVariant(sentence.sentiment)}>
                              {getPolarityText(sentence.sentiment)}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          {typeof sentence.contributor === 'string' ? sentence.contributor : 'ไม่ระบุชื่อ'}
                        </TableCell>
                        <TableCell className="font-medium text-primary">
                          {typeof sentence.word === 'string' ? sentence.word : ''}
                        </TableCell>
                        <TableCell>
                          {highlightWord(sentence.sentence, sentence.word)}
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-xs">
                          {sentence.timestamp ? 
                            new Date(sentence.timestamp).toLocaleString('th-TH', {
                              timeZone: 'Asia/Bangkok'
                            }) : 
                            ''
                          }
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
            
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
