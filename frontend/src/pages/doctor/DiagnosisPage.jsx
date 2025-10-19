import React, { useEffect, useState } from "react";
import axios from "axios";
import { ChevronDown, ChevronUp } from "lucide-react";
import Button from "../../components/common/Button";
import DiagnosisSection from "../../components/doctor/DiagnosisSection";
const API_BASE_URL =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:5001";

const DiagnosisPage = () => {
  const [appointments, setAppointments] = useState([]);
  const [precheckMap, setPrecheckMap] = useState({});
  const [expandedId, setExpandedId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // popup state
  const [isDiagOpen, setIsDiagOpen] = useState(false);
  const [isFollowOpen, setIsFollowOpen] = useState(false);
  const [confirmFollowUp, setConfirmFollowUp] = useState(false);
  const [activeAppointment, setActiveAppointment] = useState(null);

  const fetchAppointments = async () => {
    setLoading(true);
    setErr("");
    try {
      const res = await axios.get(
        `${API_BASE_URL}/api/doctor/prechecked-appointments`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      // แสดงเฉพาะผู้ป่วยที่ยังไม่ได้ตรวจ
      const list = (res.data || []).filter(
        (a) => a.status === "prechecked" || a.status === "waiting_for_diagnosis"
      );
      setAppointments(list);
    } catch (e) {
      console.error(e);
      setErr("ไม่สามารถโหลดรายชื่อผู้ป่วยได้");
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchPrecheck = async (appointment_id) => {
    try {
      const res = await axios.get(
        `${API_BASE_URL}/api/precheck/latest/${appointment_id}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setPrecheckMap((prev) => ({
        ...prev,
        [appointment_id]: res.data || null,
      }));
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const toggleExpand = (row) => {
    const id = row.appointment_id;
    setExpandedId((prev) => (prev === id ? null : id));
    if (!precheckMap[id]) fetchPrecheck(id);
  };

  const openDiagnosis = (row) => {
    setActiveAppointment(row);
    setIsDiagOpen(true);
  };


  const onDiagnosisSaved = () => {
    setIsDiagOpen(false);
    setActiveAppointment(null);
    fetchAppointments(); // refresh list หลังบันทึกผลตรวจ
  };

  const onFollowUpSaved = () => {
    setIsFollowOpen(false);
    setActiveAppointment(null);
    fetchAppointments(); // refresh list หลังนัดติดตาม
  };

  const fmtDate = (d) => {
    if (!d) return "-";
    return new Date(d).toLocaleDateString("th-TH", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };
  const fmtTime = (t) => (t ? t.slice(0, 5) : "-");

  return (
    <div className="m-8">
      <h2 className="mb-6 text-2xl font-bold text-primary-default">วินิจฉัย</h2>

      {err && (
        <div className="mb-4 rounded-lg border border-red-400 bg-red-100 px-4 py-3 text-red-700">
          {err}
        </div>
      )}

      <div className="rounded-xl">
        {loading ? (
          <p className="text-center text-gray-500">กำลังโหลด...</p>
        ) : appointments.length === 0 ? (
          <p className="text-center text-gray-500">ไม่มีผู้ป่วยที่รอตรวจ</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full overflow-hidden rounded-lg bg-white">
              <thead className="bg-pavlova-100">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    ผู้ป่วย
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    บริการ
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    ห้อง
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    วัน/เวลา
                  </th>
                  <th className="w-16 px-4 py-3 text-left text-sm font-semibold text-gray-700"></th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((row) => (
                  <React.Fragment key={row.appointment_id}>
                    <tr className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-800">
                        {row.patient_first_name} {row.patient_last_name} (HN:{" "}
                        {row.hn})
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-800">
                        {row.service_name}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-800">
                        {row.room_name || "-"}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-800">
                        {fmtDate(row.appointment_date)} เวลา{" "}
                        {fmtTime(row.appointment_time)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => toggleExpand(row)}
                          className="rounded-full p-1 text-gray-600 hover:bg-gray-200 focus:outline-none"
                        >
                          {expandedId === row.appointment_id ? (
                            <ChevronUp size={18} />
                          ) : (
                            <ChevronDown size={18} />
                          )}
                        </button>
                      </td>
                    </tr>

                    {/* แถวขยายได้  */}
                    {expandedId === row.appointment_id && (
                      <tr className="border-b border-gray-200 bg-stromboli-50">
                        <td colSpan="5" className="p-4">
                          <div className="flex flex-col gap-6 md:flex-row">
                            {/* ซ้าย: อาการ */}
                            <div className="md:w-1/3">
                              <h4 className="mb-2 font-semibold text-gray-800">
                                อาการที่แจ้ง
                              </h4>
                              <p className="text-sm text-gray-700">
                                {row.symptoms || "-"}
                              </p>
                            </div>

                            {/* ขวา: ค่าสุขภาพ */}
                            <div className="md:w-2/3">
                              <h4 className="mb-2 font-semibold text-gray-800">
                                ค่าสุขภาพเบื้องต้นล่าสุด
                              </h4>
                              {precheckMap[row.appointment_id] ? (
                                <ul className="space-y-1 text-sm text-gray-700">
                                  <li>
                                    ความดัน:{" "}
                                    {precheckMap[row.appointment_id]
                                      .blood_pressure || "-"}
                                  </li>
                                  <li>
                                    ชีพจร:{" "}
                                    {precheckMap[row.appointment_id]
                                      .heart_rate || "-"}
                                  </li>
                                  <li>
                                    อุณหภูมิ:{" "}
                                    {precheckMap[row.appointment_id]
                                      .temperature || "-"}
                                  </li>
                                  <li>
                                    น้ำหนัก:{" "}
                                    {precheckMap[row.appointment_id].weight ||
                                      "-"}
                                  </li>
                                  <li>
                                    ส่วนสูง:{" "}
                                    {precheckMap[row.appointment_id].height ||
                                      "-"}
                                  </li>
                                  <li>
                                    หมายเหตุ:{" "}
                                    {precheckMap[row.appointment_id]
                                      .other_notes || "-"}
                                  </li>
                                </ul>
                              ) : (
                                <p className="text-sm text-gray-500">
                                  ไม่มีข้อมูล
                                </p>
                              )}
                            </div>
                          </div>

                          {/* ปุ่ม (อยู่ใน expandable row ) */}
                          <div className="mt-4 flex justify-end gap-2">
                            <Button
                              variant="primary"
                              onClick={() => openDiagnosis(row)}
                              className="p-2 text-sm"
                            >
                              บันทึกผลการตรวจ
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
      </div>

      {/* Popup: วินิจฉัย */}
      {isDiagOpen && activeAppointment && (
        <div className="fixed inset-0 bg-gray-100 overflow-y-auto z-50 p-6">
          <DiagnosisSection
            appointment={activeAppointment}
            onBack={() => {
              setIsDiagOpen(false);
              setActiveAppointment(null);
            }}
            onSaved={onDiagnosisSaved}
          />
        </div>
      )}
    </div>
  );
};

export default DiagnosisPage;
