
import { useState, useEffect, useRef } from "react";
import html2canvas from "html2canvas";
import domtoimage from "dom-to-image";
import { useToast } from "@/hooks/use-toast";

interface TomatoImageGeneratorProps {
  tomatoBoxRef: React.RefObject<HTMLDivElement>;
  word: string;
  contributor: string;
  onImageGenerated: (imageUrl: string) => void;
}

const TomatoImageGenerator = ({
  tomatoBoxRef,
  word,
  contributor,
  onImageGenerated
}: TomatoImageGeneratorProps) => {
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [fontsLoaded, setFontsLoaded] = useState<boolean>(false);
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
          onImageGenerated(dataUrl);
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
          onImageGenerated(imageUrl);
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
  }, [fontsLoaded]);

  return (
    isGenerating ? (
      <div className="text-center py-4 animate-pulse">
        <p className="text-orange-600 font-sarabun">กำลังสร้างกล่องคำลังใจ...</p>
      </div>
    ) : null
  );
};

export default TomatoImageGenerator;
