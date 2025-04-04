
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface BillboardEntry {
  word: string;
  sentence: string;
  contributor: string;
  timestamp: Date;
}

const BillboardLog = () => {
  const [allSentences, setAllSentences] = useState<BillboardEntry[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const entriesPerPage = 30;
  
  // Load all motivational sentences
  useEffect(() => {
    const fetchAllSentences = () => {
      try {
        const stored = localStorage.getItem('motivation-sentences');
        if (stored) {
          const parsedData = JSON.parse(stored);
          const sentences = Array.isArray(parsedData) ? parsedData : [parsedData];
          
          // Deduplicate sentences based on sentence content and word
          const uniqueSentences = sentences.reduce((acc: BillboardEntry[], current) => {
            const isDuplicate = acc.find(
              item => item.sentence === current.sentence && item.word === current.word
            );
            if (!isDuplicate) {
              return [...acc, current];
            }
            return acc;
          }, []);
          
          // Sort by timestamp (newest first)
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
    
    // Initial load
    fetchAllSentences();
    
    // Listen for updates
    const handleUpdate = () => fetchAllSentences();
    
    window.addEventListener('motivationalSentenceGenerated', handleUpdate);
    window.addEventListener('word-database-updated', handleUpdate);
    window.addEventListener('motivation-billboard-updated', handleUpdate);
    
    // Set up interval to refresh data
    const intervalId = setInterval(fetchAllSentences, 1000);
    
    return () => {
      clearInterval(intervalId);
      window.removeEventListener('motivationalSentenceGenerated', handleUpdate);
      window.removeEventListener('word-database-updated', handleUpdate);
      window.removeEventListener('motivation-billboard-updated', handleUpdate);
    };
  }, []);
  
  // Filter entries based on search term
  const filteredEntries = allSentences.filter(entry => 
    entry.sentence?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.word?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.contributor?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Pagination logic
  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const currentEntries = filteredEntries.slice(indexOfFirstEntry, indexOfLastEntry);
  const totalPages = Math.ceil(filteredEntries.length / entriesPerPage);
  
  // Handle pagination changes
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };
  
  // Generate page numbers for pagination (show 5 pages at most)
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;
    
    if (totalPages <= maxPagesToShow) {
      // If total pages are less than or equal to maxPagesToShow, show all pages
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Show a range of pages centered around the current page
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
  
  // Helper function to highlight words in sentences
  const highlightWord = (sentence: string, word: string): React.ReactNode => {
    if (!sentence || !word) return sentence;
    
    const parts = sentence.split(new RegExp(`(${word})`, 'gi'));
    
    return parts.map((part, index) => {
      // If this part matches the word (case insensitive)
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
  
  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>ประวัติประโยคกำลังใจทั้งหมด</span>
          <div className="relative max-w-xs">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="ค้นหา..." 
              className="pl-8"
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
        {filteredEntries.length > 0 ? (
          <>
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
                        {entry.contributor || 'Anonymous'}
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
            
            {/* Pagination controls */}
            {totalPages > 1 && (
              <div className="mt-4">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                        className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                    
                    {getPageNumbers().map(number => (
                      <PaginationItem key={number}>
                        <PaginationLink 
                          isActive={currentPage === number}
                          onClick={() => handlePageChange(number)}
                          className="cursor-pointer"
                        >
                          {number}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                        className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </>
        ) : (
          <p className="text-center text-muted-foreground p-4">
            ยังไม่มีประวัติประโยคกำลังใจ
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default BillboardLog;
