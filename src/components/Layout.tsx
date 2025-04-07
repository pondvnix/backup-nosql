
import React from "react";
import Header from "./Header";
import MobileFooter from "./MobileFooter";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-gray-50 pb-16 md:pb-0">
      <Header />
      <main className="container mx-auto py-8">
        {children}
      </main>
      <MobileFooter />
    </div>
  );
};

export default Layout;
