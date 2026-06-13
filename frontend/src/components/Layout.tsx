import type { ReactNode } from "react";
import BottomNav from "./BottomNav";

import ChatWidget from "./ChatWidget";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      {children}
      <ChatWidget/>
      <BottomNav />
    </div>
  );
};

export default Layout;