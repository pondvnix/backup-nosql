
import { Button } from "@/components/ui/button";
import { Copy, Download, Facebook, Twitter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ShareButton from "@/components/ShareButton";
import { saveAs } from "file-saver";

interface TomatoActionsProps {
  imageUrl: string;
  word: string;
  contributor: string;
  onRegenerateImage: () => void;
}

const TomatoActions = ({ 
  imageUrl, 
  word, 
  contributor, 
  onRegenerateImage 
}: TomatoActionsProps) => {
  const { toast } = useToast();

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
      
      <Button 
        onClick={onRegenerateImage} 
        variant="outline" 
        className="col-span-full mt-2 gap-2 text-orange-700 border-orange-200 hover:bg-orange-100"
      >
        สร้างรูปภาพใหม่
      </Button>
    </div>
  );
};

export default TomatoActions;
