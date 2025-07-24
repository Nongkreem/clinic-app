import React, { useState, useEffect } from 'react';
import Button from '../../components/common/Button';
import Popup from '../../components/common/Popup'; // นำเข้า Modal
import GuideForm from '../../components/GuideForm';

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001';

const GuideManage = () => {
  const [guidances, setGuidances] = useState([]); // รายการคำแนะนำทั้งหมด
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const [isPopupOpen, setIsPopupOpen] = useState(false); // สถานะ Modal
  const [editingGuidance, setEditingGuidance] = useState(null); // เก็บข้อมูลคำแนะนำที่กำลังแก้ไข

  // ฟังก์ชันสำหรับดึงข้อมูลคำแนะนำทั้งหมด
  const fetchGuidances = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`${API_BASE_URL}/api/guide`, { // Endpoint /api/guide ตามที่คุณใช้
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setGuidances(response.data);
    } catch (err) {
      console.error('Failed to fetch preparation guidances:', err);
      if (err.response && (err.response.status === 401 || err.response.status === 403)) {
        setError('ไม่ได้รับอนุญาตให้เข้าถึง กรุณาเข้าสู่ระบบด้วยบัญชีที่มีสิทธิ์');
      } else {
        setError('ไม่สามารถโหลดข้อมูลคำแนะนำการเตรียมตัวได้');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGuidances(); // ดึงข้อมูลเมื่อ Component โหลดครั้งแรก
  }, []);

  const handleAddGuidance = () => {
    setEditingGuidance(null); // เคลียร์ข้อมูลสำหรับการเพิ่มใหม่
    setIsPopupOpen(true);
    setError(''); // เคลียร์ error
    setMessage(''); // เคลียร์ message
  };

  const handleEdit = (guidance) => {
    setEditingGuidance(guidance); // ตั้งค่าข้อมูลที่จะแก้ไข
    setIsPopupOpen(true);
    setError(''); // เคลียร์ error
    setMessage(''); // เคลียร์ message
  };

  const handleDelete = async (id) => { // id ที่รับมาคือ advice_id
    if (!window.confirm('คุณแน่ใจหรือไม่ที่จะลบคำแนะนำนี้?')) {
      return;
    }
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const response = await axios.delete(`${API_BASE_URL}/api/guide/${id}`, { // Endpoint /api/guide ตามที่คุณใช้
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setMessage(response.data.message || 'ลบคำแนะนำสำเร็จ!');
      fetchGuidances(); // ดึงข้อมูลใหม่หลังจากลบ
    } catch (err) {
      console.error('Error deleting guidance:', err);
      if (err.response && (err.response.status === 401 || err.response.status === 403)) {
        setError('ไม่ได้รับอนุญาตให้ลบข้อมูล กรุณาเข้าสู่ระบบด้วยบัญชีที่มีสิทธิ์');
      } else {
        setError(err.response?.data?.message || 'เกิดข้อผิดพลาดในการลบคำแนะนำ');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSuccess = () => {
    setIsPopupOpen(false); // ปิด 
    setEditingGuidance(null); // เคลียร์ข้อมูลที่แก้ไข
    fetchGuidances(); // ดึงข้อมูลใหม่
    setMessage('บันทึกข้อมูลสำเร็จ!'); // แสดง Success message ที่หน้าหลัก
  };

  const handleClosePopup = () => {
    setIsPopupOpen(false);
    setEditingGuidance(null); // เคลียร์ข้อมูลที่แก้ไข
    setError(''); // เคลียร์ error
    setMessage(''); // เคลียร์ message
  };

  return (
    <div className="m-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-primary-default">จัดการคำแนะนำการเตรียมตัว</h2>
        <Button variant="success" onClick={handleAddGuidance}>
          + เพิ่ม
        </Button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-4" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      {message && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg relative mb-4" role="alert">
          <span className="block sm:inline">{message}</span>
        </div>
      )}

      {/* ตารางแสดงรายการคำแนะนำ */}
      
      {loading && guidances.length === 0 ? (
        <div className="flex items-center justify-center h-24">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
          <p className="ml-4 text-gray-700">กำลังโหลดคำแนะนำ...</p>
        </div>
      ) : guidances.length === 0 ? (
        <p className="text-gray-600 text-center">ยังไม่มีคำแนะนำการเตรียมตัว</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-stromboli-100">
              <tr>
                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 tracking-wider">ลำดับ</th>
                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 tracking-wider">คำแนะนำ</th>
                <th className="py-3 px-4 text-left text-xs font-semibold   tracking-wider"></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {guidances.map((guidance) => (
                <tr key={guidance.advice_id} className="hover:bg-gray-50">
                  <td className="py-3 px-4 whitespace-nowrap text-sm text-gray-700">{guidance.advice_id}</td>
                  <td className="py-3 px-4 text-sm text-gray-700">{guidance.advice_text}</td>
                  <td className="py-3 px-4 whitespace-nowrap text-sm">
                    <div className="flex space-x-2">
                      <Button
                        variant="secondary"
                        onClick={() => handleEdit(guidance)}
                        className="px-3 py-1 text-xs"
                      >
                        แก้ไข
                      </Button>
                      <Button
                        variant="danger"
                        onClick={() => handleDelete(guidance.advice_id)}
                        className="px-3 py-1 text-xs"
                      >
                        ลบ
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal สำหรับเพิ่ม/แก้ไขคำแนะนำ */}
      <Popup
        isOpen={isPopupOpen}
        onClose={handleClosePopup}
        title={editingGuidance ? 'แก้ไขคำแนะนำการเตรียมตัว' : 'เพิ่มคำแนะนำการเตรียมตัว'}
      >
        <GuideForm
          initialData={editingGuidance}
          onSaveSuccess={handleSaveSuccess}
          onCancel={handleClosePopup}
        />
      </Popup>
    </div>
  );
};

export default GuideManage;
