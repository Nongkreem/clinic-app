import axios from 'axios';
import React, { useEffect, useState } from 'react'

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001';

const Appoinment = () => {
    const [services, setServices] = useState([]);
    const [error, setError] = useState("");

    useEffect(()=>{
        const fetchServices = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/api/services`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}`}
                    
                });
                setServices(response.data);
                console.log("Services fetched and set:", response.data);
            } catch(err){
                console.error('Failed to fetch services:', err)
                setError('ไม่สามารถโหลดข้อมูลบริการได้')
            }
        };
        fetchServices();
    }, []);
    console.log("services: ", services);

  return (
    <div>
      <h2>เลือกบริการ</h2>

    </div>
  )
}

export default Appoinment
