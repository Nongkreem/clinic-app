import React, { useState, useEffect } from 'react';
import {assets} from '../assets/assets'
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001';


const ServiceDetail = () => {
  
  const [services, setServices] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // ✅ เปลี่ยนชื่อฟังก์ชันให้ชัดเจนและเรียกใช้ให้ถูกต้อง
  const fetchPublicServices = async () => {
    setLoading(true);
    setError('');

    try {
      // ✅ สำคัญ: Endpoint นี้จะต้องถูกตั้งค่าใน Backend ให้เข้าถึงได้โดยไม่ต้องใช้ Token
      // ผมแนะนำให้สร้าง Endpoint ใหม่ เช่น /api/public/services เพื่อความชัดเจน
      const response = await axios.get(`${API_BASE_URL}/api/public/services`); 
      // ✅ ไม่ต้องส่ง Authorization header เพราะเป็น Public Endpoint
      
      setServices(response.data); // ✅ กำหนดข้อมูลที่ได้ (ซึ่งควรเป็น Array) ให้กับ state 'services'
    } catch (err) {
      console.error('Failed to fetch public services:', err);
      // ข้อความ Error สำหรับผู้ใช้ทั่วไป (ไม่ควรแสดงรายละเอียดทางเทคนิคมากเกินไป)
      setError('ไม่สามารถโหลดข้อมูลบริการได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPublicServices(); // ✅ เรียกใช้ฟังก์ชันที่ถูกต้อง
  }, []); // Dependency array ว่างเปล่า เพื่อให้เรียกใช้แค่ครั้งเดียวเมื่อ Component ถูก Mount

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-gray-600">
        กำลังโหลดข้อมูลบริการ...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64 text-red-600">
        {error}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center text-gray-800 mb-10">บริการของเรา</h1>
      {services.length === 0 ? (
        <p className="text-center text-gray-600 text-lg">ยังไม่มีบริการให้แสดงในขณะนี้</p>
      ) : (
        // ✅ วนลูปเพื่อแสดงบริการแต่ละรายการ
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service) => (
            <div
              key={service.service_id} // ✅ ใช้ service_id เป็น key
              className="bg-white rounded-lg shadow-lg overflow-hidden transform transition-transform duration-300 hover:scale-105"
            >
              <img
                // ✅ ใช้ service.picture_path หรือใช้ placeholder หากไม่มี/ผิดพลาด
                src={service.picture_path || 'https://placehold.co/600x400/E0F2F7/000?text=No+Image'} 
                alt={service.service_name || 'Service Image'}
                className="w-full h-48 object-cover"
                // Fallback สำหรับรูปภาพที่โหลดไม่ได้
                onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/600x400/E0F2F7/000?text=Image+Error'; }} 
              />
              <div className="p-6">
                <h2 className="text-2xl font-semibold text-gray-800 mb-2">{service.service_name}</h2>
                <p className="text-gray-600 text-base leading-relaxed">
                  {service.description || 'ไม่มีคำอธิบายสำหรับบริการนี้'}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
export default ServiceDetail
