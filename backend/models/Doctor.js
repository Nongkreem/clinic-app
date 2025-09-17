const db = require('../config/db');

exports.createDoctor = async ({ doctor_id, full_name, phone_number, email, service_ids }) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

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
      'SELECT d.doctor_id, d.full_name, d.phone_number, d.email FROM doctors d ORDER BY d.full_name'
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

/**
 * อัปเดตข้อมูลแพทย์และบริการที่เกี่ยวข้อง
 * @param {string} doctor_id - ID ของแพทย์ที่ต้องการอัปเดต
 * @param {Object} doctorData - ข้อมูลแพทย์ที่ต้องการอัปเดต
 * @param {string} doctorData.full_name - ชื่อเต็ม
 * @param {string} [doctorData.phone_number] - เบอร์โทรศัพท์ (optional)
 * @param {string} [doctorData.email] - อีเมล (optional)
 * @param {Array<number>} doctorData.service_ids - Array ของ service_id ที่เกี่ยวข้อง
 * @returns {Promise<boolean>} - true ถ้าอัปเดตสำเร็จ, false ถ้าไม่พบ ID
 */
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

/**
 * ลบข้อมูลแพทย์และบริการที่เกี่ยวข้อง
 * @param {string} doctor_id - ID ของแพทย์ที่ต้องการลบ
 * @returns {Promise<boolean>} - true ถ้าลบสำเร็จ, false ถ้าไม่พบ ID
 */
exports.deleteDoctor = async (doctor_id) => {
  const connection = await db.getConnection();
  console.log('Delete doctor id : ', doctor_id)
  try {
    await connection.beginTransaction();

    // 1. Delete doctor from all table has delete cascade
    await connection.execute('DELETE FROM doctorService WHERE doctor_id = ?', [doctor_id]);
     
    await connection.execute('DELETE FROM doctorSchedules WHERE doctor_id = ?', [doctor_id]);
    // 2. Delete from doctors table
    const [result] = await connection.execute('DELETE FROM doctors WHERE doctor_id = ?', [doctor_id]);

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