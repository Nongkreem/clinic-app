import React, { useState, useEffect } from "react";
import { Plus, Trash2, X, RefreshCw } from "lucide-react";
import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:5001";

export default function SymptomAssessmentManager() {
  const [questions, setQuestions] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const token = localStorage.getItem("token");
  const [newQuestionText, setNewQuestionText] = useState("");
  const [addingChoiceFor, setAddingChoiceFor] = useState(null);
  const [newChoiceText, setNewChoiceText] = useState("");

  // โหลดข้อมูลจาก Backend
  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      setLoading(true);

      // ดึงชุดคำถาม + service
      const [qRes, sRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/symptom-assessment/question`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_BASE_URL}/api/services`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      // ดึงคะแนนทั้งหมด
      const questionsWithScores = await Promise.all(
        (qRes.data || []).map(async (q) => {
          if (q.choices && q.choices.length > 0) {
            const choicesWithScores = await Promise.all(
              q.choices.map(async (choice) => {
                try {
                  // ดึงคะแนนของแต่ละ choice
                  const scoreRes = await axios.get(
                    `${API_BASE_URL}/api/symptom-assessment/choice/${choice.choice_id}/scores`,
                    { headers: { Authorization: `Bearer ${token}` } }
                  );
                  return { ...choice, scores: scoreRes.data || [] };
                } catch (err) {
                  console.warn(
                    `ไม่สามารถดึงคะแนนของ choice ${choice.choice_id}`,
                    err
                  );
                  return { ...choice, scores: [] };
                }
              })
            );
            return { ...q, choices: choicesWithScores };
          }
          return { ...q, choices: [] };
        })
      );

      setQuestions(questionsWithScores);
      setServices(sRes.data || []);
    } catch (err) {
      console.error("โหลดข้อมูลไม่สำเร็จ:", err);
      alert("โหลดข้อมูลไม่สำเร็จ กรุณาตรวจสอบการเชื่อมต่อ");
    } finally {
      setLoading(false);
    }
  };

  const saveAssessment = async () => {
    try {
      setSaving(true);
      let total = 0
      // นับจำนวนทั้งหมด (เพื่อ progress)
      questions.forEach((q) => {
        total++;
        (q.choices || []).forEach((c) => {
          total++;
          (c.scores || []).forEach(() => total++);
        });
      });

      for (const q of questions) {
        // บันทึกคำถาม
        await axios.post(
          `${API_BASE_URL}/api/symptom-assessment/question`,
          {
            question_id: q.question_id,
            question_text: q.question_text,
            sort_order: q.sort_order || 0,
            is_active: 1,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        for (const c of q.choices || []) {
          // บันทึกตัวเลือก
          await axios.post(
            `${API_BASE_URL}/api/symptom-assessment/choice`,
            {
              choice_id: c.choice_id,
              question_id: q.question_id,
              choice_text: c.choice_text,
              sort_order: c.sort_order || 0,
              is_active: 1,
            },
            { headers: { Authorization: `Bearer ${token}` } }
          );

          for (const s of c.scores || []) {
            // บันทึกคะแนนต่อ service
            await axios.post(
              `${API_BASE_URL}/api/symptom-assessment/choice-score`,
              {
                choice_id: c.choice_id,
                service_id: s.service_id,
                score: Number(s.score),
              },
              { headers: { Authorization: `Bearer ${token}` } }
            );
          }
        }
      }

      alert("บันทึกแบบประเมินสำเร็จแล้ว!");
    } catch (err) {
      console.error("บันทึกแบบประเมินไม่สำเร็จ:", err);
      alert("บันทึกไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setSaving(false);
    }
  };

  /** ------------------------
   *  CRUD ฝั่ง Head Nurse
   * ------------------------ */

  // เพิ่มคำถาม
  const addNewQuestion = async () => {
    if (!newQuestionText.trim()) return;
    try {
      setSaving(true);
      await axios.post(
        `${API_BASE_URL}/api/symptom-assessment/question`,
        {
          question_text: newQuestionText.trim(),
          sort_order: questions.length + 1,
          is_active: 1,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewQuestionText("");
      await fetchAll();
    } catch (err) {
      console.error(err);
      alert("เพิ่มคำถามไม่สำเร็จ");
    } finally {
      setSaving(false);
    }
  };

  // แก้ไขคำถาม (บันทึกเฉพาะเมื่อข้อความไม่ว่าง)
const updateQuestion = async (question_id, field, value) => {
  const question = questions.find((q) => q.question_id === question_id);
  if (!question) return;

  // อัปเดต state ทันที เพื่อให้ UI แสดงค่าที่ผู้ใช้พิมพ์ได้แบบเรียลไทม์
  setQuestions((prev) =>
    prev.map((q) =>
      q.question_id === question_id ? { ...q, [field]: value } : q
    )
  );

  // ถ้าเป็นค่าว่าง ("" หรือมีแต่ช่องว่าง) จะไม่ยิง API
  if (!value.trim()) {
    console.warn("ข้ามการอัปเดตเพราะคำถามว่าง");
    return;
  }

  try {
    await axios.post(
      `${API_BASE_URL}/api/symptom-assessment/question`,
      {
        question_id,
        question_text: value.trim(),
        sort_order: question.sort_order || 0,
        is_active: question.is_active ?? 1,
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );
  } catch (err) {
    console.error("updateQuestion failed:", err);
    alert("แก้ไขคำถามไม่สำเร็จ");
  }
};


  // ลบคำถาม
  const deleteQuestion = async (question_id) => {
    if (
      !confirm(
        "ต้องการลบคำถามนี้หรือไม่? (จะลบตัวเลือกและคะแนนที่เกี่ยวข้องทั้งหมด)"
      )
    )
      return;

    try {
      setSaving(true);
      await axios.delete(
        `${API_BASE_URL}/api/symptom-assessment/question/${question_id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchAll();
      alert("ลบคำถามสำเร็จ");
    } catch (err) {
      console.error(err);
      alert(
        "ลบคำถามไม่สำเร็จ: " + (err.response?.data?.message || err.message)
      );
    } finally {
      setSaving(false);
    }
  };

  // เพิ่มตัวเลือก
  const addChoice = async (question_id) => {
    if (!newChoiceText.trim()) return;
    try {
      setSaving(true);
      await axios.post(
        `${API_BASE_URL}/api/symptom-assessment/choice`,
        {
          question_id,
          choice_text: newChoiceText.trim(),
          sort_order: 1,
          is_active: 1,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAddingChoiceFor(null);
      setNewChoiceText("");
      await fetchAll();
    } catch (err) {
      console.error(err);
      alert("เพิ่มตัวเลือกไม่สำเร็จ");
    } finally {
      setSaving(false);
    }
  };

  // แก้ไขตัวเลือก
  const updateChoice = async (question_id, choice_id, value) => {
    const question = questions.find((q) => q.question_id === question_id);
    const choice = question?.choices?.find((c) => c.choice_id === choice_id);
    if (!choice) return;

    try {
      await axios.post(
        `${API_BASE_URL}/api/symptom-assessment/choice`,
        {
          choice_id,
          question_id,
          choice_text: value,
          sort_order: choice.sort_order || 0,
          is_active: choice.is_active ?? 1,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // อัพเดท local state
      setQuestions(
        questions.map((q) => {
          if (q.question_id === question_id) {
            return {
              ...q,
              choices: q.choices.map((c) =>
                c.choice_id === choice_id ? { ...c, choice_text: value } : c
              ),
            };
          }
          return q;
        })
      );
    } catch (err) {
      console.error(err);
      alert("แก้ไขตัวเลือกไม่สำเร็จ");
    }
  };

  // ลบตัวเลือก
  const deleteChoice = async (choice_id) => {
    if (
      !confirm("ต้องการลบตัวเลือกนี้หรือไม่? (จะลบคะแนนที่เกี่ยวข้องทั้งหมด)")
    )
      return;

    try {
      setSaving(true);
      await axios.delete(
        `${API_BASE_URL}/api/symptom-assessment/choice/${choice_id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchAll();
      alert("ลบตัวเลือกสำเร็จ");
    } catch (err) {
      console.error(err);
      alert(
        "ลบตัวเลือกไม่สำเร็จ: " + (err.response?.data?.message || err.message)
      );
    } finally {
      setSaving(false);
    }
  };

  // บันทึกคะแนน (เรียกทุกครั้งที่เปลี่ยนแปลง)
  const updateScore = async (question_id, choice_id, service_id, score) => {
    try {
      await axios.post(
        `${API_BASE_URL}/api/symptom-assessment/choice-score`,
        {
          choice_id,
          service_id,
          score: Number(score) || 0,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // อัพเดท local state
      setQuestions(
        questions.map((q) => {
          if (q.question_id === question_id) {
            return {
              ...q,
              choices: q.choices.map((c) => {
                if (c.choice_id === choice_id) {
                  const scores = c.scores || [];
                  const existingIndex = scores.findIndex(
                    (s) => s.service_id === service_id
                  );
                  let newScores;

                  if (existingIndex >= 0) {
                    newScores = scores.map((s, i) =>
                      i === existingIndex ? { ...s, score: Number(score) } : s
                    );
                  } else {
                    newScores = [
                      ...scores,
                      {
                        choiceScore_id: Date.now(),
                        service_id,
                        score: Number(score),
                      },
                    ];
                  }

                  return { ...c, scores: newScores };
                }
                return c;
              }),
            };
          }
          return q;
        })
      );
    } catch (err) {
      console.error(err);
      alert(
        "บันทึกคะแนนไม่สำเร็จ: " + (err.response?.data?.message || err.message)
      );
    }
  };

  const getScore = (choice, serviceId) => {
    const scoreObj = choice?.scores?.find((s) => s.service_id === serviceId);
    return scoreObj?.score ?? 0;
  };

  // เพิ่มคำถามแบบ inline
  const addNewQuestionInline = async (question_text) => {
    try {
      await axios.post(
        `${API_BASE_URL}/api/symptom-assessment/admin/question`,
        { question_text, sort_order: questions.length + 1, is_active: 1 },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchAll();
    } catch (err) {
      console.error(err);
      alert("เพิ่มคำถามไม่สำเร็จ");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-emerald-600 mx-auto mb-2" />
          <p className="text-gray-600">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-primary-default">
              จัดการคำถามประเมินอาการ
            </h1>
            <button
              onClick={saveAssessment}
              disabled={saving || loading}
              className="bg-primary-default hover:bg-emerald-800 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? "กำลังบันทึก..." : "บันทึกแบบประเมิน"}
            </button>
          </div>

          {services.length === 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <p className="text-yellow-800">
                ยังไม่มีบริการในระบบ กรุณาเพิ่มบริการก่อนตั้งค่าคะแนน
              </p>
            </div>
          )}

          {/* Service Headers */}
          {services.length > 0 && (
            <div
              className="grid gap-4 mb-4 text-sm font-semibold text-gray-600 border-b pb-2 bg-white sticky top-0 z-10 shadow-sm"
              style={{
                gridTemplateColumns: `170px 170px repeat(${services.length}, 150px) 50px`,
              }}
            >
              <div>คำถาม</div>
              <div></div>
              {services.map((service) => (
                <div
                  key={service.service_id}
                  className="text-center truncate"
                  title={service.service_name}
                >
                  {service.service_name}
                </div>
              ))}
              <div></div>
            </div>
          )}

          {/* Questions List */}
          <div className="space-y-4">
            {questions.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p className="mb-4">ยังไม่มีคำถามในระบบ</p>
                <button
                  onClick={addNewQuestion}
                  disabled={saving}
                  className="text-emerald-700 hover:text-emerald-800 font-medium disabled:opacity-50"
                >
                  คลิกเพื่อเพิ่มคำถามแรก
                </button>
              </div>
            ) : (
              questions.map((question, qIndex) => (
                <div
                  key={question.question_id}
                  className="border rounded-lg p-4 bg-gray-50"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-semibold text-gray-700">
                          คำถามที่ {qIndex + 1}
                        </span>
                        <button
                          onClick={() => deleteQuestion(question.question_id)}
                          disabled={saving}
                          className="text-red-500 hover:text-red-700 p-1 disabled:opacity-50"
                          title="ลบคำถาม"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <input
                        type="text"
                        value={question.question_text || ""}
                        onChange={(e) =>
                          updateQuestion(
                            question.question_id,
                            "question_text",
                            e.target.value
                          )
                        }
                        onBlur={(e) => {
                          // บันทึกเมื่อ blur
                          if (e.target.value !== question.question_text) {
                            updateQuestion(
                              question.question_id,
                              "question_text",
                              e.target.value
                            );
                          }
                        }}
                        placeholder="ระบุคำถาม..."
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                      />
                    </div>
                  </div>

                  {/* Choices */}
                  <div className="ml-6 space-y-3">
                    {question.choices && question.choices.length > 0 ? (
                      question.choices.map((choice, cIndex) => (
                        <div
                          key={choice.choice_id}
                          className="grid gap-3 items-center bg-white p-3 rounded border"
                          style={{
                            gridTemplateColumns: `150px 150px repeat(${services.length}, 150px) 50px`,
                          }}
                        >
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs text-gray-500">
                                ตัวเลือก {cIndex + 1}
                              </span>
                            </div>
                            <input
                              type="text"
                              value={choice.choice_text || ""}
                              onChange={(e) =>
                                updateChoice(
                                  question.question_id,
                                  choice.choice_id,
                                  e.target.value
                                )
                              }
                              onBlur={(e) => {
                                if (e.target.value !== choice.choice_text) {
                                  updateChoice(
                                    question.question_id,
                                    choice.choice_id,
                                    e.target.value
                                  );
                                }
                              }}
                              placeholder="ข้อความตัวเลือก..."
                              className="w-full px-2 py-1 text-sm border rounded focus:ring-1 focus:ring-emerald-500 outline-none"
                            />
                          </div>
                          <div className="mx-4 text-sm text-gray-500">
                            คะแนนต่อบริการ →
                          </div>
                          {services.map((service) => (
                            <div key={service.service_id}>
                              <input
                                type="number"
                                value={getScore(choice, service.service_id)}
                                onChange={(e) =>
                                  updateScore(
                                    question.question_id,
                                    choice.choice_id,
                                    service.service_id,
                                    e.target.value
                                  )
                                }
                                className="w-full px-2 py-1 text-sm border rounded text-center focus:ring-1 focus:ring-emerald-500 outline-none"
                                min="0"
                                step="1"
                              />
                            </div>
                          ))}
                          <div>
                            <button
                              onClick={() => deleteChoice(choice.choice_id)}
                              disabled={saving}
                              className="text-red-400 hover:text-red-600 disabled:opacity-50"
                              title="ลบตัวเลือก"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500 italic">
                        ยังไม่มีตัวเลือกสำหรับคำถามนี้
                      </p>
                    )}

                    {addingChoiceFor === question.question_id ? (
                      <div className="flex items-center gap-2 mt-2">
                        <input
                          type="text"
                          autoFocus
                          placeholder="พิมพ์ข้อความตัวเลือกใหม่..."
                          value={newChoiceText}
                          onChange={(e) => setNewChoiceText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter")
                              addChoice(question.question_id);
                            if (e.key === "Escape") {
                              setAddingChoiceFor(null);
                              setNewChoiceText("");
                            }
                          }}
                          className="border rounded px-3 py-2 w-80 focus:ring-1 focus:ring-emerald-500 outline-none"
                        />
                        <button
                          onClick={() => addChoice(question.question_id)}
                          disabled={saving}
                          className="bg-emerald-700 hover:bg-emerald-800 text-white px-3 py-2 rounded disabled:opacity-50"
                        >
                          บันทึก
                        </button>
                        <button
                          onClick={() => {
                            setAddingChoiceFor(null);
                            setNewChoiceText("");
                          }}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          ยกเลิก
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setAddingChoiceFor(question.question_id)}
                        disabled={saving}
                        className="flex items-center gap-2 text-emerald-700 hover:text-emerald-800 text-sm font-medium disabled:opacity-50"
                      >
                        <Plus className="w-4 h-4" />
                        เพิ่มตัวเลือก
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-6">
            {newQuestionText !== "" ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  autoFocus
                  placeholder="พิมพ์คำถามใหม่..."
                  value={newQuestionText}
                  onChange={(e) => setNewQuestionText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") addNewQuestion();
                    if (e.key === "Escape") setNewQuestionText("");
                  }}
                  className="border rounded px-3 py-2 w-full focus:ring-2 focus:ring-emerald-500 outline-none"
                />
                <button
                  onClick={addNewQuestion}
                  disabled={saving}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2 rounded disabled:opacity-50"
                >
                  บันทึก
                </button>
                <button
                  onClick={() => setNewQuestionText("")}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ยกเลิก
                </button>
              </div>
            ) : (
              <button
                onClick={() => setNewQuestionText(" ")} // <-- เปิดช่อง input
                disabled={saving}
                className="mt-6 flex items-center gap-2 text-emerald-700 hover:text-emerald-800 font-medium border-2 border-dashed border-emerald-300 hover:border-emerald-400 rounded-lg px-4 py-3 w-full justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-5 h-5" />
                เพิ่มคำถามใหม่
              </button>
            )}
          </div>
        </div>

        {/* Preview Section */}
        {questions.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">
              ตัวอย่างแบบประเมินที่ผู้ป่วยจะเห็น
            </h2>
            <div className="space-y-4">
              {questions
                .filter((q) => q.question_text && q.question_text.trim())
                .map((question, idx) => (
                  <div key={question.question_id} className="border-b pb-4">
                    <p className="font-medium text-gray-700 mb-2">
                      {idx + 1}. {question.question_text}
                    </p>
                    <div className="ml-4 space-y-2">
                      {question.choices
                        ?.filter((c) => c.choice_text && c.choice_text.trim())
                        .map((choice) => (
                          <label
                            key={choice.choice_id}
                            className="flex items-center gap-2 text-gray-600 cursor-pointer hover:text-gray-800"
                          >
                            <input
                              type="radio"
                              name={`preview_q${question.question_id}`}
                              className="text-emerald-600"
                              disabled
                            />
                            {choice.choice_text}
                          </label>
                        ))}
                      {(!question.choices || question.choices.length === 0) && (
                        <p className="text-sm text-gray-400 italic">
                          ยังไม่มีตัวเลือก
                        </p>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
