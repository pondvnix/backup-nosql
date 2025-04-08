
import { Card } from "@/components/ui/card";
import TomatoActions from "./TomatoActions";

interface TomatoImageDisplayProps {
  imageUrl: string;
  word: string;
  contributor: string;
  onRegenerateImage: () => void;
}

const TomatoImageDisplay = ({
  imageUrl,
  word,
  contributor,
  onRegenerateImage
}: TomatoImageDisplayProps) => {
  if (!imageUrl) return null;
  
  return (
    <Card className="p-4 bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-orange-800 mb-4 font-sarabun">กล่องคำลังใจของคุณ</h3>
        <div className="bg-white p-2 rounded-lg shadow-md mb-4">
          <img src={imageUrl} alt="Doikham Box" className="max-w-full h-auto mx-auto rounded-lg" />
        </div>
        
        <TomatoActions
          imageUrl={imageUrl}
          word={word}
          contributor={contributor}
          onRegenerateImage={onRegenerateImage}
        />
      </div>
    </Card>
  );
};

export default TomatoImageDisplay;
