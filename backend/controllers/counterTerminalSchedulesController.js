const Schedules = require("../models/counterTerminalSchedules");

exports.getAllSchedules = async (req, res) => {
  try {
    const schedules = await Schedules.getAllSchedules();
    res.status(200).json(schedules);
  } catch (error) {
    console.error("Error in nurseScheduleController - getAllSchedules:", error);
    res
      .status(500)
      .json({ message: "ไม่สามารถดึงข้อมูลตารางออกตรวจของพยาบาลได้" });
  }
};

exports.deleteSchedule = async (req, res) => {
  const { id: ct_id } = req.params;
  console.log("data from frontend: ", ct_id);
  try {
    const deleted = await Schedules.deleteSchedule(ct_id);
    if (deleted) {
      res.status(200).json({ message: "ลบตารางพยาบาลประจำ Counter Terminal สำเร็จ!" });
    } else {
      res.status(404).json({ message: "ไม่พบตาราง Counter Terminal ที่ต้องการลบ" });
    }
  } catch (error) {
    console.error("Error in counterTerminal controller - deleteSchedule:", error);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการลบตาราง Counter Terminal" });
  }
};

exports.toggleCounterStatus = async (req, res) => {
    const { id: nurse_id } = req.params;
    const { status } = req.body;
    try {
        const updated = await Schedules.toggleCounterStatus(nurse_id, status);
        if (updated) {
            res.status(200).json({ message: "อัปเดตสถานะสำเร็จ!" });
        } else {
            res.status(404).json({ message: "ไม่พบพยาบาลที่ต้องการอัปเดตสถานะ" });
        }
    } catch (error) {
        console.error("Error in counterTerminal controller - toggleCounterStatus:", error);
        res.status(500).json({ message: "เกิดข้อผิดพลาดในการอัปเดตสถานะ" });
    }
};

exports.createSchedule = async (req, res) => {
  try {
    const { selectedDayOfWeek, startDate, endDate, scheduleEntries, scheduleDates } = req.body;
    // --- ดูข้อมูลที่ Frontend ส่งมา (debugging) ---
    console.log("Create Schedule Payload:", req.body);
    // ตรวจสอบว่ามี scheduleEntries ไหม
    if (!scheduleEntries || !Array.isArray(scheduleEntries) || scheduleEntries.length === 0) {
      return res.status(400).json({ message: "ต้องส่งข้อมูลพยาบาลอย่างน้อย 1 รายการ" });
    }

    // ถ้าสร้าง recurring schedule ให้เช็คช่วงวันด้วย
    if (selectedDayOfWeek !== undefined) {
      if (!startDate || !endDate) {
        return res.status(400).json({ message: "ต้องระบุ startDate และ endDate" });
      }
      if (new Date(startDate) > new Date(endDate)) {
        return res.status(400).json({ message: "วันที่เริ่มต้นต้องไม่มากกว่าวันสิ้นสุด" });
      }
      if (!scheduleDates || !Array.isArray(scheduleDates) || scheduleDates.length === 0) {
        return res.status(400).json({ message: "ต้องส่ง scheduleDates มาด้วย" });
      }
    }
    // ตรวจซ้ำ nurse_id ในรายการเดียวกัน
    const ids = scheduleEntries.map(e => e.nurse_id);
    const hasDuplicate = ids.some((id, idx) => ids.indexOf(id) !== idx);
    if (hasDuplicate) {
      return res.status(400).json({ message: "พบ nurse_id ซ้ำในรายการ" });
    }

    // เรียก model เพื่อบันทึกลง DB
    const inserted = await Schedules.createSchedule({
      scheduleEntries,
      scheduleDates
    });

    res.status(201).json({ message: "เพิ่มตารางเวรสำเร็จ", inserted });
  } catch (error) {
    console.error("Error in nurseScheduleController - createSchedule:", error);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการเพิ่มตารางเวร" });
  }
};