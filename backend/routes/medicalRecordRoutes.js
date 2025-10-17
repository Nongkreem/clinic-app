const express = require('express');
const router = express.Router();
const medicalRecordController = require('../controllers/medicalRecordController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { authorizeRole } = require('../middleware/authorization');

// สร้าง medical record (คัดลอกค่าจาก precheck)
// และปิดนัดเป็น complete
router.post('/', authenticateToken, authorizeRole(['doctor']), medicalRecordController.createFromAppointment);

// อัปเดต record (อนุญาตแก้ diagnosis/treatment/note/follow_up_date)
router.put('/:record_id', authenticateToken, authorizeRole(['doctor']), medicalRecordController.updateRecord);

module.exports = router;
