import React, { useEffect, useState } from "react";
import axios from "axios";
import { ChevronLeft, ChevronRight, FileText } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const API_BASE_URL =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:5001";

export default function MedicalCertificate() {
  const { token } = useAuth();
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/medical-certificates/my`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCertificates(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCertificates();
  }, [token]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen text-lg">
        กำลังโหลดข้อมูลใบรับรองแพทย์...
      </div>
    );
  }

  // Pagination logic
  const totalPages = Math.ceil(certificates.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = certificates.slice(startIndex, endIndex);

  const handlePrevPage = () => setCurrentPage((p) => Math.max(p - 1, 1));
  const handleNextPage = () => setCurrentPage((p) => Math.min(p + 1, totalPages));

  return (
    <div className="mt-16 container mx-auto p-4 md:p-8">
      <h2 className="text-3xl font-bold text-primary-default mb-6 text-center flex justify-center">
        ใบรับรองแพทย์ของฉัน
      </h2>

      {certificates.length === 0 ? (
        <div className="bg-white p-6 text-center shadow-lg rounded-lg">
          <p className="text-gray-600">คุณยังไม่มีใบรับรองแพทย์</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white shadow-xl rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-yellow-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-primary-default uppercase tracking-wider">
                  #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-primary-default uppercase tracking-wider">
                  วันที่ออก
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-primary-default uppercase tracking-wider">
                  ชื่อแพทย์
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-primary-default uppercase tracking-wider">
                  การวินิจฉัย
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-primary-default uppercase tracking-wider">
                  คำแนะนำ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-primary-default uppercase tracking-wider text-center">
                  ดาวน์โหลด
                </th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
              {currentItems.map((c, index) => (
                <tr
                  key={c.cert_id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 text-sm text-gray-700 text-center">
                    {startIndex + index + 1}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap">
                    {new Date(c.issued_at).toLocaleDateString("th-TH")}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {c.doctor_full_name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700 break-words">
                    {c.reason || "-"}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700 break-words">
                    {c.other_notes || "-"}
                  </td>
                  <td className="px-6 py-4 text-sm text-center">
                    {c.public_url && c.public_url !== "undefined" ? (
                      <a
                        href={c.public_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 text-secondary-default hover:text-secondary-dark underline"
                      >
                        <FileText size={16} /> ดาวน์โหลด
                      </a>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* ✅ Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 py-4 border-t border-gray-200">
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  currentPage === 1
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-primary-default hover:bg-gray-100"
                }`}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <span className="text-sm text-gray-700">
                หน้า <span className="font-semibold">{currentPage}</span> จาก{" "}
                <span className="font-semibold">{totalPages}</span>
              </span>

              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  currentPage === totalPages
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-primary-default hover:bg-gray-100"
                }`}
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
