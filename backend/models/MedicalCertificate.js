const db = require('../config/db');
exports.createFromAppointment = async ({ appointment_id, doctor_id, reason, other_notes }) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // ดึง appointment + patient + doctor owner
    const [[appt]] = await conn.query(
      `SELECT a.appointment_id, a.patient_id, a.doctor_id, a.service_id
       FROM appointment a
       WHERE a.appointment_id = ?`,
      [appointment_id]
    );
    if (!appt) {
      await conn.rollback();
      return { success: false, message: 'ไม่พบนัดหมาย' };
    }
    if (appt.doctor_id !== doctor_id) {
      await conn.rollback();
      return { success: false, message: 'คุณไม่มีสิทธิ์ออกใบรับรองสำหรับนัดนี้' };
    }

    // ดึงข้อมูลผู้ป่วย
    const [[patient]] = await conn.query(
      `SELECT patient_id, hn, first_name, last_name FROM patient WHERE patient_id = ?`,
      [appt.patient_id]
    );

    // ดึงข้อมูลแพทย์
    const [[doctor]] = await conn.query(
      `SELECT doctor_id, full_name FROM doctors WHERE doctor_id = ?`,
      [doctor_id]
    );

    // Insert record
    const [ins] = await conn.execute(
      `INSERT INTO medical_certificate
       (appointment_id, patient_id, doctor_id, reason,
        other_notes)
       VALUES (?,?,?,?,?)`,
      [appointment_id, appt.patient_id, doctor_id, reason || null, other_notes || null]
    );

    await conn.commit();

    return {
      success: true,
      cert_id: ins.insertId,
      patient,
      doctor
    };
  } catch (e) {
    await conn.rollback();
    console.error('createFromAppointment error:', e);
    return { success: false, message: 'สร้างใบรับรองแพทย์ไม่สำเร็จ' };
  } finally {
    conn.release();
  }
};

exports.attachPdfPath = async (cert_id, pdf_path) => {
  await db.execute(
    `UPDATE medical_certificate SET pdf_path = ? WHERE cert_id = ?`,
    [pdf_path, cert_id]
  );
};

exports.getByIdForDoctor = async (cert_id, doctor_id) => {
  const [rows] = await db.execute(
    `SELECT mc.*, p.hn, p.first_name, p.last_name, d.full_name
     FROM medical_certificate mc
     JOIN patient p ON mc.patient_id = p.patient_id
     JOIN doctors d ON mc.doctor_id = d.doctor_id
     WHERE mc.cert_id = ? AND mc.doctor_id = ?`,
    [cert_id, doctor_id]
  );
  return rows[0] || null;
};

exports.getByIdForPatient = async (cert_id, patient_id) => {
  const [rows] = await db.execute(
    `SELECT mc.*, p.hn, p.first_name, p.last_name, d.full_name
     FROM medical_certificate mc
     JOIN patient p ON mc.patient_id = p.patient_id
     JOIN doctors d ON mc.doctor_id = d.doctor_id
     WHERE mc.cert_id = ? AND mc.patient_id = ?`,
    [cert_id, patient_id]
  );
  return rows[0] || null;
};

// ดึงใบรับรองแพทย์ของหมอวันนี้
exports.listForDoctorToday = async (doctor_id) => {
  const [rows] = await db.execute(
    `SELECT mc.cert_id, mc.issued_at, mc.reason, mc.status, mc.pdf_path AS public_url,
            p.hn, p.first_name as patient_first_name, p.last_name as patient_last_name
     FROM medical_certificate mc
     JOIN patient p ON mc.patient_id = p.patient_id
     WHERE mc.doctor_id = ? AND DATE(mc.issued_at) = CURDATE()
     ORDER BY mc.issued_at DESC`,
    [doctor_id]
  );
  return rows;
};

// ดึงใบรับรองแพทย์ของหมอ (ตามช่วงวันที่)
exports.listForDoctor = async (doctor_id, { fromDate, toDate }) => {
  const params = [doctor_id];
  let where = `mc.doctor_id = ?`;
  if (fromDate) { where += ` AND DATE(mc.issued_at) >= ?`; params.push(fromDate); }
  if (toDate)   { where += ` AND DATE(mc.issued_at) <= ?`; params.push(toDate); }

  const [rows] = await db.execute(
    `SELECT
        mc.cert_id,
        mc.issued_at,
        mc.reason,
        mc.status,
        mc.pdf_path AS public_url,
        p.hn,
        p.first_name AS patient_first_name,
        p.last_name AS patient_last_name
     FROM medical_certificate mc
     JOIN patient p ON mc.patient_id = p.patient_id
     WHERE ${where}
     ORDER BY mc.issued_at DESC`,
    params
  );
  return rows;
};

exports.listForPatient = async (patient_id) => {
    const baseUrl = process.env.BASE_URL || "http://localhost:5001"; // fallback กันไว้
  const [rows] = await db.execute(
    `SELECT mc.cert_id, mc.issued_at, mc.reason, mc.other_notes, mc.status, CONCAT(?, mc.pdf_path) AS public_url,
            d.full_name AS doctor_full_name
     FROM medical_certificate mc
     JOIN doctors d ON mc.doctor_id = d.doctor_id
     WHERE mc.patient_id = ?
     ORDER BY mc.issued_at DESC`,
    [baseUrl,patient_id]
  );
  return rows;
};

exports.updateByDoctor = async ({ cert_id, doctor_id, reason, other_notes }) => {
  const [res] = await db.execute(
    `UPDATE medical_certificate
     SET reason = ?, other_notes = ?
     WHERE cert_id = ? AND doctor_id = ?`,
    [reason || null, other_notes || null, cert_id, doctor_id]
  );
  return res.affectedRows > 0;
};
