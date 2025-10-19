// components/Sidebar.jsx
import { useContext, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, LogOut, ChevronUp, ChevronDown } from "lucide-react";
import Button from "./Button";
import Bar_3 from "../icons/Bar_3";
import Bar_3_bottom_right from "../icons/Bar_3_bottom_right";

const menuByRole = {
  doctor: [
    { label: "วินิจฉัย", path: "/doctor/diagnosis"},
    { label: "ใบรับรองแพทย์", path: "/doctor/medical-certificates"},
  ],
  nurse: [
    { label: "คำขอนัดหมาย", path: "/nurse/appointment-req" },
  ],
  nurseCounter: [
    { label: "Precheck", path: "/nurse/precheck" },
  ],
  head_nurse: [
    { label: "คำแนะนำการเตรียมตัว", path: "/head_nurse/guide" },
    { label: "ข้อมูลบริการ", path: "/head_nurse/services" },
    { label: "ข้อมูลห้องตรวจ", path: "/head_nurse/examination-room" },
    { label: "ข้อมูลแพทย์", path: "/head_nurse/doctors" },
    {
      label: "ข้อมูลตารางออกตรวจแพทย์",
      path: "/head_nurse/schedules",
    },
    { label: "ข้อมูลพยาบาล", path: "/head_nurse/nurses" },
    {
      label: "ข้อมูลตารางเวรพยาบาล",
      path: "/head_nurse/nurses-schedules",
    },
    {
      label: "จัดการแบบประเมินอาการ",
      path: "/head_nurse/symptom-question",
    },
    {
      label: "รายงาน",
      path: "/head_nurse/dashboard",
    },
  ],
};

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  console.log("user role", user.role);
  const role = user?.role;
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  let menuItemsForRole = [];
  console.log('[sidebar] user.is_counter_terminal', user.is_counter_terminal)
  if (user?.role === "nurse") {
    menuItemsForRole = user.is_counter_terminal
      ? menuByRole.nurse // ถ้าเป็นพยาบาลประจำ counter
      : menuByRole.nurseCounter; // ถ้าเป็นพยาบาลทั่วไป
  } else {
    menuItemsForRole = menuByRole[user?.role] || [];
  }

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const toggleCollapsible = (key) => {
    setOpenCollapsible((prevKey) => (prevKey === key ? null : key));
  };

  const isSectionActive = (subItems) =>
    subItems.some((item) => location.pathname.startsWith(item.path));

  const renderMenuItem = (item) => {
    // กรณีที่เมนูเป็นแบบ collapsible

    // กรณีที่ Sidebar ปิดอยู่
    if (!isSidebarOpen) {
      return null;
    }
    // สำหรับเมนูปกติ
    return (
      <NavLink
        key={item.path}
        to={item.path}
        className={({ isActive }) =>
          `flex items-center p-2 rounded hover:bg-stromboli-900 transition-colors duration-200 ${
            isActive ? "bg-secondary-default font-semibold text-white" : ""
          }`
        }
        title={item.label}
      >
        {item.icon && <item.icon size={18} className="mr-2" />}
        {isSidebarOpen && item.label}
      </NavLink>
    );
  };

  return (
    <div
      className={`flex flex-col justify-between h-screen m-2 p-4 transition-all duration-300 bg-primary-default border-r rounded-xl 
      ${isSidebarOpen ? "w-60" : "w-20"} overflow-hidden`}
      style={{ height: "calc(100vh - 1rem)" }}
    >
      <div className="flex flex-col">
        <div
          className={`flex items-center p-4 ${
            isSidebarOpen ? "justify-between" : "justify-center"
          }`}
        >
          <span className="font-bold text-lg truncate text-white">
            {isSidebarOpen ? "จัดการข้อมูล" : ""} {/* Sidebar title */}
          </span>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-1 rounded"
          >
            {isSidebarOpen ? (
              <Bar_3_bottom_right className="w-6 h-6 text-white hover:text-gray-100" />
            ) : (
              <Bar_3 className="w-6 h-6 text-white hover:text-gray-100" />
            )}
          </button>
        </div>
        <nav className="flex flex-col gap-2 p-2 text-white flex-grow overflow-y-auto">
          {menuItemsForRole.map(renderMenuItem)}
        </nav>
      </div>

      {/* logout section */}
      {user && (
        <div className="bottom-10 mt-auto">
          <hr className="border-stromboli-300 mb-2" />
          <Button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2"
            title={isSidebarOpen ? "ออกจากระบบ" : "ออกจากระบบ"}
          >
            <LogOut size={18} />
            {isSidebarOpen && "ออกจากระบบ"}
          </Button>
        </div>
      )}
    </div>
  );
}
