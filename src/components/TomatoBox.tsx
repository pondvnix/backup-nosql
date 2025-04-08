
import { useEffect, useState } from "react";
import html2canvas from "html2canvas";
import { Button } from "@/components/ui/button";
import { Copy, Download, Facebook, Twitter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ShareButton from "@/components/ShareButton";

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
    <div className="space-y-6">
      {/* Hidden div that will be converted to image */}
      <div id="tomato-box-content" className="bg-white p-6 rounded-lg shadow-lg max-w-lg mx-auto" style={{ display: "block" }}>
        <div className="border-4 border-red-600 p-6 rounded-lg bg-red-50">
          <div className="text-center relative">
            {/* Create a small tomato logo/icon at the top */}
            <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 bg-white p-2 rounded-full border-2 border-red-600">
              <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">ดอยคำ</span>
              </div>
            </div>
            
            <h2 className="text-2xl font-bold text-red-700 mb-3 mt-4">กล่องน้ำมะเขือเทศดอยคำ</h2>
            <div className="text-3xl font-bold my-4 py-4 px-2 border-y-2 border-red-400 bg-white rounded-md shadow-inner">
              "{word}"
            </div>
            
            <p className="text-lg mt-3 font-medium text-red-800">โดย: {contributor}</p>
            
            {sentence && (
              <div className="mt-5 p-3 bg-white rounded-lg shadow-sm border border-red-200">
                <p className="text-md italic text-red-800">"{sentence}"</p>
              </div>
            )}
            
            {selectedWords && selectedWords.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium mb-2 text-red-700">คำที่เลือก:</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {selectedWords.map((selectedWord, index) => (
                    <span key={index} className="px-3 py-1 bg-red-100 text-red-800 text-xs rounded-full border border-red-300">
                      {selectedWord}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            <div className="mt-4 text-xs text-red-500 font-medium">
              กล่องน้ำมะเขือเทศดอยคำ - ข้อความให้กำลังใจตามแบบของคุณ
            </div>
          </div>
        </div>
      </div>

      {/* Display the generated image */}
      {imageUrl && (
        <div className="text-center">
          <img
            src={imageUrl}
            alt="Tomato Box"
            className="max-w-full h-auto mx-auto rounded-lg shadow-md border-2 border-red-100"
          />
          
          <div className="mt-6 flex flex-wrap gap-2 justify-center">
            {/* Download button */}
            <a
              href={imageUrl}
              download={`doikham_tomato_box_${word}_${contributor}.png`}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 gap-2"
            >
              <Download className="h-4 w-4" />
              ดาวน์โหลด
            </a>
            
            {/* Share to Facebook */}
            <ShareButton 
              platform="facebook" 
              url={window.location.href} 
              sectionId="tomato-box-section"
              text={`กล่องน้ำมะเขือเทศดอยคำ: "${word}" โดย ${contributor}`}
              className="bg-blue-500 text-white hover:bg-blue-600"
            />
            
            {/* Share to Twitter */}
            <ShareButton 
              platform="twitter" 
              url={window.location.href} 
              sectionId="tomato-box-section"
              text={`กล่องน้ำมะเขือเทศดอยคำ: "${word}" โดย ${contributor}`}
              className="bg-sky-500 text-white hover:bg-sky-600"
            />
            
            {/* Copy to clipboard */}
            <Button 
              onClick={copyToClipboard} 
              variant="outline" 
              className="gap-2 bg-gray-100 hover:bg-gray-200"
            >
              <Copy className="h-4 w-4" />
              คัดลอก
            </Button>
          </div>
        </div>
      )}

      {isGenerating && (
        <div className="text-center py-4">
          <p>กำลังสร้างกล่องน้ำมะเขือเทศ...</p>
        </div>
      )}
    </div>
  );
};

export default TomatoBox;
