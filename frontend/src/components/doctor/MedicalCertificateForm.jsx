// src/components/doctor/MedicalCertificateForm.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import Button from "../common/Button";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5001";

const MedicalCertificateForm = ({ onCreated, onCancel }) => {
  // เลือกผู้ป่วยจากรายการนัดของวันนี้ที่ status = prechecked (หรือ approved/confirmed ก็ปรับได้)
  const [todayAppts, setTodayAppts] = useState([]);
  const [appointmentId, setAppointmentId] = useState("");
  const [reason, setReason] = useState("");
  const [otherNotes, setOtherNotes] = useState("");

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/doctor/completed-appointments`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setTodayAppts(res.data || []);
      } catch (e) {
        console.error(e);
      }
    };
    load();
  }, []);

  const submitCreate = async (e) => {
    e.preventDefault();
    setErr("");
    if (!appointmentId || !reason.trim()) {
      setErr("กรุณาเลือกผู้ป่วย (นัด) และระบุเหตุผล");
      return;
    }
    setLoading(true);
    try {
      await axios.post(
        `${API_BASE_URL}/api/medical-certificates`,
        {
          appointment_id: Number(appointmentId),
          reason,
          other_notes: otherNotes || null,
        },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      onCreated?.();
    } catch (e) {
      console.error(e);
      setErr(e.response?.data?.message || "ออกใบรับรองไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submitCreate}>
      {err && (
        <div className="mb-3 rounded-lg border border-red-400 bg-red-100 px-3 py-2 text-sm text-red-700">
          {err}
        </div>
      )}
      <div className="mb-3">
        <label className="mb-1 block text-sm font-semibold text-gray-700">เลือกผู้ป่วย (จากนัดวันนี้)</label>
        <select
          className="w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
          value={appointmentId}
          onChange={(e) => setAppointmentId(e.target.value)}
        >
          <option value="">-- เลือกนัด --</option>
          {todayAppts.map((a) => (
            <option key={a.appointment_id} value={a.appointment_id}>
              {a.patient_first_name} {a.patient_last_name} — {a.service_name} / {a.appointment_time?.slice(0,5)}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-3">
        <label className="mb-1 block text-sm font-semibold text-gray-700">เหตุผล</label>
        <textarea
          className="w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
          rows={3}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="สาเหตุ/ข้อวินิจฉัยย่อเพื่อประกอบใบรับรองแพทย์"
          required
        />
      </div>

      <div className="mb-4">
        <label className="mb-1 block text-sm font-semibold text-gray-700">หมายเหตุ (ถ้ามี)</label>
        <textarea
          className="w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
          rows={2}
          value={otherNotes}
          onChange={(e) => setOtherNotes(e.target.value)}
          placeholder="ความคิดเห็นของแพทย์เพิ่มเติม"
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="secondary" type="button" onClick={onCancel}>ยกเลิก</Button>
        <Button type="submit" disabled={loading || !appointmentId || !reason.trim()}>
          {loading ? "กำลังออกใบรับรอง..." : "ออกใบรับรองแพทย์"}
        </Button>
      </div>
    </form>
  );
};

export default MedicalCertificateForm;
