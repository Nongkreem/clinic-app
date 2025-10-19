// frontend/src/pages/MyAppointment.jsx

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Button from "../../components/common/Button";
import Popup from "../../components/common/Popup";
import { FileText, Info, ChevronDown, ChevronUp } from "lucide-react"; // Import Chevron icons for the table

const API_BASE_URL =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:5001";

const MyAppointment = () => {
  const { user, loading: authLoading } = useAuth();
  const patientId = user?.entity_id;

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [patientBlacklistStatus, setPatientBlacklistStatus] = useState(null); // New state for table row expansion

  const [expandedRows, setExpandedRows] = useState({}); // States for confirmation popup

  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [actionType, setActionType] = useState("");
  const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);
  const [confirmMessage, setConfirmMessage] = useState(""); // State for Appointment Card Popup (still keep this, as 'View Appointment Card' button exists)

  const [showAppointmentCardPopup, setShowAppointmentCardPopup] =
    useState(false);
  const [appointmentCardDetails, setAppointmentCardDetails] = useState(null);

  const navigate = useNavigate(); // Fetch patient's blacklist status on mount and after actions

  const fetchBlacklistStatus = async () => {
    if (!patientId) return;
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/patients/${patientId}/blacklist-status`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setPatientBlacklistStatus(response.data);
      console.log("Blacklist Status:", response.data);
    } catch (err) {
      console.error("Error fetching blacklist status:", err);
    }
  }; // Fetch appointments for the logged-in patient

  const fetchMyAppointments = async () => {
    if (!patientId || authLoading) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/appointments/my-appointments`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setAppointments(response.data);
      console.log("My Appointments:", response.data);
    } catch (err) {
      console.error("Failed to fetch my appointments:", err);
      setError("ไม่สามารถโหลดรายการนัดหมายของคุณได้");
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyAppointments();
    fetchBlacklistStatus();
  }, [patientId, authLoading]);

  const willCauseBlacklist = (appointment) => {
    if (appointment.status !== "approved") return false;

    const appointmentDateTime = new Date(
      `${appointment.appointment_date}T${appointment.appointment_time}`
    );
    const twentyFourHoursBeforeAppointment = new Date(
      appointmentDateTime.getTime() - 24 * 60 * 60 * 1000
    );
    const currentTime = new Date();

    return currentTime > twentyFourHoursBeforeAppointment;
  };

  const handleCancelClick = (appointment) => {
    setSelectedAppointmentId(appointment.appointment_id);
    setActionType("cancel");
    if (willCauseBlacklist(appointment)) {
      setConfirmMessage(
        "การยกเลิกนัดหมายนี้อาจทำให้จำนวนการยกเลิกของคุณเพิ่มขึ้น และอาจถูกบันทึกเข้า Blacklist หากเกิน 3 ครั้ง คุณแน่ใจหรือไม่ที่จะยกเลิก?"
      );
    } else {
      setConfirmMessage("คุณแน่ใจหรือไม่ที่จะยกเลิกนัดหมายนี้?");
    }
    setShowConfirmPopup(true);
  };

  const handleCompleteClick = (appointmentId) => {
    setSelectedAppointmentId(appointmentId);
    setActionType("confirmed");
    setConfirmMessage("คุณแน่ใจหรือไม่ว่าได้เข้ารับบริการนี้แล้ว?");
    setShowConfirmPopup(true);
  };

  const handleConfirmAction = async () => {
    setShowConfirmPopup(false);
    setLoading(true);
    setError("");

    try {
      let response;
      if (actionType === "cancel") {
        response = await axios.put(
          `${API_BASE_URL}/api/appointments/${selectedAppointmentId}/patient-cancel`,
          {},
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
      } else if (actionType === "confirmed") {
        response = await axios.put(
          `${API_BASE_URL}/api/appointments/${selectedAppointmentId}/patient-complete`,
          {},
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
      }

      if (response.status === 200) {
        alert(
          `${actionType === "cancel" ? "ยกเลิก" : "ยืนยันเข้ารับบริการ"}สำเร็จ!`
        );
        await fetchMyAppointments();
        if (actionType === "cancel") {
          await fetchBlacklistStatus();
        }
      } else {
        setError(response.data?.message || "เกิดข้อผิดพลาดในการดำเนินการ");
      }
    } catch (err) {
      console.error(`Error ${actionType}ing appointment:`, err);
      setError(err.response?.data?.message || "เกิดข้อผิดพลาดในการดำเนินการ");
    } finally {
      setLoading(false);
      setSelectedAppointmentId(null);
      setActionType("");
      setConfirmMessage("");
    }
  };

  const handleCancelPopup = () => {
    setShowConfirmPopup(false);
    setSelectedAppointmentId(null);
    setActionType("");
    setConfirmMessage("");
  };

  const handleViewAppointmentCard = (appointment) => {
    setAppointmentCardDetails(appointment);
    setShowAppointmentCardPopup(true);
  };

  const handleCloseAppointmentCardPopup = () => {
    setShowAppointmentCardPopup(false);
    setAppointmentCardDetails(null);
  };
  // New function to handle row expansion
  // MODIFIED LOGIC: Ensure only one row is expanded by replacing the entire state with the new ID,
  // or clearing it if the same ID is clicked.
  const toggleRow = (id) => {
    setExpandedRows((prev) => {
      // If the clicked row is already expanded, close it
      if (prev[id]) {
        return {}; // Clear the object to close all (including the clicked one)
      }
      // Otherwise, expand the clicked row and implicitly close all others
      // by returning a new object with only the new ID.
      return {
        [id]: true,
      };
    });
  };

  const getFormattedDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString); // Using 'th-TH' locale is correct for Thai formatting.
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

  const isArrivingSoon = (dateString) => {
    if (!dateString) return false;
    const appointmentDate = new Date(dateString);
    const today = new Date(); // Set both to midnight for accurate day comparison
    appointmentDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0); // Calculate the difference in days (24 hours * 60 minutes * 60 seconds * 1000 milliseconds)
    const diffTime = appointmentDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // Check if the appointment is today or within the next 2 days (diffDays >= 0 and diffDays <= 2) // Also ensure it's not a past date (diffDays >= 0)
    return diffDays >= 0 && diffDays <= 2;
  };

  const getStatusDisplay = (status, appointmentDate) => {
    let display = "";
    let className = "px-2 py-1 text-xs font-semibold rounded-full ";

    switch (status) {
      case "pending":
        display = "รออนุมัติ";
        className += "bg-yellow-100 text-yellow-800";
        break;
      case "approved":
        display = "อนุมัติแล้ว";
        className += "bg-green-100 text-green-800";
        break;
      case "rejected":
        display = "ถูกปฏิเสธ";
        className += "bg-red-100 text-red-800";
        break;
      case "confirmed": // Custom logic for 'กำลังจะมาถึง' (Arriving Soon)
        if (isArrivingSoon(appointmentDate)) {
          display = "กำลังจะมาถึง";
          className += "bg-blue-100 text-blue-800 animate-pulse"; // Added a subtle pulse effect
        } else {
          display = "เข้ารับบริการ";
          className += "bg-blue-100 text-blue-800";
        }
        break;
      case "cancelled":
        display = "ยกเลิกแล้ว";
        className += "bg-gray-100 text-gray-800";
        break;
      default:
        display = status;
        className += "bg-gray-100 text-gray-800";
    }
    return <span className={className}>{display}</span>;
  };

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen text-lg">
                กำลังโหลดข้อมูลนัดหมาย...      
      </div>
    );
  }

  // ต้องมีการ import React, Button, ChevronUp, ChevronDown, FileText, Info, useNavigate, getFormattedDate, getFormattedTime, getStatusDisplay, willCauseBlacklist, Popup, loading, appointments, expandedRows, toggleRow, handleCancelClick, handleCompleteClick, handleViewAppointmentCard, handleCancelPopup, handleConfirmAction, confirmMessage, showConfirmPopup, actionType, showAppointmentCardPopup, handleCloseAppointmentCardPopup, appointmentCardDetails, patientBlacklistStatus
