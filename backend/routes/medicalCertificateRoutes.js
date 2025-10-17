const express = require('express');
const router = express.Router();
const medicalCertController = require('../controllers/medicalCertificateController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { authorizeRole } = require('../middleware/authorization');

// ออกใบรับรองแพทย์จากนัด (หมอ)
router.post(
  '/',
  authenticateToken,
  authorizeRole(['doctor']),
  medicalCertController.createFromAppointment
);

// หมอดูรายการของตัวเอง (todayOnly=1 เพื่อดูเฉพาะวันนี้)
router.get(
  '/mine',
  authenticateToken,
  authorizeRole(['doctor']),
  medicalCertController.listMine
);

// คนไข้ดูของตัวเอง
router.get(
  '/my',
  authenticateToken,
  authorizeRole(['patient']),
  medicalCertController.listForPatient
);

// หมอดูฉบับเดียว
router.get(
  '/:id',
  authenticateToken,
  authorizeRole(['doctor']),
  medicalCertController.getOneForDoctor
);

// คนไข้ดูฉบับเดียว
router.get(
  '/patient/:id',
  authenticateToken,
  authorizeRole(['patient']),
  medicalCertController.getOneForPatient
);

// หมอแก้ไข + regenerate PDF
router.put(
  '/:id',
  authenticateToken,
  authorizeRole(['doctor']),
  medicalCertController.updateMine
);

module.exports = router;
