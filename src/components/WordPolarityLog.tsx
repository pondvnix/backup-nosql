
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getWordPolarity } from "@/utils/sentenceAnalysis";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface WordLogEntry {
  word: string;
  contributor: string;
  timestamp: Date;
  polarity: 'positive' | 'neutral' | 'negative';
  score: number;
}

interface WordPolarityLogProps {
  words: Array<{
    id: string;
    text: string;
    contributor: string;
    timestamp: Date;
  }>;
}

const WordPolarityLog = ({ words }: WordPolarityLogProps) => {
  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const entriesPerPage = 30;
  
  // Process words to include polarity information
  const wordLog: WordLogEntry[] = words.map(word => {
    const polarityInfo = getWordPolarity(word.text);
    return {
      word: word.text,
      contributor: word.contributor,
      timestamp: word.timestamp,
      polarity: polarityInfo.polarity as 'positive' | 'neutral' | 'negative',
      score: polarityInfo.score
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

  // Get color for polarity
  const getPolarityColor = (polarity: string): string => {
    switch (polarity) {
      case 'positive':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'neutral':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'negative':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  // Get Thai translation for polarity - Matching the Management page
  const getPolarityText = (polarity: string): string => {
    switch (polarity) {
      case 'positive':
        return 'เชิงบวก';
      case 'neutral':
        return 'กลาง';
      case 'negative':
        return 'เชิงลบ';
      default:
        return '';
    }
  };

  // Get score text based on polarity - Exactly matching the Management page
  const getScoreText = (polarity: string): string => {
    switch (polarity) {
      case 'positive':
        return '2 คะแนน';
      case 'neutral':
        return '1 คะแนน';
      case 'negative':
        return '-1 คะแนน';
      default:
        return '0 คะแนน';
    }
  };

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
            <th className="px-4 py-2 text-left">ความรู้สึก</th>
            <th className="px-4 py-2 text-left">คะแนน</th>
          </tr>
        </thead>
        <tbody>
          {currentEntries.map((entry, index) => (
            <tr key={index} className="border-t border-gray-200 hover:bg-muted/50 transition-colors">
              <td className="px-4 py-2">{entry.word}</td>
              <td className="px-4 py-2">{entry.contributor}</td>
              <td className="px-4 py-2 text-xs">
                {new Date(entry.timestamp).toLocaleString('th-TH', {
                  timeZone: 'Asia/Bangkok'
                })}
              </td>
              <td className="px-4 py-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPolarityColor(entry.polarity)}`}>
                  {getPolarityText(entry.polarity)}
                </span>
              </td>
              <td className="px-4 py-2">{getScoreText(entry.polarity)}</td>
            </tr>
          ))}
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
