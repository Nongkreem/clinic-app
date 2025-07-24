// components/Sidebar.jsx
import { useContext, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, LogOut } from "lucide-react";
import Button from "./Button";

const menuByRole = {
  doctor: [
    { label: "Dashboard", path: "/doctor/dashboard" },
    { label: "Appointments", path: "/doctor/appointments" },
    { label: "Reports", path: "/doctor/reports" },
  ],
  nurse: [
    { label: "ข้อมูลบริการ", path: "/nurse-dashboard/services" },
    { label: "ข้อมูลแพทย์", path: "/nurse-dashboard/doctors" },
    { label: "คำแนะนำการเตรียมตัว", path: "/nurse-dashboard/guide" }
  ],
  headNurse: [
    { label: "Dashboard", path: "/headnurse/dashboard" },
    { label: "Staff Management", path: "/headnurse/staff" },
    { label: "Reports", path: "/headnurse/reports" },
  ],
};

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  console.log(user.role);
  const role = user?.role;
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(true);

  const menuItems = menuByRole[role] || [];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };
  return (
    <div
      className={`flex flex-col justify-between h-screen m-2 p-4 transition-all duration-300 bg-primary-default border-r rounded-xl 
      ${isOpen ? "w-60" : "w-14"} overflow-hidden`}
      style={{ height: 'calc(100vh - 1rem)' }}
    >
      <div className="flex flex-col">
        <div className="flex items-center justify-between p-4">
          <span className="font-bold text-lg truncate text-white">
            {isOpen ? "จัดการข้อมูล" : ""}
          </span>
          <button onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? (
              <X size={20} color="white" />
            ) : (
              <Menu size={20} color="white" />
            )}
          </button>
        </div>
        <nav className="flex flex-col gap-2 p-2 text-white">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`p-2 rounded hover:bg-secondary-default ${
                location.pathname === item.path
                  ? "bg-secondary-default font-semibold text-white"
                  : ""
              }`}
              title={item.label}
            >
              {isOpen ? item.label : item.label[0]}
            </Link>
          ))}
        </nav>
      </div>

      {/* logout section */}
      {user && (
        <div className="bottom-10">
          <hr className="border-stromboli-300"/>
          <Button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2"
          >
            <LogOut size={18} />
            ออกจากระบบ
          </Button>
        </div>
      )}
    </div>
  );
}
