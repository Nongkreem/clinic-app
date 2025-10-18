// src/pages/doctor/MedicalCertificatePage.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import Button from "../../components/common/Button";
import Popup from "../../components/common/Popup";
import MedicalCertificateForm from "../../components/doctor/MedicalCertificateForm";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5001";

const MedicalCertificatePage = () => {
  const [certs, setCerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const fetchCerts = async () => {
    setLoading(true);
    setErr("");
    try {
      const res = await axios.get(`${API_BASE_URL}/api/medical-certificates/mine`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setCerts(res.data || []);
    } catch (e) {
      console.error(e);
      setErr("ไม่สามารถโหลดรายการใบรับรองแพทย์ได้");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCerts();
  }, []);

  const onCreated = () => {
    setIsOpen(false);
    fetchCerts();
  };

  const fmtDateTime = (d) =>
    d ? new Date(d).toLocaleString("th-TH", { dateStyle: "medium", timeStyle: "short" }) : "-";

  return (
    <div className="m-8">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-primary-default">ใบรับรองแพทย์</h2>
        <Button onClick={() => setIsOpen(true)}>ออกใบรับรองแพทย์</Button>
      </div>

      {err && (
        <div className="mb-4 rounded-lg border border-red-400 bg-red-100 px-4 py-3 text-red-700">
          {err}
        </div>
      )}

      <div className="rounded-xl ">
        {loading ? (
          <p className="text-center text-gray-500">กำลังโหลด...</p>
        ) : certs.length === 0 ? (
          <p className="text-center text-gray-500">ยังไม่มีใบรับรองแพทย์</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full overflow-hidden rounded-lg bg-white">
              <thead className="bg-pavlova-100">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">รหัส</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">ผู้ป่วย</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">วันที่ออก</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">เหตุผล</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">ไฟล์</th>
                </tr>
              </thead>
              <tbody>
                {certs.map((c) => (
                  <tr key={c.cert_id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-800">{c.cert_id}</td>
                    <td className="px-4 py-3 text-sm text-gray-800">
                      {c.patient_first_name} {c.patient_last_name} (HN: {c.hn})
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-800">{fmtDateTime(c.issued_at)}</td>
                    <td className="px-4 py-3 text-sm text-gray-800">{c.reason || "-"}</td>
                    <td className="px-4 py-3 text-sm text-stromboli-400">
                      {c.public_url ? (
                        <a
                          href={`${API_BASE_URL}${c.public_url}`}
                          target="_blank"
                          rel="noreferrer"
                          className="underline hover:no-underline"
                        >
                          เปิดดู
                        </a>
                      ) : (
                        "-"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Popup isOpen={isOpen} onClose={() => setIsOpen(false)} title="ออกใบรับรองแพทย์">
        <MedicalCertificateForm onCreated={onCreated} onCancel={() => setIsOpen(false)} />
      </Popup>
    </div>
  );
};

export default MedicalCertificatePage;