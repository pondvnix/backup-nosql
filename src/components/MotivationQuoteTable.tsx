
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { useState, useEffect } from "react";
import { Smile, Meh, Frown } from "lucide-react";
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

const MotivationQuoteTable = ({ quotes = [], showAllUsers = false }: QuoteManagementTableProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [displayedQuotes, setDisplayedQuotes] = useState<Quote[]>([]);
  const quotesPerPage = 10;
  
  useEffect(() => {
    if (!Array.isArray(quotes)) {
      setDisplayedQuotes([]);
      return;
    }
    
    const uniqueQuotes = quotes.reduce((acc: Quote[], current) => {
      if (!current || typeof current !== 'object') return acc;
      if (!current.text || typeof current.text !== 'string') return acc;
      
      const isDuplicate = acc.find(item => item.text === current.text);
      if (!isDuplicate) {
        return [...acc, current];
      }
      return acc;
    }, []);
    
    const sortedQuotes = [...uniqueQuotes].sort((a, b) => {
      const dateA = a.date instanceof Date ? a.date.getTime() : 0;
      const dateB = b.date instanceof Date ? b.date.getTime() : 0;
      return dateB - dateA;
    });
    
    setDisplayedQuotes(sortedQuotes);
  }, [quotes]);
  
  const indexOfLastQuote = currentPage * quotesPerPage;
  const indexOfFirstQuote = indexOfLastQuote - quotesPerPage;
  const currentQuotes = displayedQuotes.slice(indexOfFirstQuote, indexOfLastQuote);
  const totalPages = Math.ceil(displayedQuotes.length / quotesPerPage);
  
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
  
  const formatDate = (date: Date | null | undefined) => {
    if (!date || !(date instanceof Date)) {
      return '';
    }
    
    try {
      return new Date(date).toLocaleString('th-TH', {
        timeZone: 'Asia/Bangkok'
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return '';
    }
  };
  
  const cleanTemplateText = (text: string | undefined): string => {
    if (!text || typeof text !== 'string') {
      return '';
    }
    
    return text
      .replace(/\$\{บวก\}/g, '')
      .replace(/\$\{กลาง\}/g, '')
      .replace(/\$\{ลบ\}/g, '')
      .replace(/\$\{[\w\u0E00-\u0E7F]+\}/g, (match) => {
        const word = match.substring(2, match.length - 1);
        return word;
      });
  };
  
  const getSentimentFromTemplate = (template?: string): 'positive' | 'neutral' | 'negative' => {
    if (!template || typeof template !== 'string') return 'neutral';
    
    if (template.includes('${บวก}')) return 'positive';
    if (template.includes('${ลบ}')) return 'negative';
    if (template.includes('${กลาง}')) return 'neutral';
    
    const { sentiment } = extractSentimentFromTemplate(template);
    return sentiment;
  };
  
  const getSentimentIcon = (quote: Quote) => {
    if (!quote || typeof quote !== 'object') {
      return <Meh className="h-4 w-4 text-blue-500" />;
    }
    
    const sentiment = getSentimentFromTemplate(quote.template);
    
    switch (sentiment) {
      case 'positive':
        return <Smile className="h-4 w-4 text-green-500" />;
      case 'negative':
        return <Frown className="h-4 w-4 text-red-500" />;
      default:
        return <Meh className="h-4 w-4 text-blue-500" />;
    }
  };
  
  const getSentimentScore = (quote: Quote): number => {
    if (!quote || typeof quote !== 'object') {
      return 0;
    }
    
    const sentiment = getSentimentFromTemplate(quote.template);
    return sentiment === 'positive' ? 1 : sentiment === 'negative' ? -1 : 0;
  };
  
  const highlightWord = (sentence: string | undefined, word?: string): React.ReactNode => {
    if (!sentence || typeof sentence !== 'string') {
      return '';
    }
    
    if (!word || typeof word !== 'string') {
      return cleanTemplateText(sentence);
    }
    
    const cleanedSentence = cleanTemplateText(sentence);
    
    try {
      const parts = cleanedSentence.split(new RegExp(`(${word})`, 'gi'));
      
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
    } catch (error) {
      console.error("Error highlighting word:", error);
      return cleanedSentence;
    }
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
                {currentQuotes.map((quote, index) => {
                  if (!quote || typeof quote !== 'object') {
                    return null;
                  }
                  
                  const sentiment = getSentimentFromTemplate(quote.template);
                  const badgeVariant = getSentimentBadgeVariant(sentiment);
                  
                  return (
                    <TableRow key={`${quote.text}-${index}`}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getSentimentIcon(quote)}
                          <Badge variant={badgeVariant}>
                            {getPolarityText(sentiment)}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>{getSentimentScore(quote)}</TableCell>
                      {showAllUsers && (
                        <TableCell>{typeof quote.userId === 'string' ? quote.userId : 'ไม่ระบุชื่อ'}</TableCell>
                      )}
                      {showAllUsers && (
                        <TableCell className="font-medium text-primary">
                          {typeof quote.word === 'string' ? quote.word : '-'}
                        </TableCell>
                      )}
                      <TableCell className="font-medium">
                        {typeof quote.word === 'string' && typeof quote.text === 'string' ? 
                         highlightWord(quote.text, quote.word) : 
                         cleanTemplateText(typeof quote.text === 'string' ? quote.text : '')}
                      </TableCell>
                      {showAllUsers && (
                        <TableCell className="text-xs">{formatDate(quote.date)}</TableCell>
                      )}
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
        <p className="text-center text-muted-foreground p-4">ไม่พบประโยคกำลังใจในระบบ</p>
      )}
    </div>
  );
};

export default MotivationQuoteTable;
