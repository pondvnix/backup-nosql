
import React from "react";
import Header from "./Header";
import MobileFooter from "./MobileFooter";

interface LayoutProps {
  children: React.ReactNode;
  className?: string;
}

const Layout = ({ children, className = "" }: LayoutProps) => {
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
