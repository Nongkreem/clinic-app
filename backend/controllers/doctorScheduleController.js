const DoctorSchedule = require('../models/DoctorSchedules');

exports.createSchedules = async (req, res) => {
    const { selectedDayOfWeek, startDate, endDate, scheduleEntries } = req.body;
    
    console.log('[Backend Controller] createSchedules received body:', req.body);


    if (!selectedDayOfWeek || !startDate || !endDate || !Array.isArray(scheduleEntries) || scheduleEntries.length === 0) {
        return res.status(400).json({ message: 'ข้อมูลตารางออกตรวจไม่สมบูรณ์: ต้องระบุวันในสัปดาห์, ช่วงวันที่, และรายละเอียดตารางอย่างน้อยหนึ่งรายการ' });
    }

    // Validate each schedule entry template
    for (const entry of scheduleEntries) {
        const { service_id, doctor_id, room_id, time_start, time_end } = entry;
        if (!service_id || !doctor_id || !room_id || !time_start || !time_end) {
            return res.status(400).json({ message: 'รายละเอียดตารางออกตรวจไม่สมบูรณ์ในบางรายการ' });
        }
    }

    try {
        const { createdSchedules, skippedSchedules } = await DoctorSchedule.createSchedules({
            selectedDayOfWeek,
            startDate,
            endDate,
            scheduleEntries
        });

        let successMessage = `บันทึกตารางออกตรวจแบบประจำสำเร็จ! สร้าง ${createdSchedules.length} รายการ`;
        if (skippedSchedules.length > 0) {
            successMessage += `, ข้าม ${skippedSchedules.length} รายการเนื่องจากทับซ้อนกับตารางเดิม`;
        }
        res.status(201).json({ message: 'บันทึกตารางออกตรวจสำเร็จ!', schedules: createdSchedules });
    } catch (error) {
        if (error.message.includes('ทับซ้อนกับตารางเดิม')) {
            return res.status(409).json({ message: error.message });
        }
        console.error('Error in createSchedules controller:', error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการบันทึกตารางออกตรวจ' });
    }
};

exports.getAllSchedules = async (req, res) => {
    const serviceId = req.query.serviceId ? parseInt(req.query.serviceId, 10) : null;
    const scheduleDate = req.query.scheduleDate || null;

    if (scheduleDate && !/^\d{4}-\d{2}-\d{2}$/.test(scheduleDate)) {
        return res.status(400).json({ message: 'รูปแบบวันที่ไม่ถูกต้อง (YYYY-MM-DD)' });
    }

    try {
        const schedules = await DoctorSchedule.getAllSchedules({serviceId, scheduleDate});
        res.status(200).json(schedules);
    } catch (error) {
        console.error('Error in getAllSchedules controller:', error);
        res.status(500).json({ message: 'ไม่สามารถดึงข้อมูลตารางออกตรวจได้' });
    }
};


exports.updateSchedule = async (req, res) => {
    const { id: ds_id } = req.params;
    const { service_id, doctor_id, room_id, schedule_date, time_start, time_end } = req.body;

    if (!service_id || !doctor_id || !room_id || !schedule_date || !time_start || !time_end) {
        return res.status(400).json({ message: 'ข้อมูลตารางออกตรวจไม่สมบูรณ์' });
    }

    try {
        const updated = await DoctorSchedule.updateSchedule(ds_id, { service_id, doctor_id, room_id, schedule_date, time_start, time_end });
        if (updated) {
            res.status(200).json({ message: 'อัปเดตตารางออกตรวจสำเร็จ!' });
        } else {
            res.status(404).json({ message: 'ไม่พบตารางออกตรวจที่ต้องการอัปเดต' });
        }
    } catch (error) {
        if (error.message.includes('ทับซ้อนกับตารางเดิม')) {
            return res.status(409).json({ message: error.message });
        }
        console.error('Error in updateSchedule controller:', error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการอัปเดตตารางออกตรวจ' });
    }
};


exports.deleteSchedule = async (req, res) => {
    const { id: ds_id } = req.params;

    try {
        const deleted = await DoctorSchedule.deleteSchedule(ds_id);
        if (deleted) {
            res.status(200).json({ message: 'ลบตารางออกตรวจสำเร็จ!' });
        } else {
            res.status(404).json({ message: 'ไม่พบตารางออกตรวจที่ต้องการลบ' });
        }
    } catch (error) {
        console.error('Error in deleteSchedule controller:', error);
        // ตรวจสอบข้อความ error จาก Model
        if (
            error.message.includes("ไม่สามารถลบตารางออกตรวจได้") ||
            error.message.includes("การนัดหมายของแพทย์ในตารางนี้")
        ) {
            return res.status(400).json({ message: error.message }); // ส่งข้อความจริงไปยัง FE
        }

        // ถ้าเป็น error อื่น เช่น Database connection
        return res
            .status(500)
            .json({ message: "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์ กรุณาลองใหม่อีกครั้ง" });
        }
};

exports.getScheduleById = async (req, res) => {
    const { id: ds_id } = req.params;
    try {
        const schedule = await DoctorSchedule.getScheduleById(ds_id);
        if (schedule) {
            res.status(200).json(schedule);
        } else {
            res.status(404).json({ message: 'ไม่พบตารางออกตรวจ' });
        }
    } catch (error) {
        console.error('Error in getScheduleById controller:', error);
        res.status(500).json({ message: 'ไม่สามารถดึงข้อมูลตารางออกตรวจได้' });
    }
};

exports.getAvailableSlots = async (req, res) => {
    const { scheduleDate, serviceId } = req.query;

    if (!scheduleDate || !serviceId) {
        return res.status(400).json({ message: 'ต้องระบุวันที่และรหัสบริการ' });
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(scheduleDate)) {
        return res.status(400).json({ message: 'รูปแบบวันที่ไม่ถูกต้อง (YYYY-MM-DD)' });
    }
    const parsedServiceId = parseInt(serviceId, 10);
    if (isNaN(parsedServiceId)) {
        return res.status(400).json({ message: 'รหัสบริการไม่ถูกต้อง' });
    }

    try {
        const slots = await DoctorSchedule.getAlldAvailableSlots(scheduleDate, parsedServiceId);
        res.status(200).json(slots);
    } catch (error) {
        console.error('Error in getAggregatedAvailableSlots controller:', error);
        res.status(500).json({ message: 'ไม่สามารถดึงข้อมูล Slot เวลาที่ว่างได้' });
    }
};

exports.bookSlot = async (req, res) => {
    const { ers_id, ds_id } = req.body;
    // Assuming patient_id comes from authenticated user context (e.g., req.user.patient_id)
    // For now, let's use a placeholder or assume it's sent in the body for testing
    const patient_id = req.user?.patient_id || req.body.patient_id; // Get patient_id from auth or body

    if (!ers_id || !ds_id || !patient_id) {
        return res.status(400).json({ message: 'ข้อมูลการจองไม่สมบูรณ์: ต้องระบุ Slot, ตารางแพทย์, และรหัสผู้ป่วย' });
    }

    try {
        const booked = await DoctorSchedule.bookSlot(ers_id, patient_id, ds_id);
        if (booked) {
            res.status(200).json({ message: 'จองคิวสำเร็จ!' });
        } else {
            res.status(409).json({ message: 'Slot เวลานี้ถูกจองไปแล้ว หรือไม่สามารถจองได้' });
        }
    } catch (error) {
        console.error('Error in bookSlot controller:', error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการจองคิว' });
    }
};