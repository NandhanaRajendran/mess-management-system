import { LogOut, Menu } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function LibraryHeader({ toggleMenu }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    sessionStorage.removeItem("role");
    navigate("/login");
  };

  return (
    <div className="lib-header">
      <button className="lib-menu-btn" onClick={toggleMenu}>
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
  );
}