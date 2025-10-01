const express = require('express');
const router = express.Router();
const precheckController = require('../controllers/precheckController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { authorizeRole } = require('../middleware/authorization');

//เพิ่ม/แก้ไข precheck 
router.post('/', authenticateToken, authorizeRole(['nurse']), precheckController.upsertPrecheck);

// ดึง precheck ล่าสุดของนัด
router.get('/latest/:appointmentId', authenticateToken, authorizeRole(['nurse','doctor']), precheckController.getLatestPrecheckByAppointment);

// ส่งตรวจ (update appointment.status = 'prechecked')
router.put('/send-to-doctor/:appointmentId', authenticateToken, authorizeRole(['nurse']), precheckController.sendToDoctor);

module.exports = router;
