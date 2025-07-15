import React from 'react'
import { useAuth } from '../context/AuthContext';

const DoctorDashboard = () => {
  const { currentUser, logout } = useAuth();
  console.log('Current User:', currentUser);
  return (
    <div>
      Doctor Dashboard
      <p>ยินดีต้อนรับ, แพทย์!</p>
    </div>
  )
}

export default DoctorDashboard
