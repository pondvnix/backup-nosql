
import React from "react";
import Header from "@/components/Header";
import MobileFooter from "@/components/MobileFooter";

interface LayoutProps {
  children: React.ReactNode;
  hideHeader?: boolean;
  hideFooter?: boolean;
}

const Layout = ({ children, hideHeader = false, hideFooter = false }: LayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {!hideHeader && <Header />}
      <main className="flex-grow w-full pb-20 md:pb-6">{children}</main>
      {!hideFooter && <MobileFooter />}
    </div>
  );
};

export default Layout;
