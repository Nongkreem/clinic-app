const SymptomAssessment = require('../models/SymptomAssessment');

// ========== Patient ==========
exports.getQuestionnaire = async (req, res) => {
  try {
    const questionnaire = await SymptomAssessment.getActiveQuestionnaire();
    res.status(200).json(questionnaire);
  } catch (err) {
    console.error('getQuestionnaire error:', err);
    res.status(500).json({ message: 'ไม่สามารถดึงแบบประเมินได้' });
  }
};

exports.submitAssessmentAndRecommend = async (req, res) => {
  try {
    const patient_id = req.user.entity_id; // patient เท่านั้น
    const { answers } = req.body;
    // answers: [{ question_id, choice_id }, ...]

    if (!Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ message: 'รูปแบบคำตอบไม่ถูกต้อง' });
    }

    // 1) คำนวณคะแนนรวมต่อ service
    const { totals, recommended } = await SymptomAssessment.computeScores(answers);

    // 2) (ออปชัน) บันทึกผล
    const savedId = await SymptomAssessment.saveAssessmentResult({
      patient_id,
      recommended_service_id: recommended.service_id,
      totals
    });

    res.status(201).json({
      result_id: savedId,
      recommended_service_id: recommended.service_id,
      recommended_service_name: recommended.service_name,
      scores: totals
    });
  } catch (err) {
    console.error('submitAssessmentAndRecommend error:', err);
    res.status(500).json({ message: 'ไม่สามารถประมวลผลแบบประเมินได้' });
  }
};

exports.listMyResults = async (req, res) => {
  try {
    const patient_id = req.user.entity_id;
    const rows = await SymptomAssessment.listResultsByPatient(patient_id);
    res.status(200).json(rows);
  } catch (err) {
    console.error('listMyResults error:', err);
    res.status(500).json({ message: 'ไม่สามารถดึงประวัติผลการประเมินได้' });
  }
};

// ========== Head Nurse Management ==========
exports.upsertQuestion = async (req, res) => {
  try {
    const { question_id, question_text, sort_order = 0, is_active = 1 } = req.body;
    if (!question_text) return res.status(400).json({ message: 'ต้องระบุ question_text' });
    const id = await SymptomAssessment.upsertQuestion({ question_id, question_text, sort_order, is_active });
    res.status(200).json({ message: 'บันทึกคำถามสำเร็จ', question_id: id });
  } catch (err) {
    console.error('upsertQuestion error:', err);
    res.status(500).json({ message: 'บันทึกคำถามไม่สำเร็จ' });
  }
};

exports.deleteQuestion = async (req, res) => {
  try {
    const id = req.params.id;
    const ok = await SymptomAssessment.deleteQuestion(id);
    if (!ok) return res.status(404).json({ message: 'ไม่พบคำถาม' });
    res.status(200).json({ message: 'ลบคำถามสำเร็จ' });
  } catch (err) {
    console.error('deleteQuestion error:', err);
    res.status(500).json({ message: 'ลบคำถามไม่สำเร็จ' });
  }
};

exports.upsertChoice = async (req, res) => {
  try {
    const { choice_id, question_id, choice_text, sort_order = 0, is_active = 1 } = req.body;
    if (!question_id || !choice_text) return res.status(400).json({ message: 'ข้อมูลไม่ครบ' });
    const id = await SymptomAssessment.upsertChoice({ choice_id, question_id, choice_text, sort_order, is_active });
    res.status(200).json({ message: 'บันทึกตัวเลือกสำเร็จ', choice_id: id });
  } catch (err) {
    console.error('upsertChoice error:', err);
    res.status(500).json({ message: 'บันทึกตัวเลือกไม่สำเร็จ' });
  }
};

exports.deleteChoice = async (req, res) => {
  try {
    const id = req.params.id;
    const ok = await SymptomAssessment.deleteChoice(id);
    if (!ok) return res.status(404).json({ message: 'ไม่พบตัวเลือก' });
    res.status(200).json({ message: 'ลบตัวเลือกสำเร็จ' });
  } catch (err) {
    console.error('deleteChoice error:', err);
    res.status(500).json({ message: 'ลบตัวเลือกไม่สำเร็จ' });
  }
};

exports.upsertChoiceScore = async (req, res) => {
  try {
    const { choiceScore_id, choice_id, service_id, score } = req.body;
    if (!choice_id || !service_id || typeof score !== 'number') {
      return res.status(400).json({ message: 'ข้อมูลไม่ครบ' });
    }
    const id = await SymptomAssessment.upsertChoiceScore({ choiceScore_id, choice_id, service_id, score });
    res.status(200).json({ message: 'บันทึกคะแนนสำเร็จ', choiceScore_id: id });
  } catch (err) {
    console.error('upsertChoiceScore error:', err);
    res.status(500).json({ message: 'บันทึกคะแนนไม่สำเร็จ' });
  }
};

exports.deleteChoiceScore = async (req, res) => {
  try {
    const id = req.params.id;
    const ok = await SymptomAssessment.deleteChoiceScore(id);
    if (!ok) return res.status(404).json({ message: 'ไม่พบคะแนน' });
    res.status(200).json({ message: 'ลบคะแนนสำเร็จ' });
  } catch (err) {
    console.error('deleteChoiceScore error:', err);
    res.status(500).json({ message: 'ลบคะแนนไม่สำเร็จ' });
  }
};
