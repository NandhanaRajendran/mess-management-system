import { LogOut, Menu } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Header({ toggleMenu }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    sessionStorage.removeItem("role");
    navigate("/login");
  };

  return (
    <div className="header-card">

      {/* Hamburger (Mobile only) */}
      <button className="menu-icon" onClick={toggleMenu}>
        <Menu size={20} />
      </button>

      {/* Profile Section */}
      <div className="profile-section">
        <div className="avatar-circle">MS</div>
        <div>
          {/* <p className="header-name">Nandhana</p> */}
          <p className="header-role">Mess Secretary</p>
        </div>
      </div>

      {/* Logout */}
      <button className="logout-btn" onClick={handleLogout}>
        <LogOut size={16} />
        Logout
      </button>

    </div>
  );
}