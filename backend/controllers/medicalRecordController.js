const MedicalRecord = require('../models/MedicalRecord');

exports.createFromAppointment = async (req, res) => {
  try {
    const doctor_id = req.user.entity_id; // หมอที่ล็อกอิน
    const { appointment_id, diagnosis, treatment, note, follow_up_date } = req.body;

    if (!appointment_id || !diagnosis || !treatment) {
      return res.status(400).json({ message: 'กรอกข้อมูลไม่ครบ' });
    }

    const result = await MedicalRecord.createFromAppointment({
      appointment_id,
      doctor_id,
      diagnosis,
      treatment,
      note: note || null,
      follow_up_date: follow_up_date || null
    });

    if (!result.success) {
      return res.status(400).json({ message: result.message || 'บันทึกไม่สำเร็จ' });
    }
    return res.status(201).json({ message: 'บันทึกประวัติการรักษาสำเร็จ', record_id: result.record_id });
  } catch (err) {
    console.error('createFromAppointment error:', err);
    res.status(500).json({ message: 'ไม่สามารถบันทึกประวัติการรักษาได้' });
  }
};

exports.updateRecord = async (req, res) => {
  try {
    const doctor_id = req.user.entity_id;
    const { record_id } = req.params;
    const { diagnosis, treatment, note, follow_up_date } = req.body;

    if (!record_id) return res.status(400).json({ message: 'ต้องระบุ record_id' });
    if (!diagnosis && !treatment && !note && !follow_up_date) {
      return res.status(400).json({ message: 'ไม่มีข้อมูลให้แก้ไข' });
    }

    const ok = await MedicalRecord.updateRecord({
      record_id,
      doctor_id,
      diagnosis: diagnosis ?? null,
      treatment: treatment ?? null,
      note: note ?? null,
      follow_up_date: follow_up_date ?? null
    });

    if (!ok) return res.status(404).json({ message: 'ไม่พบข้อมูล หรือไม่ได้รับอนุญาต' });
    return res.status(200).json({ message: 'อัปเดตประวัติการรักษาสำเร็จ' });
  } catch (err) {
    console.error('updateRecord error:', err);
    return res.status(500).json({ message: 'อัปเดตประวัติการรักษาไม่สำเร็จ' });
  }
};