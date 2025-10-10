const Precheck = require('../models/Precheck');
const Appointment = require('../models/Appointment');

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
    // เปลี่ยนสถานะนัดเป็น prechecked
    const ok = await Appointment.updateAppointmentStatus(appointmentId, 'prechecked', null, null);
    if (!ok) return res.status(400).json({ message: 'ไม่สามารถส่งตรวจได้' });
    res.status(200).json({ message: 'ส่งตรวจเรียบร้อย' });
  } catch (err) {
    console.error('sendToDoctor error:', err);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการส่งตรวจ' });
  }
};
