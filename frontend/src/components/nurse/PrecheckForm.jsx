// frontend/src/components/nurse/PrecheckForm.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5001";

const PrecheckForm = ({ initialData, onSaveSuccess, onCancel }) => {
  const [bloodPressure, setBloodPressure] = useState("");
  const [heartRate, setHeartRate] = useState("");
  const [temperature, setTemperature] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [otherNotes, setOtherNotes] = useState("");
  const appointmentId = initialData?.appointment_id || null;

  // โหลดข้อมูล precheck ล่าสุด
  useEffect(() => {
    const fetchLatestPrecheck = async () => {
      if (!appointmentId) return;
      try {
        const res = await axios.get(
          `${API_BASE_URL}/api/precheck/latest/${appointmentId}`,
          { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
        );
        if (res.data) {
          setBloodPressure(res.data.blood_pressure || "");
          setHeartRate(res.data.heart_rate || "");
          setTemperature(res.data.temperature || "");
          setWeight(res.data.weight || "");
          setHeight(res.data.height || "");
          setOtherNotes(res.data.other_notes || "");
        }
      } catch (err) {
        console.error("Failed to load precheck data:", err);
      }
    };
    fetchLatestPrecheck();
  }, [appointmentId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        `${API_BASE_URL}/api/precheck`,
        {
          appointment_id: appointmentId,
          blood_pressure: bloodPressure,
          heart_rate: heartRate,
          temperature: temperature,
          weight: weight,
          height: height,
          other_notes: otherNotes,
        },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      alert("บันทึกค่าสุขภาพสำเร็จ");
      onSaveSuccess();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "เกิดข้อผิดพลาดในการบันทึก");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block font-semibold">ความดันโลหิต</label>
        <input
          type="text"
          value={bloodPressure}
          onChange={(e) => setBloodPressure(e.target.value)}
          className="w-full border rounded px-3 py-2"
          placeholder="เช่น 120/80"
        />
      </div>
      <div>
        <label className="block font-semibold">ชีพจร (ครั้ง/นาที)</label>
        <input
          type="number"
          value={heartRate}
          onChange={(e) => setHeartRate(e.target.value)}
          className="w-full border rounded px-3 py-2"
        />
      </div>
      <div>
        <label className="block font-semibold">อุณหภูมิ (°C)</label>
        <input
          type="number"
          step="0.1"
          value={temperature}
          onChange={(e) => setTemperature(e.target.value)}
          className="w-full border rounded px-3 py-2"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block font-semibold">น้ำหนัก (กก.)</label>
          <input
            type="number"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block font-semibold">ส่วนสูง (ซม.)</label>
          <input
            type="number"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
        </div>
      </div>
      <div>
        <label className="block font-semibold">บันทึกเพิ่มเติม</label>
        <textarea
          value={otherNotes}
          onChange={(e) => setOtherNotes(e.target.value)}
          className="w-full border rounded px-3 py-2"
          rows={3}
        />
      </div>
      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
        >
          ยกเลิก
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-primary-default text-white rounded hover:bg-primary-dark"
        >
          บันทึก
        </button>
      </div>
    </form>
  );
};

export default PrecheckForm;
