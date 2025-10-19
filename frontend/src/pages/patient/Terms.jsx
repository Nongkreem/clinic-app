import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Button from "../../components/common/Button";
import { toast } from "react-toastify";

const Terms = () => {
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();

  // ตรวจสอบว่ามีข้อมูล pending หรือไม่
  useEffect(() => {
    const pendingData = localStorage.getItem("pendingRegistration");
    console.log("Data from register", pendingData)
  }, []);

  const handleAgree = async () => {
    console.log("agree: ", agreed)
    if (!agreed) {
      toast.error("กรุณายอมรับข้อตกลงก่อนดำเนินการต่อ");
      return;
    }

    setLoading(true);

    const pendingData = JSON.parse(localStorage.getItem("pendingRegistration"));
    if (!pendingData) {
      toast.error("ไม่พบข้อมูลการลงทะเบียน โปรดลองใหม่อีกครั้ง");
      navigate("/register");
      return;
    }

    try {
      console.log("Registering user...");
      
      const res = await register(
        pendingData.email,
        pendingData.password,
        pendingData.role,
        pendingData.hn,
        pendingData.firstName,
        pendingData.lastName,
        pendingData.dateOfBirth,
        pendingData.phoneNumber,
        pendingData.gender
      );

      console.log("✅ Register result:", res);

      if (res?.success) {
        toast.success("ลงทะเบียนสำเร็จ! กรุณาเข้าสู่ระบบ", {
          autoClose: 3000,
        });
        
        // ลบข้อมูล pending
        localStorage.removeItem("pendingRegistration");
        
        // รอ toast แสดงแล้วพาไป login
        setTimeout(() => {
          navigate("/login");
        }, 1500);
      } else {
        toast.error(res?.message || "ไม่สามารถลงทะเบียนได้");
        
        // ถ้า error เกี่ยวกับ HN หรือ email ซ้ำ ให้กลับไป register
        if (res?.message?.includes("ถูกใช้") || res?.message?.includes("ซ้ำ")) {
          setTimeout(() => {
            navigate("/register");
          }, 2000);
        }
      }
    } catch (err) {
      console.error("Registration error:", err);
      toast.error("เกิดข้อผิดพลาดในการลงทะเบียน");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate("/register");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-3xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-primary-default">
          ข้อตกลงและเงื่อนไขการใช้บริการ
        </h1>

        <section className="mb-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            1. การรักษาข้อมูลทางการแพทย์และข้อมูลส่วนบุคคล
          </h2>
          <ul className="list-disc pl-6 space-y-2 text-gray-600">
            <li>
              โรงพยาบาลจะเก็บข้อมูลส่วนบุคคลของท่าน เช่น ชื่อ-นามสกุล หมายเลข HN
              วันเดือนปีเกิด หมายเลขโทรศัพท์ อีเมล และข้อมูลทางการแพทย์
              เพื่อใช้ในการให้บริการทางการแพทย์อย่างมีประสิทธิภาพ
            </li>
            <li>
              ข้อมูลของท่านจะถูกนำไปใช้เพื่อวัตถุประสงค์ทางการแพทย์ เช่น
              การวินิจฉัยโรค การรักษา การติดตามผล และการติดต่อแจ้งเตือนนัดหมาย
            </li>
            <li>
              โรงพยาบาลอาจเปิดเผยข้อมูลแก่บุคลากรทางการแพทย์หรือหน่วยงานที่เกี่ยวข้อง
              เพื่อประโยชน์ในการรักษาเท่านั้น
            </li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            2. เงื่อนไขในการจองนัดหมาย
          </h2>
          <ul className="list-disc pl-6 space-y-2 text-gray-600">
            <li>
              ผู้ใช้สามารถจองนัดหมายล่วงหน้าได้ไม่เกิน 1 วัน (24 ชั่วโมง)
              ก่อนวันเข้ารับบริการจริง
            </li>
            <li>
              หากผู้ใช้ยกเลิกนัดหมาย หรือไม่กดยืนยันเข้ารับการรักษา
              หลังจากที่พยาบาลอนุมัติคำขอแล้วเกิน 3 ครั้ง
              บัญชีจะถูกระงับการใช้งาน
            </li>
            <li>
              ผู้ใช้ที่ถูกระงับบัญชีต้องติดต่อเจ้าหน้าที่เพื่อปลดล็อกบัญชี
              และต้องชำระค่าเสียหายจำนวน 5,000 บาท
            </li>
          </ul>
        </section>

        <div className="flex items-center gap-3 mt-8">
          <input
            type="checkbox"
            id="agree"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="w-5 h-5 text-primary-default focus:ring-primary-default"
            style={{ accentColor: "#2F5233" }}
          />
          <label htmlFor="agree" className="text-gray-700 cursor-pointer">
            ฉันได้อ่านและยินยอมตามข้อตกลงและเงื่อนไขทั้งหมด
          </label>
        </div>

        <div className="mt-8 flex gap-4 justify-center">
          <Button
            onClick={handleBack}
            variant="secondary"
            disabled={loading}
            className="px-8 py-3"
          >
            ย้อนกลับ
          </Button>
          <Button
            onClick={handleAgree}
            disabled={!agreed || loading}
            variant="primary"
            className={`px-8 py-3 rounded-lg text-white font-semibold ${
              agreed && !loading
                ? "bg-primary-default hover:bg-stromboli-800"
                : "bg-gray-400 cursor-not-allowed"
            }`}
          >
            {loading ? "กำลังดำเนินการ..." : agreed ? "ยอมรับและลงทะเบียน" : "โปรดยินยอมก่อนดำเนินการต่อ"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Terms;