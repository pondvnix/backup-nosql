
import { useEffect, useState } from "react";
import html2canvas from "html2canvas";
import { Button } from "@/components/ui/button";
import { Copy, Download, Facebook, Twitter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ShareButton from "@/components/ShareButton";
import { Card } from "@/components/ui/card";

// Add a props interface at the top of the file
export interface TomatoBoxProps {
  word: string;
  contributor: string;
  sentence?: string;
  selectedWords?: string[];
}

// Make sure the component accepts the props
const TomatoBox = ({ word = "กำลังใจ", contributor = "ไม่ระบุชื่อ", sentence, selectedWords }: TomatoBoxProps) => {
  const [imageUrl, setImageUrl] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const { toast } = useToast();

  // Generate the tomato box image
  const generateTomatoBoxImage = async () => {
    setIsGenerating(true);
    try {
      const tomatoBoxElement = document.getElementById('tomato-box-content');
      
      if (tomatoBoxElement) {
        const canvas = await html2canvas(tomatoBoxElement, {
          backgroundColor: "#ffffff",
          scale: 2, // Higher resolution
        });
        
        const imageUrl = canvas.toDataURL('image/png');
        setImageUrl(imageUrl);
      }
    } catch (error) {
      console.error("Error generating tomato box image:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Generate image when component mounts or when props change
  useEffect(() => {
    generateTomatoBoxImage();
  }, [word, contributor, sentence, selectedWords]);

  // Copy to clipboard function
  const copyToClipboard = async () => {
    try {
      if (imageUrl) {
        // For modern browsers
        const blob = await fetch(imageUrl).then(r => r.blob());
        const item = new ClipboardItem({ "image/png": blob });
        await navigator.clipboard.write([item]);
        
        toast({
          title: "คัดลอกสำเร็จ",
          description: "กล่องน้ำมะเขือเทศถูกคัดลอกไปยังคลิปบอร์ดแล้ว",
        });
      }
    } catch (error) {
      console.error("คัดลอกล้มเหลว:", error);
      toast({
        title: "คัดลอกล้มเหลว",
        description: "ไม่สามารถคัดลอกรูปภาพได้ กรุณาใช้ปุ่มดาวน์โหลดแทน",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6 font-sarabun">
      {/* Hidden div that will be converted to image */}
      <div id="tomato-box-content" className="bg-white p-6 rounded-lg shadow-lg max-w-lg mx-auto" style={{ display: "block" }}>
        <div className="relative border-4 border-red-600 p-6 rounded-lg bg-gradient-to-r from-red-50 to-orange-50">
          {/* Doikham Logo and Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-red-600 h-12 w-12 rounded-full flex items-center justify-center text-white font-semibold shadow-md">
                <span>ดอยคำ</span>
              </div>
              <div>
                <h3 className="text-red-800 font-bold">ผลิตภัณฑ์ดอยคำ</h3>
                <p className="text-xs text-red-600">โครงการส่วนพระองค์</p>
              </div>
            </div>
            <div className="text-xs text-red-600 bg-red-50 border border-red-200 px-2 py-1 rounded">
              กล่องคำลังใจ
            </div>
          </div>
          
          {/* Main Content */}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-1/3 flex-shrink-0">
              <div className="relative aspect-square overflow-hidden rounded-md shadow-sm border-2 border-red-200">
                <img 
                  src="https://img.th.my-best.com/product_images/ce41644a1e7e304e755ac435ea9827ee.png?ixlib=rails-4.3.1&q=70&lossless=0&w=800&h=800&fit=clip&s=ef32b4f80be0dc2e6bb165897baa6116" 
                  alt="Doikham Tomato Juice" 
                  className="object-cover w-full h-full"
                />
              </div>
            </div>
            
            <div className="w-2/3">
              <div className="bg-white py-3 px-4 rounded-lg shadow-inner border border-red-100">
                <h2 className="text-xl font-semibold text-red-800 mb-1">กล่องคำลังใจ</h2>
                <p className="text-orange-500 font-medium text-lg mb-2">"{word}"</p>
                <div className="text-xs text-gray-500 mt-1 flex justify-between">
                  <span>ขนาด 100%</span>
                  <span>โดย {contributor}</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Sentence */}
          {sentence && (
            <div className="mb-4 bg-white p-3 rounded-lg shadow border border-red-100">
              <div className="relative">
                <div className="absolute -top-2 -left-2 bg-red-50 border border-red-200 rounded-full p-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500">
                    <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"></path>
                    <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"></path>
                  </svg>
                </div>
                <p className="text-sm italic text-gray-700 pl-5">"{sentence}"</p>
              </div>
            </div>
          )}
          
          {/* Selected Words */}
          {selectedWords && selectedWords.length > 0 && (
            <div className="bg-white p-3 rounded-lg shadow-sm border border-red-100">
              <p className="text-xs font-medium mb-2 text-red-700">ส่วนประกอบ:</p>
              <div className="flex flex-wrap gap-1.5 justify-start">
                {selectedWords.map((selectedWord, index) => (
                  <span key={index} className="px-2 py-0.5 bg-orange-100 text-orange-800 text-xs rounded-full border border-orange-200">
                    {selectedWord}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {/* Footer */}
          <div className="mt-4 pt-3 border-t border-red-200 flex justify-between items-center">
            <div className="text-xs text-red-700">
              <p>ผลิตโดย โครงการส่วนพระองค์ สวนจิตรลดา</p>
              <p>กล่องคำลังใจ - ข้อความให้กำลังใจ</p>
            </div>
            <div className="text-xs text-red-600 bg-white px-2 py-1 rounded-full border border-red-200">
              กำลังใจ
            </div>
          </div>
        </div>
      </div>

      {/* Display the generated image */}
      {imageUrl && (
        <Card className="p-4 bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-orange-800 mb-4">กล่องคำลังใจของคุณ</h3>
            <div className="bg-white p-2 rounded-lg shadow-md mb-4">
              <img
                src={imageUrl}
                alt="Doikham Box"
                className="max-w-full h-auto mx-auto rounded-lg"
              />
            </div>
            
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
              {/* Download button */}
              <a
                href={imageUrl}
                download={`doikham_box_${word}_${contributor}.png`}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-red-600 text-white hover:bg-red-700 h-10 px-4 py-2 gap-2 animate-fade-in"
              >
                <Download className="h-4 w-4" />
                ดาวน์โหลด
              </a>
              
              {/* Share to Facebook */}
              <ShareButton 
                platform="facebook" 
                url={window.location.href} 
                sectionId="tomato-box-section"
                text={`กล่องคำลังใจดอยคำ: "${word}" โดย ${contributor}`}
                className="bg-blue-600 text-white hover:bg-blue-700 h-10 animate-fade-in"
              />
              
              {/* Share to Twitter */}
              <ShareButton 
                platform="twitter" 
                url={window.location.href} 
                sectionId="tomato-box-section"
                text={`กล่องคำลังใจดอยคำ: "${word}" โดย ${contributor}`}
                className="bg-black text-white hover:bg-gray-800 h-10 animate-fade-in"
              />
              
              {/* Copy to clipboard */}
              <Button 
                onClick={copyToClipboard} 
                variant="outline" 
                className="gap-2 bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100 h-10 animate-fade-in"
              >
                <Copy className="h-4 w-4" />
                คัดลอก
              </Button>
            </div>
          </div>
        </Card>
      )}

      {isGenerating && (
        <div className="text-center py-4 animate-pulse">
          <p className="text-orange-600">กำลังสร้างกล่องคำลังใจ...</p>
        </div>
      )}
    </div>
  );
};

export default TomatoBox;
