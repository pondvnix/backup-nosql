import { useEffect, useState, useRef } from "react";
import html2canvas from "html2canvas";
import domtoimage from "dom-to-image";
import { saveAs } from "file-saver";
import { Button } from "@/components/ui/button";
import { Copy, Download, Facebook, Twitter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ShareButton from "@/components/ShareButton";
import { Card } from "@/components/ui/card";

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

        const textElements = tomatoBoxElement.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, div');
        textElements.forEach(el => {
          (el as HTMLElement).style.fontFamily = "'Sarabun', sans-serif";
        });

        const wordElement = tomatoBoxElement.querySelector('.word-highlight');
        if (wordElement) {
          (wordElement as HTMLElement).style.fontFamily = "'Sarabun', sans-serif";
          (wordElement as HTMLElement).style.fontWeight = "500";
        }

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
                
                const wordElement = clonedElement.querySelector('.word-highlight');
                if (wordElement) {
                  (wordElement as HTMLElement).style.fontFamily = "'Sarabun', sans-serif";
                  (wordElement as HTMLElement).style.fontWeight = "500";
                }
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
        description: "ไม่สามาร���บันทึกรูปภาพได้ กรุณาลองใหม่อีกครั้ง",
        variant: "destructive"
      });
    }
  };

  const dataURLtoBlob = (dataURL: string): Blob => {
    const arr = dataURL.split(',');
    const mime = arr[0].match(/:(.*?);/)![1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  };

  const highlightWordsInSentence = (sentence: string | undefined, focusWord: string) => {
    if (!sentence || !focusWord) return sentence;
    const regex = new RegExp(`(${focusWord})`, 'gi');
    const parts = sentence.split(regex);
    return parts.map((part, index) => {
      if (part.toLowerCase() === focusWord.toLowerCase()) {
        return <span key={index} className="bg-orange-200 text-orange-800 rounded px-[6px] mx-[6px] word-highlight" style={{fontFamily: "'Sarabun', sans-serif"}}>{part}</span>;
      }
      return part;
    });
  };

  return <div className="space-y-6 font-sarabun">
      <div id="tomato-box-content" ref={tomatoBoxRef} className="bg-white p-6 rounded-lg shadow-lg max-w-lg mx-auto" style={{
      display: "block",
      fontFamily: "'Sarabun', sans-serif",
      width: "100%"
    }}>
        <div className="relative border-4 border-red-600 p-6 rounded-lg bg-gradient-to-r from-red-50 to-orange-50" style={{ fontFamily: "'Sarabun', sans-serif" }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-red-600 h-12 w-12 rounded-full flex items-center justify-center text-white font-semibold shadow-md">
                <span className="font-sarabun" style={{ fontFamily: "'Sarabun', sans-serif" }}>ดอยคำ</span>
              </div>
              <div>
                <h3 className="text-red-800 font-bold font-sarabun" style={{ fontFamily: "'Sarabun', sans-serif" }}>ผลิตภัณฑ์ดอยคำ</h3>
                <p className="text-xs text-red-600 font-sarabun" style={{ fontFamily: "'Sarabun', sans-serif" }}>โครงการส่วนพระองค์</p>
              </div>
            </div>
            <div className="text-xs text-red-600 bg-red-50 border border-red-200 px-2 py-1 rounded font-sarabun" style={{ fontFamily: "'Sarabun', sans-serif" }}>
              กล่องคำลังใจ
            </div>
          </div>
          
          <div className="flex items-center gap-4 mb-6">
            <div className="w-1/3 flex-shrink-0">
              <div className="relative aspect-square overflow-hidden rounded-md shadow-sm border-2 border-red-200">
                <img src="https://img.th.my-best.com/product_images/ce41644a1e7e304e755ac435ea9827ee.png?ixlib=rails-4.3.1&q=70&lossless=0&w=800&h=800&fit=clip&s=ef32b4f80be0dc2e6bb165897baa6116" alt="Doikham Tomato Juice" className="object-cover w-full h-full" crossOrigin="anonymous" />
              </div>
            </div>
            
            <div className="w-2/3">
              <div className="bg-white py-3 px-4 rounded-lg shadow-inner border border-red-100">
                <h2 className="text-xl font-semibold text-red-800 mb-1 font-sarabun" style={{ fontFamily: "'Sarabun', sans-serif" }}>กล่องคำลังใจ</h2>
                <p className="text-orange-500 font-medium text-lg mb-2 font-sarabun word-highlight" style={{ fontFamily: "'Sarabun', sans-serif" }}>"{word}"</p>
                <div className="text-xs text-gray-500 mt-1 flex justify-between font-sarabun" style={{ fontFamily: "'Sarabun', sans-serif" }}>
                  <span>ขนาด 100%</span>
                  <span>โดย {contributor}</span>
                </div>
              </div>
            </div>
          </div>
          
          {sentence && <div className="mb-4 bg-white p-4 rounded-lg shadow border border-orange-200">
              <div className="relative">
                <div className="absolute -top-2 -left-2 bg-orange-50 border border-orange-200 rounded-full p-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange-500">
                    <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"></path>
                    <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"></path>
                  </svg>
                </div>
                <h3 className="text-orange-800 font-medium mb-1 pl-5" style={{ fontFamily: "'Sarabun', sans-serif" }}>ประโยคให้กำลังใจ</h3>
                <p className="text-sm italic text-orange-700 pl-5 font-sarabun" style={{ fontFamily: "'Sarabun', sans-serif" }}>"{highlightWordsInSentence(sentence, word)}"</p>
              </div>
            </div>}
          
          {selectedWords && selectedWords.length > 0 && <div className="bg-white p-3 rounded-lg shadow-sm border border-red-100">
              <p className="text-xs font-medium mb-2 text-red-700 font-sarabun" style={{ fontFamily: "'Sarabun', sans-serif" }}>ส่วนประกอบ:</p>
              <div className="flex flex-wrap gap-1.5 justify-start">
                {selectedWords.map((selectedWord, index) => <span key={index} className={`px-2 py-0.5 ${selectedWord.toLowerCase() === word.toLowerCase() ? 'bg-orange-200 text-orange-900 word-highlight' : 'bg-orange-100 text-orange-800'} text-xs rounded-full border border-orange-200 font-sarabun`} style={{ fontFamily: "'Sarabun', sans-serif" }}>
                    {selectedWord}
                  </span>)}
              </div>
            </div>}
          
          <div className="mt-4 pt-3 border-t border-red-200 flex justify-between items-center">
            <div className="text-xs text-red-700 font-sarabun" style={{ fontFamily: "'Sarabun', sans-serif" }}>
              <p>ผลิตโดย โครงการส่วนพระองค์ สวนจิตรลดา</p>
              <p>กล่องคำลังใจ - ข้อความให้กำลังใจ</p>
            </div>
            <div className="text-xs text-red-600 bg-white px-2 py-1 rounded-full border border-red-200 font-sarabun" style={{ fontFamily: "'Sarabun', sans-serif" }}>
              กำลังใจ
            </div>
          </div>

          <div className="absolute bottom-2 right-2 opacity-20">
            <div className="text-red-800 font-bold text-xs" style={{ fontFamily: "'Sarabun', sans-serif" }}>
              ดอยคำ
            </div>
          </div>
        </div>
      </div>

      {imageUrl && <Card className="p-4 bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
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
        </Card>}

      {isGenerating && <div className="text-center py-4 animate-pulse">
          <p className="text-orange-600 font-sarabun">กำลังสร้างกล่องคำลังใจ...</p>
        </div>}
    </div>;
};

export default TomatoBox;
