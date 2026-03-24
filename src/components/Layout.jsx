import { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import "../styles/mess.css";

export default function Layout({ children }) {

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleMenu = () => setSidebarOpen(!sidebarOpen);
  const closeMenu = () => setSidebarOpen(false);

  return (
    <div className="mess-scope layout">

      <Sidebar isOpen={sidebarOpen} closeMenu={closeMenu} />

      <div className="main">

        <Header toggleMenu={toggleMenu} />

        <div className="page-content">
          {children}
        </div>

      </div>

      {sidebarOpen && (
        <div className="mobile-overlay" onClick={closeMenu}></div>
      )}

    </div>
  );
}