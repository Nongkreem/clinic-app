const express = require('express');
const router = express.Router();
const clinicRoomController = require('../controllers/clinicRoomController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { authorizeRole } = require('../middleware/authorization');

// Route สำหรับสร้างแพทย์ใหม่
router.post('/rooms', authenticateToken, authorizeRole(['nurse', 'head_nurse']), clinicRoomController.createRoom);

// Route สำหรับดึงข้อมูลแพทย์ทั้งหมด
router.get('/rooms', authenticateToken, authorizeRole(['nurse', 'head_nurse']), clinicRoomController.getAllRooms);

// Route สำหรับอัปเดตข้อมูลแพทย์
router.put('/rooms/:id', authenticateToken, authorizeRole(['nurse', 'head_nurse']), clinicRoomController.updateRoom);

// Route สำหรับลบข้อมูลแพทย์
router.delete('/rooms/:id', authenticateToken, authorizeRole(['nurse', 'head_nurse']), clinicRoomController.deleteRoom);

module.exports = router;