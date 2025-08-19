import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import FormGroup from '../components/common/FormGroup'; // ✅ Import FormGroup
import Button from '../components/common/Button';     // ✅ Import Button


const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [hn, setHn] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [gender, setGender] = useState('female'); // Set default to female as per the request
  const role = 'patient';
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const { register, loading } = useAuth();
  const navigate = useNavigate(); 
  // State to manage the steps of the form
  const [step, setStep] = useState(1);

  const handleNext = () => {
    setError('');
    
    if (!hn || !firstName || !lastName || !dateOfBirth || !gender) {
      setError('กรุณากรอกข้อมูลผู้ป่วยให้ครบถ้วน');
      return;
    }
    
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();
    const dayDifference = today.getDate() - birthDate.getDate();

    if (monthDifference < 0 || (monthDifference === 0 && dayDifference < 0)) {
        age--;
    }

    if (age < 12) {
      setError('ผู้ใช้ควรมีอายุไม่ต่ำกว่า 10 ปี');
      return;
    }
    
    if (gender !== 'female') {
      setError('คลินิกนี้สำหรับผู้หญิงเท่านั้น');
      return;
    }

    if (!/^\d{7}$/.test(hn)) {
      setError('หมายเลข HN ต้องเป็นตัวเลข 7 หลัก');
      return;
    }

    setStep(2);
  };

  const handleBack = () => {
    setStep(1);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (password !== confirmPassword) {
      setError('รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน');
      return;
    }
    if (!/^\d{10}$/.test(phoneNumber)) {
      setError('เบอร์โทรศัพท์ต้องเป็นตัวเลข 10 หลัก');
      return;
    }

    const result = await register(
      email,
      password,
      role,
      hn,
      firstName,
      lastName,
      dateOfBirth,
      phoneNumber,
      gender
    );

    if (result.success) {
      setMessage(result.message + ' ตอนนี้คุณสามารถเข้าสู่ระบบได้แล้ว');
      setTimeout(() => {
        console.log('Navigating to login page...');
        navigate('/login');
      }, 2000); 
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md relative z-10">
        
        {/* Progress Bar */}
        <div className="relative pt-1">
          <div className="flex mb-2 items-center justify-between text-primary-default">
            <div>
              <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full bg-stromboli-100">
                ขั้นตอนที่ {step}
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs font-semibold inline-block">
                {step === 1 ? '50%' : '100%'}
              </span>
            </div>
          </div>
          <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-stromboli-200">
            <div 
              style={{ width: `${step === 1 ? '50%' : '100%'}` }} 
              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary-default transition-all duration-500 ease-in-out"
            ></div>
          </div>
        </div>
        
        <h2 className="text-3xl font-bold text-center text-primary-default mb-8">ลงทะเบียนผู้ป่วย</h2>
        
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

          {step === 1 && (
            <>
              {/* Using imported FormGroup Component */}
              <FormGroup
                label="HN (หมายเลขผู้ป่วย 7 หลัก)"
                type="text"
                id="hn"
                name="hn"
                value={hn}
                onChange={(e) => setHn(e.target.value)}
                placeholder="เช่น 1234567"
                required
                pattern="\d{7}"
                title="กรุณากรอก HN เป็นตัวเลข 7 หลัก"
              />

              {/* Using imported FormGroup Component with select type */}
              <FormGroup
                label="เพศ"
                as="select"
                id="gender"
                name="gender"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                required
                options={[{value: 'female', label: 'หญิง'}]}
              >
              </FormGroup>

              {/* Using imported FormGroup Component */}
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

              {/* Using imported FormGroup Component */}
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

              {/* Using imported FormGroup Component */}
              <FormGroup
                label="วันเดือนปีเกิด"
                type="date"
                id="dateOfBirth"
                name="dateOfBirth"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                required
              />

              <div className="flex justify-end mt-6">
                {/* Using imported Button Component */}
                <Button type="button" 
                className="w-full bg-primary-default hover:bg-stromboli-400 text-white"
                onClick={handleNext}>
                  ถัดไป
                </Button>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <FormGroup
                label="เบอร์โทรศัพท์"
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="เช่น 0812345678"
                required
                pattern="\d{10}"
                title="กรุณากรอกเบอร์โทรศัพท์เป็นตัวเลข 10 หลัก"
              />

              {/* Using imported FormGroup Component */}
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

              {/* Using imported FormGroup Component */}
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

              {/* Using imported FormGroup Component */}
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

              <div className="flex justify-between mt-6">
                {/* Using imported Button Component */}
                <Button type="button" variant="secondary" className="w-1/2 mr-2" onClick={handleBack}>
                  ย้อนกลับ
                </Button>
                {/* Using imported Button Component */}
                <Button type="submit" variant="success" 
                className="w-1/2 ml-2  bg-primary-default hover:bg-stromboli-400 text-white"  disabled={loading}>
                  {loading ? 'กำลังลงทะเบียน...' : 'ลงทะเบียน'}
                </Button>
              </div>
            </>
          )}

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
