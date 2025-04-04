
import Header from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Users, ClipboardList } from "lucide-react";
import MobileFooter from "@/components/MobileFooter";

const AboutPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-orange-50 to-white pb-16 md:pb-0">
      <Header />
      
      <main className="flex-1 container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-center mb-12 font-mitr animate-fade-in">
            เกี่ยวกับโครงการ
          </h1>
          
          <div className="space-y-8">
            <Card className="hover:shadow-lg transition-all duration-300 animate-fade-in">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-primary" />
                  <span>โครงการ "คำ"ลังใจ</span>
                </CardTitle>
                <CardDescription>
                  ส่งต่อกำลังใจผ่านถ้อยคำที่มีพลัง
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p>
                    โครงการ "คำ"ลังใจ เป็นโครงการที่เปิดโอกาสให้ทุกคนได้มีส่วนร่วมในการสร้างข้อความให้กำลังใจ
                    ผ่านการเพิ่มคำเข้าไปในประโยคร่วมกัน เพื่อสร้างประโยคกำลังใจที่ยาวที่สุดและมีความหมาย
                  </p>
                  <p>
                    ประโยคกำลังใจนี้จะถูกนำไปแสดงบน Billboard และแพลตฟอร์มต่างๆ เพื่อส่งต่อพลังใจให้กับผู้ป่วย
                    บุคลากรทางการแพทย์ และผู้ที่กำลังต้องการกำลังใจในยามที่ท้อแท้
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-lg transition-all duration-300 animate-fade-in">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-500" />
                  <span>แนวคิดของโครงการ</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p>
                    เราเชื่อว่าทุกคนมีพลังในการสร้างกำลังใจให้กับผู้อื่น แม้เพียงหนึ่งคำเท่านั้น
                    เมื่อทุกคนร่วมกันสร้างคำเหล่านั้น จะกลายเป็นประโยคที่มีพลังมหาศาล
                  </p>
                  <p>
                    โครงการนี้ไม่เพียงช่วยสร้างกำลังใจให้ผู้รับ แต่ยังช่วยให้ผู้ร่วมโครงการได้
                    ฝึกการมองโลกในแง่บวก และตระหนักถึงพลังของคำพูดที่มีต่อจิตใจของมนุษย์
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-lg transition-all duration-300 animate-fade-in">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardList className="h-5 w-5 text-green-500" />
                  <span>วิธีการเข้าร่วม</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-secondary/60 rounded-md p-4">
                    <h3 className="font-medium mb-2">1. เพิ่มคำของคุณ</h3>
                    <p className="text-sm text-muted-foreground">
                      เพียงเพิ่มหนึ่งคำที่คุณคิดว่าจะสร้างกำลังใจให้กับผู้อื่นได้ 
                      ลงในช่องด้านบนในหน้าหลัก พร้อมระบุชื่อของคุณ
                    </p>
                  </div>
                  
                  <div className="bg-secondary/60 rounded-md p-4">
                    <h3 className="font-medium mb-2">2. สร้างประโยคกำลังใจ</h3>
                    <p className="text-sm text-muted-foreground">
                      กดปุ่ม "ใช้คำนี้" เพื่อให้ระบบนำคำของคุณไปสร้างเป็นประโยคกำลังใจ 
                      ร่วมกับคำอื่นๆ ที่ผู้ร่วมโครงการได้เพิ่มเข้ามา
                    </p>
                  </div>
                  
                  <div className="bg-secondary/60 rounded-md p-4">
                    <h3 className="font-medium mb-2">3. แชร์ต่อ</h3>
                    <p className="text-sm text-muted-foreground">
                      แชร์ประโยคกำลังใจที่คุณมีส่วนร่วมสร้างไปยังโซเชียลมีเดียต่างๆ 
                      เพื่อส่งต่อกำลังใจไปยังผู้ที่ต้องการ
                    </p>
                  </div>
                </div>
                
                <div className="mt-6 text-center">
                  <p className="text-primary font-medium">
                    ร่วมเป็นส่วนหนึ่งในการสร้างกำลังใจให้กับสังคมไปด้วยกัน
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      <footer className="bg-white py-6 border-t hidden md:block">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground">
            &copy; {new Date().getFullYear()} "คำ"ลังใจ - 
            โครงการสร้างกำลังใจร่วมกัน
          </p>
        </div>
      </footer>
      
      {/* Sticky footer bar for mobile and tablet */}
      <MobileFooter />
    </div>
  );
};

export default AboutPage;
