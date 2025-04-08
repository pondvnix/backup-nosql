
import React from "react";

export interface TomatoBoxContentProps {
  word: string;
  contributor: string;
  sentence?: string;
  selectedWords?: string[];
  withoutImageGeneration?: boolean; // Flag to optimize for image generation
}

const TomatoBoxContent: React.FC<TomatoBoxContentProps> = ({
  word = "กำลังใจ",
  contributor = "ไม่ระบุชื่อ",
  sentence,
  selectedWords,
  withoutImageGeneration = false
}) => {
  const highlightWordsInSentence = (sentence: string | undefined, focusWord: string) => {
    if (!sentence || !focusWord) return sentence;
    const regex = new RegExp(`(${focusWord})`, 'gi');
    const parts = sentence.split(regex);
    return parts.map((part, index) => {
      if (part.toLowerCase() === focusWord.toLowerCase()) {
        return (
          <span 
            key={index} 
            className="bg-orange-200 text-orange-800 rounded px-[6px] mx-[2px] word-highlight"
            style={{
              fontFamily: "'Sarabun', sans-serif",
              fontWeight: 500,
              display: 'inline-block',
              position: 'relative'
            }}
          >
            {part}
          </span>
        );
      }
      return part;
    });
  };

  return (
    <div className="relative border-4 border-red-600 p-6 rounded-lg bg-gradient-to-r from-red-50 to-orange-50" style={{ fontFamily: "'Sarabun', sans-serif" }}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="bg-red-600 h-12 w-12 rounded-full flex items-center justify-center text-white font-semibold shadow-md">
            <span className="font-sarabun" style={{ fontFamily: "'Sarabun', sans-serif" }}>ดอยคำ</span>
          </div>
          <div>
            <h3 className="text-red-800 font-bold font-sarabun" style={{ fontFamily: "'Sarabun', sans-serif" }}>ผลิตภัณฑ์ดอยคำ</h3>
            <p className="text-xs text-red-600 font-sarabun" style={{ fontFamily: "'Sarabun', sans-serif" }}>โครงการส่วนพระองค์</p>
          </div>
        </div>
        <div className="text-xs text-red-600 bg-red-50 border border-red-200 px-2 py-1 rounded font-sarabun" style={{ fontFamily: "'Sarabun', sans-serif" }}>
          กล่องคำลังใจ
        </div>
      </div>
      
      <div className="flex items-center gap-4 mb-6">
        <div className="w-1/3 flex-shrink-0">
          <div className="relative aspect-square overflow-hidden rounded-md shadow-sm border-2 border-red-200">
            <img 
              src="https://img.th.my-best.com/product_images/ce41644a1e7e304e755ac435ea9827ee.png?ixlib=rails-4.3.1&q=70&lossless=0&w=800&h=800&fit=clip&s=ef32b4f80be0dc2e6bb165897baa6116" 
              alt="Doikham Tomato Juice" 
              className="object-cover w-full h-full" 
              crossOrigin="anonymous" 
            />
          </div>
        </div>
        
        <div className="w-2/3">
          <div className="bg-white py-3 px-4 rounded-lg shadow-inner border border-red-100">
            <h2 className="text-xl font-semibold text-red-800 mb-1 font-sarabun" style={{ fontFamily: "'Sarabun', sans-serif" }}>กล่องคำลังใจ</h2>
            <p className="text-orange-500 font-medium text-lg mb-2 font-sarabun word-highlight" style={{ 
              fontFamily: "'Sarabun', sans-serif", 
              fontWeight: 500,
              display: 'inline-block'
            }}>"{word}"</p>
            <div className="text-xs text-gray-500 mt-1 flex justify-between font-sarabun" style={{ fontFamily: "'Sarabun', sans-serif" }}>
              <span>ขนาด 100%</span>
              <span>โดย {contributor}</span>
            </div>
          </div>
        </div>
      </div>
      
      {sentence && (
        <div className="mb-4 bg-white p-4 rounded-lg shadow border border-orange-200">
          <div className="relative">
            <div className="absolute -top-2 -left-2 bg-orange-50 border border-orange-200 rounded-full p-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange-500">
                <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"></path>
                <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"></path>
              </svg>
            </div>
            <h3 className="text-orange-800 font-medium mb-1 pl-5" style={{ fontFamily: "'Sarabun', sans-serif" }}>ประโยคให้กำลังใจ</h3>
            <p className="text-sm italic text-orange-700 pl-5 font-sarabun" style={{ fontFamily: "'Sarabun', sans-serif" }}>
              "{highlightWordsInSentence(sentence, word)}"
            </p>
          </div>
        </div>
      )}
      
      {selectedWords && selectedWords.length > 0 && (
        <div className="bg-white p-3 rounded-lg shadow-sm border border-red-100">
          <p className="text-xs font-medium mb-2 text-red-700 font-sarabun" style={{ fontFamily: "'Sarabun', sans-serif" }}>ส่วนประกอบ:</p>
          <div className="flex flex-wrap gap-1.5 justify-start">
            {selectedWords.map((selectedWord, index) => (
              <span 
                key={index} 
                className={`px-2 py-0.5 ${
                  selectedWord.toLowerCase() === word.toLowerCase() 
                    ? 'bg-orange-200 text-orange-900 word-highlight' 
                    : 'bg-orange-100 text-orange-800'
                } text-xs rounded-full border border-orange-200 font-sarabun`}
                style={{ 
                  fontFamily: "'Sarabun', sans-serif",
                  fontWeight: selectedWord.toLowerCase() === word.toLowerCase() ? 500 : 'normal',
                  display: 'inline-block'
                }}
              >
                {selectedWord}
              </span>
            ))}
          </div>
        </div>
      )}
      
      <div className="mt-4 pt-3 border-t border-red-200 flex justify-between items-center">
        <div className="text-xs text-red-700 font-sarabun" style={{ fontFamily: "'Sarabun', sans-serif" }}>
          <p>ผลิตโดย โครงการส่วนพระองค์ สวนจิตรลดา</p>
          <p>กล่องคำลังใจ - ข้อความให้กำลังใจ</p>
        </div>
        <div className="text-xs text-red-600 bg-white px-2 py-1 rounded-full border border-red-200 font-sarabun" style={{ fontFamily: "'Sarabun', sans-serif" }}>
          กำลังใจ
        </div>
      </div>

      <div className="absolute bottom-2 right-2 opacity-20">
        <div className="text-red-800 font-bold text-xs" style={{ fontFamily: "'Sarabun', sans-serif" }}>
          ดอยคำ
        </div>
      </div>
    </div>
  );
};

export default TomatoBoxContent;
