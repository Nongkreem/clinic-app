const db = require('../config/db');
const passwordHasher = require('../utils/passwordHasher'); // ต้องมี passwordHasher


exports.findByUserEmail = async (email) => {
  try {
    const [rows] = await db.execute(
      `SELECT 
          ua.id,
          ua.email,
          ua.password_hash,
          ua.role,
          ua.entity_id,
          ua.is_counter_terminal,
          n.service_id AS nurse_service_id
       FROM user_accounts ua
       LEFT JOIN nurse n ON ua.entity_id = n.nurse_id
       WHERE ua.email = ?`,
      [email]
    );

    if (rows.length > 0) {
      const user = rows[0];

      // ถ้าเป็นหมอ และ user มีอยู่แล้ว ก็ไปดึง service_id เพิ่ม
      if (user.role === "doctor") {
        const [services] = await db.execute(
          `SELECT service_id FROM doctorService WHERE doctor_id = ?`,
          [user.entity_id]
        );
        user.service_ids = services.map(s => s.service_id);
      }
      return user;
    }

    // 2) ถ้าไม่เจอใน user_accounts → ลองไปดูในตาราง nurse
    const [nurseRows] = await db.execute(
      `SELECT nurse_id AS entity_id, service_id 
       FROM nurse
       WHERE gmail = ? LIMIT 1`,
      [email]
    );
    if (nurseRows.length > 0) {
      const nurse = nurseRows[0];
      return {
        id: null, // ยังไม่มีใน user_accounts
        email,
        password_hash: null,
        role: "nurse",
        entity_id: nurse.entity_id,
        is_counter_terminal: 0,
        nurse_service_id: nurse.service_id
      };
    }

    // 3) ถ้าไม่เจอ → ลองไปดูในตาราง doctors
    const [doctorRows] = await db.execute(
      `SELECT doctor_id AS entity_id 
       FROM doctors
       WHERE email = ? LIMIT 1`,
      [email]
    );
    if (doctorRows.length > 0) {
      const doctor = doctorRows[0];
      const [services] = await db.execute(
        `SELECT service_id FROM doctorService WHERE doctor_id = ?`,
        [doctor.entity_id]
      );
      return {
        id: null, // ยังไม่มีใน user_accounts
        email,
        password_hash: null,
        role: "doctor",
        entity_id: doctor.entity_id,
        is_counter_terminal: 0,
        service_ids: services.map(s => s.service_id)
      };
    }

    // 4) ถ้าไม่เจอเลย
    return null;

  } catch (error) {
    console.error('Error finding user by email:', error);
    throw error;
  }

};


exports.register = async (email, password, role, hn, firstName, lastName, dateOfBirth, phoneNumber, gender) => {
    const connection = await db.getConnection(); 
    try {
        await connection.beginTransaction(); // Start transaction

        const [existingUsers] = await connection.execute(
            'SELECT email FROM user_accounts WHERE email = ?',
            [email]
        );
        if (existingUsers.length > 0) {
            await connection.rollback();
            return { success: false, message: 'อีเมลนี้ถูกใช้ลงทะเบียนแล้ว' };
        }

        // 2. Hash the password
        const hashedPassword = await passwordHasher.hashPassword(password);
        let entityId = null; 

        if (role === 'patient') {
            const [existingHNs] = await connection.execute(
                'SELECT hn FROM patient WHERE hn = ?',
                [hn]
            );
            if (existingHNs.length > 0) {
                await connection.rollback(); // Rollback if HN exists
                return { success: false, message: 'หมายเลข HN นี้ถูกใช้ลงทะเบียนแล้ว' };
            }

            // 4. Insert into Patient table
            const [patientResult] = await connection.execute(
                'INSERT INTO patient (hn, first_name, last_name, date_of_birth, phone_number, gender) VALUES (?, ?, ?, ?, ?, ?)',
                [hn, firstName, lastName, dateOfBirth, phoneNumber, gender]
            );
            entityId = patientResult.insertId;
            console.log(`[User Model] New patient created with patient_id: ${entityId}`);
        }
        
        const [userAccountResult] = await connection.execute(
            'INSERT INTO user_accounts (email, password_hash, role, entity_id) VALUES (?, ?, ?, ?)',
            [email, hashedPassword, role, entityId]
        );
        console.log(`[User Model] New user account created for email: ${email}`);


        await connection.commit();
        return { success: true, message: 'ลงทะเบียนสำเร็จ' };

    } catch (error) {
        await connection.rollback(); 
        console.error('Error during user registration transaction:', error);
        throw error;
    } finally {
        connection.release();
    }
};

exports.createStaffAccount = async (email, role, entityId) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // ตรวจสอบว่าอีเมลนี้ถูกใช้งานแล้วหรือยัง
        const [existingUsers] = await connection.execute(
            'SELECT email FROM user_accounts WHERE email = ?',
            [email]
        );
        if (existingUsers.length > 0) {
            await connection.rollback();
            return { success: false, message: 'อีเมลนี้ถูกใช้ลงทะเบียนแล้ว' };
        }

        // password_hash จะเป็น NULL หากยังไม่เคยเข้าสู่ระบบ
        const [userAccountResult] = await connection.execute(
            'INSERT INTO user_accounts (email, password_hash, role, entity_id) VALUES (?, ?, ?, ?)',
            [email, null, role, entityId]
        );

        await connection.commit();
        return { success: true, message: 'สร้างบัญชีบุคลากรสำเร็จ' };
    } catch (error) {
        await connection.rollback();
        console.error('Error during staff account creation transaction:', error);
        throw error;
    } finally {
        connection.release();
    }
};