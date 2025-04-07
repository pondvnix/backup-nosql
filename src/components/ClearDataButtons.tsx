
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Cookie, Trash, Trash2 } from "lucide-react";

const ClearDataButtons = () => {
  const { toast } = useToast();

  const clearLocalStorage = () => {
    try {
      localStorage.clear();
      toast({
        title: "ล้างแคชเรียบร้อย",
        description: "ล้างข้อมูลแคชทั้งหมดสำเร็จ เพจจะรีเฟรชใน 3 วินาที",
      });
      
      // Refresh page after a brief delay
      setTimeout(() => {
        window.location.reload();
      }, 3000);
    } catch (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถล้างข้อมูลแคชได้",
        variant: "destructive",
      });
    }
  };

  const clearCookies = () => {
    try {
      // Get all cookies and delete them
      const cookies = document.cookie.split(";");
      
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i];
        const eqPos = cookie.indexOf("=");
        const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
      }
      
      toast({
        title: "ล้างคุกกี้เรียบร้อย",
        description: "ล้างคุกกี้ทั้งหมดสำเร็จ เพจจะรีเฟรชใน 3 วินาที",
      });
      
      // Refresh page after a brief delay
      setTimeout(() => {
        window.location.reload();
      }, 3000);
    } catch (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถล้างคุกกี้ได้",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>การจัดการข้อมูล</CardTitle>
        <CardDescription>ล้างข้อมูลแคชและคุกกี้ของเว็บไซต์</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button 
            variant="outline" 
            className="flex items-center justify-center gap-2 h-16 border-red-200 hover:bg-red-50 hover:text-red-600 transition-all"
            onClick={clearLocalStorage}
          >
            <Trash2 className="h-5 w-5" />
            <div className="flex flex-col items-start">
              <span className="font-medium">ล้างแคช</span>
              <span className="text-xs text-muted-foreground">ล้างข้อมูลที่เก็บในเบราว์เซอร์</span>
            </div>
          </Button>
          
          <Button 
            variant="outline" 
            className="flex items-center justify-center gap-2 h-16 border-amber-200 hover:bg-amber-50 hover:text-amber-600 transition-all"
            onClick={clearCookies}
          >
            <Cookie className="h-5 w-5" />
            <div className="flex flex-col items-start">
              <span className="font-medium">ล้างคุกกี้</span>
              <span className="text-xs text-muted-foreground">ล้างคุกกี้ทั้งหมดของเว็บไซต์</span>
            </div>
          </Button>
        </div>
        
        <div className="mt-2 p-3 bg-amber-50 border border-amber-100 rounded-md">
          <p className="text-sm text-amber-800">
            <strong>คำเตือน:</strong> การล้างข้อมูลจะเป็นการลบข้อมูลทั้งหมดที่เก็บไว้ในเบราว์เซอร์ รวมถึงประวัติคำ ประโยคกำลังใจ และการตั้งค่าต่างๆ การดำเนินการนี้ไม่สามารถเรียกคืนได้
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ClearDataButtons;
