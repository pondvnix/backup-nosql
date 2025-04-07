
import { Home, Award, Info, Settings, HistoryIcon } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const MobileFooter = () => {
  const location = useLocation();
  const path = location.pathname;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-2 flex justify-around z-50 md:hidden">
      <Link 
        to="/" 
        className={cn(
          "flex flex-col items-center text-muted-foreground hover:text-primary",
          path === "/" && "text-primary"
        )}
      >
        <Home size={20} />
        <span className="text-xs mt-1">หน้าหลัก</span>
      </Link>
      <Link 
        to="/leaderboard" 
        className={cn(
          "flex flex-col items-center text-muted-foreground hover:text-primary",
          path === "/leaderboard" && "text-primary"
        )}
      >
        <Award size={20} />
        <span className="text-xs mt-1">อันดับ</span>
      </Link>
      <Link 
        to="/logs" 
        className={cn(
          "flex flex-col items-center text-muted-foreground hover:text-primary",
          path === "/logs" && "text-primary"
        )}
      >
        <HistoryIcon size={20} />
        <span className="text-xs mt-1">บันทึก</span>
      </Link>
      <Link 
        to="/about" 
        className={cn(
          "flex flex-col items-center text-muted-foreground hover:text-primary",
          path === "/about" && "text-primary"
        )}
      >
        <Info size={20} />
        <span className="text-xs mt-1">เกี่ยวกับ</span>
      </Link>
      <Link 
        to="/management" 
        className={cn(
          "flex flex-col items-center text-muted-foreground hover:text-primary",
          path === "/management" && "text-primary"
        )}
      >
        <Settings size={20} />
        <span className="text-xs mt-1">จัดการ</span>
      </Link>
    </div>
  );
};

export default MobileFooter;
