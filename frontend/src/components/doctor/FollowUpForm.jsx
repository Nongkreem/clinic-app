// src/components/doctor/FollowUpForm.jsx
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Button from "../common/Button";
import { useAuth } from "../../context/AuthContext";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5001";

const FollowUpForm = ({ appointment, onSaved, onCancel }) => {
  const { user } = useAuth(); // ใช้ service_id (array) ของหมอได้ถ้าต้องกรอง service options
  const [allServices, setAllServices] = useState([]);
  const [serviceId, setServiceId] = useState(appointment.service_id); // ดีฟอลต์เป็นบริการเดิม
  const [date, setDate] = useState("");
  const [timeBlocks, setTimeBlocks] = useState([]);
  const [selectedBlock, setSelectedBlock] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [note, setNote] = useState("");

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // โหลด service options แล้วกรองเฉพาะที่หมอให้บริการ
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/services`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        const all = res.data || [];
        let filtered = all;
        if (Array.isArray(user?.service_id) && user.service_id.length > 0) {
          filtered = all.filter((s) => user.service_id.includes(s.service_id));
        }
        setAllServices(filtered);
      } catch (e) {
        console.error(e);
      }
    };
    fetchServices();
  }, [user]);

  // โหลด time blocks เมื่อเลือกวัน+บริการ
  useEffect(() => {
    const loadBlocks = async () => {
      setTimeBlocks([]);
      setSelectedBlock(null);
      setSelectedSlot(null);

      if (!serviceId || !date) return;
      setLoading(true);
      setErr("");

      try {
        const res = await axios.get(`${API_BASE_URL}/api/appointments/available-slots`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          params: { scheduleDate: date, serviceId },
        });
        setTimeBlocks(res.data || []);
      } catch (e) {
        console.error(e);
        setErr("ไม่พบช่วงเวลาที่ว่างในวันที่เลือก");
      } finally {
        setLoading(false);
      }
    };
    loadBlocks();
  }, [serviceId, date]);

  const onPickBlock = (block) => {
    if (selectedBlock?.slot_start === block.slot_start && selectedBlock?.slot_end === block.slot_end) {
      setSelectedBlock(null);
      setSelectedSlot(null);
    } else {
      setSelectedBlock(block);
      setSelectedSlot(block.ers_ids_in_block?.[0] || null); // เอา slot แรกในบล็อค
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    if (!serviceId || !date || !selectedSlot) {
      setErr("กรุณาเลือกบริการ วัน และช่วงเวลา");
      return;
    }
    setLoading(true);
    try {
      await axios.post(
        `${API_BASE_URL}/api/doctor/follow-up-appointment`,
        {
          base_appointment_id: appointment.appointment_id,
          service_id: serviceId,
          ers_id: selectedSlot,
          note: note || null,
        },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      onSaved?.();
    } catch (e) {
      console.error(e);
      setErr(e.response?.data?.message || "สร้างนัดติดตามอาการไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  const fmtDateText = useMemo(() => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("th-TH", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }, [date]);

  return (
    <form onSubmit={handleSubmit}>
      {err && (
        <div className="mb-3 rounded-lg border border-red-400 bg-red-100 px-3 py-2 text-sm text-red-700">
          {err}
        </div>
      )}

      {/* Service select เฉพาะกรณีหมอมีหลายบริการ */}
      <div className="mb-3">
        <label className="mb-1 block text-sm font-semibold text-gray-700">
          บริการสำหรับนัดติดตาม
        </label>
        <select
          className="w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
          value={serviceId || ""}
          onChange={(e) => setServiceId(Number(e.target.value))}
        >
          {allServices.map((s) => (
            <option key={s.service_id} value={s.service_id}>
              {s.service_name}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-3">
        <label className="mb-1 block text-sm font-semibold text-gray-700">เลือกวันนัด</label>
        <input
          type="date"
          className="w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          min={new Date().toISOString().split("T")[0]}
        />
      </div>

      {/* Time blocks */}
      {date && (
        <div className="mb-4">
          <div className="mb-2 text-sm font-semibold text-gray-700">
            ช่วงเวลาที่ว่างสำหรับ {fmtDateText}
          </div>
          {loading ? (
            <p className="text-sm text-gray-500">กำลังโหลดช่วงเวลา...</p>
          ) : timeBlocks.length === 0 ? (
            <p className="text-sm text-gray-500">ไม่มีช่วงเวลาว่าง</p>
          ) : (
            <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4">
              {timeBlocks.map((b) => (
                <button
                  key={`${b.slot_start}-${b.slot_end}`}
                  type="button"
                  onClick={() => onPickBlock(b)}
                  className={`rounded-lg border-2 p-2 text-center text-sm transition
                    ${
                      selectedBlock?.slot_start === b.slot_start && selectedBlock?.slot_end === b.slot_end
                        ? "bg-secondary-default text-secondary-dark shadow"
                        : "border-gray-300 bg-white text-gray-800 hover:bg-secondary-light hover:text-secondary-default"
                    }`}
                >
                  <div className="font-medium">
                    {b.slot_start.slice(0, 5)} - {b.slot_end.slice(0, 5)}
                  </div>
                  <div className="text-xs">ว่าง: {b.total_available_slots_in_time_block} คิว</div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="mb-4">
        <label className="mb-1 block text-sm font-semibold text-gray-700">หมายเหตุ (ถ้ามี)</label>
        <textarea
          className="w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
          rows={2}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="จุดประสงค์/คำแนะนำสำหรับการติดตามอาการ..."
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="secondary" type="button" onClick={onCancel}>ยกเลิก</Button>
        <Button type="submit" disabled={loading || !serviceId || !date || !selectedSlot}>
          {loading ? "กำลังสร้าง..." : "ยืนยันการนัดติดตาม"}
        </Button>
      </div>
    </form>
  );
};

export default FollowUpForm;