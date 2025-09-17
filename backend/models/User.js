const db = require('../config/db'); // ตรวจสอบให้แน่ใจว่า import db connection pool แล้ว
const passwordHasher = require('../utils/passwordHasher'); // ต้องมี passwordHasher


exports.findByUserEmail = async (email) => {
  try {
    const [rows] = await db.execute('SELECT id, email, password_hash, role, entity_id FROM user_accounts WHERE email = ?', [email]);
    return rows[0] || null;
  } catch (error) {
    console.error('Error finding user by email:', error);
    throw error;
  }
};

exports.register = async (email, password, role, hn, firstName, lastName, dateOfBirth, phoneNumber, gender) => {
    const connection = await db.getConnection(); // Get a database connection
    try {
        await connection.beginTransaction(); // Start a transaction

        // 1. Check if user_name (email) already exists in User_account
        const [existingUsers] = await connection.execute(
            'SELECT email FROM user_accounts WHERE email = ?',
            [email]
        );
        if (existingUsers.length > 0) {
            await connection.rollback(); // Rollback the transaction if username exists
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