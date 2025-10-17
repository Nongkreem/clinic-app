const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctorController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { authorizeRole } = require('../middleware/authorization');

// Route สำหรับสร้างแพทย์ใหม่
router.post('/doctors', authenticateToken, authorizeRole(['nurse', 'head_nurse']), doctorController.createDoctor);


// Route สำหรับดึงข้อมูลแพทย์ทั้งหมด
router.get('/doctors', authenticateToken, authorizeRole(['nurse', 'head_nurse']), doctorController.getAllDoctors);

// ดึงรายชื่อคนไข้ของ "หมอที่ล็อกอิน" วันนี้ ที่สถานะ prechecked
router.get(
    '/doctor/prechecked-appointments',
    authenticateToken,
    authorizeRole(['doctor']),
    doctorController.getPrecheckedAppointmentsForToday
);
router.get(
  '/doctor/completed-appointments',
  authenticateToken,
  authorizeRole(['doctor']),
  doctorController.getCompletedAppointmentsForToday
);

// หมอนัดติดตามอาการ
router.post('/doctor/follow-up', authenticateToken, authorizeRole(['doctor']), doctorController.createFollowUpAppointment);
// Route สำหรับอัปเดตข้อมูลแพทย์
router.put('/doctors/:id', authenticateToken, authorizeRole(['nurse', 'head_nurse']), doctorController.updateDoctor);

// Route สำหรับลบข้อมูลแพทย์
router.delete('/doctors/:id', authenticateToken, authorizeRole(['nurse', 'head_nurse']), doctorController.deleteDoctor);

router.get('/doctors/by-service/:serviceId', authenticateToken, authorizeRole(['nurse', 'head_nurse']), doctorController.getDoctorsByService);

module.exports = router;