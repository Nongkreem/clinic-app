import React from "react";
import TopServicesChart from "../../components/charts/TopServicesChart";
import PeakHoursChart from "../../components/charts/PeakHoursChart";
import MonthlyBookingsChart from "../../components/charts/MonthlyBookingsChart";
import DepartmentChart from "../../components/charts/DepartmentChart";
import DoctorLoadChart from "../../components/charts/DoctorLoadChart";
import RoomUtilizationChart from "../../components/charts/RoomUtilizationChart";
import AppointmentStatusChart from "../../components/charts/AppointmentStatusChart";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5001";

export default function HeadNurseDashboard() {
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-semibold text-primary mb-6">
        แดชบอร์ดภาพรวมคลินิก
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TopServicesChart api={`${API_BASE_URL}/api/dashboard/top-services`} />
        <PeakHoursChart api={`${API_BASE_URL}/api/dashboard/peak-hours`} />
        <MonthlyBookingsChart api={`${API_BASE_URL}/api/dashboard/monthly-bookings`} />
        <DepartmentChart api={`${API_BASE_URL}/api/dashboard/department`} />
        <DoctorLoadChart api={`${API_BASE_URL}/api/dashboard/doctor-load`} />
        <RoomUtilizationChart api={`${API_BASE_URL}/api/dashboard/room-utilization`} />
        <AppointmentStatusChart api={`${API_BASE_URL}/api/dashboard/appointment-status`} />
      </div>
    </div>
  );
}
