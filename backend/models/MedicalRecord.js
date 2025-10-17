const db = require('../config/db');

exports.createFromAppointment = async ({ appointment_id, doctor_id, diagnosis, treatment, note, follow_up_date }) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // 1) ดึงข้อมูล appointment + patient + precheck ล่าสุด
    const [[appt]] = await conn.query(
      `SELECT a.appointment_id, a.patient_id
       FROM appointment a
       WHERE a.appointment_id = ? AND a.status IN ('prechecked','approved','confirmed')`,
      [appointment_id]
    );
    if (!appt) {
      await conn.rollback();
      return { success: false, message: 'ไม่พบนัดหมาย หรือสถานะไม่ถูกต้อง' };
    }

    const [[precheck]] = await conn.query(
      `SELECT * FROM patient_precheck WHERE appointment_id = ? ORDER BY created_at DESC LIMIT 1`,
      [appointment_id]
    );

    // 2) แทรก medicalRecord (คัดลอกค่า precheck ถ้ามี)
    const bp  = precheck?.blood_pressure ?? '';
    const hr  = precheck?.heart_rate ?? null;
    const tmp = precheck?.temperature ?? null;
    const wt  = precheck?.weight ?? null;
    const ht  = precheck?.height ?? null;
    const notes = precheck?.other_notes ?? null;
    const precheck_id = precheck?.precheck_id ?? null;

    const [ins] = await conn.execute(
      `INSERT INTO medicalRecord
       (patient_id, doctor_id, appointment_id, precheck_id, date,
        diagnosis, treatment, other_notes,
        blood_pressure, heart_rate, temperature, weight, height,
        follow_up_date)
       VALUES (?,?,?,?,NOW(), ?,?,?,?,?,?,?,?, ?)`,
      [
        appt.patient_id, doctor_id, appointment_id, precheck_id,
        diagnosis, treatment, note,
        bp, hr, tmp, wt, ht,
        follow_up_date
      ]
    );

    // 3) ปิดนัด เป็น complete
    await conn.execute(
      `UPDATE appointment SET status = 'completed' WHERE appointment_id = ?`,
      [appointment_id]
    );

    await conn.commit();
    return { success: true, record_id: ins.insertId };
  } catch (e) {
    await conn.rollback();
    console.error('createFromAppointment model error:', e);
    return { success: false, message: 'บันทึกไม่สำเร็จ' };
  } finally {
    conn.release();
  }
};


// อัปเดต record (ตรวจสิทธิ์ว่าเจ้าของคือหมอที่ล็อกอิน)
exports.updateRecord = async ({ record_id, doctor_id, diagnosis, treatment, note, follow_up_date }) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // ตรวจว่าของหมอคนนี้หรือไม่
    const [[rec]] = await conn.query(
      `SELECT record_id, doctor_id FROM medicalRecord WHERE record_id = ?`,
      [record_id]
    );
    if (!rec || rec.doctor_id !== doctor_id) {
      await conn.rollback();
      return false;
    }

    const fields = [];
    const params = [];

    if (diagnosis !== null && diagnosis !== undefined) {
      fields.push('diagnosis = ?'); params.push(diagnosis);
    }
    if (treatment !== null && treatment !== undefined) {
      fields.push('treatment = ?'); params.push(treatment);
    }
    if (note !== null && note !== undefined) {
      fields.push('other_notes = ?'); params.push(note);
    }
    if (follow_up_date !== null && follow_up_date !== undefined) {
      fields.push('follow_up_date = ?'); params.push(follow_up_date);
    }

    if (fields.length === 0) {
      await conn.rollback();
      return false;
    }

    params.push(record_id);

    await conn.execute(
      `UPDATE medicalRecord SET ${fields.join(', ')} WHERE record_id = ?`,
      params
    );

    await conn.commit();
    return true;
  } catch (e) {
    await conn.rollback();
    console.error('updateRecord model error:', e);
    return false;
  } finally {
    conn.release();
  }
};