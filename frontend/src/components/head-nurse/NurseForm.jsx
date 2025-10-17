import React, { useState, useEffect } from "react";
import FormGroup from "../common/FormGroup";
import Button from "../common/Button";
import axios from "axios";
import ServiceDropdown from "../common/ServiceDropdown";
import { Mail, Phone } from "lucide-react";

const API_BASE_URL = "http://localhost:5001";

const NurseForm = ({ initialData, onSaveSuccess, onCancel }) => {
  const [nurseId, setNurseId] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [gmail, setGmail] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [allServiceOptions, setAllServiceOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Effect สำหรับดึงตัวเลือกบริการทั้งหมดจาก Backend
  useEffect(() => {
    const fetchServiceOptions = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/services`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setAllServiceOptions(response.data);
      } catch (err) {
        console.error("Failed to fetch service options:", err);
        setError("ไม่สามารถโหลดตัวเลือกบริการได้");
      }
    };
    fetchServiceOptions();
  }, []);

  // Effect สำหรับตั้งค่าข้อมูลเริ่มต้นเมื่อ initialData เปลี่ยน (สำหรับการแก้ไข)
  useEffect(() => {
    if (initialData) {
      setNurseId(initialData.nurse_id || "");
      setFirstName(initialData.first_name || "");
      setLastName(initialData.last_name || "");
      setPhone(initialData.phone || "");
      setGmail(initialData.gmail || "");
      setServiceId(
        initialData.service_id ? initialData.service_id.toString() : ""
      );
    } else {
      // สำหรับการเพิ่มใหม่, เคลียร์ฟอร์ม
      setNurseId("");
      setFirstName("");
      setLastName("");
      setPhone("");
      setGmail("");
      setServiceId("");
    }
    setError("");
  }, [initialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Validation
    if (!firstName.trim() || !lastName.trim() || !serviceId) {
      setError("กรุณากรอกชื่อ นามสกุล และเลือกบริการ");
      setLoading(false);
      return;
    }

    // Validation สำหรับโหมดสร้างใหม่เท่านั้น
    if (!initialData) {
      // ตรวจสอบความยาวรวมต้องเป็น 6 และรูปแบบต้องขึ้นต้นด้วย N ตามด้วยตัวเลข 5 หลัก
      if (nurseId.length !== 6 || !/^N\d{5}$/.test(nurseId)) {
        setError("รหัสประจำตัวพยาบาลต้องขึ้นต้นด้วย N และตามด้วยตัวเลข 5 หลัก");
        setLoading(false);
        return;
      }
    }

    // ตรวจสอบรูปแบบอีเมล 
    if (gmail && !/^[^\s@]+@vejnaree\.ac\.th$/.test(gmail)) {
      setError("อีเมลต้องลงท้ายด้วย @vejnaree.ac.th");
      setLoading(false);
      return;
    }

    // ตรวจสอบรูปแบบเบอร์โทรศัพท์ (ตัวเลข 9-10 หลัก)
    if (phone && !/^\d{9,10}$/.test(phone)) {
      setError("รูปแบบเบอร์โทรศัพท์ไม่ถูกต้อง (ตัวเลข 9-10 หลัก)");
      setLoading(false);
      return;
    }

    const nurseData = {
      nurse_id: nurseId.trim(),
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      phone: phone.trim(),
      gmail: gmail.trim(),
      service_id: parseInt(serviceId, 10),
    };

    try {
      if (initialData && initialData.nurse_id) {
        // อัปเดตพยาบาล
        await axios.put(
          `${API_BASE_URL}/api/nurses/${initialData.nurse_id}`,
          nurseData,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
      } else {
        // สร้างพยาบาลใหม่
        await axios.post(`${API_BASE_URL}/api/nurses`, nurseData, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
      }
      onSaveSuccess(); // แจ้ง Parent ว่าบันทึกสำเร็จ
    } catch (err) {
      console.error("Error saving nurse:", err);
      setError(
        err.response?.data?.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูลพยาบาล"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-4"
          role="alert"
        >
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {/* รหัสประจำตัวพยาบาล (อ่านอย่างเดียวในโหมดแก้ไข) */}
      <FormGroup
        label="รหัสประจำตัวพยาบาล (6 หลัก)"
        type="text"
        id="nurseId"
        name="nurseId"
        value={nurseId}
        onChange={(e) => setNurseId(e.target.value)}
        placeholder="รหัสประจำตัวพยาบาล (ขึ้นต้นด้วย N ตามด้วยตัวเลข 5 หลัก)"
        readOnly={!!initialData} // อ่านอย่างเดียวถ้าอยู่ในโหมดแก้ไข
        required
        className="mb-4"
      />

      {/* ชื่อจริง */}
      <FormGroup
        label="ชื่อ"
        type="text"
        id="firstName"
        name="firstName"
        value={firstName}
        onChange={(e) => setFirstName(e.target.value)}
        placeholder="เช่น สมศรี"
        required
        className="mb-4"
      />

      {/* นามสกุล */}
      <FormGroup
        label="นามสกุล"
        type="text"
        id="lastName"
        name="lastName"
        value={lastName}
        onChange={(e) => setLastName(e.target.value)}
        placeholder="เช่น ใจดี"
        required
        className="mb-4"
      />

      {/* เบอร์โทรศัพท์ */}
      <FormGroup
        label="เบอร์โทรศัพท์"
        type="tel"
        id="phone"
        name="phone"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="เช่น 0812345678"
        className="mb-4"
      />

      {/* อีเมล */}
      <FormGroup
        label="อีเมล"
        type="email"
        id="gmail"
        name="gmail"
        value={gmail}
        onChange={(e) => setGmail(e.target.value)}
        placeholder="เช่น nurse.name@hospital.com"
        className="mb-4"
      />

      {/* ส่วนสำหรับเลือกบริการ */}
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          บริการที่รับผิดชอบ <span className="text-red-500">*</span>
        </label>
        <ServiceDropdown
          value={serviceId}
          onChange={(selectedService) =>
            setServiceId(selectedService.service_id.toString())
          }
          options={allServiceOptions}
          className="w-full mb-0"
        />
        {!serviceId && (
          <p className="text-red-500 text-xs mt-1">กรุณาเลือกบริการ</p>
        )}
      </div>

      <div className="flex space-x-2 mt-4 justify-end">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={loading}
        >
          ยกเลิก
        </Button>
        <Button
          type="submit"
          variant={initialData ? "primary" : "success"}
          disabled={loading}
        >
          {loading
            ? "กำลังบันทึก..."
            : initialData
            ? "บันทึกการแก้ไข"
            : "เพิ่มพยาบาล"}
        </Button>
      </div>
    </form>
  );
};

export default NurseForm;
