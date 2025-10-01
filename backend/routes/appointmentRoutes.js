// backend/routes/appointmentRoutes.js
const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { authorizeRole } = require('../middleware/authorization');

router.get('/available-slots', authenticateToken, authorizeRole(['patient']), appointmentController.getAvailableSlotsByDateAndService);

router.post('/', authenticateToken, authorizeRole(['patient']), appointmentController.bookNewAppointment);

router.get('/my-appointments', authenticateToken, authorizeRole(['patient']), appointmentController.getPatientAppointments);
router.get('/', authenticateToken, authorizeRole(['nurse', 'head_nurse']), appointmentController.getAppointments);
// พยาบาลแผนกดึงรายการ: อนุมัติแล้ว + ผู้ป่วยเช็คอินแล้ว (confirmCheckInTime not null) + ตาม service ของตน
router.get('/approved-with-checkin/:id', authenticateToken, authorizeRole(['nurse']), appointmentController.getApprovedCheckedInForService);


router.get('/:id', authenticateToken, authorizeRole(['patient', 'nurse', 'head_nurse']), appointmentController.getAppointmentById);
router.put('/:id/status', authenticateToken, authorizeRole(['nurse', 'head_nurse']), appointmentController.updateAppointmentStatus);
router.put('/:id/patient-cancel', authenticateToken, authorizeRole(['patient', 'nurse', 'head_nurse']), appointmentController.cancelPatientAppointment); // Allow patient to cancel
router.put('/:id/patient-complete', authenticateToken, authorizeRole(['patient']), appointmentController.completePatientAppointment); // Allow patient to mark as completed
module.exports = router;
