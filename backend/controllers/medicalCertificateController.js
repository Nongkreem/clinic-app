const path = require('path');
const MedicalCertificate = require('../models/MedicalCertificate');
const { generateMedicalCertPDF } = require('../utils/medcertPdf');



// สร้างใบรับรองแพทย์ + สร้าง PDF
exports.createFromAppointment = async (req, res) => {
  try {
    const doctor_id = req.user.entity_id; // role: doctor
    const { appointment_id, reason, rest_from, rest_to, other_notes } = req.body;
    if (!appointment_id) return res.status(400).json({ message: 'ต้องระบุ appointment_id' });

    const result = await MedicalCertificate.createFromAppointment({
      appointment_id,
      doctor_id,
      reason,
      rest_from,
      rest_to,
      other_notes
    });

    if (!result.success) {
      return res.status(400).json({ message: result.message || 'สร้างใบรับรองแพทย์ไม่สำเร็จ' });
    }

    // เตรียมข้อมูล generate PDF
    const payload = {
      hospital: {
        name: 'Vejnaree Clinic',
        address: '123 Rasda Rd., Hatyai',
        phone: '02-123-4567',
        logoPath: path.join(__dirname, '..', 'assets', 'logo.png')  // ถ้ามี
      },
      patient: result.patient,
      doctor: { doctor_id, full_name: result.doctor?.full_name || doctor_id },
      cert: {
        cert_id: result.cert_id,
        issued_at: new Date(),
        reason,
        rest_from,
        rest_to,
        other_notes
      }
    };

    const { publicUrl } = await generateMedicalCertPDF(payload);

    await MedicalCertificate.attachPdfPath(result.cert_id, publicUrl);

    return res.status(201).json({
      message: 'ออกใบรับรองแพทย์สำเร็จ',
      cert_id: result.cert_id,
      pdf_url: publicUrl
    });
  } catch (err) {
    console.error('createFromAppointment controller error:', err);
    res.status(500).json({ message: 'ไม่สามารถออกใบรับรองแพทย์ได้' });
  }
};

// หมอดูรายการ (มีตัวกรองช่วงวันได้)
exports.listMine = async (req, res) => {
  try {
    const doctor_id = req.user.entity_id;
    const { fromDate, toDate, todayOnly } = req.query;

    const rows = todayOnly === '1'
      ? await MedicalCertificate.listForDoctorToday(doctor_id)
      : await MedicalCertificate.listForDoctor(doctor_id, { fromDate, toDate });

    res.status(200).json(rows);
  } catch (err) {
    console.error('listMine error:', err);
    res.status(500).json({ message: 'ไม่สามารถดึงรายการใบรับรองแพทย์ได้' });
  }
};

// คนไข้ดูของตัวเอง
exports.listForPatient = async (req, res) => {
  try {
    const patient_id = req.user.entity_id;
    const rows = await MedicalCertificate.listForPatient(patient_id);
    res.status(200).json(rows);
  } catch (err) {
    console.error('listForPatient error:', err);
    res.status(500).json({ message: 'ไม่สามารถดึงใบรับรองแพทย์ของคุณได้' });
  }
};

// ดูฉบับเดียว (หมอ)
exports.getOneForDoctor = async (req, res) => {
  try {
    const doctor_id = req.user.entity_id;
    const { id } = req.params;
    const row = await MedicalCertificate.getByIdForDoctor(id, doctor_id);
    if (!row) return res.status(404).json({ message: 'ไม่พบข้อมูลหรือไม่มีสิทธิ์เข้าถึง' });
    res.status(200).json(row);
  } catch (err) {
    console.error('getOneForDoctor error:', err);
    res.status(500).json({ message: 'ไม่สามารถดึงข้อมูลได้' });
  }
};

// ดูฉบับเดียว (ผู้ป่วย)
exports.getOneForPatient = async (req, res) => {
  try {
    const patient_id = req.user.entity_id;
    const { id } = req.params;
    const row = await MedicalCertificate.getByIdForPatient(id, patient_id);
    if (!row) return res.status(404).json({ message: 'ไม่พบข้อมูลหรือไม่มีสิทธิ์เข้าถึง' });
    res.status(200).json(row);
  } catch (err) {
    console.error('getOneForPatient error:', err);
    res.status(500).json({ message: 'ไม่สามารถดึงข้อมูลได้' });
  }
};

// อัปเดต (หมอแก้ไขข้อความ/ช่วงพัก) และ regenerate PDF
exports.updateMine = async (req, res) => {
  try {
    const doctor_id = req.user.entity_id;
    const { id } = req.params;
    const { reason, rest_from, rest_to, other_notes } = req.body;

    const ok = await MedicalCertificate.updateByDoctor({
      cert_id: id,
      doctor_id,
      reason,
      rest_from,
      rest_to,
      other_notes
    });
    if (!ok) return res.status(404).json({ message: 'ไม่พบใบรับรองหรือไม่มีสิทธิ์แก้ไข' });

    // ดึงข้อมูลไว้ regenerate PDF
    const row = await MedicalCertificate.getByIdForDoctor(id, doctor_id);
    if (!row) return res.status(404).json({ message: 'ไม่พบข้อมูลหลังแก้ไข' });

    const payload = {
      hospital: {
        name: 'Wonyoung Clinic',
        address: '123 Sukhumvit Rd., Bangkok',
        phone: '02-123-4567',
      },
      patient: { hn: row.hn, first_name: row.first_name, last_name: row.last_name },
      doctor: { doctor_id: row.doctor_id, full_name: row.full_name },
      cert: {
        cert_id: row.cert_id,
        issued_at: row.issued_at,
        reason: row.reason,
        rest_from: row.rest_from,
        rest_to: row.rest_to,
        other_notes: row.other_notes
      }
    };

    const { publicUrl } = await generateMedicalCertPDF(payload);
    await MedicalCertificate.attachPdfPath(id, publicUrl);

    res.status(200).json({ message: 'อัปเดตใบรับรองสำเร็จ', pdf_url: publicUrl });
  } catch (err) {
    console.error('updateMine error:', err);
    res.status(500).json({ message: 'ไม่สามารถอัปเดตใบรับรองแพทย์ได้' });
  }
};
