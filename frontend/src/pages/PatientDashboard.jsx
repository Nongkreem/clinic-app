// frontend/src/pages/PatientDashboard.jsx
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
// ไม่ต้อง import '../App.css' แล้ว

function PatientDashboard() {
  const { user: currentUser, logout } = useAuth();
  const navigate = useNavigate();
  console.log('Current User:', currentUser);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!currentUser || currentUser.role !== 'patient') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4 text-center">
        <p className="text-lg text-gray-700 mb-4">คุณไม่มีสิทธิ์เข้าถึงหน้านี้ หรือยังไม่ได้เข้าสู่ระบบ</p>
        <button
          onClick={() => navigate('/login')}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
        >
          กลับไปหน้า Login
        </button>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8">
        <div className="flex justify-between items-center pb-6 border-b border-gray-200 mb-6">
          <h2 className="text-3xl font-bold text-blue-600">ยินดีต้อนรับ, คนไข้ {currentUser.email}!</h2>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
          >
            ออกจากระบบ
          </button>
        </div>
        <div className="text-left text-gray-800">
          <p className="text-lg mb-4">นี่คือหน้า Dashboard สำหรับคนไข้</p>
          <ul className="list-disc list-inside space-y-2">
            <li>ดูประวัติการนัดหมาย</li>
            <li>จองคิวแพทย์</li>
            <li>ดูข้อมูลส่วนตัว</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default PatientDashboard;