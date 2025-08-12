import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import FormGroup from '../components/common/FormGroup';
import Button from '../components/common/Button';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const { login, loading } = useAuth(); // ใช้ loading จาก AuthContext
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    const result = await login(email, password);

    if (result.success) {
      setMessage(result.message);
      // Redirect based on role
      // ควรใช้ user จาก context โดยตรงหลังจาก login สำเร็จ
      const user = JSON.parse(localStorage.getItem('user')); // หรือดึงจาก useAuth().user ถ้ามีการ update state ทันที
      if (user) {
        switch (user.role) {
          case 'patient':
            navigate('/patient/home')
            break;
          case 'doctor':
            navigate('/doctor-dashboard');
            break;
          case 'nurse':
            navigate('/nurse-dashboard');
            break;
          case 'head_nurse':
            navigate('/head-nurse-dashboard');
            break;
          case 'admin':
            navigate('/admin-dashboard');
            break;
          default:
            navigate('/'); // Fallback
            break;
        }
      } else {
        navigate('/'); // Fallback if user data is missing
      }

    } else {
      setError(result.message);
    }

  };

   return (
    <div className="min-h-screen flex ">
      {/* Left side: green background and image */}
      <div className="hidden lg:flex w-1/2 bg-primary-default items-center justify-center relative overflow-hidden">
        {/* Replace with your image */}
        <img 
          src="https://source.unsplash.com/1600x900/?hospital,medical" 
          alt="Medical background"
          className="w-full h-full object-cover absolute inset-0"
        />
        <div className="absolute inset-0 bg-primary-default opacity-80"></div>
        <div className="relative text-white text-4xl font-bold z-10">ยินดีต้อนรับ</div>
      </div>

      {/* Right side: Login form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4">
        {/* Adjusted to remove the outer box and its padding/shadow */}
        <div className="w-96 max-w-lg">
          <h2 className="text-3xl font-bold text-center text-primary-default mb-8">เข้าสู่ระบบ</h2>
          <form onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md relative mb-6" role="alert">
                <span className="block sm:inline">{error}</span>
              </div>
            )}
            {message && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-md relative mb-6" role="alert">
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

            <Button type="submit" variant="primary" className="w-full mt-6" disabled={loading}>
              {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
            </Button>

            <p className="text-center text-sm mt-4 text-gray-600">
              ยังไม่มีบัญชีใช่ไหม?{' '}
              <Link to="/register" className="text-secondary-default hover:underline font-semibold">
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
