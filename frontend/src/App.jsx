// frontend/src/App.jsx
import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

// Layouts
import TopNavbarLayout from "./layouts/TopNavbarLayout.jsx";
import StaffDashboardLayout from "./layouts/StaffDashboardLayout.jsx.jsx";

// Public Pages
import Home from "./pages/Landing.jsx";
import About from "./pages/About";
import Service from "./pages/Service";
import Login from "./pages/Login";
import Register from "./pages/Register"; // เพิ่ม Register Page

// Specific Pages for Doctor
import DoctorDashboard from "./pages/doctor/DoctorDashboard";
import DiagnosisPage from "./pages/doctor/DiagnosisPage.jsx";
import MedicalCertificatePage from "./pages/doctor/MedicalCertificatePage.jsx";

// Specific Pages for Head Nurse
import HeadNurseDashboard from "./pages/head-nurse/HeadNurseDashboard";
import ServiceManage from "./pages/head-nurse/ServiceManage.jsx";
import DoctorsManage from "./pages/head-nurse/DoctorsManage.jsx";
import GuideManage from "./pages/head-nurse/GuideManage.jsx";
import ClinicRoomManage from "./pages/head-nurse/ClinicRoomManage.jsx";
import DoctorScheduleManage from "./pages/head-nurse/DoctorScheduleManage.jsx";
import NurseManage from "./pages/head-nurse/NurseManage.jsx";
import SymptomQuestionManage from "./pages/head-nurse/SymptomQuestionManage.jsx"
// Specific Pages for Patient
import PatientDashboard from "./pages/patient/PatientDashboard";
import AppoinmentBooking from "./pages/patient/AppoinmentBooking.jsx";
import MyAppointment from "./pages/patient/MyAppointment.jsx";
import PatientHome from "./pages/patient/PatientHome.jsx";

// Specific Pages for Nures
import NurseDashboard from "./pages/nurse/NurseDashboard";
import AppointmentReqManage from "./pages/nurse/AppointmentReqManage.jsx";
import NursePrecheckManage from "./pages/nurse/NursePrecheckManage.jsx";
// Components
import Button from "./components/common/Button";
import NurseScheduleManage from "./pages/head-nurse/NurseScheduleManage.jsx";
import Landing from "./pages/Landing.jsx";
import SymptomAssessment from "./pages/patient/SymptomAsessment.jsx";

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

  const hideNavbar =
    location.pathname === "/login" || location.pathname === "/register";
  return (
    <div className="">
      <Routes>
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        {/* Layout มี navbar */}
        <Route element={<TopNavbarLayout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          {/* Patient Routes */}
          <Route path="patient">
            <Route path="home" element={<PatientHome />} />
            <Route path="landing" element={<Landing />} />
            <Route path="create-appointment" element={<AppoinmentBooking />} />
            <Route path="my-appointment" element={<MyAppointment />} />
            <Route path="assessment" element={<SymptomAssessment />} />

          </Route>
        </Route>

        {/* Layout สำหรับ Dashboard ของบุคลากร (มี Sidebar) */}
        <Route
          element={
            <ProtectedRoute allowedRoles={["doctor", "nurse", "head_nurse"]}>
              <StaffDashboardLayout />
            </ProtectedRoute>
          }
        >
          {/* Doctor routes */}
          <Route path="/doctor" element={<DoctorDashboard />}>
            <Route path="diagnosis" element={<DiagnosisPage />} />
            <Route
              path="medical-certificates"
              element={<MedicalCertificatePage />}
            />
          </Route>

          {/* Nurse routes */}
          <Route path="/nurse/*" element={<NurseDashboard />}>
              <Route path="appointment-req" element={<AppointmentReqManage />} />
              <Route path="precheck" element={<NursePrecheckManage />} />
          </Route>

          <Route path="/head_nurse" element={<HeadNurseDashboard />}>
            <Route path="services" element={<ServiceManage />} />
            <Route path="doctors" element={<DoctorsManage />} />
            <Route path="guide" element={<GuideManage />} />
            <Route path="examination-room" element={<ClinicRoomManage />} />
            <Route path="schedules" element={<DoctorScheduleManage />} />
            <Route path="nurses" element={<NurseManage />} />
            <Route path="nurses-schedules" element={<NurseScheduleManage />} />
            <Route path="symptom-question" element={<SymptomQuestionManage />} />
          </Route>
        </Route>

        {/* หน้า Unauthorized (ถ้าผู้ใช้ไม่มีสิทธิ์) */}
        <Route
          path="/unauthorized"
          element={
            <div className="min-h-screen flex flex-col items-center justify-center bg-red-50 p-4 text-center">
              <h2 className="text-4xl font-bold text-red-700 mb-4">
                คุณไม่มีสิทธิ์เข้าถึงหน้านี้
              </h2>
              <p className="text-lg text-gray-700 mb-8">
                กรุณาติดต่อผู้ดูแลระบบหากคุณคิดว่านี่คือข้อผิดพลาด
              </p>
              <Button
                onClick={() =>
                  isAuthenticated ? navigate("/") : navigate("/login")
                }
                variant="secondary"
              >
                {isAuthenticated ? "กลับหน้าหลัก" : "กลับไปหน้า Login"}
              </Button>
            </div>
          }
        />

        {/* Fallback for unknown routes or redirect authenticated users from root */}
        <Route
          path="*"
          element={
            isAuthenticated ? (
              // Redirect authenticated users from root to their dashboard
              <Navigate to={`/${user?.role}`} replace />
            ) : (
              // Redirect unauthenticated users to login
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </div>
  );
}

export default App;
