const Precheck = require('../models/Precheck');
const Appointment = require('../models/Appointment');
const db = require('../config/db');

exports.upsertPrecheck = async (req, res) => {
  try {
    const nurse_id = req.user.entity_id; // พยาบาลที่ล็อกอิน
    const {
      appointment_id,
      blood_pressure,
      heart_rate,
      temperature,
      weight,
      height,
      other_notes
    } = req.body;

    if (!appointment_id) return res.status(400).json({ message: 'ต้องระบุ appointment_id' });

    const saved = await Precheck.upsert({
      appointment_id,
      nurse_id,
      blood_pressure,
      heart_rate,
      temperature,
      weight,
      height,
      other_notes
    });

    res.status(200).json({ message: 'บันทึกค่าสุขภาพสำเร็จ', precheck_id: saved.precheck_id });
  } catch (err) {
    console.error('upsertPrecheck error:', err);
    res.status(500).json({ message: 'บันทึกค่าสุขภาพไม่สำเร็จ' });
  }
};

exports.getLatestPrecheckByAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    console.log("[precheckController - getLatestPrecheckByAppointment] appointment id from fe", appointmentId)
    const row = await Precheck.getLatestByAppointment(appointmentId);
    if (!row) return res.status(200).json(null); // ✅ ส่ง 200 แต่ไม่มีข้อมูล
    res.status(200).json(row);
  } catch (err) {
    console.error('getLatestPrecheckByAppointment error:', err);
    res.status(500).json({ message: 'ไม่สามารถดึงข้อมูล precheck ได้' });
  }
};

exports.sendToDoctor = async (req, res) => {
  try {
    const { appointmentId } = req.params;

    const [[appt]] = await db.execute(
      `SELECT appointment_date FROM appointment WHERE appointment_id = ?`,
      [appointmentId]
    );

    if (!appt) {
      return res.status(404).json({ message: "ไม่พบนัดหมาย" });
    }
    // แปลงวันที่จาก DB (UTC) → เวลาไทย แล้ว format เป็น yyyy-mm-dd
    const apptDate = new Date(appt.appointment_date).toLocaleDateString("en-CA", { timeZone: "Asia/Bangkok" });
    const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Bangkok" });
    console.log(today)
    console.log(appt.appointment_date)
    if (apptDate !== today) {
      return res.status(400).json({
        message: "ไม่สามารถส่งตรวจล่วงหน้าได้",
      });
    }

    // เปลี่ยนสถานะเป็น prechecked
    await Appointment.updateAppointmentStatus(appointmentId, "prechecked");
    res.status(200).json({ message: "ส่งตรวจเรียบร้อย" });
  } catch (err) {
    console.error("sendToDoctor error:", err);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการส่งตรวจ" });
  }
};

