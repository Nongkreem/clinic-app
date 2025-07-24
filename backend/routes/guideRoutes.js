// backend/routes/preparationGuidanceRoutes.js
const express = require('express');
const router = express.Router();
const guideController = require('../controllers/guideController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { authorizeRole } = require('../middleware/authorization');

router.get('/', authenticateToken, authorizeRole(['nurse', 'head_nurse', 'admin']), guideController.getAllGuidances);
router.post('/', authenticateToken, authorizeRole(['nurse', 'head_nurse', 'admin']), guideController.createGuidance);
router.put('/:id', authenticateToken, authorizeRole(['nurse', 'head_nurse', 'admin']), guideController.updateGuidance);
router.delete('/:id', authenticateToken, authorizeRole(['nurse', 'head_nurse', 'admin']), guideController.deleteGuidance);

module.exports = router;