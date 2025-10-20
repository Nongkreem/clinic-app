const express = require('express');
const router = express.Router();
const nurseController = require('../controllers/nurseController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { authorizeRole } = require('../middleware/authorization');

// Route สำหรับสร้างพยาบาลใหม่
router.post('/', authenticateToken, authorizeRole(['head_nurse']), nurseController.createNurese);

// Route สำหรับดึงข้อมูลพยาบาลทั้งหมด
router.get('/', authenticateToken, authorizeRole(['nurse', 'head_nurse']), nurseController.getAllNurses);

router.delete('/:id', authenticateToken, authorizeRole(['nurse', 'head_nurse']), nurseController.deleteNurse);
// สำหรับอัปเดตข้อมูลพยาบาล
router.put(
  '/:id',
  authenticateToken,
  authorizeRole(['head_nurse']),
  nurseController.updateNurse
);

module.exports = router;