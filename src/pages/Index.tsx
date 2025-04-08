
import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Smile, EyeIcon, UsersIcon } from "lucide-react";
import { getContributorName, setContributorName } from "@/utils/contributorManager";
import MotivationalSentence from "@/components/MotivationalSentence";
import WordSuggestions from "@/components/WordSuggestions";
import { saveMotivationalSentence } from "@/utils/motivationSentenceManager";
import WordStream from "@/components/WordStream";

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
      <div className="container mx-auto max-w-6xl space-y-6">
        {!isNameSet ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-center">ระบบประโยคให้กำลังใจ</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <UsersIcon className="h-5 w-5" />
                  <label htmlFor="name" className="text-lg font-medium">
                    ชื่อผู้ร่วมสร้างประโยคให้กำลังใจ
                  </label>
                </div>
                <Input 
                  id="name" 
                  placeholder="ระบุชื่อของคุณ" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <p className="text-sm text-muted-foreground">
                  ชื่อของคุณจะถูกแสดงเมื่อประโยคให้กำลังใจของคุณปรากฏในระบบ
                </p>
              </div>
              <Button 
                className="w-full" 
                onClick={handleSetName}
                disabled={!name.trim()}
              >
                <Smile className="h-4 w-4 mr-2" />
                เริ่มสร้างประโยคให้กำลังใจ
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Smile className="h-5 w-5 text-primary" />
                      <span>ยินดีต้อนรับคุณ {name}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-4">
                      เลือกคำจากรายการด้านล่างเพื่อสร้างประโยคให้กำลังใจที่มีคำเหล่านั้น
                    </p>
                    
                    {/* คำที่เลือกแล้ว */}
                    {selectedWords.length > 0 && (
                      <div className="mb-4">
                        <h3 className="text-sm font-medium mb-2">คำที่เลือกแล้ว:</h3>
                        <div className="flex flex-wrap gap-2">
                          {selectedWords.map((word, index) => (
                            <div key={index} className="px-3 py-1 bg-primary/10 rounded-full text-primary">
                              {word}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* แสดงประโยคให้กำลังใจ */}
                    <MotivationalSentence selectedWords={selectedWords} />
                    
                    {/* แสดงคำแนะนำ */}
                    <WordSuggestions onWordSelect={handleWordSelect} selectedWords={selectedWords} />
                  </CardContent>
                </Card>
              </div>
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
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
            
            {/* Section "คำ"ลังใจและอื่นๆ ที่ต้องการแสดง */}
            <div className="mt-8">
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-center">
                    "คำ"ลังใจ
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-center mb-4">
                    ร่วมสร้างประโยคกำลังใจที่ยาวที่สุด โดยเพิ่มคำของคุณต่อท้ายคำอื่นๆ เพื่อส่งต่อกำลังใจให้กับผู้ป่วยและบุคลากรทางการแพทย์
                  </p>
                  
                  {/* WordStream Component */}
                  <WordStream />
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default Index;
