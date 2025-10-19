import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import FormGroup from "../components/common/FormGroup";
import Button from "../components/common/Button";
import { toast } from "react-toastify";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5001";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [hn, setHn] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [gender, setGender] = useState("female");
  const role = "patient";
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  const handleNext = () => {
    setError("");

    if (!hn || !firstName || !lastName || !dateOfBirth || !gender) {
      setError("กรุณากรอกข้อมูลผู้ป่วยให้ครบถ้วน");
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
      setError("ผู้ใช้ควรมีอายุไม่ต่ำกว่า 12 ปี");
      return;
    }

    if (gender !== "female") {
      setError("คลินิกนี้สำหรับผู้หญิงเท่านั้น");
      return;
    }

    if (!/^\d{7}$/.test(hn)) {
      setError("หมายเลข HN ต้องเป็นตัวเลข 7 หลัก");
      return;
    }

    setStep(2);
  };

  const handleBack = () => {
    setStep(1);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validate password
    if (password !== confirmPassword) {
      setError("รหัสผ่านไม่ตรงกัน");
      setLoading(false);
      return;
    }

    const formData = {
      email,
      password,
      role,
      hn,
      firstName,
      lastName,
      dateOfBirth,
      phoneNumber,
      gender,
    };

    try {
      // ✅ ตรวจสอบ blacklist ก่อน
      console.log("🔍 Checking blacklist for HN:", hn);
      console.log("📍 API URL:", `${API_BASE_URL}/api/auth/check-blacklist`);

      const checkRes = await axios.post(
        `${API_BASE_URL}/api/auth/check-blacklist`,
        { hn },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("✅ Blacklist check response:", checkRes.data);

      if (checkRes.data.isBlacklisted) {
        toast.error(
          "ผู้ป่วยรายนี้ถูกระงับบัญชี เนื่องจากยกเลิกนัดเกิน 3 ครั้ง โปรดติดต่อเจ้าหน้าที่เพื่อปลดล็อกบัญชี",
          {
            autoClose: 5000,
          }
        );
        setLoading(false);
        return;
      }

      // ✅ ไม่ได้ถูก blacklist - เก็บข้อมูลไว้ชั่วคราว
      console.log("✅ Not blacklisted - saving to localStorage");
      localStorage.setItem("pendingRegistration", JSON.stringify(formData));

      // พาไปหน้า Terms
      toast.info("กรุณายอมรับข้อตกลงและเงื่อนไข");
      navigate("/terms");
    } catch (error) {
      console.error("❌ Error:", error);
      console.error("❌ Response:", error.response);

      if (error.code === "ERR_NETWORK") {
        toast.error("ไม่สามารถเชื่อมต่อกับ Server ได้ กรุณาลองอีกครั้ง");
      } else if (error.response?.status === 404) {
        toast.error("ไม่พบ API endpoint กรุณาติดต่อผู้ดูแลระบบ");
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("เกิดข้อผิดพลาดในการตรวจสอบข้อมูล");
      }
    } finally {
      setLoading(false);
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
                {step === 1 ? "50%" : "100%"}
              </span>
            </div>
          </div>
          <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-stromboli-200">
            <div
              style={{ width: `${step === 1 ? "50%" : "100%"}` }}
              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary-default transition-all duration-500 ease-in-out"
            ></div>
          </div>
        </div>

        <h2 className="text-3xl font-bold text-center text-primary-default mb-8">
          ลงทะเบียนผู้ป่วย
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

          {step === 1 && (
            <>
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

              <FormGroup
                label="เพศ"
                as="select"
                id="gender"
                name="gender"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                required
                options={[{ value: "female", label: "หญิง" }]}
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

              <div className="flex justify-end mt-6">
                <Button
                  type="button"
                  className="w-full bg-primary-default hover:bg-stromboli-400 text-white"
                  onClick={handleNext}
                >
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
                placeholder="ใส่รหัสผ่าน (อย่างน้อย 6 ตัวอักษร)"
                required
                minLength={6}
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

              <div className="flex justify-between mt-6">
                <Button
                  type="button"
                  variant="secondary"
                  className="w-1/2 mr-2 bg-stromboli-400"
                  onClick={handleBack}
                  disabled={loading}
                >
                  ย้อนกลับ
                </Button>
                <Button
                  type="submit"
                  variant="success"
                  className="w-1/2 ml-2 bg-primary-default hover:bg-stromboli-400 text-white"
                  disabled={loading}
                >
                  {loading ? "กำลังตรวจสอบ..." : "ถัดไป"}
                </Button>
              </div>
            </>
          )}

          <p className="text-center text-sm mt-4 text-gray-600">
            มีบัญชีอยู่แล้ว?{" "}
            <Link
              to="/login"
              className="text-secondary-default hover:underline font-semibold"
            >
              เข้าสู่ระบบที่นี่
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register;