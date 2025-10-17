import React, { useState, useEffect } from "react";
import axios from "axios";
import Button from "../../components/common/Button";
import Popup from "../../components/common/Popup";
import { ChevronDown, ChevronUp } from "lucide-react";
import PrecheckForm from "../../components/nurse/PrecheckForm";

const API_BASE_URL =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:5001";

const NursePrecheckManage = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [expandedAppointmentId, setExpandedAppointmentId] = useState(null);
  const [precheckData, setPrecheckData] = useState({});

  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);

  const fetchAppointments = async () => {
    setLoading(true);
    setError("");
    try {
      const serviceId = localStorage.getItem("service_id");
      const response = await axios.get(
        `${API_BASE_URL}/api/appointments/approved-with-checkin?serviceId=${serviceId}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setAppointments(response.data);
      console.log("Fetched approved appointments:", response.data);
    } catch (err) {
      console.error("Failed to fetch appointments:", err);
      setError("ไม่สามารถโหลดรายชื่อนัดหมายได้");
    } finally {
      setLoading(false);
    }
  };

  const fetchPrecheck = async (appointmentId) => {
    try {
      const res = await axios.get(
        `${API_BASE_URL}/api/precheck/latest/${appointmentId}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setPrecheckData((prev) => ({ ...prev, [appointmentId]: res.data }));
      console.log("Precheck data: ", precheckData);
    } catch (err) {
      console.error("Failed to fetch precheck:", err);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleToggleDetails = (appointmentId) => {
    if (expandedAppointmentId === appointmentId) {
      setExpandedAppointmentId(null);
    } else {
      setExpandedAppointmentId(appointmentId);
      if (!precheckData[appointmentId]) {
        fetchPrecheck(appointmentId);
      }
    }
  };

  const handleEditPrecheck = (appointment) => {
    setEditingAppointment(appointment);
    setIsPopupOpen(true);
  };

  const handleSendToDoctor = async (appointmentId) => {
    if (!window.confirm("ยืนยันการส่งผู้ป่วยเข้าตรวจหรือไม่?")) return;
    try {
      const res = await axios.put(
        `${API_BASE_URL}/api/precheck/send-to-doctor/${appointmentId}`,
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      alert(res.data.message || "ส่งตรวจสำเร็จ");
      fetchAppointments();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "เกิดข้อผิดพลาดในการส่งตรวจ");
    }
  };

  const handleClosePopup = () => {
    setIsPopupOpen(false);
    setEditingAppointment(null);
  };

  const handleSaveSuccess = () => {
    setIsPopupOpen(false);
    setEditingAppointment(null);
    fetchAppointments();
  };

  const getFormattedDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("th-TH", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const getFormattedTime = (timeString) => {
    if (!timeString) return "-";
    return timeString.slice(0, 5);
  };

  // ฟังก์ชันช่วยสร้าง label ของประเภทนัดหมาย
  const renderAppointmentType = (type) => {
    if (type === "doctor_follow_up") {
      return (
        <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-md">
          นัดติดตามอาการ
        </span>
      );
    }
    return (
      <span className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-md">
        นัดหมายโดยคนไข้
      </span>
    );
  };

  return (
    <div className="m-8">
      <h2 className="mb-6 text-2xl font-bold text-primary-default">
        จัดการค่าสุขภาพก่อนพบแพทย์
      </h2>

      {loading && (
        <p className="text-center text-gray-500">กำลังโหลดข้อมูล...</p>
      )}

      {error && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-4"
          role="alert"
        >
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {!loading && appointments.length === 0 && (
        <p className="text-center text-gray-500">
          ไม่พบนัดหมายที่รอการตรวจสุขภาพ
        </p>
      )}

      {!loading && appointments.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg overflow-hidden">
            <thead className="bg-pavlova-100">
              <tr>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">
                  ชื่อผู้ป่วย
                </th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">
                  แพทย์
                </th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">
                  ห้องตรวจ
                </th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">
                  วัน/เวลา
                </th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">
                  ประเภทนัดหมาย
                </th>
                <th className="py-3 px-4 text-center text-sm font-semibold text-gray-700 w-16"></th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((appt) => (
                <React.Fragment key={appt.appointment_id}>
                  <tr className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-800">
                      {appt.patient_first_name} {appt.patient_last_name} (HN:{" "}
                      {appt.hn})
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-800">
                      {appt.doctor_full_name || "-"}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-800">
                      {appt.room_name || "-"}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-800">
                      {getFormattedDate(appt.appointment_date)} เวลา{" "}
                      {getFormattedTime(appt.appointment_time)}
                    </td>
                    <td className="py-3 px-4">
                      {renderAppointmentType(appt.appointmentType)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleToggleDetails(appt.appointment_id)}
                        className="p-1 rounded-full text-gray-600 hover:bg-gray-200 focus:outline-none"
                      >
                        {expandedAppointmentId === appt.appointment_id ? (
                          <ChevronUp size={20} />
                        ) : (
                          <ChevronDown size={20} />
                        )}
                      </button>
                    </td>
                  </tr>

                  {expandedAppointmentId === appt.appointment_id && (
                    <tr className="bg-stromboli-50 border-b border-gray-200">
                      <td colSpan="6" className="p-4">
                        <div className="flex flex-col md:flex-row gap-6 text-sm text-gray-700">
                          {/* ซ้าย: อาการที่แจ้ง */}
                          <div className="md:w-1/3">
                            <h4 className="font-semibold text-gray-800 mb-2">
                              อาการที่แจ้ง
                            </h4>
                            <p>{appt.symptoms || "-"}</p>
                          </div>

                          {/* ขวา: ค่าสุขภาพ */}
                          <div className="md:w-2/3">
                            <h4 className="font-semibold text-gray-800 mb-2">
                              ค่าสุขภาพเบื้องต้นล่าสุด
                            </h4>
                            {precheckData[appt.appointment_id] ? (
                              <ul className="space-y-1">
                                <li>
                                  ความดัน:{" "}
                                  {precheckData[appt.appointment_id]
                                    .blood_pressure || "-"}
                                </li>
                                <li>
                                  ชีพจร:{" "}
                                  {precheckData[appt.appointment_id]
                                    .heart_rate || "-"}
                                </li>
                                <li>
                                  อุณหภูมิ:{" "}
                                  {precheckData[appt.appointment_id]
                                    .temperature || "-"}
                                </li>
                                <li>
                                  น้ำหนัก:{" "}
                                  {precheckData[appt.appointment_id].weight ||
                                    "-"}
                                </li>
                                <li>
                                  ส่วนสูง:{" "}
                                  {precheckData[appt.appointment_id].height ||
                                    "-"}
                                </li>
                                <li>
                                  หมายเหตุ:{" "}
                                  {precheckData[appt.appointment_id]
                                    .other_notes || "-"}
                                </li>
                              </ul>
                            ) : (
                              <p className="text-gray-500">ยังไม่มีข้อมูล</p>
                            )}
                          </div>
                        </div>

                        <div className="flex justify-end gap-2 mt-4">
                          <Button
                            variant="success"
                            onClick={() => handleEditPrecheck(appt)}
                            className="p-2 text-sm"
                          >
                            เพิ่ม/แก้ไขค่าสุขภาพ
                          </Button>
                          <Button
                            variant="primary"
                            onClick={() =>
                              handleSendToDoctor(appt.appointment_id)
                            }
                            className="p-2 text-sm"
                            disabled={
                              !precheckData[appt.appointment_id] ||
                              Object.keys(precheckData[appt.appointment_id])
                                .length === 0
                            }
                          >
                            ส่งตรวจ
                          </Button>
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

      {/* Popup ฟอร์ม */}
      <Popup
        isOpen={isPopupOpen}
        onClose={handleClosePopup}
        title="เพิ่ม/แก้ไขค่าสุขภาพ"
      >
        <PrecheckForm
          initialData={editingAppointment}
          onSaveSuccess={handleSaveSuccess}
          onCancel={handleClosePopup}
        />
      </Popup>
    </div>
  );
};

export default NursePrecheckManage;
