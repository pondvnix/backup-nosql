
import { useEffect, useState } from "react";
import Layout from "@/layouts/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import Leaderboard from "@/components/Leaderboard";
import StatsDashboard from "@/components/StatsDashboard";
import MoodReport from "@/components/MoodReport";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Smile, Meh, Frown } from "lucide-react";

interface MotivationalSentence {
  word: string;
  sentence: string;
  template?: string;
  contributor?: string;
  timestamp: Date | string | number;
  polarity?: 'positive' | 'neutral' | 'negative';
  score?: number;
}

const LeaderboardPage = () => {
  const [sentences, setSentences] = useState<MotivationalSentence[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // กรองข้อมูลซ้ำซ้อน
  const removeDuplicateSentences = (sentences: MotivationalSentence[]): MotivationalSentence[] => {
    const uniqueIds = new Set();
    return sentences.filter(sentence => {
      const id = `${sentence.word}-${sentence.sentence}-${sentence.contributor}`;
      if (uniqueIds.has(id)) return false;
      uniqueIds.add(id);
      return true;
    });
  };
  
  useEffect(() => {
    const fetchSentences = () => {
      try {
        const stored = localStorage.getItem('motivation-sentences');
        if (stored) {
          const parsedData = JSON.parse(stored);
          const sentences = Array.isArray(parsedData) ? parsedData : [parsedData];
          
          // ใช้ polarity และ score ที่มาจากฐานข้อมูลเลย ไม่ต้องคำนวณใหม่
          const uniqueSentences = removeDuplicateSentences(sentences);
          
          // Sort by timestamp (newest first)
          const sortedSentences = uniqueSentences.sort((a, b) => {
            const timeA = new Date(a.timestamp).getTime();
            const timeB = new Date(b.timestamp).getTime();
            return timeB - timeA;
          });
          
          setSentences(sortedSentences);
        }
      } catch (error) {
        console.error("Error fetching sentences:", error);
      }
    };

    fetchSentences();
    
    const handleUpdate = () => {
      fetchSentences();
      setRefreshTrigger(prev => prev + 1);
    };
    
    window.addEventListener('motivationalSentenceGenerated', handleUpdate);
    window.addEventListener('word-database-updated', handleUpdate);
    window.addEventListener('motivation-billboard-updated', handleUpdate);
    
    const intervalId = setInterval(fetchSentences, 2000);
    
    return () => {
      clearInterval(intervalId);
      window.removeEventListener('motivationalSentenceGenerated', handleUpdate);
      window.removeEventListener('word-database-updated', handleUpdate);
      window.removeEventListener('motivation-billboard-updated', handleUpdate);
    };
  }, []);

  // Function to get polarity icon
  const getPolarityIcon = (polarity?: string) => {
    switch (polarity) {
      case 'positive':
        return <Smile className="h-4 w-4 text-green-500" />;
      case 'negative':
        return <Frown className="h-4 w-4 text-red-500" />;
      default:
        return <Meh className="h-4 w-4 text-blue-500" />;
    }
  };
  
  // Function to format date
  const formatDate = (date: Date | string | number) => {
    return new Date(date).toLocaleString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Bangkok'
    });
  };
  
  // Function to highlight word in sentence
  const highlightWord = (sentence: string, word: string): React.ReactNode => {
    if (!sentence || !word) return sentence;
    
    const parts = sentence.split(new RegExp(`(${word})`, 'gi'));
    
    return parts.map((part, index) => {
      if (part.toLowerCase() === word.toLowerCase()) {
        return (
          <span key={index} className="text-[#F97316] font-semibold">
            {part}
          </span>
        );
      }
      return part;
    });
  };
  
  // Pagination logic
  const totalPages = Math.ceil(sentences.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentSentences = sentences.slice(indexOfFirstItem, indexOfLastItem);
  
  // Page numbers for pagination
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
    <Layout>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6 text-center">อันดับและสถิติ</h1>
        
        <Tabs defaultValue="datatable" className="w-full">
          <TabsList className="grid grid-cols-4 mb-6">
            <TabsTrigger value="datatable">ตารางข้อมูล</TabsTrigger>
            <TabsTrigger value="overview">ภาพรวม</TabsTrigger>
            <TabsTrigger value="stats">รายงานละเอียด</TabsTrigger>
            <TabsTrigger value="moods">บันทึกตามความรู้สึก</TabsTrigger>
          </TabsList>
          
          <TabsContent value="datatable" className="space-y-6 animate-fade-in">
            <Card>
              <CardHeader>
                <CardTitle className="text-center">ตารางประโยคกำลังใจ</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ความรู้สึก</TableHead>
                        <TableHead>คำ</TableHead>
                        <TableHead>ประโยคกำลังใจ</TableHead>
                        <TableHead>ผู้ให้กำลังใจ</TableHead>
                        <TableHead>คะแนน</TableHead>
                        <TableHead>วันที่</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentSentences.length > 0 ? (
                        currentSentences.map((sentence, index) => (
                          <TableRow key={`${sentence.sentence}-${index}`}>
                            <TableCell>{getPolarityIcon(sentence.polarity)}</TableCell>
                            <TableCell className="font-medium text-primary">{sentence.word || '-'}</TableCell>
                            <TableCell>{highlightWord(sentence.sentence, sentence.word)}</TableCell>
                            <TableCell>{sentence.contributor || 'ไม่ระบุชื่อ'}</TableCell>
                            <TableCell className={`font-medium ${
                              sentence.score && sentence.score > 0 
                                ? 'text-green-600' 
                                : sentence.score === 0 
                                  ? 'text-blue-600' 
                                  : 'text-red-600'
                            }`}>
                              {sentence.score !== undefined ? sentence.score : 0}
                            </TableCell>
                            <TableCell className="text-xs whitespace-nowrap">{formatDate(sentence.timestamp)}</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-4">ไม่พบข้อมูลประโยคกำลังใจ</TableCell>
                        </TableRow>
                      )}
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
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="overview" className="space-y-6 animate-fade-in">
            <Leaderboard 
              refreshTrigger={refreshTrigger} 
              allSentences={sentences}
            />
          </TabsContent>
          
          <TabsContent value="stats" className="space-y-6 animate-fade-in">
            <StatsDashboard sentences={sentences} />
          </TabsContent>
          
          <TabsContent value="moods" className="space-y-6 animate-fade-in">
            <MoodReport sentences={sentences} />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default LeaderboardPage;
