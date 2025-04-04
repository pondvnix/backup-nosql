
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Home } from "lucide-react";
import MobileFooter from "@/components/MobileFooter";

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-gradient-to-b from-orange-50 to-white pb-16 md:pb-0">
      <div className="text-center space-y-6 max-w-lg">
        <h1 className="text-6xl md:text-8xl font-bold text-primary font-mitr">404</h1>
        <h2 className="text-3xl font-bold font-mitr">ไม่พบหน้าที่คุณต้องการ</h2>
        <p className="text-muted-foreground">
          หน้าที่คุณกำลังมองหาอาจถูกย้าย ลบ หรือไม่เคยมีอยู่
        </p>
        <Button size="lg" asChild>
          <Link to="/" className="flex items-center gap-2">
            <Home className="h-5 w-5" />
            <span>กลับสู่หน้าหลัก</span>
          </Link>
        </Button>
      </div>
      
      {/* Sticky footer bar for mobile and tablet */}
      <MobileFooter />
    </div>
  );
};

export default NotFound;
