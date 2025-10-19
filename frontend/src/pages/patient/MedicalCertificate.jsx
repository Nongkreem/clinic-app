import React, { useEffect, useState } from "react";
import axios from "axios";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5001";

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

  if (loading) return <div className="text-center mt-10">กำลังโหลดข้อมูล...</div>;

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = certificates.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(certificates.length / itemsPerPage);

  const handlePrevPage = () => currentPage > 1 && setCurrentPage(currentPage - 1);
  const handleNextPage = () => currentPage < totalPages && setCurrentPage(currentPage + 1);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
      <h1 className="mt-20 sm:mt-24 text-2xl sm:text-3xl lg:text-4xl font-extrabold text-primary-default mb-8 text-center">
        ใบรับรองแพทย์ของฉัน
      </h1>

      {certificates.length === 0 ? (
        <div className="text-center text-gray-500">ยังไม่มีใบรับรองแพทย์</div>
      ) : (
        <>
          {/* ตาราง */}
          <div className="overflow-x-auto bg-white rounded-xl shadow">
            <table className="min-w-full border-collapse text-sm sm:text-base">
              <thead className="bg-pavlova-200 text-pavlova-800">
                <tr>
                  <th className="px-3 sm:px-4 py-3 text-left">#</th>
                  <th className="px-3 sm:px-4 py-3 text-left whitespace-nowrap">วันที่ออก</th>
                  <th className="px-3 sm:px-4 py-3 text-left whitespace-nowrap">ชื่อแพทย์</th>
                  <th className="px-3 sm:px-4 py-3 text-left">การวินิจฉัย</th>
                  <th className="px-3 sm:px-4 py-3 text-left">คำแนะนำ</th>
                  <th className="px-3 sm:px-4 py-3 text-left whitespace-nowrap">ดาวน์โหลด</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((c, index) => (
                  <tr
                    key={c.cert_id}
                    className="border-t hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-3 sm:px-4 py-3 text-gray-700 text-center">
                      {indexOfFirstItem + index + 1}
                    </td>
                    <td className="px-3 sm:px-4 py-3 text-gray-700 whitespace-nowrap flex items-center gap-1">
                      {new Date(c.issued_at).toLocaleDateString("th-TH")}
                    </td>
                    <td className="px-3 sm:px-4 py-3 text-gray-700">{c.doctor_full_name}</td>
                    <td className="px-3 sm:px-4 py-3 text-gray-700 break-words">{c.reason}</td>
                    <td className="px-3 sm:px-4 py-3 text-gray-700 break-words">{c.other_notes}</td>
                    <td className="px-3 sm:px-4 py-3 text-secondary-default">
                      {c.public_url ? (
                        <a
                          href={c.public_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline hover:text-secondary-dark"
                        >
                          ดาวน์โหลด
                        </a>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex justify-between items-center mt-6 px-2 sm:px-4">
            {/* ปุ่มซ้าย */}
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className={`flex items-center gap-1 text-lg sm:text-xl ${
                currentPage === 1
                  ? "text-gray-300 cursor-not-allowed"
                  : "text-secondary-default hover:text-secondary-dark"
              }`}
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            {/* ตัวเลขกลาง */}
            <span className="text-gray-700 text-sm sm:text-base">
              หน้า {currentPage} จาก {totalPages}
            </span>

            {/* ปุ่มขวา */}
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className={`flex items-center gap-1 text-lg sm:text-xl ${
                currentPage === totalPages
                  ? "text-gray-300 cursor-not-allowed"
                  : "text-secondary-default hover:text-secondary-dark"
              }`}
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
