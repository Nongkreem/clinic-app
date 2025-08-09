// frontend/src/pages/PatientDashboard.jsx
import React from "react";
import { useAuth } from "../../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import Button from "../../components/common/Button";
// ไม่ต้อง import '../App.css' แล้ว

function PatientDashboard() {
  const { user: currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (!currentUser || currentUser.role !== "patient") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4 text-center">
        <p className="text-lg text-gray-700 mb-4">
          คุณไม่มีสิทธิ์เข้าถึงหน้านี้ หรือยังไม่ได้เข้าสู่ระบบ
        </p>
        <button
          onClick={() => navigate("/login")}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
        >
          กลับไปหน้า Login
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="flex justify-between items-center pb-6 mb-6">
        <h2 className="text-3xl font-bold text-primary-default">
          ยินดีต้อนรับ, คนไข้ {currentUser.email}!
        </h2>
      </div>
      <Button type="button" onClick={() => navigate("/patient/appointment")}>
        สร้างนัดหมาย
      </Button>
    </div>
  );
}

export default PatientDashboard;
