import { useState, useRef } from "react";
import TomatoBoxContent from "./TomatoBoxContent";
import TomatoImageGenerator from "./tomato/TomatoImageGenerator";
import TomatoImageDisplay from "./tomato/TomatoImageDisplay";

export interface TomatoBoxProps {
  word: string;
  contributor: string;
  sentence?: string;
  selectedWords?: string[];
}

const TomatoBox = ({
  word = "กำลังใจ",
  contributor = "ไม่ระบุชื่อ",
  sentence,
  selectedWords
}: TomatoBoxProps) => {
  const [imageUrl, setImageUrl] = useState<string>("");
  const tomatoBoxRef = useRef<HTMLDivElement>(null);

  const generateTomatoBoxImage = () => {
    // This function will be called from the TomatoActions component
    // to regenerate the image on demand
    if (tomatoBoxRef.current) {
      // Force a re-render of the TomatoImageGenerator component
      setImageUrl("");
      setTimeout(() => {
        // TomatoImageGenerator will handle the actual image generation
      }, 100);
    }
  };

  return (
    <div className="space-y-6 font-sarabun">
      <div id="tomato-box-content" ref={tomatoBoxRef} className="bg-white p-6 rounded-lg shadow-lg max-w-lg mx-auto" style={{
        display: "block",
        fontFamily: "'Sarabun', sans-serif",
        width: "100%"
      }}>
        <TomatoBoxContent 
          word={word}
          contributor={contributor}
          sentence={sentence}
          selectedWords={selectedWords}
        />
      </div>

      <TomatoImageGenerator
        tomatoBoxRef={tomatoBoxRef}
        word={word}
        contributor={contributor}
        onImageGenerated={setImageUrl}
      />

      {imageUrl && (
        <TomatoImageDisplay 
          imageUrl={imageUrl}
          word={word}
          contributor={contributor}
          onRegenerateImage={generateTomatoBoxImage}
        />
      )}
    </div>
  );
};

export default TomatoBox;
