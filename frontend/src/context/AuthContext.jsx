import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
// สร้าง Context
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true); // สำหรับโหลดสถานะเริ่มต้น

  const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001';

  const initializeAuth = () => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      try {
        const decodedToken = jwtDecode(storedToken);
        // Check if token is expired
        if (decodedToken.exp * 1000 < Date.now()) {
          console.log('Token expired. Logging out.');
          logout();
          return;
        }
        setToken(storedToken);
        setUser({ email: decodedToken.email, role: decodedToken.role, id: decodedToken.id, entity_id: decodedToken.entity_id });
        axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
      } catch (e) {
        console.error("Failed to decode token or token is invalid", e);
        logout(); // Clear invalid token
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    initializeAuth();
  }, []); 

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/login`, { email, password });
      const { token, user: userData } = response.data; // user: userData เพื่อไม่ให้ชื่อซ้ำกับ state user
      
      localStorage.setItem('token', token);
            
      setToken(token);
      setUser({ email: userData.email, role: userData.role, id: userData.id, entity_id: userData.entity_id }); // ตั้งค่า user state
      
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

  
  const register = async (email, password, role, hn, firstName, lastName, dateOfBirth, phoneNumber, gender) => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/register`, {
        email,
        password,
        role,
        hn,           
        firstName,    
        lastName,     
        dateOfBirth,  
        phoneNumber,
        gender
      });
      setLoading(false);
      return response.data; // { success: true, message: '...' } or { success: false, message: '...' }
    } catch (error) {
      setLoading(false);
      console.error('Registration failed:', error.response?.data || error.message);
      return { success: false, message: error.response?.data?.message || 'การลงทะเบียนล้มเหลว' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setToken(null);
    delete axios.defaults.headers.common['Authorization'];
  };

  const authContextValue = {
    user,
    token,
    loading,
    isAuthenticated: !!user && !!token, // ตรวจสอบจาก user และ token state
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