const db = require('../config/db');

exports.getActiveQuestionnaire = async () => {
  // ดึงคำถาม + ตัวเลือกที่ active พร้อมเรียงลำดับ
  const [qs] = await db.execute(
    `SELECT question_id, question_text, sort_order
     FROM question
     WHERE is_active = 1
     ORDER BY sort_order ASC, question_id ASC`
  );

  const qIds = qs.map(q => q.question_id);
  if (qIds.length === 0) return [];

  const [choices] = await db.execute(
    `SELECT choice_id, question_id, choice_text, sort_order
     FROM symptomChoice
     WHERE is_active = 1 AND question_id IN (${qIds.map(()=>'?').join(',')})
     ORDER BY question_id ASC, sort_order ASC, choice_id ASC`,
    qIds
  );

  // group choices by question
  const byQ = choices.reduce((acc, c) => {
    acc[c.question_id] = acc[c.question_id] || [];
    acc[c.question_id].push({
      choice_id: c.choice_id,
      choice_text: c.choice_text,
      sort_order: c.sort_order
    });
    return acc;
  }, {});

  return qs.map(q => ({
    question_id: q.question_id,
    question_text: q.question_text,
    choices: byQ[q.question_id] || []
  }));
};

exports.computeScores = async (answers) => {
  // answers: [{question_id, choice_id}, ...]
  // รวม choice_id ทั้งหมด แล้วดึงคะแนนต่อ service
  const choiceIds = answers.map(a => a.choice_id).filter(Boolean);
  if (choiceIds.length === 0) {
    return { totals: [], recommended: { service_id: null, service_name: null } };
  }

  // ดึงคะแนนทั้งหมดของ choices เหล่านี้
  const [rows] = await db.execute(
    `SELECT cs.choice_id, cs.service_id, cs.score, s.service_name
     FROM choiceScore cs
     JOIN services s ON s.service_id = cs.service_id
     WHERE cs.choice_id IN (${choiceIds.map(()=>'?').join(',')})`,
    choiceIds
  );

  // รวมคะแนนตาม service
  const totalsMap = new Map(); // service_id -> { service_id, service_name, total_score }
  for (const r of rows) {
    const k = r.service_id;
    if (!totalsMap.has(k)) {
      totalsMap.set(k, { service_id: r.service_id, service_name: r.service_name, total_score: 0 });
    }
    const obj = totalsMap.get(k);
    obj.total_score += Number(r.score || 0);
  }

  // ใส่บริการที่ไม่มีคะแนนให้มี 0? (ถ้าต้องการ) — ไม่จำเป็นก็ได้
  const totals = Array.from(totalsMap.values()).sort((a, b) => b.total_score - a.total_score);

  // เลือกตัวสูงสุด (หากเสมอ เลือกตัวแรกหลัง sort) — หรือคืน ties ก็ได้
  const recommended = totals[0] || { service_id: null, service_name: null, total_score: 0 };

  return { totals, recommended };
};

exports.saveAssessmentResult = async ({ patient_id, recommended_service_id, totals }) => {
  const [ins] = await db.execute(
    `INSERT INTO symptomAssessmentResult (patient_id, recommended_service_id, total_scores_json)
     VALUES (?,?,?)`,
    [patient_id, recommended_service_id, JSON.stringify(totals)]
  );
  return ins.insertId;
};

exports.listResultsByPatient = async (patient_id) => {
  const [rows] = await db.execute(
    `SELECT result_id, patient_id, recommended_service_id, total_scores_json, created_at
     FROM symptomAssessmentResult
     WHERE patient_id = ?
     ORDER BY created_at DESC`,
    [patient_id]
  );
  return rows.map(r => ({
    result_id: r.result_id,
    patient_id: r.patient_id,
    recommended_service_id: r.recommended_service_id,
    created_at: r.created_at,
    scores: JSON.parse(r.total_scores_json || '[]')
  }));
};

/* ============ Head Nurse ============ */
exports.upsertQuestion = async ({ question_id, question_text, sort_order, is_active }) => {
  if (question_id) {
    await db.execute(
      `UPDATE question SET question_text=?, sort_order=?, is_active=? WHERE question_id=?`,
      [question_text, sort_order, is_active, question_id]
    );
    return question_id;
  } else {
    const [ins] = await db.execute(
      `INSERT INTO question (question_text, sort_order, is_active) VALUES (?,?,?)`,
      [question_text, sort_order, is_active]
    );
    return ins.insertId;
  }
};

exports.deleteQuestion = async (question_id) => {
  const [res] = await db.execute(`DELETE FROM question WHERE question_id=?`, [question_id]);
  return res.affectedRows > 0;
};

exports.upsertChoice = async ({ choice_id, question_id, choice_text, sort_order, is_active }) => {
  if (choice_id) {
    await db.execute(
      `UPDATE symptomChoice SET question_id=?, choice_text=?, sort_order=?, is_active=? WHERE choice_id=?`,
      [question_id, choice_text, sort_order, is_active, choice_id]
    );
    return choice_id;
  } else {
    const [ins] = await db.execute(
      `INSERT INTO symptomChoice (question_id, choice_text, sort_order, is_active) VALUES (?,?,?,?)`,
      [question_id, choice_text, sort_order, is_active]
    );
    return ins.insertId;
  }
};

exports.deleteChoice = async (choice_id) => {
  const [res] = await db.execute(`DELETE FROM symptomChoice WHERE choice_id=?`, [choice_id]);
  return res.affectedRows > 0;
};

exports.upsertChoiceScore = async ({ choiceScore_id, choice_id, service_id, score }) => {
  if (choiceScore_id) {
    await db.execute(
      `UPDATE choiceScore SET choice_id=?, service_id=?, score=? WHERE choiceScore_id=?`,
      [choice_id, service_id, score, choiceScore_id]
    );
    return choiceScore_id;
  } else {
    // upsert ด้วย UNIQUE(choice_id, service_id)
    const [res] = await db.execute(
      `INSERT INTO choiceScore (choice_id, service_id, score)
       VALUES (?,?,?)
       ON DUPLICATE KEY UPDATE score=VALUES(score)`,
      [choice_id, service_id, score]
    );
    return res.insertId || null; // ถ้า DUPLICATE จะได้ insertId = 0; แต่ไม่เป็นไรเพราะเราอัปเดตแล้ว
  }
};

exports.deleteChoiceScore = async (choiceScore_id) => {
  const [res] = await db.execute(`DELETE FROM choiceScore WHERE choiceScore_id=?`, [choiceScore_id]);
  return res.affectedRows > 0;
};
