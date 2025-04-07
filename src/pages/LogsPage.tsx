
import React, { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import BillboardLog from "@/components/BillboardLog";
import { getUsedTemplates } from "@/utils/templateTracker";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  History, 
  HistoryIcon,
  FilePlus, 
  Copy, 
  Clock, 
  BookText
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { extractSentimentFromTemplate } from "@/utils/sentimentConsistency";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

interface UsedTemplate {
  word: string;
  template: string;
  timestamp: number;
}

const LogsPage = () => {
  const [usedTemplates, setUsedTemplates] = useState<UsedTemplate[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const templatesPerPage = 10;
  
  // Load used templates
  useEffect(() => {
    const loadUsedTemplates = () => {
      const templates = getUsedTemplates();
      
      // Sort by timestamp (newest first)
      const sortedTemplates = templates.sort((a, b) => b.timestamp - a.timestamp);
      setUsedTemplates(sortedTemplates);
    };
    
    loadUsedTemplates();
    
    // Set up listener for template usage updates
    window.addEventListener('template-usage-updated', loadUsedTemplates);
    window.addEventListener('motivationalSentenceGenerated', loadUsedTemplates);
    
    return () => {
      window.removeEventListener('template-usage-updated', loadUsedTemplates);
      window.removeEventListener('motivationalSentenceGenerated', loadUsedTemplates);
    };
  }, []);
  
  // Get sentiment from template
  const getSentimentFromTemplate = (template: string): 'positive' | 'neutral' | 'negative' => {
    if (!template) return 'neutral';
    
    if (template.includes('${บวก}')) return 'positive';
    if (template.includes('${ลบ}')) return 'negative';
    if (template.includes('${กลาง}')) return 'neutral';
    
    const { sentiment } = extractSentimentFromTemplate(template);
    return sentiment;
  };
  
  // Clean template text by removing sentiment markers
  const cleanTemplateText = (text: string): string => {
    return text
      .replace(/\$\{บวก\}/g, '')
      .replace(/\$\{กลาง\}/g, '')
      .replace(/\$\{ลบ\}/g, '')
      .replace(/\$\{[\w\u0E00-\u0E7F]+\}/g, (match) => {
        // Extract the word from ${word}
        const word = match.substring(2, match.length - 1);
        return word;
      });
  };
  
  // Filter templates based on search term
  const filteredTemplates = usedTemplates.filter(template => 
    template.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cleanTemplateText(template.template).toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Pagination logic
  const indexOfLastTemplate = currentPage * templatesPerPage;
  const indexOfFirstTemplate = indexOfLastTemplate - templatesPerPage;
  const currentTemplates = filteredTemplates.slice(indexOfFirstTemplate, indexOfLastTemplate);
  const totalPages = Math.ceil(filteredTemplates.length / templatesPerPage);
  
  // Get badge variant based on template sentiment
  const getBadgeVariant = (sentiment: 'positive' | 'neutral' | 'negative') => {
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
  const getSentimentText = (sentiment: 'positive' | 'neutral' | 'negative'): string => {
    switch (sentiment) {
      case 'positive':
        return 'เชิงบวก';
      case 'negative':
        return 'เชิงลบ';
      default:
        return 'กลาง';
    }
  };
  
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
    <Layout>
      <div className="container mx-auto py-6 px-4 md:px-6">
        <div className="flex flex-col items-start md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold mb-1">บันทึกการใช้งาน</h1>
            <p className="text-muted-foreground">ประวัติการใช้งานคำและแม่แบบประโยค</p>
          </div>
        </div>

        <Tabs defaultValue="templates" className="w-full">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="templates" className="flex items-center gap-2">
              <BookText className="h-4 w-4" />
              <span>แม่แบบประโยค</span>
            </TabsTrigger>
            <TabsTrigger value="sentences" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              <span>ประโยคทั้งหมด</span>
            </TabsTrigger>
          </TabsList>

          {/* Templates Tab */}
          <TabsContent value="templates">
            <Card>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>ประวัติแม่แบบประโยคที่ใช้</span>
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
                <CardDescription>
                  แสดงแม่แบบประโยคทั้งหมดที่เคยใช้งานแล้ว
                </CardDescription>
              </CardHeader>
              <CardContent>
                {filteredTemplates.length > 0 ? (
                  <>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>ความรู้สึก</TableHead>
                            <TableHead>คำ</TableHead>
                            <TableHead>แม่แบบประโยค</TableHead>
                            <TableHead>วันที่เวลา</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {currentTemplates.map((template, index) => {
                            const sentiment = getSentimentFromTemplate(template.template);
                            const cleanedText = cleanTemplateText(template.template);
                            
                            return (
                              <TableRow key={`${template.word}-${index}`}>
                                <TableCell>
                                  <Badge variant={getBadgeVariant(sentiment)}>
                                    {getSentimentText(sentiment)}
                                  </Badge>
                                </TableCell>
                                <TableCell className="font-medium">
                                  {template.word}
                                </TableCell>
                                <TableCell>
                                  {cleanedText}
                                </TableCell>
                                <TableCell className="whitespace-nowrap">
                                  {new Date(template.timestamp).toLocaleString('th-TH', {
                                    timeZone: 'Asia/Bangkok'
                                  })}
                                </TableCell>
                              </TableRow>
                            );
                          })}
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
                      ยังไม่มีประวัติการใช้แม่แบบประโยค
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sentences Tab */}
          <TabsContent value="sentences">
            <BillboardLog />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default LogsPage;
