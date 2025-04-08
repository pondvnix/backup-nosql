
import { useState, useEffect } from "react";
import Layout from "@/layouts/Layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Heart, EyeIcon, UsersIcon, Clock, BarChart2 } from "lucide-react";
import { getContributorName, setContributorName } from "@/utils/contributorManager";
import MotivationalSentence from "@/components/MotivationalSentence";
import { saveMotivationalSentence, getMotivationalSentences } from "@/utils/motivationSentenceManager";
import WordStream from "@/components/WordStream";
import TomatoBox from "@/components/TomatoBox";
import Leaderboard from "@/components/Leaderboard";
import MoodReport from "@/components/MoodReport";
import StatsDashboard from "@/components/StatsDashboard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import WordSuggestions from "@/components/WordSuggestions";

const Index = () => {
  const [name, setName] = useState<string>("");
  const [isNameSet, setIsNameSet] = useState<boolean>(false);
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [sentences, setSentences] = useState<any[]>([]);
  const { toast } = useToast();

  // โหลดชื่อผู้ร่วมสร้างเมื่อ component ถูกโหลด
  useEffect(() => {
    const storedName = getContributorName();
    if (storedName && storedName !== 'ไม่ระบุชื่อ') {
      setName(storedName);
      setIsNameSet(true);
    }
  }, []);

  // Load sentences initially
  useEffect(() => {
    const savedSentences = getMotivationalSentences();
    setSentences(Array.isArray(savedSentences) ? savedSentences : []);
  }, []);

  // Update sentences when they change
  useEffect(() => {
    const handleUpdate = () => {
      const savedSentences = getMotivationalSentences();
      setSentences(Array.isArray(savedSentences) ? savedSentences : []);
    };
    
    window.addEventListener('motivation-billboard-updated', handleUpdate);
    
    return () => {
      window.removeEventListener('motivation-billboard-updated', handleUpdate);
    };
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
        <div className="w-full max-w-lg px-4 py-12 mx-auto">
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
                <Heart className="h-4 w-4 mr-2" />
                เริ่มสร้างประโยคให้กำลังใจ
              </Button>
            </CardContent>
          </Card>
        </div>
      ) : (
        // หน้าหลักระบบ
        <div className="w-full space-y-12 pb-20">
          {/* Hero Section - สร้างประโยคให้กำลังใจ - Combined with WordStream */}
          <section className="w-full bg-gradient-to-b from-orange-50 to-white py-8">
            <div className="w-full px-4 mx-auto">
              <Card className="border-none shadow-lg bg-white/80 backdrop-blur overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-primary">
                    <Heart className="h-6 w-6 text-primary" />
                    <span>ยินดีต้อนรับคุณ {name}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="suggestions" className="w-full">
                    <TabsList className="mb-4 w-full">
                      <TabsTrigger value="suggestions" className="flex-1">คำแนะนำ</TabsTrigger>
                      <TabsTrigger value="stream" className="flex-1">สร้างประโยคกำลังใจ</TabsTrigger>
                      <TabsTrigger value="guide" className="flex-1">คำแนะนำการใช้งาน</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="suggestions" className="mt-0">
                      <div className="space-y-4">
                        <p className="text-lg">
                          เลือกคำจากรายการด้านล่างเพื่อสร้างประโยคให้กำลังใจที่มีคำเหล่านั้น
                        </p>
                        
                        {/* แสดง WordSuggestions */}
                        <WordSuggestions 
                          onWordSelect={handleWordSelect} 
                          selectedWords={selectedWords}
                        />
                        
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
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="stream" className="mt-0">
                      <WordStream onAddWord={handleWordSelect} />
                    </TabsContent>
                    
                    <TabsContent value="guide" className="mt-0">
                      <div className="space-y-4">
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
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          </section>
          
          {/* Section กล่องน้ำมะเขือเทศ */}
          <section id="tomato-box-section" className="w-full bg-white py-10">
            <div className="w-full px-4 mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-red-700 mb-2">กล่องน้ำมะเขือเทศดอยคำ</h2>
                <p className="text-lg max-w-2xl mx-auto">
                  ดาวน์โหลดและแชร์กล่องน้ำมะเขือเทศของคุณเพื่อบอกเล่าเรื่องราวกำลังใจ
                </p>
                <div className="w-20 h-1 bg-red-600 mx-auto mt-4 mb-6 rounded-full"></div>
              </div>
              
              <Card className="border-none shadow-xl overflow-hidden bg-white max-w-3xl mx-auto">
                <CardContent className="p-6">
                  <TomatoBox 
                    word={selectedWords[0] || "กำลังใจ"} 
                    contributor={name}
                    selectedWords={selectedWords} 
                  />
                </CardContent>
              </Card>
            </div>
          </section>
          
          {/* Section อันดับผู้ร่วมสร้างกำลังใจ */}
          <section className="w-full bg-gradient-to-b from-orange-50 to-white py-10">
            <div className="w-full px-4 mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-primary mb-2">อันดับผู้ร่วมสร้างกำลังใจ</h2>
                <p className="text-lg max-w-2xl mx-auto">
                  ผู้ที่มีส่วนร่วมในการสร้างกำลังใจให้กับผู้อื่นมากที่สุด
                </p>
                <div className="w-20 h-1 bg-primary mx-auto mt-4 mb-6 rounded-full"></div>
              </div>
              
              <Card className="border-none shadow-xl overflow-hidden">
                <CardContent className="p-6">
                  <Leaderboard allSentences={Array.isArray(sentences) ? sentences : []} />
                </CardContent>
              </Card>
            </div>
          </section>
          
          {/* Section สถิติและประโยคกำลังใจล่าสุด */}
          <section className="w-full bg-white py-10">
            <div className="w-full px-4 mx-auto">
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
                      <MoodReport sentences={Array.isArray(sentences) ? sentences : []} limit={5} />
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
                      <StatsDashboard sentences={Array.isArray(sentences) ? sentences : []} />
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
