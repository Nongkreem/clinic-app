import React, { useState } from "react";
import axios from "axios";
import Button from "../common/Button";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5001";

const DiagnosisForm = ({ appointment, onSaved, onCancel }) => {
  const [diagnosis, setDiagnosis] = useState("");
  const [treatment, setTreatment] = useState("");
  const [other_notes, setOtherNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    if (!diagnosis.trim() || !treatment.trim()) {
      setErr("กรุณากรอก Diagnosis และ Treatment");
      return;
    }
    setLoading(true);
    try {
      await axios.post(
        `${API_BASE_URL}/api/medical-record`,
        {
          appointment_id: appointment.appointment_id,
          diagnosis,
          treatment,
          note: other_notes || null,
        },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      onSaved?.();
    } catch (e) {
      console.error(e);
      setErr(e.response?.data?.message || "บันทึกผลการตรวจไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {err && (
        <div className="mb-3 rounded-lg border border-red-400 bg-red-100 px-3 py-2 text-sm text-red-700">
          {err}
        </div>
      )}

      <div className="mb-3">
        <label className="mb-1 block text-sm font-semibold text-gray-700">Diagnosis</label>
        <textarea
          className="w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
          rows={3}
          value={diagnosis}
          onChange={(e) => setDiagnosis(e.target.value)}
          placeholder="สรุปการวินิจฉัยของผู้ป่วย..."
          required
        />
      </div>

      <div className="mb-3">
        <label className="mb-1 block text-sm font-semibold text-gray-700">Treatment</label>
        <textarea
          className="w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
          rows={3}
          value={treatment}
          onChange={(e) => setTreatment(e.target.value)}
          placeholder="แนวทางการรักษา/ยา/คำแนะนำ..."
          required
        />
      </div>

      <div className="mb-4">
        <label className="mb-1 block text-sm font-semibold text-gray-700">หมายเหตุ (ถ้ามี)</label>
        <textarea
          className="w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
          rows={2}
          value={other_notes}
          onChange={(e) => setOtherNotes(e.target.value)}
          placeholder="บันทึกเพิ่มเติม..."
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="secondary" type="button" onClick={onCancel}>ยกเลิก</Button>
        <Button type="submit" disabled={loading}>
          {loading ? "กำลังบันทึก..." : "บันทึกผลการตรวจ"}
        </Button>
      </div>
    </form>
  );
};

export default DiagnosisForm;
