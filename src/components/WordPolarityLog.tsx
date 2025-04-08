
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getWordPolarity } from "@/utils/sentenceAnalysis";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getSentimentBadgeVariant, getPolarityText } from "@/utils/sentimentConsistency";

interface WordLogEntry {
  word: string;
  contributor: string;
  timestamp: Date;
  sentiment?: 'positive' | 'neutral' | 'negative'; // Template sentiment instead of polarity
  templates?: string[];
}

interface WordPolarityLogProps {
  words: Array<{
    id: string;
    text: string;
    contributor: string;
    timestamp: Date;
    templates?: string[];
  }>;
}

const WordPolarityLog = ({ words }: WordPolarityLogProps) => {
  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const entriesPerPage = 30;
  
  // Process words to include template sentiment information instead of polarity
  const wordLog: WordLogEntry[] = words.map(word => {
    // Get template sentiment if available
    let sentiment: 'positive' | 'neutral' | 'negative' = 'neutral';
    
    if (word.templates && Array.isArray(word.templates) && word.templates.length > 0) {
      const firstTemplate = word.templates[0];
      // Check if firstTemplate is a string before using includes
      if (typeof firstTemplate === 'string') {
        if (firstTemplate.startsWith('${บวก}')) {
          sentiment = 'positive';
        } else if (firstTemplate.startsWith('${ลบ}')) {
          sentiment = 'negative';
        } else if (firstTemplate.startsWith('${กลาง}')) {
          sentiment = 'neutral';
        }
      }
    }
    
    return {
      word: word.text,
      contributor: word.contributor,
      timestamp: word.timestamp,
      sentiment,
      templates: word.templates
    };
  });

  // Sort by timestamp descending (newest first)
  const sortedLog = [...wordLog].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
  
  // Pagination logic
  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const currentEntries = sortedLog.slice(indexOfFirstEntry, indexOfLastEntry);
  const totalPages = Math.ceil(sortedLog.length / entriesPerPage);

  // Generate page numbers for pagination
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

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-muted">
            <th className="px-4 py-2 text-left">คำ</th>
            <th className="px-4 py-2 text-left">ผู้ร่วมสร้าง</th>
            <th className="px-4 py-2 text-left">เวลา</th>
            <th className="px-4 py-2 text-left">ประเภท</th>
            <th className="px-4 py-2 text-left">คะแนน</th>
          </tr>
        </thead>
        <tbody>
          {currentEntries.map((entry, index) => {
            // Get badge variant based on template sentiment
            const badgeVariant = getSentimentBadgeVariant(entry.sentiment);
            
            return (
              <tr key={index} className="border-t border-gray-200 hover:bg-muted/50 transition-colors">
                <td className="px-4 py-2">{entry.word}</td>
                <td className="px-4 py-2">{entry.contributor}</td>
                <td className="px-4 py-2 text-xs">
                  {new Date(entry.timestamp).toLocaleString('th-TH', {
                    timeZone: 'Asia/Bangkok'
                  })}
                </td>
                <td className="px-4 py-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    badgeVariant === 'success' ? 'bg-green-100 text-green-800 border-green-300' :
                    badgeVariant === 'destructive' ? 'bg-red-100 text-red-800 border-red-300' :
                    'bg-blue-100 text-blue-800 border-blue-300'
                  }`}>
                    {getPolarityText(entry.sentiment)}
                  </span>
                </td>
                <td className="px-4 py-2">
                  {entry.sentiment === 'positive' ? '1 คะแนน' : 
                   entry.sentiment === 'negative' ? '-1 คะแนน' : 
                   '0 คะแนน'}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      
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
    </div>
  );
};

export default WordPolarityLog;
