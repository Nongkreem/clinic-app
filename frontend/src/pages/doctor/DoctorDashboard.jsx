import React from 'react'
import { useAuth } from '../../context/AuthContext';
import { Outlet } from 'react-router-dom';

const DoctorDashboard = () => {
  const { currentUser, logout } = useAuth();
  console.log('Current User:', currentUser);
  return (
    <div>
      <div>
        <Outlet/>
      </div>
    </div>
  )
}

export default DoctorDashboard
