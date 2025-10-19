import React, { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
// สร้าง Context
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true); // สำหรับโหลดสถานะเริ่มต้น

  const API_BASE_URL =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:5001";

  const initializeAuth = () => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      try {
        const decodedToken = jwtDecode(storedToken);
        // Check if token is expired
        if (decodedToken.exp * 1000 < Date.now()) {
          console.log("Token expired. Logging out.");
          logout();
          return;
        }
        setToken(storedToken);
        setUser({
          email: decodedToken.email,
          role: decodedToken.role,
          id: decodedToken.id,
          entity_id: decodedToken.entity_id,
          is_counter_terminal: decodedToken.is_counter_terminal,
          service_id:
            decodedToken.service_id ||
            localStorage.getItem("service_id") ||
            null,
        });
        axios.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${storedToken}`;
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
    // ล้าง token เก่า
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setToken(null);

    try {
      console.log("🛰️ API_BASE_URL =", API_BASE_URL);
      console.log("🛰️ Full endpoint =", `${API_BASE_URL}/api/auth/login`);

      const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
        email,
        password,
      });

      const { token, user: userData } = response.data; // user: userData เพื่อไม่ให้ชื่อซ้ำกับ state user
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userData));

      if (userData.service_id) {
        localStorage.setItem("service_id", userData.service_id);
      }

      setToken(token);
      setUser({
        email: userData.email,
        role: userData.role,
        id: userData.id,
        entity_id: userData.entity_id,
        is_counter_terminal: userData.is_counter_terminal,
        service_id: userData.service_id || null,
      }); // ตั้งค่า user state
      console.log("[AuthContext] service_id: ", userData.service_id);

      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      setLoading(false);
      return { success: true, message: response.data.message };
    } catch (error) {
      setLoading(false);
      console.error("Login failed:", error);
      // ตรวจจับ response ที่มาจาก backend
      const status = error.response?.status;
      const message = error.response?.data?.message || "การเข้าสู่ระบบล้มเหลว";

      console.error("Login failed:", status, message);

      // ถูกระงับ (Blacklisted)
      if (status === 403) {
        return {
          success: false,
          message:
            message ||
            "บัญชีผู้ป่วยนี้ถูกระงับการใช้งาน โปรดติดต่อเจ้าหน้าที่เพื่อปลดล็อก",
        };
      }

      // ไม่พบผู้ใช้
      if (status === 401) {
        return {
          success: false,
          message: message || "อีเมลหรือรหัสผ่านไม่ถูกต้อง",
        };
      }

      // ข้อมูลไม่ครบ
      if (status === 400) {
        return {
          success: false,
          message: message || "กรุณากรอกอีเมลและรหัสผ่านให้ครบถ้วน",
        };
      }
      return {
        success: false,
        message,
      };
    }
  };

  const register = async (
    email,
    password,
    role,
    hn,
    firstName,
    lastName,
    dateOfBirth,
    phoneNumber,
    gender
  ) => {
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
        gender,
      });
      setLoading(false);
      return {
        success: true,
        message: response.data?.message || "ลงทะเบียนสำเร็จ!",
      };
    } catch (error) {
      setLoading(false);
      const status = error.response?.status;
      const message = error.response?.data?.message || "การลงทะเบียนล้มเหลว";
      if (status === 403) {
        return {
          success: false,
          message:
            message ||
            "ไม่สามารถลงทะเบียนได้ เนื่องจากบัญชีนี้ถูกระงับ โปรดติดต่อเจ้าหน้าที่",
        };
      }
      if (status === 409) {
        return {
          success: false,
          message: message || "ข้อมูลนี้ถูกใช้งานแล้ว",
        };
      }

      return { success: false, message };
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setToken(null);
    delete axios.defaults.headers.common["Authorization"];
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
