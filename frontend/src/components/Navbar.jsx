import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import Button from './common/Button';
import { useAuth } from '../context/AuthContext';
const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getDashboardLink = () => {
    switch (user?.role) {
      case 'patient': return '/patient-dashboard';
      case 'doctor': return '/doctor-dashboard';
      case 'nurse': return '/nurse-dashboard';
      case 'head_nurse': return '/head-nurse-dashboard';
      default: return '/';
    }
  };

  return (
    <div className='flex items-center justify-between text-sm py-4 mb-5 border-b border-b-gray-400'>
      <div onClick={()=>navigate('/')} className='cursor-pointer'>LOGO</div>

      <ul className='list-none flex items-center gap-8'>
        <NavLink to='/'><li className='py-1'>หน้าหลัก</li></NavLink>
        <NavLink to='/about'><li className='py-1'>เกี่ยวกับเรา</li></NavLink>
        <NavLink to='/services'><li className='py-1'>บริการของเรา</li></NavLink>
      </ul>

      {/* ขวาสุด */}
      {!isAuthenticated ? (
        <Button onClick={() => navigate('/login')} className='bg-primary text-white rounded-full px-8 py-3 font-light'>
          เข้าสู่ระบบ
        </Button>
      ) : (
        <div className='flex items-center gap-4 cursor-pointer group relative'>
          <div className='flex items-center justify-center w-10 h-10 rounded-full bg-primary-default'>
            <p className='text-white'>p</p>
          </div>
          <div className='absolute top-0 right-0 pt-14 text-base font-medium text-gray-600 z-20 hidden group-hover:block'>
            <div className='min-w-48 bg-stone-100 rounded flex flex-col gap-4 p-4'>
                <p onClick={()=>navigate('/')} className='hover:text-black cursor-pointer'>โปรไฟล์</p>
                <p onClick={()=>navigate('/patient/my-appointment')} className='hover:text-black cursor-pointer'>นัดหมายของฉัน</p>
                <p onClick={handleLogout} className='hover:text-black cursor-pointer'>ออกจากระบบ</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar;
