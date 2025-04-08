
import { useEffect, useState } from "react";
import html2canvas from "html2canvas";

// Add a props interface at the top of the file
export interface TomatoBoxProps {
  word: string;
  contributor: string;
  sentence?: string;
  selectedWords?: string[];
}

// Make sure the component accepts the props
const TomatoBox = ({ word = "กำลังใจ", contributor = "ไม่ระบุชื่อ", sentence, selectedWords }: TomatoBoxProps) => {
  const [imageUrl, setImageUrl] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // Generate the tomato box image
  const generateTomatoBoxImage = async () => {
    setIsGenerating(true);
    try {
      const tomatoBoxElement = document.getElementById('tomato-box-content');
      
      if (tomatoBoxElement) {
        const canvas = await html2canvas(tomatoBoxElement, {
          backgroundColor: "#ffffff",
          scale: 2, // Higher resolution
        });
        
        const imageUrl = canvas.toDataURL('image/png');
        setImageUrl(imageUrl);
      }
    } catch (error) {
      console.error("Error generating tomato box image:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Generate image when component mounts or when props change
  useEffect(() => {
    generateTomatoBoxImage();
  }, [word, contributor, sentence, selectedWords]);

  return (
    <div className="space-y-6">
      {/* Hidden div that will be converted to image */}
      <div id="tomato-box-content" className="bg-white p-6 rounded-lg shadow-lg max-w-lg mx-auto" style={{ display: "block" }}>
        <div className="border-4 border-red-600 p-4 rounded-lg">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-2">กล่องน้ำมะเขือเทศ</h2>
            <div className="text-3xl font-bold my-4 py-4 border-y-2 border-red-300">"{word}"</div>
            <p className="text-lg mt-2">โดย: {contributor}</p>
            {sentence && <p className="text-md mt-4 italic">"{sentence}"</p>}
            {selectedWords && selectedWords.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium mb-1">คำที่เลือก:</p>
                <div className="flex flex-wrap gap-1 justify-center">
                  {selectedWords.map((selectedWord, index) => (
                    <span key={index} className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                      {selectedWord}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Display the generated image */}
      {imageUrl && (
        <div className="text-center">
          <img
            src={imageUrl}
            alt="Tomato Box"
            className="max-w-full h-auto mx-auto rounded-lg shadow-md"
          />
          <div className="mt-4">
            <a
              href={imageUrl}
              download={`tomato_box_${word}_${contributor}.png`}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2"
            >
              ดาวน์โหลดกล่องน้ำมะเขือเทศ
            </a>
          </div>
        </div>
      )}

      {isGenerating && (
        <div className="text-center py-4">
          <p>กำลังสร้างกล่องน้ำมะเขือเทศ...</p>
        </div>
      )}
    </div>
  );
};

export default TomatoBox;
