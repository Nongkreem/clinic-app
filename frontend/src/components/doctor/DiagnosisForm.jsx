import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import Button from "../common/Button";
import { useSystemDate } from "../../hooks/useSystemDate";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5001";

const DiagnosisForm = ({ appointment, onSaved, onCancel }) => {
  // --- ฟอร์มวินิจฉัย ---
  const [diagnosis, setDiagnosis] = useState("");
  const [treatment, setTreatment] = useState("");
  const [otherNotes, setOtherNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // --- ฟอร์มนัดติดตาม ---
  const [followUpChecked, setFollowUpChecked] = useState(false);
  const [date, setDate] = useState("");
  const [timeBlocks, setTimeBlocks] = useState([]);
  const [selectedBlock, setSelectedBlock] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const { systemDate } = useSystemDate();

  const serviceId = appointment.service_id;

  // โหลด slot ว่างเมื่อติ๊กนัดติดตาม + เลือกวัน
  useEffect(() => {
    const loadBlocks = async () => {
      if (!followUpChecked || !date || !serviceId) return;
      try {
        const res = await axios.get(`${API_BASE_URL}/api/appointments/available-slots`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          params: { scheduleDate: date, serviceId },
        });
        let slots = res.data || [];
        const next24h = new Date(systemDate.getTime() + 24 * 60 * 60 * 1000);
        slots = slots.filter((b) => new Date(`${date}T${b.slot_start}`) >= next24h);
        setTimeBlocks(slots);
      } catch (e) {
        console.error(e);
        setTimeBlocks([]);
      }
    };
    loadBlocks();
  }, [followUpChecked, date, serviceId]);

  const onPickBlock = (block) => {
    if (selectedBlock?.slot_start === block.slot_start) {
      setSelectedBlock(null);
      setSelectedSlot(null);
    } else {
      setSelectedBlock(block);
      setSelectedSlot(block.ers_ids_in_block?.[0] || null);
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

  // บันทึกข้อมูล
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr("");

    if (!diagnosis.trim() || !treatment.trim()) {
      setErr("กรุณากรอก Diagnosis และ Prescriptions");
      return;
    }

    if (followUpChecked && (!date || !selectedSlot)) {
      setErr("กรุณาเลือกวันและเวลาสำหรับการนัดติดตามอาการ");
      return;
    }

    setLoading(true);
    try {
      // 1️⃣ บันทึกผลการตรวจ
      await axios.post(
        `${API_BASE_URL}/api/medical-record`,
        {
          appointment_id: appointment.appointment_id,
          diagnosis,
          treatment,
          note: otherNotes || null,
        },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );

      // 2️⃣ ถ้ามีติ๊ก follow-up → สร้างนัดติดตามต่อ
      if (followUpChecked) {
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
      }

      onSaved?.();
    } catch (e) {
      console.error(e);
      setErr(e.response?.data?.message || "เกิดข้อผิดพลาดในการบันทึก");
    } finally {
      setLoading(false);
    }
  };

  const getMinSelectableDate = () => {
    const next24h = new Date(systemDate.getTime() + 24 * 60 * 60 * 1000);
    return next24h.toLocaleDateString("en-CA", { timeZone: "Asia/Bangkok" });
  };
  const getMaxSelectableDate = () => {
    const nextMonth = new Date(systemDate);
    nextMonth.setMonth(systemDate.getMonth() + 1);
    return nextMonth.toLocaleDateString("en-CA", { timeZone: "Asia/Bangkok" });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {err && (
        <div className="rounded-lg border border-red-400 bg-red-100 px-3 py-2 text-sm text-red-700">
          {err}
        </div>
      )}

      {/* วินิจฉัย */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Diagnosis</label>
        <textarea
          className="w-full rounded border px-3 py-2 text-sm focus:ring-2 focus:ring-secondary-default"
          rows={3}
          value={diagnosis}
          onChange={(e) => setDiagnosis(e.target.value)}
          placeholder="สรุปการวินิจฉัยของผู้ป่วย..."
          required
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Prescriptions</label>
        <textarea
          className="w-full rounded border px-3 py-2 text-sm focus:ring-2 focus:ring-secondary-default"
          rows={3}
          value={treatment}
          onChange={(e) => setTreatment(e.target.value)}
          placeholder="รายการยา..."
          required
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">หมายเหตุ (ถ้ามี)</label>
        <textarea
          className="w-full rounded border px-3 py-2 text-sm focus:ring-2 focus:ring-secondary-default"
          rows={2}
          value={otherNotes}
          onChange={(e) => setOtherNotes(e.target.value)}
          placeholder="บันทึกเพิ่มเติม..."
        />
      </div>

      {/* Checkbox นัดติดตาม */}
      <div className="flex items-center gap-2">
        <input
          id="follow-up"
          type="checkbox"
          checked={followUpChecked}
          onChange={(e) => setFollowUpChecked(e.target.checked)}
          className="h-4 w-4 text-secondary-default focus:ring-secondary-default"
        />
        <label htmlFor="follow-up" className="text-sm text-gray-700">
          ต้องการนัดติดตามอาการ
        </label>
      </div>

      {/* ฟอร์มนัดติดตาม (ซ่อน/แสดงตาม checkbox) */}
      {followUpChecked && (
        <div className="border-t border-gray-200 pt-4 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              เลือกวันนัดติดตาม
            </label>
            <input
              type="date"
              className="w-full rounded border px-3 py-2 text-sm focus:ring-2 focus:ring-secondary-default"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              min={getMinSelectableDate()}
              max={getMaxSelectableDate()}
            />
          </div>

          {date && (
            <div>
              <div className="text-sm font-semibold text-gray-700 mb-2">
                ช่วงเวลาที่ว่างสำหรับ {fmtDateText}
              </div>
              {timeBlocks.length === 0 ? (
                <p className="text-gray-500 text-sm">ไม่มีช่วงเวลาว่าง</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {timeBlocks.map((b) => {
                    const next24h = new Date(systemDate.getTime() + 24 * 60 * 60 * 1000);
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
                        className={`rounded-lg border-2 p-2 text-center text-sm transition-all
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
                        <div className="text-xs">
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
              )}
            </div>
          )}
        </div>
      )}

      {/* ปุ่ม */}
      <div className="flex justify-end gap-2 pt-4">
        <Button variant="secondary" type="button" onClick={onCancel}>
          ยกเลิก
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "กำลังบันทึก..." : "บันทึกผลการตรวจ"}
        </Button>
      </div>
    </form>
  );
};

export default DiagnosisForm;
