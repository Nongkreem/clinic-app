import React, { useState, useEffect } from 'react';
import FormGroup from "../common/FormGroup";
import Button from "../common/Button";
import axios from "axios";
import { Plus, Trash2 } from "lucide-react";

const API_BASE_URL =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:5001";

const ClinicRoomForm = ({ initialData, onSaveSuccess, onCancel }) => {
  const [roomName, setRoomName] = useState("");

  const [selectedServiceEntries, setSelectedServiceEntries] = useState([]);
  const [allServiceOptions, setAllServiceOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchServiceOptions = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/services`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setAllServiceOptions(
          response.data.map((item) => ({
            value: item.service_id.toString(),
            label: item.service_name,
          }))
        );
      } catch (err) {
        console.error("Failed to fetch service options:", err);
        setError("ไม่สามารถโหลดตัวเลือกบริการได้");
      }
    };
    fetchServiceOptions();
  }, []);

  useEffect(() => {
    if (initialData) {
      setRoomName(initialData.room_name || "");
      // โหลดบริการที่เลือกไว้เดิม
      if (initialData.services && Array.isArray(initialData.services)) {
        setSelectedServiceEntries(
          initialData.services.map((service) => ({
            tempId: crypto.randomUUID(), // สร้าง tempId สำหรับ key
            serviceId: service.service_id.toString(),
            serviceName: service.service_name,
          }))
        );
      } else {
        setSelectedServiceEntries([]);
      }
    } else {
      // สำหรับการเพิ่มใหม่, เคลียร์ฟอร์ม
      setRoomName("");
      setSelectedServiceEntries([]);
    }
    setError("");
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
    if (!roomName.trim() || serviceIdsToSend.length === 0) {
      setError('กรุณากรอกชื่อห้องและเลือกบริการที่ให้ได้อย่างน้อยหนึ่งรายการ');
      setLoading(false);
      return;
    }

    const roomData = {
      room_name: roomName.trim(),
      service_ids: serviceIdsToSend,
    };
    try {
      if (initialData && initialData.room_id) {
        // อัปเดตแพทย์
        await axios.put(`${API_BASE_URL}/api/rooms/${initialData.room_id}`, roomData, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
      } else {
        // สร้างแพทย์ใหม่
        await axios.post(`${API_BASE_URL}/api/rooms`, roomData, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
      }
      onSaveSuccess(); // แจ้ง Parent ว่าบันทึกสำเร็จ
    } catch (err) {
      console.error('Error saving room:', err);
      setError(err.response?.data?.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูลห้องตรวจได้');
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

      <FormGroup
        label="ชื่อห้องตรวจ"
        type="text"
        id="roomName"
        name="roomName"
        value={roomName}
        onChange={(e) => setRoomName(e.target.value)}
        placeholder="เช่น ห้องตรวจทั่วไป"
        required
        className="mb-4"
      />

      {/* จัดการบริการ */}
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          บริการที่รองรับ <span className="text-red-500">*</span>
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
          {loading ? 'กำลังบันทึก...' : (initialData ? 'บันทึกการแก้ไข' : 'เพิ่มห้อง')}
        </Button>
      </div>
    </form>
  );
};

export default ClinicRoomForm;
