
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Copy, MessageSquareQuote } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useRef, useState } from "react";
import html2canvas from "html2canvas";
import ShareButton from "./ShareButton";

interface TomatoBoxProps {
  word: string;
  contributor: string;
  sentence?: string;
  selectedWords?: string[];
}

const TomatoBox = ({ word, contributor, sentence, selectedWords = [] }: TomatoBoxProps) => {
  const { toast } = useToast();
  const boxRef = useRef<HTMLDivElement>(null);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [isRendering, setIsRendering] = useState(false);
  const [motivationalSentence, setMotivationalSentence] = useState<string>(sentence || "");

  // Listen for motivational sentence updates
  useEffect(() => {
    const handleSentenceGenerated = (event: CustomEvent) => {
      if (event.detail && event.detail.sentence && event.detail.word === word) {
        setMotivationalSentence(event.detail.sentence);
      }
    };
    
    window.addEventListener('motivationalSentenceGenerated', 
      handleSentenceGenerated as EventListener);
    
    return () => {
      window.removeEventListener('motivationalSentenceGenerated', 
        handleSentenceGenerated as EventListener);
    };
  }, [word]);

  // Update sentence from props if provided
  useEffect(() => {
    if (sentence) {
      setMotivationalSentence(sentence);
    }
  }, [sentence]);

  const highlightWords = (text: string, words: string[]): React.ReactNode => {
    if (!text) return null;
    
    let parts: React.ReactNode[] = [text];
    
    words.forEach(word => {
      const newParts: React.ReactNode[] = [];
      
      parts.forEach(part => {
        if (typeof part !== 'string') {
          newParts.push(part);
          return;
        }
        
        const splitText = part.split(new RegExp(`(${word})`, 'gi'));
        
        splitText.forEach((text, i) => {
          if (i % 2 === 0) {
            if (text) newParts.push(text);
          } else {
            newParts.push(
              <span key={`${word}-${i}`} className="text-[#F97316] font-semibold">
                {text}
              </span>
            );
          }
        });
      });
      
      parts = newParts;
    });
    
    return parts;
  };

  const handleCopyImage = async () => {
    if (!boxRef.current) {
      toast({
        title: "ไม่สามารถคัดลอกได้",
        description: "ไม่พบองค์ประกอบที่ต้องการคัดลอก",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsRendering(true);
      
      // Fix: Use safe canvas options to prevent gradient issues
      const canvas = await html2canvas(boxRef.current, {
        scale: 2,
        backgroundColor: null,
        logging: false,
        useCORS: true,
        allowTaint: true, // Allow cross-origin images
        onclone: (document, clone) => {
          // Safe handling for gradients in cloned document
          const elementsWithGradients = clone.querySelectorAll('[style*="gradient"]');
          elementsWithGradients.forEach((el) => {
            if (el instanceof HTMLElement) {
              // Use solid fallback colors instead of gradients for export
              const bgColor = window.getComputedStyle(el).backgroundColor;
              if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)') {
                el.style.background = bgColor;
              } else {
                el.style.background = '#f97316'; // Fallback to orange color
              }
            }
          });
        }
      });
      
      if (navigator.clipboard && navigator.clipboard.write) {
        canvas.toBlob(async (blob) => {
          if (blob) {
            try {
              const clipboardItem = new ClipboardItem({
                [blob.type]: blob
              });
              
              await navigator.clipboard.write([clipboardItem]);
              
              toast({
                title: "คัดลอกสำเร็จ",
                description: "คัดลอกรูปภาพไปยังคลิปบอร์ดแล้ว",
              });
            } catch (err) {
              console.error("Clipboard API error:", err);
              fallbackCopyImage(canvas);
            }
          }
        }, 'image/png');
      } else {
        fallbackCopyImage(canvas);
      }
    } catch (error) {
      console.error("Error copying image:", error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถคัดลอกได้ในขณะนี้",
        variant: "destructive",
      });
    } finally {
      setIsRendering(false);
    }
  };

  const fallbackCopyImage = (canvas: HTMLCanvasElement) => {
    try {
      const img = document.createElement('img');
      img.src = canvas.toDataURL('image/png');
      img.style.position = 'fixed';
      img.style.left = '-9999px';
      document.body.appendChild(img);
      
      const range = document.createRange();
      range.selectNode(img);
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);
      
      const successful = document.execCommand('copy');
      
      document.body.removeChild(img);
      selection?.removeAllRanges();
      
      if (successful) {
        toast({
          title: "คัดลอกสำเร็จ",
          description: "คัดลอกรูปภาพไปยังคลิปบอร์ดแล้ว",
        });
      } else {
        toast({
          title: "ไม่รองรับการคัดลอกรูปภาพ",
          description: "เบราว์เซอร์ของคุณไม่รองรับการคัดลอกรูปภาพ กรุณาใช้ปุ่มดาวน์โหลดแทน",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error("Fallback copy failed:", err);
      toast({
        title: "ไม่รองรับการคัดลอกรูปภาพ",
        description: "เบราว์เซอร์ของคุณไม่รองรับการคัดลอกรูปภาพ กรุณาใช้ปุ่มดาวน์โหลดแทน",
        variant: "destructive",
      });
    }
  };

  const handleDownload = async () => {
    if (!word) {
      toast({
        title: "ไม่มีคำให้ดาวน์โหลด",
        description: "กรุณาเพิ่มคำก่อนดาวน์โหลด",
        variant: "destructive",
      });
      return;
    }

    if (!boxRef.current) {
      toast({
        title: "ไม่สามารถดาวน์โหลดได้",
        description: "ไม่พบองค์ประกอบที่ต้องการดาวน์โหลด",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsRendering(true);
      
      // Fix: Use safe canvas options to prevent gradient issues
      const canvas = await html2canvas(boxRef.current, {
        scale: 2,
        backgroundColor: null,
        logging: false,
        useCORS: true,
        allowTaint: true, // Allow cross-origin images
        onclone: (document, clone) => {
          // Safe handling for gradients in cloned document
          const elementsWithGradients = clone.querySelectorAll('[style*="gradient"]');
          elementsWithGradients.forEach((el) => {
            if (el instanceof HTMLElement) {
              // Use solid fallback colors instead of gradients for export
              const bgColor = window.getComputedStyle(el).backgroundColor;
              if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)') {
                el.style.background = bgColor;
              } else {
                el.style.background = '#f97316'; // Fallback to orange color
              }
            }
          });
        }
      });
      
      const url = canvas.toDataURL('image/png', 0.9);
      setImageUrl(url);
      
      const link = document.createElement("a");
      link.href = url;
      link.download = `tomato-box-${word}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "ดาวน์โหลดสำเร็จ",
        description: `บันทึกภาพ tomato-box-${word}.png แล้ว`,
      });
    } catch (error) {
      console.error("Error downloading image:", error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถดาวน์โหลดได้ในขณะนี้",
        variant: "destructive",
      });
    } finally {
      setIsRendering(false);
    }
  };

  useEffect(() => {
    if (!word || !boxRef.current) return;
    
    const timer = setTimeout(() => {
      renderTomatoBox();
    }, 500);
    
    return () => clearTimeout(timer);
  }, [word, contributor, sentence]);

  const renderTomatoBox = async () => {
    if (!boxRef.current || isRendering) return null;
    
    try {
      setIsRendering(true);
      
      // Fix: Use safe canvas options to prevent gradient issues
      const canvas = await html2canvas(boxRef.current, {
        scale: 2,
        backgroundColor: null,
        logging: false,
        useCORS: true,
        allowTaint: true, // Allow cross-origin images
        onclone: (document, clone) => {
          // Safe handling for gradients in cloned document
          const elementsWithGradients = clone.querySelectorAll('[style*="gradient"]');
          elementsWithGradients.forEach((el) => {
            if (el instanceof HTMLElement) {
              // Use solid fallback colors instead of gradients for export
              const bgColor = window.getComputedStyle(el).backgroundColor;
              if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)') {
                el.style.background = bgColor;
              } else {
                el.style.background = '#f97316'; // Fallback to orange color
              }
            }
          });
        }
      });
      
      const url = canvas.toDataURL('image/png', 0.9);
      setImageUrl(url);
      return url;
    } catch (error) {
      console.error("Error generating tomato box image:", error);
      return null;
    } finally {
      setIsRendering(false);
    }
  };

  return (
    <Card className="mb-8" id="tomato-box">
      <CardContent className="p-6">
        <div className="mb-4">
          <div className="flex items-center gap-2">
            <MessageSquareQuote className="h-5 w-5 text-orange-500" />
            <h3 className="text-xl font-semibold">กล่องน้ำมะเขือเทศของคุณ</h3>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            ดาวน์โหลดหรือแชร์กล่องน้ำมะเขือเทศพร้อมคำกำลังใจของคุณ
          </p>
        </div>

        <div 
          ref={boxRef}
          id="tomato-box-image"
          className="relative bg-gradient-to-br from-red-500 to-orange-500 aspect-[2/3] rounded-lg shadow-lg flex flex-col items-center justify-center p-4 mb-4 overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #f97316 0%, #ef4444 100%)', // Simplified gradient
            backgroundSize: '120px 120px',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/90 to-orange-500/90" style={{ background: 'rgba(239, 68, 68, 0.9)' }}></div>
          
          <div className="absolute top-0 right-0 w-16 h-16 z-10">
            <svg viewBox="0 0 100 100" className="fill-white/20">
              <path d="M0 0 L100 0 L100 100 Z" />
            </svg>
          </div>

          <div className="absolute top-2 right-2 text-xs text-white opacity-70 rotate-6 z-10">
            การ์ดปอนด์
          </div>
          
          <div className="absolute top-0 left-0 w-full h-8 bg-orange-600/40 z-10" />
          
          <div className="bg-white/90 rounded-md p-4 w-4/5 aspect-square flex items-center justify-center shadow-lg transform -rotate-1 z-20 transition-all duration-300 hover:rotate-0 hover:scale-105">
            <div className="text-center">
              <p className="font-bold text-xl sm:text-2xl text-primary break-words mb-2">
                {word || "คำของคุณ"}
              </p>
              {motivationalSentence && (
                <div className="text-sm text-gray-700 mt-2 p-2 bg-orange-50 rounded-md border border-orange-100">
                  {highlightWords(motivationalSentence, selectedWords)}
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-2 text-white text-center z-20">
            <p className="text-sm">โดย: {contributor || "คุณ"}</p>
            <p className="text-xs mt-1">ร่วมกันสร้างกำลังใจ</p>
          </div>
          
          <div className="absolute bottom-0 left-0 w-full h-20 bg-orange-600/20 z-10" />
          <div className="absolute bottom-2 right-2 text-2xs text-white/70 z-10">
            "คำ"ลังใจ
          </div>
        </div>

        <div className="flex flex-wrap gap-2 justify-center">
          <Button 
            onClick={handleDownload} 
            variant="outline" 
            className="gap-2 transition-all duration-300 hover:scale-105"
            disabled={isRendering}
          >
            <Download className="w-4 h-4" />
            ดาวน์โหลด
          </Button>
          
          <ShareButton 
            platform="facebook"
            url={window.location.href}
            sectionId="tomato-box-image"
            text={`คำกำลังใจจากฉัน: "${word}" โดย ${contributor}`}
          />
          
          <ShareButton 
            platform="twitter"
            url={window.location.href}
            sectionId="tomato-box-image"
            text={`คำกำลังใจจากฉัน: "${word}" โดย ${contributor}`}
          />
          
          <Button 
            onClick={handleCopyImage} 
            variant="secondary" 
            className="gap-2 transition-all duration-300 hover:scale-105"
            disabled={isRendering}
          >
            <Copy className="w-4 h-4" />
            คัดลอก
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TomatoBox;
