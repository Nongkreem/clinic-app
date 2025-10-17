import React, { useState, useEffect } from 'react';
import {assets} from '../../public/assets/assets'
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001';


const ServiceDetail = () => {
  
  const [services, setServices] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchPublicServices = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await axios.get(`${API_BASE_URL}/api/services/publish`); 
      
      setServices(response.data);
      console.log(services)
    } catch (err) {
      console.error('Failed to fetch public services:', err);
      setError('ไม่สามารถโหลดข้อมูลบริการได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPublicServices(); 
  }, []);

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
      <h1 className="text-4xl font-bold text-center text-pavlova-600 mb-4">บริการของเรา</h1>
      <div className="w-16 h-[1px] bg-primary-default mx-auto rounded-full mb-10"></div>
      {services.length === 0 ? (
        <p className="text-center text-gray-600 text-lg">ยังไม่มีบริการให้แสดงในขณะนี้</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service) => (
            <div
              key={service.service_id}
              className="mt-8 bg-white rounded-lg shadow-lg overflow-hidden transform transition-transform duration-300 hover:scale-105"
            >
              <img
                src={`/assets/${service.img_path}` || 'https://placehold.co/600x400/E0F2F7/000?text=No+Image'} 
                alt={service.service_name || 'Service Image'}
                className="w-full h-48 object-cover"
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
