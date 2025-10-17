import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5001";

export default function SymptomAssessment() {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/symptom-assessment/question`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setQuestions(res.data);
      } catch (err) {
        console.error(err);
        toast.error("ไม่สามารถโหลดแบบประเมินได้");
      }
    };
    fetchQuestions();
  }, [token]);

  const handleChange = (questionId, choiceId) => {
    setAnswers((prev) => ({ ...prev, [questionId]: choiceId }));
  };

  const handleSubmit = async () => {
    // แปลง object -> array
    const payload = {
      answers: Object.entries(answers).map(([qId, cId]) => ({
        question_id: Number(qId),
        choice_id: Number(cId),
      })),
    };

    if (payload.answers.length !== questions.length) {
      toast.warning("กรุณาตอบคำถามให้ครบทุกข้อ");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post(
        `${API_BASE_URL}/api/symptom-assessment/submit`,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setResult(res.data);
      toast.success("ส่งแบบประเมินสำเร็จ");
    } catch (err) {
      console.error(err);
      toast.error("เกิดข้อผิดพลาดในการส่งแบบประเมิน");
    } finally {
      setLoading(false);
    }
  };

  return (
      <div className="mt-24 pb-24 max-w-2xl mx-auto p-6 bg-white">
        <h1 className="text-2xl font-bold mb-8 text-center text-primary-default">แบบประเมินอาการเบื้องต้น</h1>

      {/* แบบประเมิน */}
      {result ? (
        <ResultDisplay result={result} />
      ) : (
        <>
          {questions.map((q) => (
            <div key={q.question_id} className="mb-6 border-b pb-4">
              <p className="font-semibold mb-2">
                {q.question_text}
              </p>
              <div className="flex flex-col gap-2">
                {q.choices.map((ch) => (
                  <label key={ch.choice_id} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name={`q-${q.question_id}`}
                      value={ch.choice_id}
                      checked={answers[q.question_id] === ch.choice_id}
                      onChange={() => handleChange(q.question_id, ch.choice_id)}
                    />
                    <span>{ch.choice_text}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-stromboli-600 text-white py-2 rounded-xl hover:bg-stromboli-700 disabled:opacity-50"
          >
            {loading ? "กำลังส่ง..." : "ส่งแบบประเมิน"}
          </button>
        </>
      )}
    </div>
  );
}

// ===== แสดงผลการประเมิน =====
function ResultDisplay({ result }) {
  const navigate = useNavigate();
  // หากมีหลายบริการที่คะแนนสูงสุดเท่ากัน
  const maxScore = Math.max(...result.scores.map((s) => s.total_score));
  const topServices = result.scores.filter((s) => s.total_score === maxScore);

  return (
    <div className="text-center">
      <h2 className="text-xl font-bold mb-4 text-green-800">ผลการประเมินของคุณ</h2>

      {topServices.length > 1 ? (
        <p className="mb-2 text-gray-800">
          ระบบแนะนำให้เข้ารับบริการในหน่วยต่อไปนี้ (คะแนนสูงสุดเท่ากัน)
        </p>
      ) : (
        <p className="mb-2 text-gray-800">
          ระบบแนะนำให้เข้ารับบริการ:
        </p>
      )}

      <ul className="list-disc text-left inline-block mb-4">
        {topServices.map((s) => (
          <li key={s.service_id}>
            <span className="font-semibold text-secondary-default">{s.service_name}</span> — คะแนนรวม {s.total_score}
          </li>
        ))}
      </ul>

      <div className="mt-6">
        <p className="text-gray-700 font-semibold mb-4">คะแนนรวมต่อหน่วยบริการทั้งหมด:</p>
        <table className="w-full text-sm border">
          <thead className="bg-secondary-gold">
            <tr>
              <th className="border p-2">หน่วยบริการ</th>
              <th className="border p-2">คะแนนรวม</th>
            </tr>
          </thead>
          <tbody>
            {result.scores.map((s) => (
              <tr key={s.service_id}>
                <td className="border p-2">{s.service_name}</td>
                <td className="border p-2">{s.total_score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-8 flex justify-end">
          <div
            onClick={() => navigate("/patient/create-appointment")}
            className="cursor-pointer transition border-b border-stromboli-600 text-stromboli-600 hover:text-stromboli-800"
          >
            สร้างนัดหมายเลย
          </div>
        </div>
    </div>
  );
}
