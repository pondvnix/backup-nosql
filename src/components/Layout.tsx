
import React, { useEffect } from "react";
import Header from "./Header";
import MobileFooter from "./MobileFooter";

interface LayoutProps {
  children: React.ReactNode;
  className?: string;
}

const Layout = ({ children, className = "" }: LayoutProps) => {
  // Ensure Sarabun font is loaded for the app
  useEffect(() => {
    // Preload Sarabun font with better loading strategy
    const preloadLink = document.createElement('link');
    preloadLink.rel = 'preload';
    preloadLink.href = 'https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;500;600;700&display=swap';
    preloadLink.as = 'style';
    document.head.appendChild(preloadLink);
    
    // Load the font
    const fontLink = document.createElement('link');
    fontLink.rel = 'stylesheet';
    fontLink.href = 'https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;500;600;700&display=swap';
    fontLink.onload = () => {
      // When the font is loaded, trigger a custom event
      const event = new Event('fontLoaded');
      document.dispatchEvent(event);
    };
    document.head.appendChild(fontLink);
    
    // Also add a style tag to force the font to be used
    const style = document.createElement('style');
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;500;600;700&display=swap');
      .font-sarabun, body {
        font-family: 'Sarabun', sans-serif !important;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(preloadLink);
      document.head.removeChild(fontLink);
      document.head.removeChild(style);
    };
  }, []);
  
  return (
    <div className={`min-h-screen bg-[#fef8ee] pb-16 md:pb-0 ${className}`}>
      <Header />
      <main className="container mx-auto py-8">
        {children}
      </main>
      <MobileFooter />
    </div>
  );
};

export default Layout;
