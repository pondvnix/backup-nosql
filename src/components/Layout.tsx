
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
    // Preload Sarabun font
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = 'https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;500;600;700&display=swap';
    link.as = 'style';
    document.head.appendChild(link);
    
    // Load the font
    const fontLink = document.createElement('link');
    fontLink.rel = 'stylesheet';
    fontLink.href = 'https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;500;600;700&display=swap';
    document.head.appendChild(fontLink);
    
    return () => {
      document.head.removeChild(link);
      document.head.removeChild(fontLink);
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
