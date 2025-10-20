import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Button from "../../components/common/Button";
import Popup from "../../components/common/Popup";
import {
  FileText,
  Info,
  ChevronDown,
  ChevronUp,
  RefreshCcw,
} from "lucide-react";
import { toast } from "react-toastify";

const API_BASE_URL =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:5001";

const MyAppointment = () => {
  const { user, loading: authLoading } = useAuth();
  const patientId = user?.entity_id;

  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterService, setFilterService] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [patientBlacklistStatus, setPatientBlacklistStatus] = useState(null);
  const [expandedRows, setExpandedRows] = useState({});
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [actionType, setActionType] = useState("");
  const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);
  const [confirmMessage, setConfirmMessage] = useState("");
  const [showAppointmentCardPopup, setShowAppointmentCardPopup] =
    useState(false);
  const [appointmentCardDetails, setAppointmentCardDetails] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const navigate = useNavigate();

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
    } catch (err) {
      console.error("Error fetching blacklist status:", err);
    }
  };

  const fetchMyAppointments = async () => {
    if (!patientId || authLoading) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/appointments/my-appointments`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      // กรอง precheck ออกและเรียงลำดับจากวันใกล้สุด
      const filtered = response.data
        .filter((app) => app.status !== "precheck")
        .sort((a, b) => {
          const dateA = new Date(`${a.appointment_date}T${a.appointment_time}`);
          const dateB = new Date(`${b.appointment_date}T${b.appointment_time}`);
          return dateA - dateB;
        });

      setAppointments(filtered);
      setFilteredAppointments(filtered);
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

  // ฟังก์ชันกรองข้อมูล
  useEffect(() => {
    let result = [...appointments];
    if (filterStatus !== "all") {
      result = result.filter((a) => a.status === filterStatus);
    }
    if (filterService !== "all") {
      result = result.filter((a) => a.service_name === filterService);
    }
    setFilteredAppointments(result);
    setCurrentPage(1);
  }, [appointments, filterStatus, filterService]);

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
  // ดึงข้อมูล cancellation_count
  const fetchCurrentCancellationCount = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/patients/${patientId}/blacklist-status`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      return response.data.cancellation_count || 0;
    } catch (err) {
      console.error("Error fetching latest cancellation count:", err);
      return patientBlacklistStatus?.cancellation_count || 0; // fallback
    }
  };

  // นับโอกาสที่เหลือเมื่อกดยกเลิกนัดหมาย
  const handleCancelClick = async (appointment) => {
    try {
      const currentCount = await fetchCurrentCancellationCount();
      const remaining = Math.max(0, 3 - currentCount);
      const willBlacklist = remaining <= 1;

      setSelectedAppointmentId(appointment.appointment_id);
      setActionType("cancel");

      if (willCauseBlacklist(appointment)) {
        setConfirmMessage(
          `คุณแน่ใจจริง ๆ หรือไม่? หากยกเลิกนัดหมายครั้งนี้ ` +
            `คุณจะเหลือโอกาสอีก ${
              remaining - 1 < 0 ? 0 : remaining - 1
            } ครั้งก่อนถูกระงับบัญชี`
        );
      } else {
        setConfirmMessage(
          willBlacklist
            ? `คุณแน่ใจจริง ๆ หรือไม่? หากยกเลิกนัดหมายครั้งนี้คุณจะถูกระงับบัญชีทันที`
            : `คุณแน่ใจจริง ๆ หรือไม่? หากยกเลิกนัดหมายครั้งนี้คุณจะเหลือโอกาสอีก ${
                remaining - 1 < 0 ? 0 : remaining - 1
              } ครั้งก่อนถูกระงับบัญชี`
        );
      }

      setShowConfirmPopup(true);
    } catch (err) {
      console.error("Error preparing cancel popup:", err);
      toast.error("ไม่สามารถโหลดข้อมูลจำนวนการยกเลิกได้");
    }
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

      if (actionType === "cancel") {
        const message = response.data.message || "ยกเลิกนัดหมายสำเร็จ";
        if (message.includes("เหลือโอกาส")) {
          toast.warning(message, { autoClose: 6000, theme: "colored" });
        } else {
          toast.info(message, { autoClose: 4000, theme: "colored" });
        }
        await fetchBlacklistStatus();
      } else if (actionType === "confirmed") {
        toast.success("ยืนยันเข้ารับบริการสำเร็จ!", {
          autoClose: 4000,
          theme: "colored",
        });
      }

      await fetchMyAppointments();
    } catch (err) {
      console.error(`Error ${actionType}ing appointment:`, err);
      toast.error("เกิดข้อผิดพลาดในการดำเนินการ");
    } finally {
      setLoading(false);
      setSelectedAppointmentId(null);
      setActionType("");
      setConfirmMessage("");

      // ตรวจสอบสถานะ blacklist หลังทำรายการ
      if (actionType === "cancel") {
        try {
          const statusRes = await axios.get(
            `${API_BASE_URL}/api/patients/${patientId}/blacklist-status`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );

          if (statusRes.data.isBlacklisted) {
            toast.error(
              "บัญชีของคุณถูกระงับชั่วคราวเนื่องจากยกเลิกนัดครบ 3 ครั้ง",
              {
                autoClose: 5000,
                theme: "colored",
              }
            );

            localStorage.removeItem("token");
            sessionStorage.clear();
            if (typeof logout === "function") logout(false); // ป้องกันกรณี context มี redirect ภายใน
            navigate("/login", { replace: true });
          }
        } catch (error) {
          console.error("Error checking blacklist after cancel:", error);
        }
      }
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

  const toggleRow = (id) => {
    setExpandedRows((prev) => (prev[id] ? {} : { [id]: true }));
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

  const getFormattedTime = (timeString) =>
    timeString ? timeString.slice(0, 5) : "-";

  const isArrivingSoon = (dateString) => {
    const appointmentDate = new Date(dateString);
    const today = new Date();
    appointmentDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil(
      (appointmentDate - today) / (1000 * 60 * 60 * 24)
    );
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
      case "confirmed":
        display = isArrivingSoon(appointmentDate)
          ? "กำลังจะมาถึง"
          : "ยืนยันเข้ารับบริการ";
        className += "bg-blue-100 text-blue-800";
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

  const totalPages = Math.ceil(filteredAppointments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentAppointments = filteredAppointments.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const handlePrevPage = () => setCurrentPage((p) => Math.max(p - 1, 1));
  const handleNextPage = () =>
    setCurrentPage((p) => Math.min(p + 1, totalPages));

  return (
    <div className="mt-16 container mx-auto p-4 md:p-8">
      <h2 className="text-3xl font-bold text-primary-default mb-6 flex justify-center">
        นัดหมายของฉัน
      </h2>

      {/* 🔍 ฟิลเตอร์ */}
      <div className="bg-white rounded-lg p-4 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-4">
          <select
            value={filterService}
            onChange={(e) => setFilterService(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-secondary-default"
          >
            <option value="all">บริการทั้งหมด</option>
            {[...new Set(appointments.map((a) => a.service_name))].map(
              (service) => (
                <option key={service} value={service}>
                  {service}
                </option>
              )
            )}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-secondary-default"
          >
            <option value="all">สถานะทั้งหมด</option>
            <option value="pending">รออนุมัติ</option>
            <option value="approved">อนุมัติแล้ว</option>
            <option value="confirmed">กำลังจะมาถึง</option>
            <option value="rejected">ถูกปฏิเสธ</option>
            <option value="cancelled">ยกเลิกแล้ว</option>
          </select>
        </div>

        <button
          onClick={() => {
            setFilterService("all");
            setFilterStatus("all");
          }}
          className="flex items-center gap-2 text-secondary-default hover:text-secondary-dark text-sm"
        >
          <RefreshCcw size={16} /> รีเซ็ตตัวกรอง
        </button>
      </div>

      {!loading && currentAppointments.length === 0 ? (
        <div className="bg-white p-6 text-center shadow-lg rounded-lg">
          <p className="text-gray-600">ไม่พบนัดหมายตามตัวกรอง</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white shadow-xl rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-yellow-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-primary-default uppercase tracking-wider w-1/4">
                  วันและเวลาจอง
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-primary-default uppercase tracking-wider w-1/3">
                  บริการ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-primary-default uppercase tracking-wider w-1/4">
                  สถานะ
                </th>
                <th className="relative px-6 py-3 w-1/6">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
              {currentAppointments.map((app) => (
                <React.Fragment key={app.appointment_id}>
                  <tr
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => toggleRow(app.appointment_id)}
                  >
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {getFormattedDate(app.appointment_date)} <br />
                      <span className="text-gray-700">
                        {getFormattedTime(app.appointment_time)} น.
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 font-semibold">
                      {app.service_name}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {getStatusDisplay(app.status, app.appointment_date)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleRow(app.appointment_id);
                        }}
                        className="text-primary-default hover:text-primary-dark p-1 rounded-full bg-gray-100 hover:bg-gray-200"
                      >
                        {expandedRows[app.appointment_id] ? (
                          <ChevronUp size={20} />
                        ) : (
                          <ChevronDown size={20} />
                        )}
                      </button>
                    </td>
                  </tr>
                  {/* แถวที่ซ่อน จะแสดงเมื่อกดลูกศร */}
                  {expandedRows[app.appointment_id] && (
                    <tr className="bg-gray-50 border-b-4 border-white">
                      <td colSpan="4" className="px-8 py-6">
                        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-6 text-sm text-gray-700 border-l-4 border-primary-default pl-4 items-start justify-between">
                          <div className="space-y-2">
                            <p>
                              <span className="font-semibold">วันที่:</span>{" "}
                              {getFormattedDate(app.appointment_date)}
                            </p>
                            <p>
                              <span className="font-semibold">เวลา:</span>{" "}
                              {getFormattedTime(app.appointment_time)} น.
                            </p>
                            <p>
                              <span className="font-semibold">สถานะ:</span>{" "}
                              {getStatusDisplay(
                                app.status,
                                app.appointment_date
                              )}
                            </p>
                            <p>
                              <span className="font-semibold">แพทย์:</span>{" "}
                              {app.doctor_full_name || "ไม่ได้ระบุ"}
                            </p>
                            <p>
                              <span className="font-semibold">ห้องตรวจ:</span>{" "}
                              {app.room_name || "ไม่ได้ระบุ"}
                            </p>
                          </div>

                          {/* ปุ่มจัดการแต่ละสถานะ */}
                          <div className="flex flex-col gap-2 pt-2 md:pt-0 md:justify-end md:items-end">
                            {app.status === "pending" && (
                              <Button
                                variant="danger"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCancelClick(app);
                                }}
                                className="w-full md:min-w-[200px]"
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
                                  className="w-full md:min-w-[200px]"
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
                                  className="w-full md:min-w-[200px] border border-pavlova-500 text-pavlova-800 bg-white hover:bg-pavlova-100"
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
          {/* แบ่งหน้า */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 py-4 border-t border-gray-200">
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  currentPage === 1
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-primary-default hover:bg-gray-100"
                }`}
              >
                &lt;
              </button>

              <span className="text-sm text-gray-700">
                หน้า <span className="font-semibold">{currentPage}</span> จาก{" "}
                <span className="font-semibold">{totalPages}</span>
              </span>

              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  currentPage === totalPages
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-primary-default hover:bg-gray-100"
                }`}
              >
                &gt;
              </button>
            </div>
          )}
          {/* Popup ยืนยันการยกเลิก / ยืนยันเข้ารับบริการ */}
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
              <p className="mb-4 text-gray-700 font-medium">{confirmMessage}</p>

              {/* เพิ่มแถบ Progress แสดงสถานะการยกเลิก */}
              {actionType === "cancel" && (
                <div className="mb-4">
                  <div className="flex gap-1">
                    {Array.from({ length: 3 }).map((_, i) => {
                      const current =
                        patientBlacklistStatus?.cancellation_count || 0;
                      const filled = i < current;
                      return (
                        <div
                          key={i}
                          className={`flex-1 h-2 rounded-full ${
                            filled ? "bg-red-400" : "bg-gray-200"
                          }`}
                        />
                      );
                    })}
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    ยกเลิกแล้ว {patientBlacklistStatus?.cancellation_count || 0}{" "}
                    / 3 ครั้ง
                  </p>
                </div>
              )}

              <div className="flex justify-end gap-3 mt-6">
                <Button variant="secondary" onClick={handleCancelPopup}>
                  ย้อนกลับ
                </Button>
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
          {/* Popup บัตรนัด */}
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
      )}
    </div>
  );
};

export default MyAppointment;
