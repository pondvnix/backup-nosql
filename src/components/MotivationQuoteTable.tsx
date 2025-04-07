import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { useState, useEffect } from "react";
import { Smile, Frown } from "lucide-react";
import { Badge } from "./ui/badge";
import { extractSentimentFromTemplate, getSentimentBadgeVariant, getPolarityText } from "@/utils/sentimentConsistency";

interface Quote {
  text: string;
  date: Date;
  userId: string;
  word?: string;
  template?: string;
}

interface QuoteManagementTableProps {
  quotes: Quote[];
  showAllUsers?: boolean;
}

const MotivationQuoteTable = ({ quotes, showAllUsers = false }: QuoteManagementTableProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [displayedQuotes, setDisplayedQuotes] = useState<Quote[]>([]);
  const quotesPerPage = 10;
  
  useEffect(() => {
    // Deduplicate quotes based on text content
    const uniqueQuotes = quotes.reduce((acc: Quote[], current) => {
      const isDuplicate = acc.find(item => item.text === current.text);
      if (!isDuplicate) {
        return [...acc, current];
      }
      return acc;
    }, []);
    
    // Sort quotes by date (newest first)
    const sortedQuotes = [...uniqueQuotes].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    setDisplayedQuotes(sortedQuotes);
  }, [quotes]);
  
  // Calculate pagination
  const indexOfLastQuote = currentPage * quotesPerPage;
  const indexOfFirstQuote = indexOfLastQuote - quotesPerPage;
  const currentQuotes = displayedQuotes.slice(indexOfFirstQuote, indexOfLastQuote);
  const totalPages = Math.ceil(displayedQuotes.length / quotesPerPage);
  
  // Get page numbers for pagination
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
  
  // Format date to local Thai time (GMT+7)
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString('th-TH', {
      timeZone: 'Asia/Bangkok'
    });
  };
  
  // Get sentiment from template
  const getSentimentFromTemplate = (template?: string): 'positive' | 'negative' => {
    if (!template) return 'positive';
    
    const { sentiment } = extractSentimentFromTemplate(template);
    return sentiment;
  };
  
  // Get sentiment icon based on template
  const getSentimentIcon = (quote: Quote) => {
    const sentiment = getSentimentFromTemplate(quote.template);
    
    return sentiment === 'positive' 
      ? <Smile className="h-4 w-4 text-green-500" />
      : <Frown className="h-4 w-4 text-red-500" />;
  };
  
  // Get polarity text based on template
  const getPolarityTextFromTemplate = (quote: Quote): string => {
    const sentiment = getSentimentFromTemplate(quote.template);
    return sentiment === 'positive' ? 'เชิงบวก' : 'เชิงลบ';
  };
  
  // Get badge variant based on template
  const getBadgeVariant = (quote: Quote) => {
    const sentiment = getSentimentFromTemplate(quote.template);
    return sentiment === 'positive' ? 'success' : 'destructive';
  };
  
  // Get sentiment score based on template
  const getSentimentScore = (quote: Quote): number => {
    const sentiment = getSentimentFromTemplate(quote.template);
    return sentiment === 'positive' ? 1 : -1;
  };
  
  // Highlight word in sentence
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
      {displayedQuotes.length > 0 ? (
        <>
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ความรู้สึก</TableHead>
                  <TableHead>คะแนน</TableHead>
                  {showAllUsers && <TableHead>ผู้สร้าง</TableHead>}
                  {showAllUsers && <TableHead>คำ</TableHead>}
                  <TableHead>ประโยคกำลังใจ</TableHead>
                  {showAllUsers && <TableHead>วันที่เวลา (GMT+7)</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentQuotes.map((quote, index) => (
                  <TableRow key={`${quote.text}-${index}`} isHighlighted={index % 2 === 0}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getSentimentIcon(quote)}
                        <Badge variant={getBadgeVariant(quote)}>
                          {getPolarityTextFromTemplate(quote)}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>{getSentimentScore(quote)}</TableCell>
                    {showAllUsers && (
                      <TableCell>{quote.userId || 'ไม่ระบุชื่อ'}</TableCell>
                    )}
                    {showAllUsers && (
                      <TableCell className="font-medium text-primary">
                        {quote.word || '-'}
                      </TableCell>
                    )}
                    <TableCell className="font-medium">
                      {quote.word ? highlightWord(quote.text, quote.word) : quote.text}
                    </TableCell>
                    {showAllUsers && (
                      <TableCell className="text-xs">{formatDate(quote.date)}</TableCell>
                    )}
                  </TableRow>
                ))}
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
        <p className="text-center text-muted-foreground p-4">ไม่พบประโยคกำลังใจในระบบ</p>
      )}
    </div>
  );
};

export default MotivationQuoteTable;
