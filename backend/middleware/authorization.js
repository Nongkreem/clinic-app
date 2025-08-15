/**
 * Middleware สำหรับตรวจสอบบทบาทผู้ใช้
 * @param {Array<string>} allowedRoles - Array ของบทบาทที่ได้รับอนุญาต (เช่น ['doctor', 'admin'])
 * @returns {Function} - Middleware function
 */
authorizeRole = (allowedRoles) => {
  return (req, res, next) => {
    console.log('[AuthorizeRole] req.user:', req.user);
    console.log('[AuthorizeRole] User roles:', req.user?.role);
    console.log('[AuthorizeRole] Allowed roles:', allowedRoles);
    // ตรวจสอบว่า req.user มีข้อมูลหรือไม่ (ต้องผ่าน authenticateToken มาก่อน)
    if (!req.user || !req.user.role) {
      return res.status(401).json({ message: 'ไม่ได้รับอนุญาต: ข้อมูลผู้ใช้ไม่สมบูรณ์' });
    }

    // ตรวจสอบว่าบทบาทของผู้ใช้รวมอยู่ใน allowedRoles หรือไม่
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'ไม่ได้รับอนุญาต: คุณไม่มีสิทธิ์เข้าถึงส่วนนี้' }); // 403 Forbidden
    }
    next(); // ไปยัง middleware/route handler ถัดไป
  };
};

module.exports = { authorizeRole };