// (สมมติว่าคุณได้ import สิ่งเหล่านี้ไว้แล้ว)

// ... (omitted imports and function definitions) ...

return (
    <div className="container mx-auto p-4 md:p-8">
        
      <h2 className="text-3xl font-bold text-primary-default mb-6">
            นัดหมายของฉัน      
      </h2>
        
      {/* Blacklist Status Display */}
      {patientBlacklistStatus?.isBlacklisted && (
        <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
            <Info size={20} />
            <p className="text-sm font-semibold">
                คุณถูก Blacklist ไม่สามารถจองคิวได้ 
                {patientBlacklistStatus.blacklistUntil
                  ? ` จนถึงวันที่ ${new Date(
                      patientBlacklistStatus.blacklistUntil
                    ).toLocaleDateString("th-TH")}`
                  : ""}
                เนื่องจากยกเลิกนัดหมายบ่อยเกินไป
                (ยกเลิกแล้ว 
                {patientBlacklistStatus.cancellation_count || 0} ครั้ง)
            </p>
        </div>
      )}
        
      {!loading && appointments.length === 0 ? (
        <div className="bg-white p-6 text-center shadow-lg rounded-lg">
            <p className="text-gray-600">คุณยังไม่มีนัดหมายในระบบ</p>
            <p
              className="mt-2 text-secondary-default text-sm cursor-pointer hover:text-pavlova-600"
              onClick={() => navigate("/patient/create-appointment")}
            >
                ลองสร้างนัดหมายใหม่ได้เลย!
            </p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white shadow-xl rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
                
            {/* ✨ การปรับปรุงสีพื้นหลังส่วนหัว: เปลี่ยนเป็นสีครีม/เหลืองอ่อน (bg-yellow-50) */}
            <thead className="bg-yellow-50"> 
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-primary-default uppercase tracking-wider w-1/4"
                >
                    วันและเวลาจอง
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-primary-default uppercase tracking-wider w-1/3"
                >
                    บริการ
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-primary-default uppercase tracking-wider w-1/4"
                >
                    สถานะ
                </th>
                <th scope="col" className="relative px-6 py-3 w-1/6">
                    <span className="sr-only">Actions/Details</span>
                </th>
              </tr>
            </thead>
                
            <tbody className="bg-white divide-y divide-gray-200">
              {appointments.map((app) => (
                <React.Fragment key={app.appointment_id}>
                    
                  <tr
                    // แก้ไข: เพิ่ม hover:bg-gray-50 เพื่อให้พื้นหลังเป็นสีเทาอ่อนเมื่อเมาส์ชี้
                    className="cursor-pointer hover:bg-gray-50" 
                    onClick={() => toggleRow(app.appointment_id)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {getFormattedDate(app.appointment_date)} <br />
                      <span className="text-gray-700">
                        {getFormattedTime(app.appointment_time)} น.
                      </span>
                    </td>
                        
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      <span className="font-semibold">{app.service_name}</span>
                    </td>
                        
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {getStatusDisplay(app.status, app.appointment_date)}
                    </td>
                        
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleRow(app.appointment_id);
                        }}
                        className="text-primary-default hover:text-primary-dark transition duration-150 ease-in-out p-1 rounded-full bg-gray-100 hover:bg-gray-200"
                        aria-expanded={!!expandedRows[app.appointment_id]}
                        aria-controls={`details-${app.appointment_id}`}
                      >
                        {expandedRows[app.appointment_id] ? (
                          <ChevronUp size={20} />
                        ) : (
                          <ChevronDown size={20} />
                        )}
                      </button>
                    </td>
                        
                  </tr>
                    
                  {expandedRows[app.appointment_id] && (
                    <tr
                      id={`details-${app.appointment_id}`}
                      // ✨ การปรับปรุงสีพื้นหลังแถวขยาย: เปลี่ยนเป็นสีเขียวอ่อน (bg-green-50) เพื่อให้คล้ายภาพแนบ
                      className="bg-gray-50 border-b-4 border-white" 
                    >
                      <td colSpan="4" className="px-8 py-6"> 
                        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-6 text-sm text-gray-700 border-l-4 border-primary-default pl-4 items-start justify-between">
                            
                          {/* Detail Section (Left) */}
                          <div className="min-w-[50%] space-y-2">
                            <p>
                              <span className="font-semibold">วันที่:</span>
                              {getFormattedDate(app.appointment_date)}
                            </p>
                            <p>
                              <span className="font-semibold">เวลา:</span>
                              {getFormattedTime(app.appointment_time)} น.
                            </p>
                            <p>
                              <span className="font-semibold">สถานะ:</span>
                              {getStatusDisplay(
                                app.status,
                                app.appointment_date
                              )}
                            </p>
                            <p>
                              <span className="font-semibold">แพทย์:</span>
                              {app.doctor_full_name || "ไม่ได้ระบุ"}
                            </p>
                            <p>
                              <span className="font-semibold">ห้องตรวจ:</span>
                              {app.room_name || "ไม่ได้ระบุ"}
                            </p>
                          </div>
                            
                          {/* Action Section (Right) */}
                          <div className="flex flex-col gap-2 pt-2 md:pt-0 md:justify-end md:items-end">
                            {app.status === "pending" && (
                              <Button
                                variant="danger"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCancelClick(app);
                                }}
                                className="w-full md:w-auto flex items-center justify-center gap-2" 
                                disabled={loading}
                              >
                                ยกเลิกคำขอนัดหมาย
                              </Button>
                            )}

                            {app.status === "approved" && (
                              <>
                                <Button
                                  variant="success"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleCompleteClick(app.appointment_id);
                                  }}
                                  className="w-full md:w-auto flex items-center justify-center gap-2" 
                                  disabled={loading}
                                >
                                    ยืนยันเข้ารับบริการ
                                </Button>

                                <Button
                                  variant="danger"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleCancelClick(app);
                                  }}
                                  className="
                                    w-full md:w-auto flex items-center justify-center gap-2 
                                    border border-pavlova-500 text-pavlova-800 bg-white 
                                    hover:bg-pavlova-100 hover:border-pavlova-600
                                  "
                                  disabled={loading}
                                >
                                  {willCauseBlacklist(app)
                                    ? "ยกเลิก (ติด Blacklist หากเกิน 3 ครั้ง)"
                                    : "ยกเลิกนัดหมาย"}
                                </Button>
                              </>
                            )}

                            {app.status === "confirmed" && (
                              <Button
                                variant="primary"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleViewAppointmentCard(app);
                                }}
                                className="w-full md:w-auto flex items-center justify-center gap-2"
                              >
                                <FileText size={18} /> ดูบัตรนัด
                              </Button>
                            )}

                            {app.status === "rejected" && (
                              <div className="bg-red-100 p-2 rounded w-full md:w-auto">
                                <p className="text-xs text-red-800 font-semibold">
                                  เหตุผลที่ปฏิเสธ:
                                </p>
                                <p className="text-xs text-red-700">
                                  {app.rejection_reason || "ไม่มีเหตุผลระบุ"}
                                </p>
                              </div>
                            )}
                          </div>
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
        
      {/* ... (Popup Components - ไม่ได้แก้ไข) ... */}
      <Popup
        isOpen={showConfirmPopup}
        onClose={handleCancelPopup}
        title={
          actionType === "cancel"
            ? "ยืนยันการยกเลิกนัดหมาย"
            : "ยืนยันการเข้ารับบริการ"
        }
      >
        <div className="p-4">
          <p className="mb-4 text-gray-700">
              {confirmMessage}
          </p>
          <div className="flex justify-end gap-3 mt-6">
            <Button
              variant={actionType === "cancel" ? "danger" : "success"}
              onClick={handleConfirmAction}
              disabled={loading}
            >
              {loading
                ? "กำลังดำเนินการ..."
                : actionType === "cancel"
                ? "ยืนยันยกเลิก"
                : "ยืนยันเข้ารับบริการ"}
            </Button>
          </div>
        </div>
      </Popup>
        
      <Popup
        isOpen={showAppointmentCardPopup}
        onClose={handleCloseAppointmentCardPopup}
        title="บัตรนัดหมาย"
      >
        {appointmentCardDetails && (
          <div className="p-6 bg-white rounded-lg shadow-md max-w-sm mx-auto my-4 border-t-4 border-stromboli-400">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-primary-default mb-2">
                  บัตรนัดหมาย
              </h3>
              <p className="text-gray-600 text-sm">
                  โปรดแสดงบัตรนี้ที่เคาน์เตอร์
              </p>
            </div>
            <div className="space-y-3 text-gray-700">
              <div className="flex justify-between items-center border-b pb-2">
                <span className="font-semibold">HN:</span>
                <span>{appointmentCardDetails.patient_hn}</span>
              </div>
              <div className="flex justify-between items-center border-b pb-2">
                <span className="font-semibold">ผู้ป่วย:</span>
                <span>
                  {appointmentCardDetails.patient_first_name}
                  {appointmentCardDetails.patient_last_name}
                </span>
              </div>
              <div className="flex justify-between items-center border-b pb-2">
                <span className="font-semibold">บริการ:</span>
                <span>{appointmentCardDetails.service_name}</span>
              </div>
              <div className="flex justify-between items-center border-b pb-2">
                <span className="font-semibold">วันที่นัด:</span>
                <span>
                  {getFormattedDate(appointmentCardDetails.appointment_date)}
                </span>
              </div>
              <div className="flex justify-between items-center border-b pb-2">
                <span className="font-semibold">เวลา:</span>
                <span>
                  {getFormattedTime(appointmentCardDetails.appointment_time)} น.
                </span>
              </div>
              <div className="flex justify-between items-center border-b pb-2">
                <span className="font-semibold">แพทย์:</span>
                <span>{appointmentCardDetails.doctor_full_name || "-"}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold">ห้องตรวจ:</span>
                <span>{appointmentCardDetails.room_name || "-"}</span>
              </div>
            </div>
            <div className="mt-8 text-center text-sm text-gray-500">
              <p>โปรดมาถึงคลินิกก่อนเวลานัด 15 นาที</p>
              <p className="font-bold text-gray-600 mt-2">
                  คลินิกนรีเวชวิวัฒน์
              </p>
            </div>
          </div>
        )}
      </Popup>
        
    </div>
  );
};

export default MyAppointment;