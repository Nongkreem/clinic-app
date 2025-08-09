const express = require('express');
const router = express.Router();
const clinicRoomController = require('../controllers/clinicRoomController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { authorizeRole } = require('../middleware/authorization');

router.post('/rooms', authenticateToken, authorizeRole(['nurse', 'head_nurse']), clinicRoomController.createRoom);

router.get('/rooms', authenticateToken, authorizeRole(['nurse', 'head_nurse']), clinicRoomController.getAllRooms);
router.get('/rooms/available', authenticateToken, authorizeRole(['nurse', 'head_nurse']), clinicRoomController.getAvailableRoomsByTime);
router.get('/rooms/by-service/:serviceId', authenticateToken, authorizeRole(['nurse', 'head_nurse']), clinicRoomController.getRoomsByService);

router.put('/rooms/:id', authenticateToken, authorizeRole(['nurse', 'head_nurse']), clinicRoomController.updateRoom);

router.delete('/rooms/:id', authenticateToken, authorizeRole(['nurse', 'head_nurse']), clinicRoomController.deleteRoom);

module.exports = router;