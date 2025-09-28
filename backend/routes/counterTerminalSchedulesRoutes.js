const express = require('express');
const router = express.Router();
const nurseScheduleController = require('../controllers/counterTerminalSchedulesController.js');
const { authenticateToken } = require('../middleware/authMiddleware.js');
const { authorizeRole } = require('../middleware/authorization.js');

router.get('/', authenticateToken, authorizeRole(['nurse', 'head_nurse']), nurseScheduleController.getAllSchedules);
router.post('/', authenticateToken, authorizeRole(['nurse', 'head_nurse']), nurseScheduleController.createSchedule);

router.delete('/:id', authenticateToken, authorizeRole(['nurse', 'head_nurse']), nurseScheduleController.deleteSchedule);

// Toggle is_at_counter_terminal status
router.put('/toggle-status/:id', authenticateToken, authorizeRole(['head_nurse']), nurseScheduleController.toggleCounterStatus);

module.exports = router;