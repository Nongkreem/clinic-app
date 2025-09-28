import React, { useState, useEffect } from "react";
import FormGroup from "../common/FormGroup";
import Button from "../common/Button";
import axios from "axios";
import { Plus } from "lucide-react";

const API_BASE_URL =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:5001";

const dayOfWeekOptions = [
  { value: "", label: "เลือกวันในสัปดาห์" },
  { value: "1", label: "จันทร์" }, // Monday is day 1
  { value: "2", label: "อังคาร" },
  { value: "3", label: "พุธ" },
  { value: "4", label: "พฤหัสบดี" },
  { value: "5", label: "ศุกร์" },
  { value: "6", label: "เสาร์" },
  { value: "0", label: "อาทิตย์" }, // Sunday is day 0
];

const generateDatesForScheduleClient = (
  dayOfWeekIndex,
  startDateStr,
  endDateStr,
) => {
  dayOfWeekIndex = Number(dayOfWeekIndex);
  const dates = [];
  const [startYear, startMonth, startDay] = startDateStr.split("-").map(Number);

  let currentDate = new Date(startYear, startMonth - 1, startDay);

  const [endYear, endMonth, endDay] = endDateStr.split("-").map(Number);
  const endDate = new Date(endYear, endMonth - 1, endDay);
  endDate.setHours(23, 59, 59, 999);

  while (currentDate.getDay() !== dayOfWeekIndex && currentDate <= endDate) {
    currentDate.setDate(currentDate.getDate() + 1);
  }

  while (currentDate <= endDate) {
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, "0");
    const day = String(currentDate.getDate()).padStart(2, "0");
    const formattedDate = `${year}-${month}-${day}`;

    dates.push(formattedDate);
    currentDate.setDate(currentDate.getDate() + 7);
  }
  return dates;
};

