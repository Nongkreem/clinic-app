import React, { useState, useEffect } from "react";
import axios from "axios";
import ServiceDropdown from "../../components/common/ServiceDropdown";

const API_BASE_URL =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:5001";

const AppointmentReqManage = () => {
  const [allServiceOptions, setAllServiceOptions] = useState([]);
  const [selectedFilterService, setSelectedFilterService] = useState(null); // เก็บ full service object

  const [loading, setLoading] = useState(true); // สถานะโหลดบริการ
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchServiceOptions = async () => {
        setLoading(true);
        setError("");
      try {
        const response = await axios.get(`${API_BASE_URL}/api/services`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setAllServiceOptions(response.data);
        console.log("Fetched service options:", response.data);
      } catch (err) {
        console.error("Failed to fetch service options:", err);
        setError("ไม่สามารถโหลดตัวเลือกบริการได้");
      } finally {
        setLoading(false);
      }
    };
    fetchServiceOptions();
  }, []);

  const handleFilterServiceChange = (service) => {
    setSelectedFilterService(service);
    console.log("Selected service for filter:", service);
  };

  return (
    <div className="m-8">
      <h2 className="mb-6 text-2xl font-bold text-primary-default">
        จัดการคำขอนัดหมาย
      </h2>
      {/* service filter dropdown */}
      <div className="mb-4 w-60">
        <label
          htmlFor="service-filter-dropdown"
          className="block text-gray-700 text-sm font-semibold mb-2"
        >
          แสดงคำขอนัดหมายตามบริการ:
        </label>
        {error && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-2"
            role="alert"
          >
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        <ServiceDropdown
          value={selectedFilterService ? selectedFilterService.service_id : ""}
          onChange={handleFilterServiceChange}
          options={allServiceOptions}
          disabled={loading}
          defaultOptionText="แสดงบริการทั้งหมด"
        />
      </div>
      {/* display appointment */}
      <div className="mt-8 p-4 ">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">
          รายการคำขอนัดหมาย{" "}
          {selectedFilterService
            ? `สำหรับ: ${selectedFilterService.service_name}`
            : ""}
        </h3>
        {/* นี่คือที่ที่คุณจะแสดงรายการคำขอนัดหมายที่ดึงมาจาก API */}
        {/* ตัวอย่าง: ถ้ามี API สำหรับดึงคำขอนัดหมาย */}
        {/* <AppointmentsList serviceId={selectedFilterService?.service_id} /> */}
        <p className="text-gray-500">
          (ส่วนนี้จะแสดงรายการคำขอนัดหมายที่กรองตามบริการที่เลือก)
        </p>
        {loading && (
          <p className="text-center text-gray-500">กำลังโหลดคำขอนัดหมาย...</p>
        )}
      </div>
    </div>
  );
};

export default AppointmentReqManage;
