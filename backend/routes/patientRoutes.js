const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController'); // ✅ ต้องสร้าง controller นี้
const { authenticateToken } = require('../middleware/authMiddleware');
const { authorizeRole } = require('../middleware/authorization');

router.get('/:patientId/blacklist-status', authenticateToken, authorizeRole(['patient']), patientController.getPatientBlacklistStatus);


module.exports = router;