
import React from "react";
import { Button } from "@/components/ui/button";
import { Facebook, Twitter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { setDynamicShareMetaInfo } from "@/utils/metaConfig";

export interface ShareButtonProps {
  platform: "facebook" | "twitter";
  url: string;
  sectionId: string;
  text?: string;
  title?: string;
  className?: string;
  imageUrl?: string;
}

export const ShareButton = ({
  platform,
  url,
  sectionId,
  text,
  title,
  className,
  imageUrl,
}: ShareButtonProps) => {
  const { toast } = useToast();
  
  // Build full URL with section anchor
  const fullUrl = url.includes('#') ? url : url + '#' + sectionId;
  const encodedUrl = encodeURIComponent(fullUrl);
  
  // Default text if none provided
  const defaultText = text || "คำกำลังใจจากฉัน";
  const encodedText = encodeURIComponent(defaultText);
  
  const handleShare = () => {
    // Set dynamic meta tags for better sharing experience if image is provided
    if (imageUrl) {
      setDynamicShareMetaInfo(
        imageUrl,
        title || '"คำ" ลังใจ - กล่องคำลังใจ',
        text || 'กล่องคำลังใจจากผลิตภัณฑ์ดอยคำ'
      );
    }
    
    let shareUrl = "";
    let windowTitle = "";
    
    if (platform === "facebook") {
      shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
      windowTitle = "facebook-share";
    } else if (platform === "twitter") {
      shareUrl = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`;
      windowTitle = "twitter-share";
    }
    
    // Open share popup
    window.open(
      shareUrl,
      windowTitle,
      'width=600,height=400'
    );
    
    toast({
      title: `กำลังแชร์ไปยัง ${platform === "facebook" ? "Facebook" : "X (Twitter)"}`,
      description: "หน้าต่างแชร์ได้เปิดขึ้นแล้ว",
    });
  };
  
  return (
    <Button 
      onClick={handleShare} 
      variant="outline" 
      className={`gap-2 transition-all duration-300 hover:scale-105 ${
        platform === "facebook" 
          ? "bg-blue-500 text-white hover:bg-blue-600" 
          : "bg-sky-500 text-white hover:bg-sky-600"
      } ${className || ""}`}
    >
      {platform === "facebook" ? (
        <Facebook className="w-4 h-4 transition-transform hover:animate-pulse" />
      ) : (
        <Twitter className="w-4 h-4 transition-transform hover:animate-pulse" />
      )}
      แชร์ {platform === "facebook" ? "Facebook" : "X"}
    </Button>
  );
};

export default ShareButton;
