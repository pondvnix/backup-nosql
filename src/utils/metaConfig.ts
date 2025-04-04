export const getEncodedMetaInfo = () => {
  // เข้ารหัสข้อมูล
  const encodeData = (data: string) => {
    return btoa(data);
  };

  // ถอดรหัสข้อมูล
  const decodeData = (encoded: string) => {
    return atob(encoded);
  };

  const metaInfo = {
    title: encodeData("Word Stream Encouragement"),
    description: encodeData("Word-Stream-Encouragement"),
    author: encodeData("pond-dev"),
    twitterHandle: encodeData("@pond_dev"),
    imageUrl: encodeData("https://wpmart.co/wp-content/uploads/2024/09/cropped-Favicon_WP-1-192x192.png")
  };

  return {
    getDecodedValue: (key: keyof typeof metaInfo) => decodeData(metaInfo[key])
  };
}; 