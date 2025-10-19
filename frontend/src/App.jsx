// frontend/src/App.jsx
import React from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

// Layouts
import TopNavbarLayout from "./layouts/TopNavbarLayout.jsx";
import StaffDashboardLayout from "./layouts/StaffDashboardLayout.jsx.jsx";

// Public Pages
import Home from "./pages/Landing.jsx";
import About from "./pages/About";
import Service from "./pages/Service";
import Login from "./pages/Login";
import Register from "./pages/Register";

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
import SymptomQuestionManage from "./pages/head-nurse/SymptomQuestionManage.jsx";
import NurseScheduleManage from "./pages/head-nurse/NurseScheduleManage.jsx";

// Specific Pages for Patient
import PatientDashboard from "./pages/patient/PatientDashboard";
import AppoinmentBooking from "./pages/patient/AppoinmentBooking.jsx";
import MyAppointment from "./pages/patient/MyAppointment.jsx";
import Landing from "./pages/Landing.jsx";
import SymptomAssessment from "./pages/patient/SymptomAsessment.jsx";
import Terms from "./pages/patient/Terms.jsx";
import MedicalCertificate from "./pages/patient/MedicalCertificate.jsx";
// Specific Pages for Nurse
import NurseDashboard from "./pages/nurse/NurseDashboard";
import AppointmentReqManage from "./pages/nurse/AppointmentReqManage.jsx";
import NursePrecheckManage from "./pages/nurse/NursePrecheckManage.jsx";

// Components
import Button from "./components/common/Button";

// Component สำหรับ Protected Route
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
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

function App() {
  console.log("App.jsx rendered");
  const { isAuthenticated, loading, user } = useAuth();
  const navigate = useNavigate();

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
    <>

      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/terms" element={<Terms />} />
        {/* Public Pages with Navbar */}
        <Route element={<TopNavbarLayout />}>
          <Route index element={<Home />} />
          <Route path="/about" element={<About />} />
        </Route>

        {/* Patient Routes - Protected */}
        <Route
          element={
            <ProtectedRoute allowedRoles={["patient"]}>
              <TopNavbarLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/patient/landing" element={<Landing />} />
          <Route
            path="/patient/create-appointment"
            element={<AppoinmentBooking />}
          />
          <Route path="/patient/my-appointment" element={<MyAppointment />} />
          <Route path="/patient/assessment" element={<SymptomAssessment />} />
          <Route path="/patient/e-certmed" element={<MedicalCertificate />} />
          
        </Route>

        {/* Staff Dashboard Layout - Protected */}
        <Route
          element={
            <ProtectedRoute allowedRoles={["doctor", "nurse", "head_nurse"]}>
              <StaffDashboardLayout />
            </ProtectedRoute>
          }
        >
          {/* Doctor Routes */}
          <Route path="/doctor" element={<DoctorDashboard />}>
            <Route path="diagnosis" element={<DiagnosisPage />} />
            <Route
              path="medical-certificates"
              element={<MedicalCertificatePage />}
            />
          </Route>

          {/* Nurse Routes */}
          <Route path="/nurse/*" element={<NurseDashboard />}>
            <Route path="appointment-req" element={<AppointmentReqManage />} />
            <Route path="precheck" element={<NursePrecheckManage />} />
          </Route>

          {/* Head Nurse Routes */}
          <Route path="/head_nurse" element={<HeadNurseDashboard />}>
            <Route path="services" element={<ServiceManage />} />
            <Route path="doctors" element={<DoctorsManage />} />
            <Route path="guide" element={<GuideManage />} />
            <Route path="examination-room" element={<ClinicRoomManage />} />
            <Route path="schedules" element={<DoctorScheduleManage />} />
            <Route path="nurses" element={<NurseManage />} />
            <Route path="nurses-schedules" element={<NurseScheduleManage />} />
            <Route
              path="symptom-question"
              element={<SymptomQuestionManage />}
            />
          </Route>
        </Route>

        {/* Unauthorized Page */}
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
                onClick={() => {
                  if (isAuthenticated && user?.role) {
                    navigate(`/${user.role}`);
                  } else {
                    navigate("/login");
                  }
                }}
                variant="secondary"
              >
                {isAuthenticated ? "กลับหน้าหลัก" : "กลับไปหน้า Login"}
              </Button>
            </div>
          }
        />

        {/* Fallback Route */}
        <Route
          path="*"
          element={
            isAuthenticated && user?.role ? (
              <Navigate to={`/${user.role}/landing`} replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </>
  );
}

export default App;
