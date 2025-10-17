import React, { useState } from "react";
import { useNavigate, Link, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import FormGroup from "../components/common/FormGroup";
import Button from "../components/common/Button";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const { login, loading } = useAuth(); // ใช้ loading จาก AuthContext
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");
  setMessage("");

  const result = await login(email, password);

  if (result.success) {
    const user = JSON.parse(localStorage.getItem("user"));

    if (user?.role) {
      switch (user.role) {
        case "patient":
          navigate("/patient/home", { replace: true });
          break;
        case "doctor":
          navigate("/doctor", { replace: true });
          break;
        case "nurse":
          navigate("/nurse", { replace: true });
          break;
        case "head_nurse":
          navigate("/head_nurse", { replace: true });
          break;
        default:
          navigate("/landing", { replace: true });
          break;
      }
    } else {
      setError("ไม่พบข้อมูลผู้ใช้หลังเข้าสู่ระบบ");
    }
  } else {
    setError(result.message || "เข้าสู่ระบบไม่สำเร็จ");
  }
};
const { isAuthenticated, user } = useAuth();

if (isAuthenticated && user?.role) {
  switch (user.role) {
    case "patient":
      return <Navigate to="/patient/home" replace />;
    case "doctor":
      return <Navigate to="/doctor" replace />;
    case "nurse":
      return <Navigate to="/nurse" replace />;
    case "head_nurse":
      return <Navigate to="/head_nurse" replace />;
    default:
      return <Navigate to="/landing" replace />;
  }
}

  return (
    <div className="min-h-screen flex ">
      {/* ส่วนซ้าย: พื้นหลังรูปภาพ */}
      {/* แก้ไขจาก bg-primary-default เป็นการใช้ backgroundImage */}
      <div
        className="hidden lg:flex w-1/2 items-center justify-center bg-cover bg-center relative"
        style={{
          backgroundImage: "url('/assets/pelvic-surgery-unit.jpg')",
        }}
      >
        {/* เพิ่ม overlay เพื่อทำให้ภาพจางลง */}
        <div className="absolute inset-0 bg-gray-900 opacity-40"></div>
        {/* ปรับขนาดตัวอักษรของข้อความ "ยินดีต้อนรับ" จาก text-4xl เป็น text-6xl */}
        <div className="relative text-white text-5xl font-bold drop-shadow-lg z-10">
          ยินดีต้อนรับ
        </div>
      </div>

      {/* ส่วนขวา: ฟอร์ม Login */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4">
        {/* ปรับขนาด container ของ form เป็นค่าที่กว้างขึ้น เช่น w-96 และ max-w-lg */}
        <div className="w-96 max-w-lg">
          <h2 className="text-3xl font-bold text-center text-primary-default mb-8">
            เข้าสู่ระบบ
          </h2>
          <form onSubmit={handleSubmit}>
            {error && (
              <div
                className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-6"
                role="alert"
              >
                <span className="block sm:inline">{error}</span>
              </div>
            )}
            {message && (
              <div
                className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg relative mb-6"
                role="alert"
              >
                <span className="block sm:inline">{message}</span>
              </div>
            )}

            <FormGroup
              label="อีเมล"
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ใส่อีเมลของคุณ"
              required
              inputClassName="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-default h-12"
            />

            <FormGroup
              label="รหัสผ่าน"
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="ใส่รหัสผ่านของคุณ"
              required
              inputClassName="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-default h-12"
            />

            <Button
              type="submit"
              variant="primary"
              className="w-full mt-6"
              disabled={loading}
            >
              {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
            </Button>

            <p className="text-center text-sm mt-4 text-gray-600">
              ยังไม่มีบัญชีใช่ไหม?{" "}
              <Link
                to="/register"
                className="text-secondary-default hover:underline font-semibold"
              >
                ลงทะเบียนที่นี่
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
