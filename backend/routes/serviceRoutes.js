const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { authorizeRole } = require('../middleware/authorization');

// Route สำหรับสร้างบริการใหม่
router.post('/services', authenticateToken, authorizeRole(['nurse', 'head_nurse']), serviceController.createService);

// Route สำหรับดึงข้อมูลบริการทั้งหมด
router.get('/services', authenticateToken, authorizeRole(['nurse', 'head_nurse']), serviceController.getAllServices);

// Route สำหรับอัปเดตข้อมูลบริการ
router.put('/services/:id', authenticateToken, authorizeRole(['nurse', 'head_nurse']), serviceController.updateService);

// Route สำหรับลบข้อมูลบริการ
router.delete('/services/:id', authenticateToken, authorizeRole(['nurse', 'head_nurse']), serviceController.deleteService);

module.exports = router;