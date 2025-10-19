import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Button from "../common/Button";
import { useAuth } from "../../context/AuthContext";
import { useSystemDate } from "../../hooks/useSystemDate"; // ✅ ใช้วันที่ระบบจำลอง

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5001";

const FollowUpForm = ({ appointment, onSaved, onCancel }) => {
  const { user } = useAuth();
  const [allServices, setAllServices] = useState([]);
  const [serviceId, setServiceId] = useState(appointment.service_id);
  const [date, setDate] = useState("");
  const [timeBlocks, setTimeBlocks] = useState([]);
  const [selectedBlock, setSelectedBlock] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const { systemDate, loading: dateLoading } = useSystemDate(); // ✅ mock date สำหรับ demo mode

  // โหลด service ที่หมอให้บริการ
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/services`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        const all = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data.data)
          ? res.data.data
          : [];

        let doctorServiceIds = [];
        if (Array.isArray(user?.service_id)) {
          doctorServiceIds = user.service_id;
        } else if (typeof user?.service_id === "string") {
          doctorServiceIds = user.service_id
            .split(",")
            .map((id) => Number(id.trim()))
            .filter((id) => !isNaN(id));
        }

        const filtered =
          doctorServiceIds.length > 0
            ? all.filter((s) => doctorServiceIds.includes(s.service_id))
            : all;

        setAllServices(filtered);
      } catch (e) {
        console.error(e);
      }
    };
    fetchServices();
  }, [user]);

  // โหลด slot เมื่อเลือกวัน + service
  useEffect(() => {
    const loadBlocks = async () => {
      if (!serviceId || !date) return;
      setLoading(true);
      setErr("");

      try {
        const res = await axios.get(`${API_BASE_URL}/api/appointments/available-slots`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          params: { scheduleDate: date, serviceId },
        });

        let slots = res.data || [];

        // ✅ กรอง slot ตามเวลา (จองได้ต้องมากกว่า 24 ชม.)
        const next24h = new Date(systemDate.getTime() + 24 * 60 * 60 * 1000);
        slots = slots.filter((block) => {
          const blockStart = new Date(`${date}T${block.slot_start}`);
          return blockStart >= next24h; // เอาเฉพาะที่ >= 24 ชม.
        });

        setTimeBlocks(slots);
      } catch (e) {
        console.error(e);
        setErr("ไม่พบช่วงเวลาที่ว่างในวันที่เลือก");
      } finally {
        setLoading(false);
      }
    };
    loadBlocks();
  }, [serviceId, date]);

  // ✅ ปิดปุ่มที่เร็วกว่า 24 ชม. หรือ slot เต็ม
  const renderTimeBlocks = () => {
    if (loading) return <p className="text-sm text-gray-500">กำลังโหลดช่วงเวลา...</p>;
    if (timeBlocks.length === 0) return <p className="text-sm text-gray-500">ไม่มีช่วงเวลาว่าง</p>;

    const next24h = new Date(systemDate.getTime() + 24 * 60 * 60 * 1000);

    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {timeBlocks.map((b) => {
          const blockStart = new Date(`${date}T${b.slot_start}`);
          const isTooSoon = blockStart < next24h;
          const isFull = b.total_available_slots_in_time_block === 0;
          const isDisabled = isTooSoon || isFull;

          return (
            <button
              key={`${b.slot_start}-${b.slot_end}`}
              type="button"
              onClick={() => !isDisabled && onPickBlock(b)}
              disabled={isDisabled}
              title={
                isFull
                  ? "Slot เต็มแล้ว"
                  : isTooSoon
                  ? "ต้องนัดติดตามล่วงหน้าอย่างน้อย 24 ชั่วโมง"
                  : ""
              }
              className={`rounded-lg border-2 p-3 text-center text-sm transition-all
                ${
                  isDisabled
                    ? "bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed"
                    : selectedBlock?.slot_start === b.slot_start
                    ? "bg-secondary-default text-white border-secondary-default shadow-lg"
                    : "bg-white text-gray-800 border-gray-300 hover:bg-secondary-light hover:border-secondary-default"
                }`}
            >
              <div className="font-medium">
                {b.slot_start.slice(0, 5)} - {b.slot_end.slice(0, 5)}
              </div>
              <div className="text-xs mt-1">
                {isFull
                  ? "เต็มแล้ว"
                  : isTooSoon
                  ? "จองได้หลัง 24 ชม."
                  : `ว่าง: ${b.total_available_slots_in_time_block} คิว`}
              </div>
            </button>
          );
        })}
      </div>
    );
  };

  const onPickBlock = (block) => {
    if (selectedBlock?.slot_start === block.slot_start && selectedBlock?.slot_end === block.slot_end) {
      setSelectedBlock(null);
      setSelectedSlot(null);
    } else {
      setSelectedBlock(block);
      setSelectedSlot(block.ers_ids_in_block?.[0] || null);
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
        `${API_BASE_URL}/api/doctor/follow-up`,
        {
          previous_appointment_id: appointment.appointment_id,
          ers_id: selectedSlot,
          appointment_date: date,
          appointment_time: selectedBlock.slot_start,
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
    <form onSubmit={handleSubmit} className="space-y-5">
      {err && (
        <div className="rounded-lg border border-red-400 bg-red-100 px-3 py-2 text-sm text-red-700">
          {err}
        </div>
      )}

      {/* เลือกบริการ */}
      <div>
        <label className="mb-1 block text-sm font-semibold text-gray-700">
          บริการสำหรับนัดติดตาม
        </label>
        <select
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary-default"
          value={serviceId || ""}
          onChange={(e) => setServiceId(Number(e.target.value))}
        >
          <option value="">-- กรุณาเลือกบริการ --</option>
          {allServices.map((s) => (
            <option key={s.service_id} value={s.service_id}>
              {s.service_name}
            </option>
          ))}
        </select>
      </div>

      {/* เลือกวัน */}
      <div>
        <label className="mb-1 block text-sm font-semibold text-gray-700">เลือกวันนัด</label>
        <input
          type="date"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary-default"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          min={new Date(systemDate.getTime() + 24 * 60 * 60 * 1000)
            .toLocaleDateString("en-CA", { timeZone: "Asia/Bangkok" })}
        />
      </div>

      {/* Slot */}
      {date && (
        <div>
          <div className="mb-2 text-sm font-semibold text-gray-700">
            ช่วงเวลาที่ว่างสำหรับ {fmtDateText}
          </div>
          {renderTimeBlocks()}
        </div>
      )}

      {/* หมายเหตุ */}
      <div>
        <label className="mb-1 block text-sm font-semibold text-gray-700">หมายเหตุ (ถ้ามี)</label>
        <textarea
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary-default"
          rows={2}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="คำแนะนำหรือจุดประสงค์ของการติดตามอาการ..."
        />
      </div>

      {/* ปุ่ม */}
      <div className="flex justify-end gap-3 pt-3">
        <Button variant="secondary" type="button" onClick={onCancel}>
          ยกเลิก
        </Button>
        <Button type="submit" disabled={loading || !serviceId || !date || !selectedSlot}>
          {loading ? "กำลังสร้าง..." : "ยืนยันการนัดติดตาม"}
        </Button>
      </div>
    </form>
  );
};

export default FollowUpForm;
