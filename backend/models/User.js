const db = require('../config/db'); // ตรวจสอบให้แน่ใจว่า import db connection pool แล้ว
const passwordHasher = require('../utils/passwordHasher'); // ต้องมี passwordHasher


exports.findByEmail = async (email) => {
  try {
    const [rows] = await db.execute('SELECT id, email, password_hash, role, entity_id FROM user_accounts WHERE email = ?', [email]);
    return rows[0] || null;
  } catch (error) {
    console.error('Error finding user by email:', error);
    throw error;
  }
};

exports.create = async ({ email, password, role, entityId }) => {
  try {
    // Hash รหัสผ่านก่อนบันทึกลงฐานข้อมูล
    const hashedPassword = await passwordHasher.hashPassword(password);

    const [result] = await db.execute(
      'INSERT INTO user_accounts (email, password_hash, role, entity_id) VALUES (?, ?, ?, ?)',
      [email, hashedPassword, role, entityId]
    );

    // ส่งคืนข้อมูลผู้ใช้ที่สร้างใหม่
    return {
      id: result.insertId,
      email,
      role,
      entity_id: entityId
    };
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};