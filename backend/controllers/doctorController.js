const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const db = require("../config/db")
exports.createDoctor = async (req, res) => {
    console.log('Received req body: ', req.body)
  const { doctor_id, full_name, phone_number, email, service_ids } = req.body;
  if (!doctor_id || !full_name || !Array.isArray(service_ids) || service_ids.length === 0) {
    return res.status(400).json({ message: 'ข้อมูลแพทย์ไม่สมบูรณ์: รหัสแพทย์, ชื่อเต็ม, และบริการที่ให้จำเป็นต้องระบุ' });
  }
  if (doctor_id.length !== 6 || !/^D\d{5}$/.test(doctor_id)) {
    return res.status(400).json({ message: 'รหัสประจำตัวแพทย์ต้องขึ้นต้นด้วย D และตามด้วยตัวเลข 5 หลัก' });
  }
  if (!email.endsWith('@vejnaree.ac.th')) {
  return res.status(400).json({ message: 'อีเมลต้องลงท้ายด้วย @vejnaree.ac.th เท่านั้น' });
}


  try {
    const newDoctor = await Doctor.createDoctor({ doctor_id, full_name, phone_number, email, service_ids });
    res.status(201).json({ message: 'บันทึกข้อมูลแพทย์สำเร็จ!', doctor: newDoctor });
  } catch (error) {
    console.error('Error in createDoctor controller:', error);
    if (error.code === 'ER_DUP_ENTRY') { // ถ้า doctor_id ซ้ำ
      return res.status(409).json({ message: 'รหัสประจำตัวแพทย์นี้มีอยู่ในระบบแล้ว' });
    }
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการบันทึกข้อมูลแพทย์' });
  }
};


exports.getAllDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.getAllDoctors();
    console.log('doctor data')
    res.status(200).json(doctors);
  } catch (error) {
    console.error('Error in getAllDoctors controller:', error);
    res.status(500).json({ message: 'ไม่สามารถดึงข้อมูลแพทย์ได้' });
  }
};

exports.updateDoctor = async (req, res) => {
  const { id } = req.params; // doctor_id
  const { full_name, phone_number, email, service_ids } = req.body;
  if (!full_name || !Array.isArray(service_ids) || service_ids.length === 0) {
    return res.status(400).json({ message: 'ข้อมูลแพทย์ไม่สมบูรณ์: ชื่อเต็มและบริการที่ให้จำเป็นต้องระบุ' });
  }

  try {
    const updated = await Doctor.updateDoctor(id, { full_name, phone_number, email, service_ids });
    if (updated) {
      res.status(200).json({ message: 'อัปเดตข้อมูลแพทย์สำเร็จ!' });
    } else {
      res.status(404).json({ message: 'ไม่พบข้อมูลแพทย์ที่ต้องการอัปเดต' });
    }
  } catch (error) {
    console.error('Error in updateDoctor controller:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการอัปเดตข้อมูลแพทย์' });
  }
};

exports.deleteDoctor = async (req, res) => {
  const { id } = req.params; // doctor_id
  try {
    const deleted = await Doctor.deleteDoctor(id);
    if (deleted) {
      res.status(200).json({ message: 'ลบข้อมูลแพทย์สำเร็จ!' });
    } else {
      res.status(404).json({ message: 'ไม่พบข้อมูลแพทย์ที่ต้องการลบ' });
    }
  } catch (error) {
    console.error('Error in deleteDoctor controller:', error);
    
    // ตรวจสอบข้อความ error จาก model
    if (
      error.message.includes("ไม่สามาถลบแพทย์ได้") ||
      error.message.includes("เนื่องจากมีประวัติการนัดหมายในระบบ")
    ) 
    {
      return res.status(400).json({ message: error.message }); // ส่งข้อความจริงไปยัง FE
    }

    return res
      .status(500)
      .json({ message: "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์ กรุณาลองใหม่อีกครั้ง" });
  }
};

exports.getDoctorsByService = async (req, res) => {
  const { serviceId } = req.params; // ดึง serviceId จาก URL parameter
  try {
    const doctors = await Doctor.getDoctorsByService(parseInt(serviceId, 10));
    res.status(200).json(doctors);
  } catch (error) {
    console.error('Error in getDoctorsByService controller:', error);
    res.status(500).json({ message: 'ไม่สามารถดึงข้อมูลแพทย์ตามบริการได้' });
  }
};

exports.getPrecheckedAppointmentsForToday = async (req, res) => {
  try {
    const doctorId = req.user.entity_id; 
    const rows = await Appointment.getDoctorPrecheckedAppointmentsForToday(doctorId);
    return res.status(200).json(rows);
  } catch (err) {
    console.error('getPrecheckedAppointmentsForToday error:', err);
    return res.status(500).json({ message: 'ไม่สามารถดึงข้อมูลนัดหมายได้' });
  }
};

exports.createFollowUpAppointment = async (req, res) => {
  const { previous_appointment_id, ers_id, appointment_date, appointment_time } = req.body;
  const doctor_id = req.user.entity_id;
  try {
    const result = await Appointment.createFollowUp({
      previous_appointment_id,
      ers_id,
      doctor_id,
      appointment_date,
      appointment_time
    });

    res.status(201).json({
      success: true,
      message: 'สร้างนัดติดตามอาการสำเร็จ',
      appointment_id: result.appointment_id
    });
  } catch (error) {
    console.error('[DoctorController] createFollowUpAppointment error:', error);
    res.status(500).json({ success: false, message: error.message || 'เกิดข้อผิดพลาดในการสร้างนัดติดตามอาการ' });
  }
};

exports.getCompletedAppointmentsForToday = async (req, res) => {
  try {
    const doctorId = req.user.entity_id; // จาก token
    const result = await Doctor.getDoctorCompletedAppointmentsForToday(doctorId);
    res.json(result);
  } catch (err) {
    console.error("getCompletedAppointmentsForToday error:", err);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการดึงข้อมูลนัดหมายที่ตรวจเสร็จแล้ว" });
  }
};

exports.getDoctorAvailableSlots = async (req, res) => {
  const { scheduleDate } = req.query;
  const doctor_id = req.user.entity_id;

  try {
    const [rows] = await db.query(
      `
      SELECT 
        ds.doctor_id,
        ds.service_id,
        ds.room_id,
        ds.schedule_date,
        ers.slot_start,
        ers.slot_end,
        COUNT(ers.ers_id) AS total_slots_in_time_block,
        SUM(CASE WHEN ers.is_booked = 0 THEN 1 ELSE 0 END) AS total_available_slots_in_time_block,
        GROUP_CONCAT(ers.ers_id) AS ers_ids_in_block
      FROM examRoomSlots ers
      JOIN doctorSchedules ds ON ers.ds_id = ds.ds_id
      WHERE ds.doctor_id = ?
        AND DATE(ds.schedule_date) = ?
      GROUP BY ds.doctor_id, ds.service_id, ds.room_id, ds.schedule_date, ers.slot_start, ers.slot_end
      ORDER BY ers.slot_start
      `,
      [doctor_id, scheduleDate]
    );

    res.json(rows);
  } catch (error) {
    console.error("getDoctorAvailableSlots error:", error);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการดึง slot ของหมอ" });
  }
};

