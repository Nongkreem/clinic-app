const Appointment = require("../models/Appointment");
const DoctorSchedules = require("../models/DoctorSchedules");

exports.createFollowUpAppointment = async (req, res) => {
  try {
    const {
      doctor_id,
      patient_id,
      related_appointment_id,
      appointment_date,
      time_slot,
      service_id,
      room_id,
    } = req.body;

    // ตรวจสอบข้อมูลที่จำเป็น
    if (!doctor_id || !patient_id || !appointment_date || !time_slot) {
      return res.status(400).json({ message: "กรุณากรอกข้อมูลให้ครบถ้วน" });
    }

    // ตรวจสอบว่าแพทย์ว่างหรือไม่
    const available = await DoctorSchedules.findOne({
      where: {
        doctor_id,
        date: appointment_date,
        time_slot,
        is_available: true,
      },
    });

    if (!available) {
      return res.status(400).json({ message: "แพทย์ไม่ว่างในช่วงเวลานี้" });
    }

    // สร้างนัดติดตามอาการ
    const newAppointment = await Appointment.create({
      doctor_id,
      patient_id,
      appointment_date,
      time_slot,
      service_id,
      room_id,
      appointment_type: "doctor_follow_up",
      related_appointment_id,
      status: "scheduled",
    });

    return res.status(201).json({
      message: "สร้างนัดติดตามอาการสำเร็จ",
      appointment: newAppointment,
    });
  } catch (err) {
    console.error("Error creating follow-up appointment:", err);
    return res.status(500).json({ message: "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์" });
  }
};
