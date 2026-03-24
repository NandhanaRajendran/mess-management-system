import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import "../../styles/admin.css";
import { FacultyProvider }    from "../../context/FacultyContext";
import { DepartmentProvider } from "../../context/DepartmentContext";
import { StudentsProvider }   from "../../context/StudentsContext";
import { ProfileProvider, useProfile } from "../../context/ProfileContext";

import {
  LayoutDashboard, Users, Building2, UserCog,
  Receipt, Upload, Menu, X,
} from "lucide-react";

const navigation = [
  { name: "Dashboard",       path: "/admin/dashboard",       icon: LayoutDashboard },
  { name: "Students",        path: "/admin/students",         icon: Users },
  { name: "Departments",     path: "/admin/departments",      icon: Building2 },
  { name: "Staff & Faculty", path: "/admin/staff",            icon: UserCog },
  { name: "Fee Sections",    path: "/admin/fee-sections",     icon: Receipt },
  { name: "Bulk Enrollment", path: "/admin/bulk-enrollment",  icon: Upload },
  // { name: "Settings",        path: "/admin/settings",         icon: Settings },
];

/* Inner layout — reads from ProfileContext */
function AdminLayoutInner() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { profile, initials } = useProfile();

  const logout = () => {
    sessionStorage.removeItem("role");
    navigate("/login");
  };

  return (
    <div className="admin-layout">

      <aside className={`admin-sidebar ${open ? "open" : ""}`}>
        <div className="admin-logo">Enrollment Manager</div>
        <nav>
          {navigation.map((item, index) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={index}
                to={item.path}
                className="admin-link"
                onClick={() => setOpen(false)}
              >
                <Icon size={18} />
                {item.name}
              </NavLink>
            );
          })}
        </nav>
      </aside>

      <div className="admin-main">
        <header className="admin-topbar">
          <button className="menu-btn" onClick={() => setOpen(!open)}>
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>

          <div className="admin-profile">
            {/* Avatar shows initials derived from current fullName */}
            <div className="admin-avatar-initials">
              {initials}
            </div>
            <div className="admin-info">
              {/* Reacts live to profile.fullName changes */}
              <p><b>{profile.fullName}</b></p>
              <p>{profile.role}</p>
            </div>
          </div>

          <button className="admin-logout" onClick={logout}>Logout</button>
        </header>

        <main className="admin-page">
          <StudentsProvider>
            <DepartmentProvider>
              <FacultyProvider>
                <Outlet />
              </FacultyProvider>
            </DepartmentProvider>
          </StudentsProvider>
        </main>
      </div>

      {open && (
        <div className="mobile-overlay" onClick={() => setOpen(false)}></div>
      )}

    </div>
  );
}

/* Outer wrapper provides ProfileContext to the whole layout tree */
export default function AdminLayout() {
  return (
    <ProfileProvider>
      <AdminLayoutInner />
    </ProfileProvider>
  );
}