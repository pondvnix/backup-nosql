import Header from "@/components/Header";
import WordStream from "@/components/WordStream";
import { Heart } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getContributorStats } from "@/utils/wordModeration";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useEffect, useState } from "react";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import MobileFooter from "@/components/MobileFooter";

const useContributorStats = () => {
  return useQuery({
    queryKey: ['contributor-stats'],
    queryFn: async () => {
      const stats = getContributorStats();
      return Object.entries(stats).map(([name, count]) => ({ name, count }));
    },
    refetchInterval: 1000,
  });
};

const highlightWord = (sentence: string, word: string): React.ReactNode => {
  if (!sentence || !word) return sentence;
  
  const processedSentence = sentence.replace(/\{word\}/g, word);
  
  const parts = processedSentence.split(new RegExp(`(${word})`, 'gi'));
  
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

const Index = () => {
  const { data: contributors = [] } = useContributorStats();
  const [allSentences, setAllSentences] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const entriesPerPage = 30;

  useEffect(() => {
    const fetchAllSentences = () => {
      try {
        const stored = localStorage.getItem('motivation-sentences');
        if (stored) {
          const parsedData = JSON.parse(stored);
          const sentences = Array.isArray(parsedData) ? parsedData : [parsedData];
          
          const uniqueSentences = sentences.reduce((acc: any[], current) => {
            const isDuplicate = acc.find(
              item => item.sentence === current.sentence && item.word === current.word
            );
            if (!isDuplicate) {
              return [...acc, current];
            }
            return acc;
          }, []);
          
          const sortedSentences = uniqueSentences.sort((a, b) => 
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          );
          
          setAllSentences(sortedSentences);
        } else {
          setAllSentences([]);
        }
      } catch (error) {
        console.error("Error fetching sentences:", error);
        setAllSentences([]);
      }
    };
    
    fetchAllSentences();
    
    const handleSentenceGenerated = () => {
      fetchAllSentences();
    };
    
    window.addEventListener('motivationalSentenceGenerated', handleSentenceGenerated);
    window.addEventListener('word-database-updated', handleSentenceGenerated);
    window.addEventListener('motivation-billboard-updated', handleSentenceGenerated);
    
    const intervalId = setInterval(fetchAllSentences, 1000);
    
    return () => {
      clearInterval(intervalId);
      window.removeEventListener('motivationalSentenceGenerated', handleSentenceGenerated);
      window.removeEventListener('word-database-updated', handleSentenceGenerated);
      window.removeEventListener('motivation-billboard-updated', handleSentenceGenerated);
    };
  }, []);

  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const currentEntries = allSentences.slice(indexOfFirstEntry, indexOfLastEntry);
  const totalPages = Math.ceil(allSentences.length / entriesPerPage);
  
  const recentSentences = allSentences.slice(0, 10);
  
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
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-orange-50 to-white pb-16 md:pb-0">
      <Header />
      
      <main className="flex-1 container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col items-center justify-center text-center mb-12">
            <div className="inline-flex items-center gap-3 mb-4">
              <Heart className="h-8 w-8 text-primary animate-pulse" />
              <h1 className="text-4xl md:text-5xl font-bold text-primary font-mitr">
                "คำ" <span className="text-foreground">ลังใจ</span>
              </h1>
              <Heart className="h-8 w-8 text-primary animate-pulse" />
            </div>
            
            <p className="text-lg max-w-2xl mb-6">
              ร่วมสร้างประโยคกำลังใจที่ยาวที่สุด โดยเพิ่มคำของคุณต่อท้ายคำอื่นๆ 
              เพื่อส่งต่อกำลังใจให้กับผู้ป่วยและบุคลากรทางการแพทย์
            </p>
          </div>
          
          <WordStream />
          
          <Card className="mt-12 hover:shadow-lg transition-all duration-300 mb-8">
            <CardHeader>
              <CardTitle className="text-center">ประโยคกำลังใจล่าสุด</CardTitle>
            </CardHeader>
            <CardContent>
              {recentSentences.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="whitespace-nowrap">ผู้ให้กำลังใจ</TableHead>
                        <TableHead className="whitespace-nowrap">คำ</TableHead>
                        <TableHead>ประโยคกำลังใจ</TableHead>
                        <TableHead className="whitespace-nowrap">วันที่เวลา</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentSentences.map((entry, index) => (
                        <TableRow key={index} isHighlighted={index % 2 === 0}>
                          <TableCell className="font-medium whitespace-nowrap">
                            {entry.contributor || 'ไม่ระบุชื่อ'}
                          </TableCell>
                          <TableCell className="font-medium text-primary whitespace-nowrap">
                            {entry.word}
                          </TableCell>
                          <TableCell>
                            {highlightWord(entry.sentence, entry.word)}
                          </TableCell>
                          <TableCell className="text-xs whitespace-nowrap">
                            {new Date(entry.timestamp).toLocaleString('th-TH', {
                              timeZone: 'Asia/Bangkok'
                            })}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <p className="text-center text-muted-foreground p-4">
                  ยังไม่มีประโยคกำลังใจ กดปุ่ม "ใช้คำนี้" เพื่อสร้างประโยคแรกของคุณ
                </p>
              )}
            </CardContent>
          </Card>
          
          <Card className="mt-12 hover:shadow-lg transition-all duration-300 mb-20 md:mb-8">
            <CardHeader>
              <CardTitle className="text-center">ประวัติประโยคกำลังใจทั้งหมด</CardTitle>
            </CardHeader>
            <CardContent>
              {allSentences.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="whitespace-nowrap">ผู้ให้กำลังใจ</TableHead>
                        <TableHead className="whitespace-nowrap">คำ</TableHead>
                        <TableHead>ประโยคกำลังใจ</TableHead>
                        <TableHead className="whitespace-nowrap">วันที่เวลา (GMT+7)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentEntries.map((entry, index) => (
                        <TableRow key={index} isHighlighted={index % 2 === 0}>
                          <TableCell className="font-medium whitespace-nowrap">
                            {entry.contributor || 'ไม่ระบุชื่อ'}
                          </TableCell>
                          <TableCell className="font-medium text-primary whitespace-nowrap">
                            {entry.word}
                          </TableCell>
                          <TableCell>
                            {highlightWord(entry.sentence, entry.word)}
                          </TableCell>
                          <TableCell className="text-xs whitespace-nowrap">
                            {new Date(entry.timestamp).toLocaleString('th-TH', {
                              timeZone: 'Asia/Bangkok'
                            })}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <p className="text-center text-muted-foreground p-4">
                  ยังไม่มีประวัติประโยคกำลังใจ
                </p>
              )}
            </CardContent>
          </Card>
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

export default Index;
