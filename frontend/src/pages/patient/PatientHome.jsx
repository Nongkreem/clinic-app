import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import { CalendarDays, FileText, ClipboardList, Clock, User, Calendar, Activity, Stethoscope, History, Home } from "lucide-react";
import Button from "../../components/common/Button";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5001";

const PatientHome = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [upcomingAppointment, setUpcomingAppointment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ดึงข้อมูลนัดหมายที่กำลังมาถึง
  useEffect(() => {
    const fetchUpcomingAppointment = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const response = await axios.get(`${API_BASE_URL}/api/appointments/upcoming`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setUpcomingAppointment(response.data[0] || null);
      } catch (err) {
        console.error("Error fetching upcoming appointment:", err);
        setError("ไม่สามารถโหลดข้อมูลนัดหมายได้");
      } finally {
        setLoading(false);
      }
    };
    fetchUpcomingAppointment();
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleViewCard = (appointmentId) => {
    navigate(`/patient/appointment-card/${appointmentId}`);
  };

  const handleNavigate = (path) => {
    navigate(path);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "สวัสดีตอนเช้า";
    if (hour < 18) return "สวัสดีตอนบ่าย";
    return "สวัสดีตอนเย็น";
  };

  return (
    <div className="min-h-screen pb-20 lg:pb-8">
      {/* Header - Desktop only */}
      <div className="hidden lg:flex bg-white border-b border-gray-200 px-8 py-4 items-center justify-between">
        <div className="flex items-center gap-8">
          <nav className="flex gap-6">
            <button className="text-primary-default font-medium border-b-2 border-primary-default pb-1">
              หน้าหลัก
            </button>
            <button 
              onClick={() => handleNavigate("/patient/appointment-booking")}
              className="text-gray-600 hover:text-primary-default transition-colors"
            >
              สร้างนัดหมาย
            </button>
            <button 
              onClick={() => handleNavigate("/patient/certificates")}
              className="text-gray-600 hover:text-primary-default transition-colors"
            >
              ทำแบบประเมิน
            </button>
            <button 
              onClick={() => handleNavigate("/patient/appointments-history")}
              className="text-gray-600 hover:text-primary-default transition-colors"
            >
              ประวัตินัดหมาย
            </button>
          </nav>
        </div>
        <Button
          onClick={handleLogout}
          className="text-gray-600 hover:text-primary-default font-medium"
        >
          ออกจากระบบ
        </Button>
      </div>

      {/* Mobile Header */}
      {/* Main Content */}
      <div className="mt-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-12">
        <div className="lg:grid lg:grid-cols-2 lg:gap-12 lg:items-start">
          {/* Left Column - Greeting & Menu */}
          <div className="lg:order-1">
            {/* Greeting */}
            <div className="mb-8">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl text-stromboli-900 mb-2">
                สวัสดี
              </h1>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-secondary-default mb-4">
                คุณสมใจ
              </h2>
            </div>

            {/* Menu Grid - Mobile: 2x2, Desktop: 2x2 horizontal */}
            <div className="grid grid-cols-2 gap-4 mb-8 lg:mb-0">
              {/* สร้างนัดหมาย */}
              <div
                onClick={() => handleNavigate("/patient/create-appointment")}
                className="bg-primary-opa rounded-2xl p-6 sm:p-8 cursor-pointer hover:shadow-lg transition-all duration-200 flex flex-col items-center justify-center text-center min-h-[140px] sm:min-h-[160px]"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white bg-opacity-40 rounded-2xl flex items-center justify-center mb-4">
                  <Calendar className="text-primary-dark" size={24} />
                </div>
                <p className="font-semibold text-gray-800 text-sm sm:text-base">สร้างนัดหมาย</p>
              </div>

              {/* ทำแบบประเมินอาการ */}
              <div
                onClick={() => handleNavigate("/patient/certificates")}
                className="bg-secondary-superlight rounded-3xl p-6 sm:p-8 cursor-pointer hover:shadow-lg transition-all duration-200 flex flex-col items-center justify-center text-center min-h-[140px] sm:min-h-[160px]"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white bg-opacity-60 rounded-2xl flex items-center justify-center mb-3">
                  <ClipboardList className="text-primary-dark" size={24} />
                </div>
                <p className="font-semibold text-gray-800 text-sm sm:text-base">ทำแบบประเมิน<br />อาการ</p>
              </div>

              {/* ใบรับรองแพทย์ */}
              <div
                onClick={() => handleNavigate("/patient/certificates")}
                className="bg-secondary-superlight rounded-3xl p-6 sm:p-8 cursor-pointer hover:shadow-lg transition-all duration-200 flex flex-col items-center justify-center text-center min-h-[140px] sm:min-h-[160px]"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white bg-opacity-60 rounded-2xl flex items-center justify-center mb-3">
                  <FileText className="text-primary-dark" size={24} />
                </div>
                <p className="font-semibold text-gray-800 text-sm sm:text-base">ใบรับรองแพทย์</p>
              </div>

              {/* ประวัตินัดหมาย */}
              <div
                onClick={() => handleNavigate("/patient/appointments-history")}
                className="bg-secondary-gold rounded-3xl p-6 sm:p-8 cursor-pointer hover:shadow-lg transition-all duration-200 flex flex-col items-center justify-center text-center min-h-[140px] sm:min-h-[160px]"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white bg-opacity-40 rounded-2xl flex items-center justify-center mb-3">
                  <History className="text-primary-dark" size={24} />
                </div>
                <p className="font-semibold text-gray-800 text-sm sm:text-base">ประวัตินัดหมาย</p>
              </div>
            </div>
          </div>

          {/* Right Column - Appointment Card */}
          <div className="lg:order-2">
            <p className="text-sm text-gray-600 mb-4">นัดหมายที่กำลังมาถึง</p>

            {loading ? (
              <div className="bg-primary-dark text-white rounded-3xl p-6 sm:p-8 animate-pulse">
                <div className="h-6 w-32 bg-white bg-opacity-20 rounded mb-4"></div>
                <div className="h-4 w-48 bg-white bg-opacity-20 rounded"></div>
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 rounded-3xl p-6 text-red-700">
                <p className="font-medium">{error}</p>
              </div>
            ) : upcomingAppointment ? (
              <div className="bg-primary-dark text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
                {/* Status Badge */}
                <div className="absolute top-6 right-6">
                  <span className="bg-green-500 text-white text-xs font-medium px-3 py-1.5 rounded-full">
                    ดูบัตรนัด
                  </span>
                </div>

                {/* Doctor Info with Avatar */}
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="text-primary-dark" size={28} />
                  </div>
                  <div>
                    <p className="text-sm opacity-90 mb-1">แพทย์: นิลภา</p>
                    <p className="text-xl sm:text-2xl font-bold">{upcomingAppointment.service_name || "บริจัคทั่วไป"}</p>
                  </div>
                </div>

                {/* Date & Time */}
                <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-4 flex items-center gap-4">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-10 h-10 bg-white bg-opacity-20 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Calendar size={20} />
                    </div>
                    <p className="text-sm sm:text-base">
                      {new Date(upcomingAppointment.appointment_date).toLocaleDateString("th-TH", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-10 h-10 bg-white bg-opacity-20 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Clock size={20} />
                    </div>
                    <p className="text-sm sm:text-base">
                      {upcomingAppointment.start_time?.slice(0, 5)} - {upcomingAppointment.end_time?.slice(0, 5)}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-primary-dark text-white rounded-3xl p-8 text-center">
                <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CalendarDays size={32} />
                </div>
                <h3 className="text-xl font-bold mb-2">ไม่มีนัดหมายที่กำลังมาถึง</h3>
                <p className="text-sm opacity-90 mb-6">สร้างนัดหมายใหม่เพื่อรับการดูแล</p>
                <Button
                  onClick={() => handleNavigate("/patient/appointment-booking")}
                  className="bg-white text-primary-dark font-medium px-8 py-3 rounded-2xl hover:bg-gray-100 transition-colors duration-200"
                >
                  สร้างนัดหมาย
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Navigation - Mobile Only */}
    </div>
  );
};

export default PatientHome;