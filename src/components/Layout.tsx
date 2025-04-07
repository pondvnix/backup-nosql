
import React from "react";
import Header from "./Header";
import MobileFooter from "./MobileFooter";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1">{children}</main>
      <MobileFooter />
    </div>
  );
};

export default Layout;
