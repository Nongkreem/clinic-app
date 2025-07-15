// frontend/src/App.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Pages
import Home from './pages/Home';
import About from './pages/About';
import Service from './pages/Service';
import Login from './pages/Login';
import Register from './pages/Register'; // เพิ่ม Register Page
import PatientDashboard from './pages/PatientDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import NurseDashboard from './pages/NurseDashboard';
import HeadNurseDashboard from './pages/HeadNurseDashboard';
import Button from './components/common/Button';
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
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    // ถ้า Login แล้ว แต่ไม่มีสิทธิ์ ให้ redirect ไปหน้า Unauthorized
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

function App() {
  const { isAuthenticated, loading, user } = useAuth();

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

  return (
    <div className="App font-sans antialiased text-gray-900">
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/service" element={<Service />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} /> {/* เพิ่ม Register Route */}

        {/* Protected Routes สำหรับแต่ละบทบาท */}
        <Route
          path="/patient-dashboard"
          element={
            <ProtectedRoute allowedRoles={['patient']}>
              <PatientDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/doctor-dashboard"
          element={
            <ProtectedRoute allowedRoles={['doctor', 'admin']}>
              <DoctorDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/nurse-dashboard"
          element={
            <ProtectedRoute allowedRoles={['nurse', 'head_nurse', 'admin']}>
              <NurseDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/head-nurse-dashboard"
          element={
            <ProtectedRoute allowedRoles={['head_nurse', 'admin']}>
              <HeadNurseDashboard />
            </ProtectedRoute>
          }
        />

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