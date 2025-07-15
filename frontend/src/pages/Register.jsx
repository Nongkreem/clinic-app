// frontend/src/pages/Register.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import FormGroup from '../components/common/FormGroup';
import Button from '../components/common/Button';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  // กำหนดบทบาทเป็น 'patient' โดยอัตโนมัติ
  const role = 'patient';
  // ไม่จำเป็นต้องมี entityId สำหรับ patient
  const entityId = null;

  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (password !== confirmPassword) {
      setError('รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน');
      return;
    }

    // เรียกใช้ฟังก์ชัน register โดยส่งบทบาท 'patient' และ entityId เป็น null
    const result = await register(email, password, role, entityId);

    if (result.success) {
      setMessage(result.message + ' ตอนนี้คุณสามารถเข้าสู่ระบบได้แล้ว');
      setTimeout(() => {
        navigate('/login');
      }, 2000); // Redirect to login after 2 seconds
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-green-600 mb-8">ลงทะเบียนผู้ป่วย</h2>
        <form onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-6" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          {message && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg relative mb-6" role="alert">
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
          />

          <FormGroup
            label="รหัสผ่าน"
            type="password"
            id="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="ใส่รหัสผ่าน"
            required
          />

          <FormGroup
            label="ยืนยันรหัสผ่าน"
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="ยืนยันรหัสผ่าน"
            required
          />

          {/* ส่วนนี้ถูกนำออก: ตัวเลือกบทบาท และ Entity ID */}

          <Button type="submit" variant="success" className="w-full mt-6" disabled={loading}>
            {loading ? 'กำลังลงทะเบียน...' : 'ลงทะเบียน'}
          </Button>

          <p className="text-center text-sm mt-4 text-gray-600">
            มีบัญชีอยู่แล้ว?{' '}
            <Link to="/login" className="text-blue-500 hover:underline font-semibold">
              เข้าสู่ระบบที่นี่
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register;