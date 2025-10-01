const db = require('../config/db');

exports.upsert = async ({
  appointment_id,
  nurse_id,
  blood_pressure,
  heart_rate,
  temperature,
  weight,
  height,
  other_notes
}) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const [exists] = await conn.execute(
      `SELECT precheck_id FROM patient_precheck WHERE appointment_id = ? ORDER BY created_at DESC LIMIT 1`,
      [appointment_id]
    );

    if (exists.length > 0) {
      const precheck_id = exists[0].precheck_id;
      await conn.execute(
        `UPDATE patient_precheck
         SET nurse_id=?, blood_pressure=?, heart_rate=?, temperature=?, weight=?, height=?, other_notes=?, created_at=NOW()
         WHERE precheck_id=?`,
        [nurse_id, blood_pressure, heart_rate, temperature, weight, height, other_notes, precheck_id]
      );
      await conn.commit();
      return { precheck_id };
    } else {
      const [ins] = await conn.execute(
        `INSERT INTO patient_precheck
         (appointment_id, nurse_id, blood_pressure, heart_rate, temperature, weight, height, other_notes)
         VALUES (?,?,?,?,?,?,?,?)`,
        [appointment_id, nurse_id, blood_pressure, heart_rate, temperature, weight, height, other_notes]
      );
      await conn.commit();
      return { precheck_id: ins.insertId };
    }
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
};

exports.getLatestByAppointment = async (appointment_id) => {
  const [rows] = await db.execute(
    `SELECT * FROM patient_precheck WHERE appointment_id = ? ORDER BY created_at DESC LIMIT 1`,
    [appointment_id]
  );
  return rows[0] || null;
};
