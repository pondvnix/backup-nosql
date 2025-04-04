
import { Heart, ListPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();

  return (
    <header className="bg-white shadow-sm py-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Heart className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold font-mitr">
            <span className="text-primary">"คำ"</span>ลังใจ
          </h1>
        </div>
        <nav className="hidden md:flex gap-2">
          <Button variant="ghost" onClick={() => navigate("/")}>หน้าหลัก</Button>
          <Button variant="ghost" onClick={() => navigate("/leaderboard")}>อันดับ</Button>
          <Button variant="ghost" onClick={() => navigate("/about")}>เกี่ยวกับ</Button>
          <Button variant="outline" onClick={() => navigate("/management")} className="flex items-center gap-1">
            <ListPlus className="h-4 w-4" />
            <span>จัดการคำ</span>
          </Button>
        </nav>
      </div>
    </header>
  );
};

export default Header;
