// backend/utils/passwordHasher.js
const bcrypt = require('bcryptjs');

const saltRounds = 10; // ค่านี้คือความซับซ้อนในการ hash ยิ่งมากยิ่งปลอดภัย แต่ใช้เวลานานขึ้น

/**
 * เข้ารหัส (hash) รหัสผ่าน
 * @param {string} password - รหัสผ่านแบบ plain text
 * @returns {Promise<string>} - รหัสผ่านที่ถูก hash แล้ว
 */
exports.hashPassword = async (password) => {
  return await bcrypt.hash(password, saltRounds);
};

/**
 * เปรียบเทียบรหัสผ่านแบบ plain text กับรหัสผ่านที่ถูก hash แล้ว
 * @param {string} plainPassword - รหัสผ่านแบบ plain text ที่ผู้ใช้ป้อนเข้ามา
 * @param {string} hashedPassword - รหัสผ่านที่ถูก hash แล้วจากฐานข้อมูล
 * @returns {Promise<boolean>} - true ถ้าตรงกัน, false ถ้าไม่ตรงกัน
 */
exports.comparePassword = async (plainPassword, hashedPassword) => {
  return await bcrypt.compare(plainPassword, hashedPassword);
};