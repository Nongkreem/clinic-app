// components/Sidebar.jsx
import { useContext, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, LogOut, ChevronUp, ChevronDown} from "lucide-react";
import Button from "./Button";
import Bar_3 from "../icons/Bar_3";
import Bar_3_bottom_right from "../icons/Bar_3_bottom_right";

const menuByRole = {
  doctor: [
    { label: "Dashboard", path: "/doctor/dashboard" },
    { label: "Appointments", path: "/doctor/appointments" },
    { label: "Reports", path: "/doctor/reports" },
  ],
  nurse: [
    { label: "คำขอนัดหมาย", path: "/nurse-dashboard/appointment-req" },
    { label: "ตารางนัดหมาย", path: "/nurse-dashboard/appointment" }
  ],
  head_nurse: [
    { label: "คำแนะนำการเตรียมตัว", path: "/head_nurse-dashboard/guide" },
    { label: "ข้อมูลบริการ", path: "head_nurse-dashboard/services" },
    { label: "ข้อมูลห้องตรวจ", path: "/head_nurse-dashboard/examination-room" },
    { label: "ข้อมูลแพทย์", path: "/head_nurse-dashboard/doctors" },
    { label: "ข้อมูลตารางออกตรวจ", path: "/head_nurse-dashboard/schedules" },
    { label: "ข้อมูลพยาบาล", path: "/head_nurse-dashboard/nurses"}
  ],
};

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  console.log("user role", user.role);
  const role = user?.role;
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const [openCollapsible, setOpenCollapsible] = useState(null)
  console.log('isOpenCollapsible: ', openCollapsible)
  const menuItemsForRole = menuByRole[role] || [];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const toggleCollapsible = (key) => {
    setOpenCollapsible(prevKey => (prevKey === key ? null : key));
  }

  const isSectionActive = (subItems) => subItems.some(item => location.pathname.startsWith(item.path));

  const renderMenuItem = (item) => {

    // กรณีที่เมนูเป็นแบบ collapsible
    if (item.type === 'collapsible') {
      const isOpen = openCollapsible === item.key;
      const ChevronIcon = isOpen ? ChevronUp : ChevronDown;
      return (
        <div key={item.key} className="relative">
          <button
            onClick={() => toggleCollapsible(item.key)}
            className={`w-full flex items-center justify-between p-2 rounded hover:bg-stromboli-900 transition-colors duration-200 focus:outline-none 
              ${isSectionActive(item.subItems) ? 'bg-stromboli-900 font-semibold text-white' : ''}
            `}
            title={item.label}
          >
            <span className="flex items-center">
              {isSidebarOpen && item.label}
            </span>
            {isSidebarOpen && <ChevronIcon size={18} />}
          </button>
          {isSidebarOpen && isOpen && (
            <ul className="ml-4 mt-2 border-l border-stromboli-600 pl-4 space-y-2">
              {item.subItems.map(subItem => {
                const SubIconComponent = subItem.icon;
                return (
                  <NavLink
                    key={subItem.path}
                    to={subItem.path}
                    className={({ isActive }) =>
                      `flex items-center p-2 rounded hover:bg-secondary-default transition-colors duration-200 ${
                        isActive ? 'bg-secondary-default font-semibold text-white' : ''
                      }`
                    }
                    title={subItem.label}
                  >
                    {SubIconComponent && <SubIconComponent size={18} className="mr-2" />}
                    {subItem.label}
                  </NavLink>
                );
              })}
            </ul>
          )}
        </div>
      );
    }

    // กรณีที่ Sidebar ปิดอยู่
    if(!isSidebarOpen){
      return null;
    }
    // สำหรับเมนูปกติ
    return(
      <NavLink
        key={item.path}
        to={item.path}
        className={({ isActive }) => `flex items-center p-2 rounded hover:bg-stromboli-900 transition-colors duration-200 ${
          isActive ? 'bg-secondary-default font-semibold text-white' : ''
        }`
      }
      title={item.label}
      >
        { item.icon && <item.icon size={18} className="mr-2" /> }
        { isSidebarOpen && item.label }

      </NavLink>
    );

  };

  return (
    <div
      className={`flex flex-col justify-between h-screen m-2 p-4 transition-all duration-300 bg-primary-default border-r rounded-xl 
      ${isSidebarOpen ? 'w-60' : 'w-20'} overflow-hidden`}
      style={{ height: 'calc(100vh - 1rem)' }}
    >
      <div className="flex flex-col">
        <div className={`flex items-center p-4 ${isSidebarOpen ? 'justify-between' : 'justify-center'}`}>
          <span className="font-bold text-lg truncate text-white">
            {isSidebarOpen ? 'จัดการข้อมูล' : ''} {/* Sidebar title */}
          </span>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-1 rounded">
            {isSidebarOpen ? (
              <Bar_3_bottom_right className="w-6 h-6 text-white hover:text-gray-100"/>
            ) : (
              <Bar_3 className="w-6 h-6 text-white hover:text-gray-100"/>
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
          <hr className="border-stromboli-300 mb-2"/>
          <Button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2"
            title={isSidebarOpen ? "ออกจากระบบ" : "ออกจากระบบ"}
          >
            <LogOut size={18} />
            {isSidebarOpen && 'ออกจากระบบ'}
          </Button>
        </div>
      )}
    </div>
  );
}