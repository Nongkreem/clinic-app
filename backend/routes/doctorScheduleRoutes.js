const express = require('express');
const router = express.Router();
const doctorScheduleController = require('../controllers/doctorScheduleController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { authorizeRole } = require('../middleware/authorization');

router.post('/schedules', authenticateToken, authorizeRole(['nurse', 'head_nurse']), doctorScheduleController.createSchedules);
router.post('/appointments/book', authenticateToken, authorizeRole(['patient']), doctorScheduleController.bookSlot);

router.get('/schedules', authenticateToken, authorizeRole(['nurse', 'head_nurse', 'doctor']), doctorScheduleController.getAllSchedules);
router.get('/schedules/:id', authenticateToken, authorizeRole(['nurse', 'head_nurse', 'doctor']), doctorScheduleController.getScheduleById);
router.get('/public/schedules', doctorScheduleController.getAllSchedules);
router.get('/public/schedules/available-slots', doctorScheduleController.getAvailableSlots);

router.put('/schedules/:id', authenticateToken, authorizeRole(['nurse', 'head_nurse']), doctorScheduleController.updateSchedule);

router.delete('/schedules/:id', authenticateToken, authorizeRole(['nurse', 'head_nurse']), doctorScheduleController.deleteSchedule);

module.exports = router;