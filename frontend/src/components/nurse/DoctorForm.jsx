import React, { useState, useEffect } from 'react';
import FormGroup from '../common/FormGroup';
import Button from '../common/Button';
import axios from 'axios';
import { Plus, Trash2 } from 'lucide-react'; // นำเข้าไอคอน Plus และ Trash2

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001';

/**
 * Component สำหรับ Form เพิ่ม/แก้ไขข้อมูลแพทย์
 * @param {Object} props - Props สำหรับ Component
 * @param {Object|null} props.initialData - ข้อมูลแพทย์เริ่มต้นสำหรับแก้ไข (null ถ้าเป็นการเพิ่มใหม่)
 * @param {function} props.onSaveSuccess - ฟังก์ชันที่จะถูกเรียกเมื่อบันทึกสำเร็จ
 * @param {function} props.onCancel - ฟังก์ชันที่จะถูกเรียกเมื่อยกเลิกการแก้ไข/เพิ่ม
 */
const DoctorForm = ({ initialData, onSaveSuccess, onCancel }) => {
  const [doctorId, setDoctorId] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  // selectedServiceEntries: เก็บรายการของ { tempId: uniqueId, serviceId: 'value', serviceName: 'label' }
  const [selectedServiceEntries, setSelectedServiceEntries] = useState([]);
  const [allServiceOptions, setAllServiceOptions] = useState([]); // ตัวเลือกบริการทั้งหมด
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Effect สำหรับดึงตัวเลือกบริการทั้งหมดจาก Backend
  useEffect(() => {
    const fetchServiceOptions = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/services`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setAllServiceOptions(response.data.map(item => ({
          value: item.service_id.toString(),
          label: item.service_name
        })));
      } catch (err) {
        console.error('Failed to fetch service options:', err);
        setError('ไม่สามารถโหลดตัวเลือกบริการได้');
      }
    };
    fetchServiceOptions();
  }, []);

  // Effect สำหรับตั้งค่าข้อมูลเริ่มต้นเมื่อ initialData เปลี่ยน (สำหรับการแก้ไข)
  useEffect(() => {
    if (initialData) {
      setDoctorId(initialData.doctor_id || '');
      setFullName(initialData.full_name || '');
      setPhone(initialData.phone_number || '');
      setEmail(initialData.email || '');
      // โหลดบริการที่เลือกไว้เดิม
      if (initialData.services && Array.isArray(initialData.services)) {
        setSelectedServiceEntries(
          initialData.services.map(service => ({
            tempId: crypto.randomUUID(), // สร้าง tempId สำหรับ key
            serviceId: service.service_id.toString(),
            serviceName: service.service_name
          }))
        );
      } else {
        setSelectedServiceEntries([]);
      }
    } else {
      // สำหรับการเพิ่มใหม่, เคลียร์ฟอร์ม
      setDoctorId('');
      setFullName('');
      setPhone('');
      setEmail('');
      setSelectedServiceEntries([]);
    }
    setError('');
  }, [initialData]);

  // ฟังก์ชันสำหรับเพิ่มช่องเลือกบริการใหม่
  const handleAddServiceField = () => {
    setSelectedServiceEntries(prevEntries => [
      ...prevEntries,
      { tempId: crypto.randomUUID(), serviceId: '', serviceName: '' } // เพิ่มช่องว่างพร้อม tempId
    ]);
  };

  // ฟังก์ชันสำหรับลบช่องเลือกบริการ
  const handleRemoveServiceField = (tempIdToRemove) => {
    setSelectedServiceEntries(prevEntries =>
      prevEntries.filter(entry => entry.tempId !== tempIdToRemove)
    );
  };

  // ฟังก์ชันสำหรับจัดการการเปลี่ยนแปลงค่าในแต่ละ Dropdown
  const handleServiceChange = (tempIdToUpdate, newServiceId) => {
    setSelectedServiceEntries(prevEntries =>
      prevEntries.map(entry => {
        if (entry.tempId === tempIdToUpdate) {
          const selectedOption = allServiceOptions.find(opt => opt.value === newServiceId);
          return {
            ...entry,
            serviceId: newServiceId,
            serviceName: selectedOption ? selectedOption.label : ''
          };
        }
        return entry;
      })
    );
  };

  // ฟังก์ชันสำหรับกรองตัวเลือกที่ยังไม่ถูกเลือก
  const getAvailableServiceOptions = (currentServiceId) => {
    const currentlySelectedIds = selectedServiceEntries
      .map(entry => entry.serviceId)
      .filter(id => id && id !== currentServiceId); // กรองเฉพาะที่ถูกเลือกแล้วและไม่ใช่ตัวปัจจุบัน

    return allServiceOptions.filter(option =>
      !currentlySelectedIds.includes(option.value)
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const serviceIdsToSend = selectedServiceEntries
      .map(entry => parseInt(entry.serviceId, 10))
      .filter(id => !isNaN(id)); // กรองเฉพาะ ID ที่ถูกต้อง

    // Validation
    if (!fullName.trim() || serviceIdsToSend.length === 0) {
      setError('กรุณากรอกชื่อเต็มและเลือกบริการที่ให้ได้อย่างน้อยหนึ่งรายการ');
      setLoading(false);
      return;
    }
    if (!initialData) {
      // ตรวจสอบความยาวรวมต้องเป็น 6 และรูปแบบต้องขึ้นต้นด้วย D ตามด้วยตัวเลข 5 หลัก
      if (doctorId.length !== 6 || !/^D\d{5}$/.test(doctorId)) {
        setError('รหัสประจำตัวแพทย์ต้องขึ้นต้นด้วย D และตามด้วยตัวเลข 5 หลัก');
        setLoading(false);
        return;
      }
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('รูปแบบอีเมลไม่ถูกต้อง');
      setLoading(false);
      return;
    }
    if (phone && !/^\d{9,10}$/.test(phone)) { // ตัวอย่าง: 9 หรือ 10 หลัก
      setError('รูปแบบเบอร์โทรศัพท์ไม่ถูกต้อง (ตัวเลข 9-10 หลัก)');
      setLoading(false);
      return;
    }

    const doctorData = {
      doctor_id: doctorId.trim(),
      full_name: fullName.trim(),
      phone_number: phone.trim(),
      email: email.trim(),
      service_ids: serviceIdsToSend,
    };
    console.log('Doctor data sent to backend:', doctorData); // <--- เพิ่มบรรทัดนี้

    try {
      if (initialData && initialData.doctor_id) {
        // อัปเดตแพทย์
        await axios.put(`${API_BASE_URL}/api/doctors/${initialData.doctor_id}`, doctorData, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
      } else {
        // สร้างแพทย์ใหม่
        await axios.post(`${API_BASE_URL}/api/doctors`, doctorData, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
      }
      onSaveSuccess(); // แจ้ง Parent ว่าบันทึกสำเร็จ
    } catch (err) {
      console.error('Error saving doctor:', err);
      setError(err.response?.data?.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูลแพทย์');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-4" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {/* รหัสประจำตัวแพทย์ (อ่านอย่างเดียวในโหมดแก้ไข) */}
      <FormGroup
        label="รหัสประจำตัวแพทย์ (6 หลัก)"
        type="text"
        id="doctorId"
        name="doctorId"
        value={doctorId}
        onChange={(e) => setDoctorId(e.target.value)}
        placeholder="รหัสประจำตัวแพทย์ (ขึ้นต้นด้วย D ตามด้วยตัวเลข 5 หลัก)"
        readOnly={!!initialData} // อ่านอย่างเดียวถ้าอยู่ในโหมดแก้ไข
        required
        className="mb-4"
      />

      {/* ชื่อเต็ม */}
      <FormGroup
        label="ชื่อเต็ม (มีคำนำหน้าชื่อ)"
        type="text"
        id="fullName"
        name="fullName"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        placeholder="เช่น พญ. สมศรี ใจดี"
        required
        className="mb-4"
      />

      {/* เบอร์โทรศัพท์ */}
      <FormGroup
        label="เบอร์โทรศัพท์"
        type="tel" // ใช้ type="tel" สำหรับเบอร์โทร
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
        id="email"
        name="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="เช่น doctor.name@example.com"
        className="mb-4"
      />

      {/* ส่วนสำหรับจัดการบริการที่แพทย์ให้แบบ Dynamic */}
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          บริการที่แพทย์ให้ <span className="text-red-500">*</span>
        </label>
        {selectedServiceEntries.map((entry, index) => (
          <div key={entry.tempId} className="flex items-center gap-2 mb-2">
            <FormGroup
              as="select"
              id={`service-${entry.tempId}`}
              name={`service-${entry.tempId}`}
              value={entry.serviceId}
              onChange={(e) => handleServiceChange(entry.tempId, e.target.value)}
              options={getAvailableServiceOptions(entry.serviceId)} // กรองตัวเลือก
              required
              className="flex-grow mb-0"
            />
            <Button
              type="button"
              variant="danger"
              onClick={() => handleRemoveServiceField(entry.tempId)}
              className="p-2 h-10 w-10 flex items-center justify-center rounded-lg"
            >
              <Trash2 size={18} />
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="secondary"
          onClick={handleAddServiceField}
          className="w-full flex items-center justify-center gap-2 mt-2"
          disabled={selectedServiceEntries.length >= allServiceOptions.length} // ปิดปุ่มถ้าเลือกครบแล้ว
        >
          <Plus size={18} />
          เพิ่มบริการ
        </Button>
        {selectedServiceEntries.length === 0 && (
          <p className="text-red-500 text-xs mt-1">กรุณาเลือกบริการอย่างน้อยหนึ่งรายการ</p>
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
          variant={initialData ? 'primary' : 'success'}
          disabled={loading}
        >
          {loading ? 'กำลังบันทึก...' : (initialData ? 'บันทึกการแก้ไข' : 'เพิ่มแพทย์')}
        </Button>
      </div>
    </form>
  );
};

export default DoctorForm;