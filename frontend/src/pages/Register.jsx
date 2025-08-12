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
  // New state variables for patient information
  const [hn, setHn] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  // Role is fixed to 'patient' for this registration page
  const role = 'patient';

  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const { register, loading } = useAuth(); // Get the register function and loading state from AuthContext
  const navigate = useNavigate(); // For navigation after successful registration

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior
    setError(''); // Clear previous errors
    setMessage(''); // Clear previous messages

    // Basic client-side validation for password match
    if (password !== confirmPassword) {
      setError('รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน');
      return;
    }

    // Basic client-side validation for HN format (7 digits)
    if (!/^\d{7}$/.test(hn)) {
      setError('หมายเลข HN ต้องเป็นตัวเลข 7 หลัก');
      return;
    }

    // Basic client-side validation for phone number format (10 digits)
    if (!/^\d{10}$/.test(phoneNumber)) {
      setError('เบอร์โทรศัพท์ต้องเป็นตัวเลข 10 หลัก');
      return;
    }

    // Call the register function from AuthContext with all collected data
    const result = await register(
      email,
      password,
      role,
      hn,          // Pass HN
      firstName,   // Pass First Name
      lastName,    // Pass Last Name
      dateOfBirth, // Pass Date of Birth
      phoneNumber  // Pass Phone Number
    );

    if (result.success) {
      setMessage(result.message + ' ตอนนี้คุณสามารถเข้าสู่ระบบได้แล้ว');
      // Redirect to login page after a short delay
      setTimeout(() => {
        navigate('/login');
      }, 2000); 
    } else {
      setError(result.message); // Display error message from the backend
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-primary-default mb-8">ลงทะเบียนผู้ป่วย</h2>
        <form onSubmit={handleSubmit}>
          {/* Error and Message Display Areas */}
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

          {/* New Patient Registration Fields */}
          <FormGroup
            label="HN (หมายเลขผู้ป่วย 7 หลัก)"
            type="text"
            id="hn"
            name="hn"
            value={hn}
            onChange={(e) => setHn(e.target.value)}
            placeholder="เช่น 1234567"
            required
            pattern="\d{7}" // HTML5 pattern for 7 digits
            title="กรุณากรอก HN เป็นตัวเลข 7 หลัก"
          />

          <FormGroup
            label="ชื่อ"
            type="text"
            id="firstName"
            name="firstName"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="ชื่อจริง"
            required
          />

          <FormGroup
            label="นามสกุล"
            type="text"
            id="lastName"
            name="lastName"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="นามสกุล"
            required
          />

          <FormGroup
            label="วันเดือนปีเกิด"
            type="date"
            id="dateOfBirth"
            name="dateOfBirth"
            value={dateOfBirth}
            onChange={(e) => setDateOfBirth(e.target.value)}
            required
          />

          <FormGroup
            label="เบอร์โทรศัพท์"
            type="tel" // Use type="tel" for phone numbers
            id="phoneNumber"
            name="phoneNumber"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="เช่น 0812345678"
            required
            pattern="\d{10}" // HTML5 pattern for 10 digits
            title="กรุณากรอกเบอร์โทรศัพท์เป็นตัวเลข 10 หลัก"
          />

          {/* Existing Email and Password Fields */}
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

          {/* Submit Button */}
          <Button type="submit" variant="success" className="w-full mt-6" disabled={loading}>
            {loading ? 'กำลังลงทะเบียน...' : 'ลงทะเบียน'}
          </Button>

          {/* Link to Login Page */}
          <p className="text-center text-sm mt-4 text-gray-600">
            มีบัญชีอยู่แล้ว?{' '}
            <Link to="/login" className="text-secondary-default hover:underline font-semibold">
              เข้าสู่ระบบที่นี่
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register;
