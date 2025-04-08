
import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Smile, EyeIcon, UsersIcon, ChevronDown, Clock, BarChart2 } from "lucide-react";
import { getContributorName, setContributorName } from "@/utils/contributorManager";
import MotivationalSentence from "@/components/MotivationalSentence";
import WordSuggestions from "@/components/WordSuggestions";
import { saveMotivationalSentence } from "@/utils/motivationSentenceManager";
import WordStream from "@/components/WordStream";
import TomatoBox from "@/components/TomatoBox";
import Leaderboard from "@/components/Leaderboard";
import MoodReport from "@/components/MoodReport";
import StatsDashboard from "@/components/StatsDashboard";
import { Separator } from "@/components/ui/separator";

const Index = () => {
  const [name, setName] = useState<string>("");
  const [isNameSet, setIsNameSet] = useState<boolean>(false);
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const { toast } = useToast();

  // โหลดชื่อผู้ร่วมสร้างเมื่อ component ถูกโหลด
  useEffect(() => {
    const storedName = getContributorName();
    if (storedName && storedName !== 'ไม่ระบุชื่อ') {
      setName(storedName);
      setIsNameSet(true);
    }
  }, []);

  // จัดการเมื่อผู้ใช้บันทึกชื่อ
  const handleSetName = () => {
    if (!name.trim()) {
      toast({
        title: "กรุณาระบุชื่อ",
        description: "โปรดระบุชื่อของคุณก่อนดำเนินการต่อ",
        variant: "destructive",
      });
      return;
    }

    // บันทึกชื่อลงใน localStorage
    setContributorName(name);
    setIsNameSet(true);

    toast({
      title: "บันทึกชื่อเรียบร้อย",
      description: `ยินดีต้อนรับคุณ ${name} สู่ระบบประโยคให้กำลังใจ`,
    });
  };

  // จัดการเมื่อผู้ใช้เลือกคำ
  const handleWordSelect = (word: string) => {
    if (!selectedWords.includes(word)) {
      setSelectedWords([...selectedWords, word]);
    }
  };

  return (
    <Layout>
      {!isNameSet ? (
        // หน้าใส่ชื่อ
        <div className="mx-auto max-w-lg px-4 py-12">
          <Card className="border-2 border-primary/20 shadow-lg">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl md:text-3xl text-center font-bold bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent">
                ระบบประโยคให้กำลังใจ
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <UsersIcon className="h-5 w-5 text-primary" />
                  <label htmlFor="name" className="text-lg font-medium">
                    ชื่อผู้ร่วมสร้างประโยคให้กำลังใจ
                  </label>
                </div>
                <Input 
                  id="name" 
                  placeholder="ระบุชื่อของคุณ" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="border-primary/20 focus:border-primary focus:ring-primary"
                />
                <p className="text-sm text-muted-foreground">
                  ชื่อของคุณจะถูกแสดงเมื่อประโยคให้กำลังใจของคุณปรากฏในระบบ
                </p>
              </div>
              <Button 
                className="w-full hover-bright transition-all duration-300 bg-gradient-to-r from-primary to-orange-500 hover:from-orange-500 hover:to-primary"
                onClick={handleSetName}
                disabled={!name.trim()}
              >
                <Smile className="h-4 w-4 mr-2" />
                เริ่มสร้างประโยคให้กำลังใจ
              </Button>
            </CardContent>
          </Card>
        </div>
      ) : (
        // หน้าหลักระบบ
        <div className="w-full space-y-12 pb-20">
          {/* Hero Section - สร้างประโยคให้กำลังใจ */}
          <section className="w-full bg-gradient-to-b from-orange-50 to-white py-8">
            <div className="container mx-auto px-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-4">
                  <Card className="border-none shadow-lg bg-white/80 backdrop-blur">
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2 text-primary">
                        <Smile className="h-6 w-6 text-primary" />
                        <span>ยินดีต้อนรับคุณ {name}</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="mb-4 text-lg">
                        เลือกคำจากรายการด้านล่างเพื่อสร้างประโยคให้กำลังใจที่มีคำเหล่านั้น
                      </p>
                      
                      {/* คำที่เลือกแล้ว */}
                      {selectedWords.length > 0 && (
                        <div className="mb-4 animate-fade-in">
                          <h3 className="text-sm font-medium mb-2">คำที่เลือกแล้ว:</h3>
                          <div className="flex flex-wrap gap-2">
                            {selectedWords.map((word, index) => (
                              <div 
                                key={index} 
                                className="px-3 py-1 bg-primary/10 rounded-full text-primary animate-fade-in-left"
                                style={{ animationDelay: `${index * 0.1}s` }}
                              >
                                {word}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* แสดงประโยคให้กำลังใจ */}
                      <div className="mb-6">
                        <MotivationalSentence selectedWords={selectedWords} />
                      </div>
                      
                      {/* แสดงคำแนะนำ */}
                      <WordSuggestions onWordSelect={handleWordSelect} selectedWords={selectedWords} />
                    </CardContent>
                  </Card>
                </div>
                <div>
                  <Card className="border-none shadow-lg bg-white/80 backdrop-blur">
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2 text-primary">
                        <EyeIcon className="h-5 w-5" />
                        <span>คำแนะนำการใช้งาน</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="p-3 bg-secondary rounded-md">
                        <h3 className="font-medium mb-2">วิธีการสร้างประโยคให้กำลังใจ</h3>
                        <ol className="space-y-2 list-decimal ml-5">
                          <li>เลือกคำจากรายการ "คำแนะนำ" ด้านล่าง</li>
                          <li>คลิกที่คำที่ต้องการใช้</li>
                          <li>ระบบจะสร้างประโยคให้กำลังใจที่มีคำนั้น</li>
                          <li>ประโยคจะถูกบันทึกและแสดงในส่วน "ประโยคให้กำลังใจ"</li>
                        </ol>
                      </div>
                      
                      <div className="p-3 bg-primary/10 rounded-md">
                        <h3 className="font-medium mb-2">ประเภทความรู้สึก</h3>
                        <ul className="space-y-2">
                          <li className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                            <span>เชิงบวก - ประโยคที่ให้ความรู้สึกดี (2 คะแนน)</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                            <span>กลาง - ประโยคที่เป็นกลาง (1 คะแนน)</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-500"></div>
                            <span>เชิงลบ - ประโยคที่ท้าทาย (-1 คะแนน)</span>
                          </li>
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </section>
          
          {/* Section "คำ"ลังใจ */}
          <section className="w-full bg-gradient-to-r from-orange-50 to-orange-100 py-10">
            <div className="container mx-auto px-4">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-primary mb-2">"คำ"ลังใจ</h2>
                <p className="text-lg max-w-2xl mx-auto">
                  ร่วมสร้างประโยคกำลังใจที่ยาวที่สุด โดยเพิ่มคำของคุณต่อท้ายคำอื่นๆ เพื่อส่งต่อกำลังใจให้กับผู้ป่วยและบุคลากรทางการแพทย์
                </p>
                <div className="w-20 h-1 bg-primary mx-auto mt-4 mb-6 rounded-full"></div>
              </div>
              
              <Card className="border-none shadow-xl overflow-hidden">
                <CardContent className="p-6">
                  <WordStream />
                </CardContent>
              </Card>
            </div>
          </section>
          
          {/* Section กล่องน้ำมะเขือเทศ */}
          <section className="w-full bg-white py-10">
            <div className="container mx-auto px-4">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-primary mb-2">กล่องน้ำมะเขือเทศของคุณ</h2>
                <p className="text-lg max-w-2xl mx-auto">
                  ดาวน์โหลดและแชร์กล่องน้ำมะเขือเทศของคุณเพื่อบอกเล่าเรื่องราวกำลังใจ
                </p>
                <div className="w-20 h-1 bg-primary mx-auto mt-4 mb-6 rounded-full"></div>
              </div>
              
              <div className="max-w-3xl mx-auto">
                <Card className="border-none shadow-xl overflow-hidden bg-white">
                  <CardContent className="p-6">
                    <TomatoBox />
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>
          
          {/* Section อันดับผู้ร่วมสร้างกำลังใจ */}
          <section className="w-full bg-gradient-to-b from-orange-50 to-white py-10">
            <div className="container mx-auto px-4">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-primary mb-2">อันดับผู้ร่วมสร้างกำลังใจ</h2>
                <p className="text-lg max-w-2xl mx-auto">
                  ผู้ที่มีส่วนร่วมในการสร้างกำลังใจให้กับผู้อื่นมากที่สุด
                </p>
                <div className="w-20 h-1 bg-primary mx-auto mt-4 mb-6 rounded-full"></div>
              </div>
              
              <Card className="border-none shadow-xl overflow-hidden">
                <CardContent className="p-6">
                  <Leaderboard />
                </CardContent>
              </Card>
            </div>
          </section>
          
          {/* Section สถิติและประโยคกำลังใจล่าสุด */}
          <section className="w-full bg-white py-10">
            <div className="container mx-auto px-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* ประโยคกำลังใจล่าสุด */}
                <div>
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-primary flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      ประโยคกำลังใจล่าสุด
                    </h2>
                    <div className="w-16 h-1 bg-primary mt-2 rounded-full"></div>
                  </div>
                  
                  <Card className="border-none shadow-lg overflow-hidden">
                    <CardContent className="p-6">
                      <MoodReport limit={5} />
                    </CardContent>
                  </Card>
                </div>
                
                {/* สถิติทั้งหมด */}
                <div>
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-primary flex items-center gap-2">
                      <BarChart2 className="h-5 w-5" />
                      สถิติทั้งหมด
                    </h2>
                    <div className="w-16 h-1 bg-primary mt-2 rounded-full"></div>
                  </div>
                  
                  <Card className="border-none shadow-lg overflow-hidden">
                    <CardContent className="p-6">
                      <StatsDashboard />
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}
    </Layout>
  );
};

export default Index;
