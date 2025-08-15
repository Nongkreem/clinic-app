// backend/routes/appointmentRoutes.js
const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { authorizeRole } = require('../middleware/authorization');

// Route to get aggregated available slots for booking (patient can access)
router.get('/available-slots', authenticateToken, authorizeRole(['patient']), appointmentController.getAvailableSlotsByDateAndService);

// Route to book a new appointment (patient only)
router.post('/', authenticateToken, authorizeRole(['patient']), appointmentController.bookNewAppointment);

// Route to get a specific appointment by ID (patient, nurse, head_nurse can access)
router.get('/:id', authenticateToken, authorizeRole(['patient', 'nurse', 'head_nurse']), appointmentController.getAppointmentById);

// Route to get all appointments for the authenticated patient
router.get('/my-appointments', authenticateToken, authorizeRole(['patient']), appointmentController.getPatientAppointments);
router.get('/', authenticateToken, authorizeRole(['nurse', 'head_nurse']), appointmentController.getAppointments);


// Routes for updating/cancelling appointments (typically nurse/head_nurse roles)
router.put('/:id/status', authenticateToken, authorizeRole(['nurse', 'head_nurse']), appointmentController.updateAppointmentStatus);
router.put('/:id/cancel', authenticateToken, authorizeRole(['patient', 'nurse', 'head_nurse']), appointmentController.cancelAppointment); // Allow patient to cancel

module.exports = router;