const NurseScheduleForm = ({ initialData, onSaveSuccess, onCancel }) => {
  const [selectedDayOfWeek, setSelectedDayOfWeek] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [schedules, setSchedules] = useState([]);

  const [allNurseOptions, setAllNurseOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [infoMessage, setInformMessage] = useState("");

  // --- Fetch all nurses ---
  useEffect(() => {
    const fetchNurses = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        const nursesRes = await axios.get(`${API_BASE_URL}/api/nurses`, {
          headers,
        });
        setAllNurseOptions(
          nursesRes.data.map((nurse) => ({
            value: nurse.nurse_id.toString(),
            label: `${nurse.first_name} ${nurse.last_name}`,
          }))
        );
      } catch (err) {
        console.error("Failed to fetch nurses:", err);
        setError("ไม่สามารถโหลดรายชื่อพยาบาลได้");
      }
    };
    fetchNurses();
  }, []);

  // --- Effect for setting initial data when editing ---
  useEffect(() => {
    if (initialData) {
      const dateObj = new Date(initialData.schedule_date);
      setSelectedDayOfWeek(dateObj.getDay().toString());
      setStartDate(initialData.schedule_date.split("T")[0]);
      setEndDate(initialData.schedule_date.split("T")[0]);

      setSchedules([
        {
          tempId: crypto.randomUUID(),
          nurseId: initialData.nurse_id.toString(),
        },
      ]);
    } else {
      setSelectedDayOfWeek("");
      setStartDate("");
      setEndDate("");
      setSchedules([
        {
          tempId: crypto.randomUUID(),
          nurseId: "",
        },
      ]);
    }
    setError("");
    setInformMessage("");
  }, [initialData]);

  // --- Dynamic Schedule Entry Management ---
  const handleAddScheduleRow = () => {
    setSchedules((prevSchedules) => [
      ...prevSchedules,
      {
        tempId: crypto.randomUUID(),
        nurseId: "",
      },
    ]);
  };

  const handleRemoveScheduleRow = (tempIdToRemove) => {
    setSchedules((prevSchedules) =>
      prevSchedules.filter((schedule) => schedule.tempId !== tempIdToRemove)
    );
  };

  // --- Handle changes in schedule entries ---
  const handleScheduleChange = (tempIdToUpdate, field, value) => {
    setSchedules((prevSchedules) =>
      prevSchedules.map((schedule) => {
        if (schedule.tempId === tempIdToUpdate) {
          return { ...schedule, [field]: value };
        }
        return schedule;
      })
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setInformMessage("");
    setLoading(true);

    // Validation for new schedules (recurring)
    if (!initialData) {
      if (!selectedDayOfWeek || !startDate || !endDate) {
        setError(
          "กรุณาเลือกวันในสัปดาห์และระบุช่วงวันที่สำหรับตารางเวรแบบประจำ"
        );
        setLoading(false);
        return;
      }
      if (new Date(startDate) > new Date(endDate)) {
        setError("วันที่เริ่มต้นต้องไม่เกินวันที่สิ้นสุด");
        setLoading(false);
        return;
      }
    }

    if (schedules.length === 0) {
      setError("กรุณาเพิ่มรายละเอียดตารางเวรอย่างน้อยหนึ่งรายการ");
      setLoading(false);
      return;
    }

    const scheduleEntriesToSend = [];
    const selectedNurseIds = new Set();

    for (const entry of schedules) {
      const { nurseId } = entry;

      if (!nurseId) {
        setError("กรุณาเลือกพยาบาลให้ครบถ้วนในทุกรายการ");
        setLoading(false);
        return;
      }

      // Check for duplicate nurses in the same form
      if (selectedNurseIds.has(nurseId)) {
        const nurseName =
          allNurseOptions.find((n) => n.value === nurseId)?.label ||
          `Nurse ID ${nurseId}`;
        setError(`พยาบาล '${nurseName}' ถูกเลือกซ้ำในรายการ กรุณาแก้ไข`);
        setLoading(false);
        return;
      }
      selectedNurseIds.add(nurseId);

      scheduleEntriesToSend.push({
        nurse_id: nurseId,
      });
    }

    try {
      if (initialData && initialData.ns_id) {
        const scheduleDataForUpdate = {
          ...scheduleEntriesToSend[0],
          schedule_date: initialData.schedule_date.split("T")[0],
        };

        const response = await axios.put(
          `${API_BASE_URL}/api/nurse-schedules/${initialData.ns_id}`,
          scheduleDataForUpdate,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        onSaveSuccess();
        setInformMessage(response.data.message);
      } else {
        // Create new recurring schedules
        const scheduleDates = generateDatesForScheduleClient(
          Number(selectedDayOfWeek),
          startDate,
          endDate
        );

        if (scheduleDates.length === 0) {
          setError("ช่วงวันที่ที่เลือกไม่มีวันตามสัปดาห์ที่ระบุ");
          setLoading(false);
          return;
        }
        const recurringScheduleData = {
          selectedDayOfWeek,
          startDate,
          endDate,
          scheduleEntries: scheduleEntriesToSend,
          scheduleDates,
        };

        console.log("Schedules state before submit:", schedules);
        console.log("Selected nurses:", scheduleEntriesToSend);

        const response = await axios.post(
          `${API_BASE_URL}/api/nurse-schedules`,
          recurringScheduleData,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        onSaveSuccess();
        setInformMessage(response.data.message);
      }
    } catch (err) {
      console.error("Error saving nurse schedule:", err);
      if (err.response && err.response.status === 409) {
        setError(err.response.data.message);
      } else {
        setError(
          err.response?.data?.message || "เกิดข้อผิดพลาดในการบันทึกตารางเวร"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-4"
          role="alert"
        >
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      {infoMessage && (
        <div
          className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg relative mb-4"
          role="alert"
        >
          <span className="block sm:inline">{infoMessage}</span>
        </div>
      )}

      {/* Fields for new recurring schedules only */}
      {!initialData && (
        <>
          <FormGroup
            as="select"
            label="เลือกวันในสัปดาห์"
            id="selectedDayOfWeek"
            name="selectedDayOfWeek"
            value={selectedDayOfWeek}
            onChange={(e) => setSelectedDayOfWeek(e.target.value)}
            options={dayOfWeekOptions}
            required
            className="mb-4"
          />
          <FormGroup
            label="วันที่เริ่มต้น (สำหรับตารางเวรแบบประจำ)"
            type="date"
            id="startDate"
            name="startDate"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
            className="mb-4"
          />
          <FormGroup
            label="วันที่สิ้นสุด (สำหรับตารางเวรแบบประจำ)"
            type="date"
            id="endDate"
            name="endDate"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            required
            className="mb-4"
          />
          {selectedDayOfWeek && startDate && endDate && (
            <p className="text-gray-600 text-sm mb-4">
              ระบบจะสร้างตารางเวรสำหรับทุกวัน **
              {
                dayOfWeekOptions.find((opt) => opt.value === selectedDayOfWeek)
                  ?.label
              }
              ** ระหว่างวันที่ **
              {new Date(startDate).toLocaleDateString("th-TH")}** ถึง **
              {new Date(endDate).toLocaleDateString("th-TH")}**
            </p>
          )}
        </>
      )}

      {/* Show edit info for existing schedules */}
      {initialData && (
        <p className="text-gray-600 text-sm mb-4">
          กำลังแก้ไขตารางเวรสำหรับวันที่:{" "}
          {new Date(initialData.schedule_date).toLocaleDateString("th-TH", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      )}

      {/* Schedule entries section */}
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          รายละเอียดตารางเวร (สำหรับแต่ละวันในแบบประจำ){" "}
          <span className="text-red-500">*</span>
        </label>
        <div className="max-h-96 overflow-y-auto pr-2">
          {schedules.map((schedule, index) => (
            <div
              key={schedule.tempId}
              className="relative flex flex-col items-end gap-2 mb-4 p-3 border rounded-lg bg-gray-50"
            >
              <div className="flex-grow w-full">
                <FormGroup
                  as="select"
                  label="พยาบาล"
                  id={`nurse-${schedule.tempId}`}
                  name={`nurse-${schedule.tempId}`}
                  value={schedule.nurseId}
                  onChange={(e) => {
                    console.log(
                      "Changed nurse",
                      schedule.tempId,
                      "->",
                      e.target.value
                    );
                    handleScheduleChange(
                      schedule.tempId,
                      "nurseId",
                      e.target.value
                    );
                  }}
                  options={[
                    { value: "", label: "เลือกพยาบาล" },
                    ...allNurseOptions,
                  ]}
                  required
                  className="mb-0"
                />
              </div>
              {schedules.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveScheduleRow(schedule.tempId)}
                  className="absolute top-2 right-2 h-6 w-6 flex items-center justify-center rounded-full bg-red-200 text-red-700 hover:bg-red-300 focus:outline-none focus:ring-2 focus:ring-red-400 text-xl font-bold"
                  aria-label="ลบรายละเอียดตารางเวรนี้"
                >
                  -
                </button>
              )}
            </div>
          ))}
        </div>

        <Button
          type="button"
          variant="secondary"
          onClick={handleAddScheduleRow}
          className="w-full flex items-center justify-center gap-2 mt-2"
        >
          <Plus size={18} />
          เพิ่มรายละเอียดตาราง
        </Button>
        {schedules.length === 0 && (
          <p className="text-red-500 text-xs mt-1">
            กรุณาเพิ่มรายละเอียดตารางเวรอย่างน้อยหนึ่งรายการ
          </p>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex space-x-2 mt-4 justify-end">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={loading}
        >
          ยกเลิก
        </Button>
        <Button
          type="submit"
          variant={initialData ? "primary" : "success"}
          disabled={loading}
        >
          {loading
            ? "กำลังบันทึก..."
            : initialData
            ? "บันทึกการแก้ไข"
            : "เพิ่มตารางเวร"}
        </Button>
      </div>
    </form>
  );
};

export default NurseScheduleForm;
