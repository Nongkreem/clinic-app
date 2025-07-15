const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;

/**
 * Middleware สำหรับตรวจสอบ JWT Token
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware function
 */
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  // คาดหวังรูปแบบ "Bearer TOKEN"
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) {
    return res.status(401).json({ message: 'ไม่พบ Token การยืนยันตัวตน' }); // 401 Unauthorized
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      console.error('JWT verification error:', err);
      // err.name จะเป็น 'TokenExpiredError' ถ้าหมดอายุ
      return res.status(403).json({ message: 'Token ไม่ถูกต้องหรือไม่หมดอายุ' }); // 403 Forbidden
    }
    req.user = user; // เก็บข้อมูลผู้ใช้จาก Token ไว้ใน req
    next(); // ไปยัง middleware/route handler ถัดไป
  });
};

module.exports = { authenticateToken };