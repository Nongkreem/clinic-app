import React from "react";
import ManagePageTemplate from "../../components/common/ManagePageTemplate";
import PrecheckForm from "../../components/nurse/PrecheckForm";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5001";

const NursePrecheckManage = () => {
  // หัวตารางที่จะแสดง
  const tableHeaders = [
    { label: "ชื่อ - นามสกุล" },
    { label: "แพทย์ผู้ดูแล" },
    { label: "ห้องตรวจ" },
    { label: "เวลานัด" },
    { label: "อาการที่แจ้ง" },
    { label: "การจัดการ" },
  ];

  // การเรนเดอร์แถวข้อมูล
  const renderTableRow = (item, index, handleEditItem) => {
    return (
      <tr key={item.appointment_id} className="hover:bg-gray-50">
        <td className="py-2 px-4">
          {item.patient_first_name} {item.patient_last_name} (HN: {item.hn})
        </td>
        <td className="py-2 px-4">{item.doctor_full_name || "-"}</td>
        <td className="py-2 px-4">{item.room_name || "-"}</td>
        <td className="py-2 px-4">
          {item.appointment_date} {item.appointment_time}
        </td>
        <td className="py-2 px-4">{item.symptoms || "-"}</td>
        <td className="py-2 px-4 space-x-2">
          <button
            onClick={() => handleEditItem(item)}
            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
          >
            เพิ่ม/แก้ไขค่าสุขภาพ
          </button>
          <button
            onClick={() => handleSendToDoctor(item.appointment_id)}
            className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
          >
            ส่งตรวจ
          </button>
        </td>
      </tr>
    );
  };

  // ฟังก์ชันส่งตรวจ
  const handleSendToDoctor = async (appointmentId) => {
    if (!window.confirm("ยืนยันการส่งผู้ป่วยเข้าตรวจหรือไม่?")) return;
    try {
      const res = await axios.put(
        `${API_BASE_URL}/precheck/send-to-doctor/${appointmentId}`,
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      alert(res.data.message || "ส่งตรวจสำเร็จ");
      window.location.reload(); // รีโหลดเพื่อให้ตารางอัปเดต
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "เกิดข้อผิดพลาดในการส่งตรวจ");
    }
  };

  return (
    <ManagePageTemplate
      pageTitle="จัดการค่าสุขภาพก่อนพบแพทย์"
      addButtonLabel="เพิ่มค่าสุขภาพ"
      tableHeaders={tableHeaders}
      renderTableRow={renderTableRow}
      PopupFormComponent={PrecheckForm}
      fetchItemsApi={`/api/appointments/approved-with-checkin?serviceId=${localStorage.getItem(
        "service_id"
      )}`}
      deleteItemApi="" // ไม่มีการลบ precheck
      itemIdentifierKey="appointment_id"
      popupTitlePrefix="ค่าสุขภาพ"
    />
  );
};

export default NursePrecheckManage;
