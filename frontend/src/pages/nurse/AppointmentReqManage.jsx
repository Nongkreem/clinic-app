import React, { useState, useEffect } from "react";
import axios from "axios";
import ServiceDropdown from "../../components/common/ServiceDropdown";
import Button from "../../components/common/Button";
import Popup from "../../components/common/Popup";
import { ChevronDown, ChevronUp } from "lucide-react"; // ✅ เพิ่ม ChevronDown, ChevronUp

const API_BASE_URL =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:5001";

const AppointmentReqManage = () => {
  const [allServiceOptions, setAllServiceOptions] = useState([]);
  const [selectedFilterService, setSelectedFilterService] = useState(null); 
  const [filterStatus, setFilterStatus] = useState('pending');

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState("");

  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [actionType, setActionType] = useState(''); 
  const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);

  // ✅ State สำหรับควบคุมการขยายรายละเอียดแถว
  const [expandedAppointmentId, setExpandedAppointmentId] = useState(null);

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

  useEffect(() => {
    const fetchAppointments = async () => {
      setLoading(true);
      setError("");
      try {
        const params = {
          serviceId: selectedFilterService ? selectedFilterService.service_id : undefined,
          status: filterStatus 
        };
        const response = await axios.get(`${API_BASE_URL}/api/appointments`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          params: params
        });
        setAppointments(response.data);
        console.log('Fetched appointments:', response.data);
      } catch (err) {
        console.error("Failed to fetch appointments:", err);
        setError("ไม่สามารถโหลดคำขอนัดหมายได้");
        setAppointments([]);
      } finally {
        setLoading(false);
      }
    };
    if (allServiceOptions.length > 0 || !selectedFilterService) { 
        fetchAppointments();
    }
  }, [selectedFilterService, filterStatus, allServiceOptions]);

  const handleFilterServiceChange = (service) => {
    setSelectedFilterService(service);
    console.log("Selected service for filter:", service);
  };

  const handleStatusChange = (e) => {
    setFilterStatus(e.target.value);
  }

  const handleApproveClick = (appointmentId) => {
    setSelectedAppointmentId(appointmentId);
    setActionType('approve');
    setShowConfirmPopup(true);
  };

  const handleRejectClick = (appointmentId) => {
    setSelectedAppointmentId(appointmentId);
    setActionType('reject');
    setShowConfirmPopup(true);
  };

  const handleConfirmAction = async () => {
    setShowConfirmPopup(false);
    setLoading(true);
    setError('');

    try {
        const newStatus = actionType === 'approve' ? 'approved' : 'rejected';
        const response = await axios.put(`${API_BASE_URL}/api/appointments/${selectedAppointmentId}/status`, { newStatus }, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });

        if (response.status === 200) {
            // Refetch appointments after update to ensure data consistency
            setSelectedFilterService(selectedFilterService ? { ...selectedFilterService } : null); // Trigger refetch
            setFilterStatus(filterStatus); // Trigger refetch (if the status changes, it will re-filter)
            alert(`นัดหมาย ${actionType === 'approve' ? 'อนุมัติ' : 'ปฏิเสธ'}สำเร็จ!`);
        } else {
            setError(response.data?.message || 'เกิดข้อผิดพลาดในการดำเนินการ');
        }
    } catch (err) {
        console.error(`Error ${actionType}ing appointment:`, err);
        setError(err.response?.data?.message || 'เกิดข้อผิดพลาดในการดำเนินการ');
    } finally {
        setLoading(false);
        setSelectedAppointmentId(null);
        setActionType('');
    }
  };

  const handleCancelAction = () => {
    setShowConfirmPopup(false);
    setSelectedAppointmentId(null);
    setActionType('');
  };

  const getFormattedDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const getFormattedTime = (timeString) => {
    if (!timeString) return '-';
    return timeString.slice(0, 5);
  };

  const getStatusDisplay = (status) => {
    switch (status) {
      case 'pending': return <span className="px-2 py-1 text-xs font-semibold rounded-full text-yellow-600">รอดำเนินการ</span>;
      case 'approved': return <span className="px-2 py-1 text-xs font-semibold rounded-full text-green-800">อนุมัติแล้ว</span>;
      case 'rejected': return <span className="px-2 py-1 text-xs font-semibold rounded-full text-red-800">ถูกปฏิเสธ</span>;
      case 'completed': return <span className="px-2 py-1 text-xs font-semibold rounded-full text-blue-800">เสร็จสิ้น</span>;
      case 'cancelled': return <span className="px-2 py-1 text-xs font-semibold rounded-full text-gray-800">ยกเลิกแล้ว</span>;
      default: return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  // ✅ ฟังก์ชันสำหรับสลับการแสดงรายละเอียด
  const handleToggleDetails = (appointmentId) => {
    setExpandedAppointmentId(prevId => (prevId === appointmentId ? null : appointmentId));
  };


  return (
    <div className="m-8">
      <h2 className="mb-6 text-2xl font-bold text-primary-default">
        จัดการคำขอนัดหมาย
      </h2>
      
      {/* Filters Section */}
      <div className="bg-white p-6 rounded-xl mb-6 flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <label
            htmlFor="service-filter-dropdown"
            className="block text-gray-700 text-sm font-semibold mb-2"
          >
            กรองตามบริการ:
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
            id="service-filter-dropdown"
            value={selectedFilterService ? selectedFilterService.service_id : ""}
            onChange={handleFilterServiceChange}
            options={allServiceOptions}
            disabled={loading}
            defaultOptionText="-- แสดงบริการทั้งหมด --"
          />
        </div>

        <div className="flex-1">
          <label htmlFor="status-filter" className="block text-gray-700 text-sm font-semibold mb-2">
            กรองตามสถานะ:
          </label>
          <select
            id="status-filter"
            value={filterStatus}
            onChange={handleStatusChange}
            className="shadow-sm appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition duration-200 hover:border-blue-400 hover:ring-2 hover:ring-blue-200"
            disabled={loading}
          >
            <option value="pending">รอดำเนินการ</option>
            <option value="approved">อนุมัติแล้ว</option>
            <option value="rejected">ถูกปฏิเสธ</option>
            <option value="completed">เสร็จสิ้น</option>
            <option value="cancelled">ยกเลิกแล้ว</option>
            <option value="">-- แสดงทั้งหมด --</option>
          </select>
        </div>
      </div>

      {/* Display Appointments */}
      <div className="mt-8 p-4 bg-white rounded-xl">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">
          รายการคำขอนัดหมาย{" "}
          {selectedFilterService
            ? `สำหรับ: ${selectedFilterService.service_name}`
            : ""}{" "}
          {filterStatus !== '' ? ` (สถานะ: ${filterStatus === 'pending' ? 'รอดำเนินการ' : filterStatus === 'approved' ? 'อนุมัติแล้ว' : filterStatus === 'rejected' ? 'ถูกปฏิเสธ' : filterStatus === 'completed' ? 'เสร็จสิ้น' : filterStatus === 'cancelled' ? 'ยกเลิกแล้ว' : filterStatus})` : ''}
        </h3>
        {loading && (
          <p className="text-center text-gray-500">กำลังโหลดคำขอนัดหมาย...</p>
        )}
        {error && !loading && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-4" role="alert">
                <span className="block sm:inline">{error}</span>
            </div>
        )}
        {!loading && appointments.length === 0 && (
          <p className="text-center text-gray-500">ไม่พบคำขอนัดหมาย</p>
        )}
        
        {!loading && appointments.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-lg overflow-hidden">
              <thead className="bg-pavlova-100">
                <tr>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">HN</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">ชื่อผู้ป่วย</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700"></th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((appointment) => (
                  <React.Fragment key={appointment.appointment_id}>
                    <tr className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm text-gray-800">{appointment.hn}</td>
                      <td className="py-3 px-4 text-sm text-gray-800">{appointment.patient_first_name} {appointment.patient_last_name}</td>
                      <td className="py-3 px-4 text-sm text-gray-800 w-16"> {/* Fixed width for button column */}
                        <button
                          onClick={() => handleToggleDetails(appointment.appointment_id)}
                          className="p-1 rounded-full text-gray-600 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-300 transition"
                        >
                          {expandedAppointmentId === appointment.appointment_id ? (
                            <ChevronUp size={20} />
                          ) : (
                            <ChevronDown size={20} />
                          )}
                        </button>
                      </td>
                    </tr>
                    {/* ✅ ส่วนการแสดงรายละเอียดเพิ่มเติม (ซ่อน/แสดง) */}
                    {expandedAppointmentId === appointment.appointment_id && (
                      <tr className="bg-stromboli-50 border-b border-gray-200">
                        <td colSpan="3" className="p-4"> {/* Span across all columns of the main row */}
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-2 gap-x-4 text-sm text-gray-700">
                            <div>
                              <span className="font-semibold">บริการ:</span> {appointment.service_name}
                            </div>
                            <div>
                              <span className="font-semibold">อาการเบื้องต้น:</span> {appointment.symptoms}
                            </div>
                            <div>
                              <span className="font-semibold">วันที่นัดหมาย:</span> {getFormattedDate(appointment.appointment_date)}
                            </div>
                            <div>
                              <span className="font-semibold">เวลานัดหมาย:</span> {getFormattedTime(appointment.appointment_time)}
                            </div>
                            <div>
                              <span className="font-semibold">ประเภทนัดหมาย:</span> <span className="capitalize">{appointment.appointmentType.replace(/_/g, ' ')}</span>
                            </div>
                            <div>
                              <span className="font-semibold">สถานะ:</span> {getStatusDisplay(appointment.status)}
                            </div>
                            <div>
                              <span className="font-semibold">แพทย์:</span> {appointment.doctor_full_name}
                            </div>
                            <div>
                              <span className="font-semibold">ห้องตรวจ:</span> {appointment.room_name}
                            </div>
                          </div>
                          <div className="flex justify-end gap-2 mt-4">
                              {appointment.status === 'pending' && (
                                  <>
                                      <Button 
                                          variant="success" 
                                          onClick={() => handleApproveClick(appointment.appointment_id)}
                                          className="p-2 text-sm flex items-center gap-1"
                                      >
                                        อนุมัติ
                                      </Button>
                                      <Button 
                                          variant="danger" 
                                          onClick={() => handleRejectClick(appointment.appointment_id)}
                                          className="p-2 text-sm flex items-center gap-1"
                                      >
                                        ปฏิเสธ
                                      </Button>
                                  </>
                              )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirmation Popup for Approve/Reject */}
      <Popup 
        isOpen={showConfirmPopup}
        onClose={handleCancelAction}
        title={actionType === 'approve' ? 'ยืนยันการอนุมัติ' : 'ยืนยันการปฏิเสธ'}
      >
        <div className="p-4">
            <p className="mb-4 text-gray-700">
                คุณแน่ใจหรือไม่ที่จะ {actionType === 'approve' ? 'อนุมัติ' : 'ปฏิเสธ'} นัดหมายนี้?
            </p>
            <div className="flex justify-end gap-3 mt-6">
                <Button variant="secondary" onClick={handleCancelAction}>ยกเลิก</Button>
                <Button 
                    variant={actionType === 'approve' ? 'success' : 'danger'} 
                    onClick={handleConfirmAction}
                    disabled={loading}
                >
                    {loading ? 'กำลังดำเนินการ...' : (actionType === 'approve' ? 'อนุมัติ' : 'ปฏิเสธ')}
                </Button>
            </div>
        </div>
      </Popup>
    </div>
  );
};

export default AppointmentReqManage;
