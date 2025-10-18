const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/symptomAssessmentController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { authorizeRole } = require('../middleware/authorization');


// ================= Public/Patient ===============

// ดึงชุดแบบประเมิน (เฉพาะแอคทีฟ + เรียงตาม sort_order)
router.get(
  '/question',
  authenticateToken,
  authorizeRole(['patient', 'nurse', 'doctor', 'head_nurse']),
  ctrl.getQuestionnaire
);

// ผู้ป่วยส่งคำตอบทั้งหมด เพื่อคำนวณคะแนนและแนะนำ service
router.post(
  '/submit',
  authenticateToken,
  authorizeRole(['patient']),
  ctrl.submitAssessmentAndRecommend
);

// (ออปชัน) ผู้ป่วยดูประวัติผลการประเมินของตน
router.get(
  '/my-results',
  authenticateToken,
  authorizeRole(['patient']),
  ctrl.listMyResults
);

// ============= Head Nurse management ==============

// คำถาม
router.post(
  '/question',
  authenticateToken,
  authorizeRole(['head_nurse']),
  ctrl.upsertQuestion
);
router.delete(
  '/question/:id',
  authenticateToken,
  authorizeRole(['head_nurse']),
  ctrl.deleteQuestion
);

// ตัวเลือก
router.post(
  '/choice',
  authenticateToken,
  authorizeRole(['head_nurse']),
  ctrl.upsertChoice
);
router.delete(
  '/choice/:id',
  authenticateToken,
  authorizeRole(['head_nurse']),
  ctrl.deleteChoice
);

// คะแนนต่อ service
router.post(
  '/choice-score',
  authenticateToken,
  authorizeRole(['head_nurse']),
  ctrl.upsertChoiceScore
);
router.delete(
  '/choice-score/:id',
  authenticateToken,
  authorizeRole(['head_nurse']),
  ctrl.deleteChoiceScore
);

module.exports = router;
