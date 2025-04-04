
import { useState, useEffect } from "react";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface Quote {
  text: string;
  date: Date;
  userId: string;
  word?: string;
}

interface MotivationQuoteTableProps {
  quotes: Quote[];
  currentUserId?: string;
  showAllUsers?: boolean;
}

const MotivationQuoteTable = ({ quotes, currentUserId = "", showAllUsers = true }: MotivationQuoteTableProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [uniqueQuotes, setUniqueQuotes] = useState<Quote[]>([]);
  const quotesPerPage = 30;
  
  useEffect(() => {
    const filteredQuotes = showAllUsers 
      ? quotes 
      : quotes.filter(quote => quote.userId === currentUserId);
    
    const uniqueTexts = new Set();
    const uniqueQuotesList = filteredQuotes.filter(quote => {
      if (uniqueTexts.has(quote.text)) {
        return false;
      }
      uniqueTexts.add(quote.text);
      return true;
    });
    
    const sortedQuotes = [...uniqueQuotesList].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    setUniqueQuotes(sortedQuotes);
  }, [quotes, currentUserId, showAllUsers]);
  
  const indexOfLastQuote = currentPage * quotesPerPage;
  const indexOfFirstQuote = indexOfLastQuote - quotesPerPage;
  const currentQuotes = uniqueQuotes.slice(indexOfFirstQuote, indexOfLastQuote);
  const totalPages = Math.ceil(uniqueQuotes.length / quotesPerPage);
  
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
  
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString('th-TH', {
      timeZone: 'Asia/Bangkok'
    });
  };
  
  // Function to highlight the word in the sentence
  const highlightWord = (sentence: string, word?: string): React.ReactNode => {
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
  
  return (
    <div className="space-y-4">
      {uniqueQuotes.length > 0 ? (
        <>
          <div className="overflow-x-auto border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ผู้ให้กำลังใจ</TableHead>
                  <TableHead>คำ</TableHead>
                  <TableHead>ประโยคกำลังใจ</TableHead>
                  <TableHead>วันที่เวลา (GMT+7)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentQuotes.map((quote, index) => (
                  <TableRow key={`${quote.text}-${index}`}>
                    <TableCell>{quote.userId || 'ไม่ระบุชื่อ'}</TableCell>
                    <TableCell className="font-medium text-primary">{quote.word || '-'}</TableCell>
                    <TableCell>{highlightWord(quote.text, quote.word)}</TableCell>
                    <TableCell className="text-xs whitespace-nowrap">{formatDate(quote.date)}</TableCell>
                  </TableRow>
                ))}
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
        <p className="text-center text-muted-foreground p-4">ไม่พบประโยคกำลังใจสำหรับรายการนี้</p>
      )}
    </div>
  );
};

export default MotivationQuoteTable;
