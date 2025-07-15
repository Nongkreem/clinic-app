const db = require('../config/db'); // ตรวจสอบให้แน่ใจว่า import db connection pool แล้ว
const passwordHasher = require('../utils/passwordHasher'); // ต้องมี passwordHasher

/**
 * ค้นหาผู้ใช้จากอีเมล
 * @param {string} email - อีเมลของผู้ใช้
 * @returns {Promise<Object|null>} - อ็อบเจกต์ผู้ใช้หากพบ หรือ null
 */
exports.findByEmail = async (email) => {
  try {
    const [rows] = await db.execute('SELECT id, email, password_hash, role, entity_id FROM user_accounts WHERE email = ?', [email]);
    return rows[0] || null;
  } catch (error) {
    console.error('Error finding user by email:', error);
    throw error;
  }
};

/**
 * สร้างผู้ใช้ใหม่
 * @param {Object} userData - ข้อมูลผู้ใช้
 * @param {string} userData.email - อีเมลของผู้ใช้
 * @param {string} userData.password - รหัสผ่าน (จะถูก hash)
 * @param {string} userData.role - บทบาทของผู้ใช้ ('patient', 'doctor', etc.)
 * @param {string|null} [userData.entityId] - ID ของ entity ที่เกี่ยวข้อง (เช่น doctor_id)
 * @returns {Promise<Object>} - ข้อมูลผู้ใช้ที่สร้างสำเร็จ (ไม่รวม password_hash)
 */
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