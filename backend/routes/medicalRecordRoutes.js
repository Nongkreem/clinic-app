const express = require('express');
const router = express.Router();
const medicalRecordController = require('../controllers/medicalRecordController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { authorizeRole } = require('../middleware/authorization');

// สร้าง medical record (คัดลอกค่าจาก precheck)
// และปิดนัดเป็น complete
router.post('/', authenticateToken, authorizeRole(['doctor']), medicalRecordController.createFromAppointment);

module.exports = router;
