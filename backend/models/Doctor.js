const db = require('../config/db');

exports.createDoctor = async ({ doctor_id, full_name, phone_number, email, service_ids }) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const [[apptCheck]] = await connection.execute(
      'SELECT COUNT(*) AS count FROM appointment WHERE doctor_id = ?',
      [doctor_id]
    );
    if (apptCheck.count > 0) {
      throw new Error('ไม่สามารถลบแพทย์ได้ เนื่องจากมีประวัติการนัดหมายในระบบ');
    }
    
    // 1. Insert into doctors table
    const [doctorResult] = await connection.execute(
      'INSERT INTO doctors (doctor_id, full_name, phone_number, email) VALUES (?, ?, ?, ?)',
      [doctor_id, full_name, phone_number || null, email || null]
    );

    // 2. Insert into doctorService junction table
    if (service_ids && service_ids.length > 0) {
      const doctorServiceValues = service_ids.map(serviceId => [doctor_id, serviceId]);
      await connection.query(
        'INSERT INTO doctorService (doctor_id, service_id) VALUES ?',
        [doctorServiceValues]
      );
    }

    await connection.commit();
    return { doctor_id, full_name, phone_number, email, service_ids };
  } catch (error) {
    await connection.rollback();
    console.error('Error creating doctor:', error);
    throw error;
  } finally {
    connection.release();
  }
};


exports.getAllDoctors = async () => {
  try {
    // ดึงแพทย์ทั้งหมด
    const [doctors] = await db.execute(
      'SELECT d.doctor_id, d.full_name, d.phone_number, d.email FROM doctors d WHERE is_active = 1 ORDER BY d.full_name'
    );

    // สำหรับแต่ละแพทย์, ดึงบริการที่เกี่ยวข้อง
    for (let doctor of doctors) {
      const [services] = await db.execute(
        `SELECT s.service_id, s.service_name
         FROM doctorService ds
         JOIN services s ON ds.service_id = s.service_id
         WHERE ds.doctor_id = ?`,
        [doctor.doctor_id]
      );
      doctor.services = services; // เพิ่ม array ของบริการเข้าไปใน object แพทย์
    }
    return doctors;
  } catch (error) {
    console.error('Error fetching all doctors:', error);
    throw error;
  }
};

exports.updateDoctor = async (doctor_id, { full_name, phone_number, email, service_ids }) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // 1. Update doctors table
    const [updateDoctorResult] = await connection.execute(
      'UPDATE doctors SET full_name = ?, phone_number = ?, email = ? WHERE doctor_id = ?',
      [full_name, phone_number || null, email || null, doctor_id]
    );

    // 2. Delete existing entries from doctorService for this doctor_id
    await connection.execute('DELETE FROM doctorService WHERE doctor_id = ?', [doctor_id]);

    // 3. Insert new entries into doctorService
    if (service_ids && service_ids.length > 0) {
      const doctorServiceValues = service_ids.map(serviceId => [doctor_id, serviceId]);
      await connection.query(
        'INSERT INTO doctorService (doctor_id, service_id) VALUES ?',
        [doctorServiceValues]
      );
    }

    await connection.commit();
    return updateDoctorResult.affectedRows > 0;
  } catch (error) {
    await connection.rollback();
    console.error('Error updating doctor:', error);
    throw error;
  } finally {
    connection.release();
  }
};


exports.deleteDoctor = async (doctor_id) => {
  const connection = await db.getConnection();
  console.log('Delete doctor id : ', doctor_id)
  try {
    await connection.beginTransaction();

    // ตรวจสอบก่อนว่ามี appointment อยู่หรือไม่
    const [[apptCheck]] = await connection.execute(
      'SELECT COUNT(*) AS count FROM appointment WHERE doctor_id = ?',
      [doctor_id]
    );
    if (apptCheck.count > 0) {
      throw new Error('ไม่สามารถลบแพทย์ได้ เนื่องจากมีประวัติการนัดหมายในระบบ');
    }

    // 1. ลบข้อมูลลูกที่สามารถลบได้
    await connection.execute('DELETE FROM doctorService WHERE doctor_id = ?', [doctor_id]);
    
    // 2. เปลี่ยนสถานะของหมอเป็น inactive
    const [result] = await connection.execute(
      'UPDATE doctors SET is_active = 0 WHERE doctor_id = ?',
      [doctor_id]
    );

    await connection.commit();
    return result.affectedRows > 0;
  } catch (error) {
    await connection.rollback();
    console.error('Error deleting doctor:', error);
    throw error;
  } finally {
    connection.release();
  }
};

exports.getDoctorsByService = async (serviceId) => {
  try {
    const [doctors] = await db.execute(
      `SELECT d.doctor_id, d.full_name
       FROM doctors d
       JOIN doctorService ds ON d.doctor_id = ds.doctor_id
       WHERE ds.service_id = ?
       ORDER BY d.full_name`,
      [serviceId]
    );
    return doctors;
  } catch (error) {
    console.error('Error fetching doctors by service:', error);
    throw error;
  }
};


exports.getDoctorCompletedAppointmentsForToday = async (doctorId) => {
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Bangkok" });

  const [rows] = await db.execute(
    `
    SELECT
      a.appointment_id,
      a.appointment_date,
      a.appointment_time,
      a.status,
      a.symptoms,

      p.patient_id,
      p.hn,
      p.first_name AS patient_first_name,
      p.last_name AS patient_last_name,

      s.service_id,
      s.service_name,
      er.room_id,
      er.room_name,

      pr.precheck_id,
      pr.blood_pressure,
      pr.heart_rate,
      pr.temperature,
      pr.weight,
      pr.height,
      pr.other_notes

    FROM appointment a
    JOIN patient p       ON a.patient_id = p.patient_id
    JOIN services s      ON a.service_id = s.service_id
    JOIN examRoom er     ON a.room_id = er.room_id
    LEFT JOIN patient_precheck pr
           ON pr.appointment_id = a.appointment_id
    WHERE a.status = 'completed'
      AND a.doctor_id = ?
      AND a.appointment_date = ?
      AND a.appointmentType IN ('patient_booking', 'doctor_follow_up')
    ORDER BY a.appointment_time ASC
    `,
    [doctorId, today]
  );
  return rows;
};
