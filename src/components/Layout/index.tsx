// client/src/components/Layout/index.tsx
import React from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";

const Layout: React.FC<{children: React.ReactNode}> = ({children}) => {
  return (
    <div className="app-layout">
      <Header />
      <Sidebar />
      <main>{children}</main>
    </div>
  );
};

export default Layout;
