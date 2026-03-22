import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, Menu } from "lucide-react";
import "../../styles/library.css";

export default function LibraryLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    sessionStorage.removeItem("role");
    navigate("/login");
  };

  const navTo = (path) => {
    navigate(path);
    setSidebarOpen(false);
  };

  return (
    <div className="lib-layout">

      <div className={`lib-sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="lib-sidebar-top">
          <h2 className="lib-logo">Library</h2>
          <button className="lib-close-btn" onClick={() => setSidebarOpen(false)}>×</button>
        </div>
        <nav>
          <button onClick={() => navTo("/library/students")}>Student List</button>
          <button onClick={() => navTo("/library/duesheet")}>Due Sheet</button>
        </nav>
      </div>

      <div className="lib-main">
        <div className="lib-header">
          <button className="lib-menu-btn" onClick={() => setSidebarOpen(true)}>
            <Menu size={22} />
          </button>
          <div className="lib-profile">
            <div className="lib-avatar">LB</div>
            <div>
              <p className="lib-name">Librarian</p>
              <p className="lib-role">Library Manager</p>
            </div>
          </div>
          <button className="lib-logout-btn" onClick={handleLogout}>
            <LogOut size={15} />
            Logout
          </button>
        </div>

        <div className="lib-page">
          {children}
        </div>
      </div>

      {sidebarOpen && (
        <div className="lib-overlay" onClick={() => setSidebarOpen(false)} />
      )}

    </div>
  );
}