import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Home, CalendarPlus, ClipboardList, CalendarDays, FileText } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState("home");

  // ฟังก์ชันจัดการลิงก์ตามสถานะล็อกอิน
  const handleNavigate = (id, path) => {
    setActiveMenu(id);
    if (!isAuthenticated) {
      navigate("/login");
    } else {
      // ถ้าเป็นเมนูหน้าหลักหรือโลโก้ ให้ไปหน้า landing เสมอ
      if (id === "home") {
        navigate("/patient/landing");
      } else {
        navigate(path);
      }
    }
  };

  // เมนูหลัก (ใช้ทั้ง Desktop & Mobile)
  const menuItems = [
    {
      id: "home",
      label: "หน้าหลัก",
      icon: <Home size={20} />,
      path: "/patient/landing",
    },
    {
      id: "assessment",
      label: "ทำแบบประเมิน",
      icon: <ClipboardList size={20} />,
      path: "/patient/assessment",
    },
    {
      id: "create",
      label: "สร้างนัดหมาย",
      icon: <CalendarPlus size={20} />,
      path: "/patient/create-appointment",
    },
    {
      id: "my-appointment",
      label: "นัดหมายของฉัน",
      icon: <CalendarDays size={20} />,
      path: "/patient/my-appointment",
    },
    {
      id: "my-certificate",
      label: "ใบรับรองแพทย์",
      icon: <FileText size={20} />,
      path: "/patient/e-certmed",
    },
  ];

  return (
    <>
      {/* Desktop Navbar */}
      <header
        className="hidden lg:flex items-center justify-between 
            fixed top-0 left-0 right-0 z-50
            bg-white/50 backdrop-blur-md 
            h-[80px] px-10 transition-all duration-300"
      >
        {/* LOGO */}
        <div
          className="flex items-center cursor-pointer"
          onClick={() => navigate("/patient/landing")}
        >
          <img
            src="/assets/logo.png"
            alt="Clinic Logo"
            className="w-16 h-auto object-contain"
          />
        </div>

        {/* Menu */}
        <nav className="flex items-center gap-8 text-gray-700 font-medium">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavigate(item.id, item.path)}
              className={`hover:text-primary-default transition ${
                activeMenu === item.id ? "text-primary-default" : ""
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Profile / Logout */}
        {isAuthenticated && (
          <div
            className="text-gray-500 text-sm hover:text-red-500 cursor-pointer"
            onClick={() => {
              logout();
              navigate("/landing");
            }}
          >
            ออกจากระบบ
          </div>
        )}
      </header>

      {/* Mobile Navbar */}
      <div className="bg-white lg:hidden fixed top-0 left-0 right-0 h-[60px] flex items-center justify-between px-4 pt-6 z-50">
        {/* โลโก้มุมซ้ายบน */}
        <div
          className="cursor-pointer flex items-center"
          onClick={() => navigate("/landing")}
        >
          <img
            src="/assets/logo.png"
            alt="Clinic Logo"
            className="w-[54px] h-auto object-contain"
          />
        </div>

        {isAuthenticated && (
          <button
            onClick={() => {
              logout();
              navigate("/landing");
            }}
            className="text-sm text-gray-500"
          >
            ออกจากระบบ
          </button>
        )}
      </div>

      {/* Bottom Navbar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50  bg-white/40 backdrop-blur-md flex justify-around py-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleNavigate(item.id, item.path)}
            className={`flex flex-col items-center justify-center gap-1 ${
              activeMenu === item.id ? "text-primary-default" : "text-gray-500"
            }`}
          >
            {item.icon}
            <span className="text-xs">{item.label}</span>
          </button>
        ))}
      </nav>
    </>
  );
};

export default Navbar;
