
import { useEffect, useState, useRef } from "react";
import html2canvas from "html2canvas";
import domtoimage from "dom-to-image";
import { saveAs } from "file-saver";
import { Button } from "@/components/ui/button";
import { Copy, Download, Facebook, Twitter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ShareButton from "@/components/ShareButton";
import { Card } from "@/components/ui/card";
import TomatoBoxContent from "./TomatoBoxContent";

export interface TomatoBoxProps {
  word: string;
  contributor: string;
  sentence?: string;
  selectedWords?: string[];
}

const TomatoBox = ({
  word = "กำลังใจ",
  contributor = "ไม่ระบุชื่อ",
  sentence,
  selectedWords
}: TomatoBoxProps) => {
  const [imageUrl, setImageUrl] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [fontsLoaded, setFontsLoaded] = useState<boolean>(false);
  const tomatoBoxRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    const checkFontsLoaded = () => {
      if (document.fonts && document.fonts.check('1em Sarabun')) {
        setFontsLoaded(true);
        return true;
      }
      return false;
    };

    if (checkFontsLoaded()) {
      return;
    }

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        setTimeout(() => {
          if (checkFontsLoaded()) {
            return;
          }
          setTimeout(() => setFontsLoaded(true), 1000);
        }, 200);
      });
    } else {
      setTimeout(() => setFontsLoaded(true), 1500);
    }
  }, []);

  const generateTomatoBoxImage = async () => {
    setIsGenerating(true);
    try {
      const tomatoBoxElement = document.getElementById('tomato-box-content');
      if (tomatoBoxElement) {
        if (document.fonts && !document.fonts.check('1em Sarabun')) {
          try {
            await document.fonts.load('1em Sarabun');
            await new Promise(resolve => setTimeout(resolve, 300));
          } catch (e) {
            console.log("Font loading error:", e);
          }
        }

        const originalStyle = tomatoBoxElement.getAttribute('style') || '';
        tomatoBoxElement.setAttribute('style', 
          `${originalStyle} font-family: 'Sarabun', sans-serif !important; 
           display: block !important; visibility: visible !important;`
        );

        // Ensure all text elements have the correct font and styling
        const textElements = tomatoBoxElement.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, div');
        textElements.forEach(el => {
          (el as HTMLElement).style.fontFamily = "'Sarabun', sans-serif";
        });

        // Properly style the highlighted word elements
        const wordElements = tomatoBoxElement.querySelectorAll('.word-highlight');
        wordElements.forEach(el => {
          (el as HTMLElement).style.fontFamily = "'Sarabun', sans-serif";
          (el as HTMLElement).style.fontWeight = "500";
          (el as HTMLElement).style.display = "inline-block";
          (el as HTMLElement).style.position = "relative";
        });

        await new Promise(resolve => setTimeout(resolve, 500));

        try {
          const dataUrl = await domtoimage.toPng(tomatoBoxElement, {
            quality: 1.0,
            bgcolor: "#ffffff",
            style: {
              display: "block",
              visibility: "visible",
              fontFamily: "'Sarabun', sans-serif",
            },
            width: tomatoBoxElement.offsetWidth,
            height: tomatoBoxElement.offsetHeight,
            cacheBust: true,
          });
          setImageUrl(dataUrl);
        } catch (domError) {
          console.error("Dom-to-image failed, falling back to html2canvas:", domError);
          const canvas = await html2canvas(tomatoBoxElement, {
            backgroundColor: "#ffffff",
            scale: 2,
            useCORS: true,
            allowTaint: true,
            logging: true,
            onclone: (clonedDoc) => {
              const clonedElement = clonedDoc.getElementById('tomato-box-content');
              if (clonedElement) {
                clonedElement.style.fontFamily = "'Sarabun', sans-serif";
                
                const textElements = clonedElement.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, div');
                textElements.forEach(el => {
                  (el as HTMLElement).style.fontFamily = "'Sarabun', sans-serif";
                });
                
                const wordElements = clonedElement.querySelectorAll('.word-highlight');
                wordElements.forEach(el => {
                  (el as HTMLElement).style.fontFamily = "'Sarabun', sans-serif";
                  (el as HTMLElement).style.fontWeight = "500";
                  (el as HTMLElement).style.display = "inline-block";
                  (el as HTMLElement).style.position = "relative";
                });
              }
            }
          });
          const imageUrl = canvas.toDataURL('image/png');
          setImageUrl(imageUrl);
        }

        tomatoBoxElement.setAttribute('style', originalStyle);
      }
    } catch (error) {
      console.error("Error generating tomato box image:", error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถสร้างรูปภาพได้ กรุณาลองใหม่อีกครั้ง",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    if (fontsLoaded) {
      const timer = setTimeout(() => {
        generateTomatoBoxImage();
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [word, contributor, sentence, selectedWords, fontsLoaded]);

  const copyToClipboard = async () => {
    try {
      if (imageUrl) {
        if (navigator.clipboard && ClipboardItem) {
          const blob = await fetch(imageUrl).then(r => r.blob());
          const item = new ClipboardItem({
            "image/png": blob
          });
          await navigator.clipboard.write([item]);
          toast({
            title: "คัดลอกสำเร็จ",
            description: "กล่องน้ำมะเขือเทศถูกคัดลอกไปยังคลิปบอร์ดแล้ว"
          });
        } else {
          // Fallback for browsers that don't support ClipboardItem
          const tempImg = document.createElement('img');
          tempImg.src = imageUrl;
          
          const tempContainer = document.createElement('div');
          tempContainer.style.position = 'fixed';
          tempContainer.style.pointerEvents = 'none';
          tempContainer.style.opacity = '0';
          tempContainer.appendChild(tempImg);
          document.body.appendChild(tempContainer);
          
          const range = document.createRange();
          range.selectNode(tempContainer);
          window.getSelection()?.removeAllRanges();
          window.getSelection()?.addRange(range);
          
          const success = document.execCommand('copy');
          window.getSelection()?.removeAllRanges();
          document.body.removeChild(tempContainer);
          
          if (success) {
            toast({
              title: "คัดลอกสำเร็จ",
              description: "กล่องน้ำมะเขือเทศถูกคัดลอกไปยังคลิปบอร์ดแล้ว"
            });
          } else {
            throw new Error("execCommand returned false");
          }
        }
      }
    } catch (error) {
      console.error("คัดลอกล้มเหลว:", error);
      toast({
        title: "คัดลอกล้มเหลว",
        description: "ไม่สามารถคัดลอกรูปภาพได้ กรุณาใช้ปุ่มดาวน์โหลดแทน",
        variant: "destructive"
      });
    }
  };

  const saveImage = () => {
    try {
      if (imageUrl) {
        saveAs(imageUrl, `doikham_box_${word}_${contributor}.png`);
        toast({
          title: "บันทึกสำเร็จ",
          description: "กล่องน้ำมะเขือเทศถูกบันทึกลงในอุปกรณ์ของคุณแล้ว"
        });
      }
    } catch (error) {
      console.error("บันทึกล้มเหลว:", error);
      toast({
        title: "บันทึกล้มเหลว",
        description: "ไม่สามารถบันทึกรูปภาพได้ กรุณาลองใหม่อีกครั้ง",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6 font-sarabun">
      <div id="tomato-box-content" ref={tomatoBoxRef} className="bg-white p-6 rounded-lg shadow-lg max-w-lg mx-auto" style={{
        display: "block",
        fontFamily: "'Sarabun', sans-serif",
        width: "100%"
      }}>
        <TomatoBoxContent 
          word={word}
          contributor={contributor}
          sentence={sentence}
          selectedWords={selectedWords}
        />
      </div>

      {imageUrl && (
        <Card className="p-4 bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-orange-800 mb-4 font-sarabun">กล่องคำลังใจของคุณ</h3>
            <div className="bg-white p-2 rounded-lg shadow-md mb-4">
              <img src={imageUrl} alt="Doikham Box" className="max-w-full h-auto mx-auto rounded-lg" />
            </div>
            
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
              <Button onClick={saveImage} className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-red-600 text-white hover:bg-red-700 h-10 px-4 py-2 gap-2 animate-fade-in">
                <Download className="h-4 w-4" />
                ดาวน์โหลด
              </Button>
              
              <ShareButton 
                platform="facebook" 
                url={window.location.href} 
                sectionId="tomato-box-section" 
                text={`กล่องคำลังใจดอยคำ: "${word}" โดย ${contributor}`}
                imageUrl={imageUrl}
                title={`"${word}" - กล่องคำลังใจดอยคำ`}
                className="bg-blue-600 text-white hover:bg-blue-700 h-10 animate-fade-in" 
              />
              
              <ShareButton 
                platform="twitter" 
                url={window.location.href} 
                sectionId="tomato-box-section" 
                text={`กล่องคำลังใจดอยคำ: "${word}" โดย ${contributor}`}
                imageUrl={imageUrl}
                title={`"${word}" - กล่องคำลังใจดอยคำ`}
                className="bg-black text-white hover:bg-gray-800 h-10 animate-fade-in" 
              />
              
              <Button onClick={copyToClipboard} variant="outline" className="gap-2 bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100 h-10 animate-fade-in">
                <Copy className="h-4 w-4" />
                คัดลอก
              </Button>
            </div>
            
            <Button onClick={generateTomatoBoxImage} variant="outline" className="mt-4 gap-2 text-orange-700 border-orange-200 hover:bg-orange-100">
              สร้างรูปภาพใหม่
            </Button>
          </div>
        </Card>
      )}

      {isGenerating && (
        <div className="text-center py-4 animate-pulse">
          <p className="text-orange-600 font-sarabun">กำลังสร้างกล่องคำลังใจ...</p>
        </div>
      )}
    </div>
  );
};

export default TomatoBox;
