// frontend/src/App.jsx
import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Layouts
import TopNavbarLayout from './layouts/TopNavbarLayout.jsx';
import StaffDashboardLayout from './layouts/StaffDashboardLayout.jsx.jsx'

// Pages
import Home from './pages/Home';
import About from './pages/About';
import Service from './pages/Service';
import Login from './pages/Login';
import Register from './pages/Register'; // เพิ่ม Register Page
import PatientDashboard from './pages/patient/PatientDashboard';
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import NurseDashboard from './pages/nurse/NurseDashboard';
import HeadNurseDashboard from './pages/head-nurse/HeadNurseDashboard';

// Specific Pages for Nures
import ServiceManage from './pages/nurse/ServiceManage.jsx';
import DoctorsManage from './pages/nurse/DoctorsManage.jsx';

// Components
import Button from './components/common/Button';
import GuideManage from './pages/nurse/GuideManage.jsx';


// omponent สำหรับ Protected Route
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-700">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // ถ้ายังไม่ได้ Login ให้ redirect ไปหน้า Login
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    // ถ้า Login แล้ว แต่ไม่มีสิทธิ์ ให้ redirect ไปหน้า Unauthorized
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

function App() {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-700">กำลังโหลดแอปพลิเคชัน...</p>
        </div>
      </div>
    );
  }

  const hideNavbar = ['/login', '/register'].includes(location.pathname)
  return (
    <div className="">

      <Routes>
        {/* Layout มี navbar */}
        <Route element={<TopNavbarLayout />}>
          <Route index element={<Home />} /> {/* หน้า '/' */}
          <Route path="about" element={<About />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />

          {/* Patient Routes */}
          <Route path="patient">
            <Route path="home" element={<PatientDashboard />} />
          </Route>
        </Route>

        {/* Layout สำหรับ Dashboard ของบุคลากร (มี Sidebar) */}
        <Route element={<ProtectedRoute allowedRoles={['doctor', 'nurse', 'head_nurse']}><StaffDashboardLayout /></ProtectedRoute>} >
          <Route path="doctor-dashboard" element={<DoctorDashboard />} />

          <Route path="nurse-dashboard" element={<Navigate to = "/nurse-dashboard/services" replace/>} />
          <Route path="nurse-dashboard/*" element={<NurseDashboard/>}>
            <Route path="services" element={<ServiceManage/>}/>
            <Route path="doctors" element={<DoctorsManage/>}/>
            <Route path="guide" element={<GuideManage/>}/>
            <Route path="*" element={<Navigate to="services" replace />} /> {/* Fallback สำหรับ /nurse-dashboard/unknown-path */}
          </Route>
          
          <Route path="headnurse-dashboard" element={<HeadNurseDashboard />} />
        </Route>


        {/* หน้า Unauthorized (ถ้าผู้ใช้ไม่มีสิทธิ์) */}
        <Route path="/unauthorized" element={
          <div className="min-h-screen flex flex-col items-center justify-center bg-red-50 p-4 text-center">
            <h2 className="text-4xl font-bold text-red-700 mb-4">คุณไม่มีสิทธิ์เข้าถึงหน้านี้</h2>
            <p className="text-lg text-gray-700 mb-8">กรุณาติดต่อผู้ดูแลระบบหากคุณคิดว่านี่คือข้อผิดพลาด</p>
            <Button onClick={() => isAuthenticated ? navigate('/') : navigate('/login')} variant="secondary">
              {isAuthenticated ? 'กลับหน้าหลัก' : 'กลับไปหน้า Login'}
            </Button>
          </div>
        } />

        {/* Fallback for unknown routes or redirect authenticated users from root */}
        <Route path="*" element={
            isAuthenticated ? (
                // Redirect authenticated users from root to their dashboard
                <Navigate to={`/${user?.role}-dashboard`} replace />
            ) : (
                // Redirect unauthenticated users to login
                <Navigate to="/login" replace />
            )
        } />
      </Routes>
    </div>
  );
}

export default App;