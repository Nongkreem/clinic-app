import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import HomeIcon from '../components/icons/HomeIcon';
import Button from '../components/common/Button';
const Home = () => {
  const { isAuthenticated, user, logout } = useAuth();

  const getDashboardLink = () => {
    if (!user || !user.role) return '/'; // Fallback
    switch (user.role) {
      case 'patient': return '/patient-dashboard';
      case 'doctor': return '/doctor-dashboard';
      case 'nurse': return '/nurse-dashboard';
      case 'head_nurse': return '/head-nurse-dashboard';
      case 'admin': return '/admin-dashboard';
      default: return '/';
    }
  };

  return (

    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4 text-center">
      <HomeIcon className="w-24 h-24 text-blue-500 mb-8" />
      <h1 className="text-5xl font-extrabold text-gray-900 mb-6">
        ยินดีต้อนรับสู่ <span className="text-blue-600">Clinic App</span>
      </h1>
      <p className="text-xl text-gray-700 mb-10 max-w-2xl">
        ระบบจัดการคลินิกที่ครบวงจร เพื่อการดูแลสุขภาพที่ดีที่สุดสำหรับคุณ
      </p>

      <div className="flex flex-col sm:flex-row gap-4">
        {!isAuthenticated ? (
          <>
            <Link to="/login">
              <Button variant="primary" className="w-full sm:w-auto">
                เข้าสู่ระบบ
              </Button>
            </Link>
            <Link to="/register">
              <Button variant="secondary" className="w-full sm:w-auto">
                ลงทะเบียน
              </Button>
            </Link>
          </>
        ) : (
          <>
            <Link to={getDashboardLink()}>
              <Button variant="primary" className="w-full sm:w-auto">
                ไปที่ Dashboard ของฉัน
              </Button>
            </Link>
            <Button onClick={logout} variant="danger" className="w-full sm:w-auto">
              ออกจากระบบ
            </Button>
          </>
        )}
      </div>

      <div className="mt-12 text-gray-600 text-lg">
        <p>สำรวจเพิ่มเติม:</p>
        <ul className="mt-2 space-y-2">
          <li><Link to="/about" className="text-blue-500 hover:underline">เกี่ยวกับเรา</Link></li>
          <li><Link to="/service" className="text-blue-500 hover:underline">บริการของเรา</Link></li>
        </ul>
      </div>
    </div>
  );
};

export default Home;