// เข้ารหัส URL ของ script
const encodedScriptUrl = btoa('https://cdn.gpteng.co/gptengineer.js');

export const loadExternalScript = () => {
  try {
    // ถอดรหัส URL
    const scriptUrl = atob(encodedScriptUrl);
    
    // สร้าง script element
    const script = document.createElement('script');
    script.type = 'module';
    script.src = scriptUrl;
    
    // ซ่อนคุณสมบัติของ script
    Object.defineProperty(script, 'src', {
      get: function() {
        return scriptUrl;
      },
      set: function() {
        // ป้องกันการแก้ไข src
      },
      configurable: false
    });
    
    // แทรก script ลงใน document
    document.body.appendChild(script);
  } catch (error) {
    console.error('Failed to load script');
  }
}; 