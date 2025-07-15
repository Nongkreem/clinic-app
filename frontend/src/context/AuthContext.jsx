import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

// สร้าง Context
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true); // สำหรับโหลดสถานะเริ่มต้น

  // อ่าน URL ของ Backend จาก .env.local
  // ใน Vite, ตัวแปรสภาพแวดล้อมต้องขึ้นต้นด้วย VITE_
  const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001';

  useEffect(() => {
    // โหลดข้อมูลจาก localStorage เมื่อ Component โหลดครั้งแรก
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      try {
        setUser(JSON.parse(storedUser));
        // ตั้งค่า default header สำหรับ axios เพื่อส่ง token ทุกครั้ง
        axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
      } catch (e) {
        console.error("Failed to parse user from localStorage", e);
        // ถ้า parse ไม่ได้ แสดงว่าข้อมูลเสียหาย ลบออก
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
    setLoading(false); // หยุดโหลดหลังจากตรวจสอบ localStorage
  }, []);

  /**
   * ฟังก์ชันสำหรับ Login
   * @param {string} email - อีเมลของผู้ใช้
   * @param {string} password - รหัสผ่านของผู้ใช้
   * @returns {Promise<Object>} - ผลลัพธ์การ Login (success, message)
   */
  const login = async (email, password) => {
    try {
      setLoading(true);
      const response = await axios.post(`${API_BASE_URL}/api/auth/login`, { email, password });
      const { token, user } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      setToken(token);
      setUser(user);
      // ตั้งค่า default header สำหรับ axios เพื่อส่ง token ทุกครั้ง
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      setLoading(false);
      return { success: true, message: response.data.message };
    } catch (error) {
      setLoading(false);
      console.error('Login failed:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'การเข้าสู่ระบบล้มเหลว'
      };
    }
  };

  /**
   * ฟังก์ชันสำหรับ Register
   * @param {string} email - อีเมลของผู้ใช้
   * @param {string} password - รหัสผ่านของผู้ใช้
   * @param {string} role - บทบาทของผู้ใช้ ('patient', 'doctor', 'nurse', 'head_nurse', 'admin')
   * @param {string} [entityId] - ID ของ Entity (เช่น ID แพทย์/พยาบาล) สำหรับบทบาทที่ไม่ใช่ patient
   * @returns {Promise<Object>} - ผลลัพธ์การ Register (success, message)
   */
  const register = async (email, password, role, entityId) => {
    try {
      setLoading(true);
      const response = await axios.post(`${API_BASE_URL}/api/auth/register`, { email, password, role, entityId });
      setLoading(false);
      return { success: true, message: response.data.message };
    } catch (error) {
      setLoading(false);
      console.error('Registration failed:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'การลงทะเบียนล้มเหลว'
      };
    }
  };

  /**
   * ฟังก์ชันสำหรับ Logout
   */
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    // ลบ default header สำหรับ axios
    delete axios.defaults.headers.common['Authorization'];
  };

  const authContextValue = {
    user,
    token,
    loading,
    isAuthenticated: !!user && !!token,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom Hook สำหรับเรียกใช้ AuthContext
export const useAuth = () => {
  return useContext(AuthContext);
};