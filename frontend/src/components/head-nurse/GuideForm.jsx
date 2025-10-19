import React, { useState, useEffect } from 'react';
import FormGroup from '../common/FormGroup';
import Button from '../common/Button';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001';

const GuideForm = ({ initialData, onSaveSuccess, onCancel }) => {
  const [adviceText, setAdviceText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState(''); // อาจจะไม่ใช้ใน Form นี้ เพราะ parent จะจัดการ message

  // ตั้งค่าข้อมูลเริ่มต้นเมื่อ initialData เปลี่ยน (สำหรับการแก้ไข)
  useEffect(() => {
    if (initialData) {
      setAdviceText(initialData.advice_text || '');
    } else {
      setAdviceText(''); // เคลียร์ฟอร์มสำหรับการเพิ่มใหม่
    }
    setError(''); // เคลียร์ error เมื่อ initialData เปลี่ยน
  }, [initialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    if (!adviceText.trim()) {
      setError('กรุณากรอกข้อความคำแนะนำ');
      setLoading(false);
      return;
    }

    const guidanceData = {
      advice_text: adviceText.trim(),
    };

    try {
      if (initialData && initialData.advice_id) {
        // อัปเดตข้อมูล
        const response = await axios.put(`${API_BASE_URL}/api/guide/${initialData.advice_id}`, guidanceData, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        });
        setMessage(response.data.message || 'อัปเดตคำแนะนำสำเร็จ!');
      } else {
        // เพิ่มข้อมูลใหม่
        const response = await axios.post(`${API_BASE_URL}/api/guide`, guidanceData, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        });
        setMessage(response.data.message || 'เพิ่มคำแนะนำใหม่สำเร็จ!');
      }
      onSaveSuccess(); // เรียกฟังก์ชันเมื่อบันทึกสำเร็จ (เพื่อให้ parent ปิด modal และ refresh data)
    } catch (err) {
      console.error('Error saving guidance:', err);
      if (err.response && (err.response.status === 401 || err.response.status === 403)) {
        setError('ไม่ได้รับอนุญาตให้บันทึกข้อมูล กรุณาเข้าสู่ระบบด้วยบัญชีที่มีสิทธิ์');
      } else {
        setError(err.response?.data?.message || 'เกิดข้อผิดพลาดในการบันทึกคำแนะนำ');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-4" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      {message && ( // อาจจะไม่แสดง message ใน form นี้ เพราะ parent จะจัดการ
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg relative mb-4" role="alert">
          <span className="block sm:inline">{message}</span>
        </div>
      )}

      <FormGroup
        label="ข้อความคำแนะนำ"
        as="textarea"
        id="adviceText"
        name="adviceText"
        value={adviceText}
        onChange={(e) => setAdviceText(e.target.value)}
        placeholder="เช่น งดน้ำงดอาหาร 8 ชั่วโมง"
        rows={4}
        required
      />
      <div className="flex space-x-2 mt-4 justify-end"> {/* จัดปุ่มไปทางขวา */}
        <Button
          type="button" // เปลี่ยนเป็น type="button" เพื่อไม่ให้ submit form เมื่อกด cancel
          variant="secondary"
          onClick={onCancel}
          disabled={loading}
        >
          ยกเลิก
        </Button>
        <Button
          type="submit"
          variant={initialData ? 'primary' : 'success'}
          disabled={loading}
        >
          {loading ? 'กำลังบันทึก...' : (initialData ? 'บันทึกการแก้ไข' : 'เพิ่มคำแนะนำ')}
        </Button>
      </div>
    </form>
  );
};

export default GuideForm;