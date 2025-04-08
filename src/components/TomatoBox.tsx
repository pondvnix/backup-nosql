// Add a props interface at the top of the file
export interface TomatoBoxProps {
  word: string;
  contributor: string;
}

// Make sure the component accepts the props
const TomatoBox = ({ word = "กำลังใจ", contributor = "ไม่ระบุชื่อ" }: TomatoBoxProps) => {
  // Function to generate the Tomato Box image URL
  const generateTomatoBoxURL = () => {
    const apiEndpoint = `https://tomato.nayoo.co/api/generate?word=${encodeURIComponent(word)}&name=${encodeURIComponent(contributor)}`;
    return apiEndpoint;
  };

  const imageUrl = generateTomatoBoxURL();

  return (
    <div>
      <img
        src={imageUrl}
        alt="Tomato Box"
        style={{ maxWidth: '100%', height: 'auto' }}
      />
      <div className="mt-4 text-center">
        <a
          href={imageUrl}
          download={`tomato_box_${word}_${contributor}.png`}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2"
        >
          ดาวน์โหลดกล่องน้ำมะเขือเทศ
        </a>
      </div>
    </div>
  );
};

export default TomatoBox;
