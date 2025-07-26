import React, { useState, useEffect } from 'react';
import FormGroup from '../common/FormGroup';
import Button from '../common/Button';
import axios from 'axios';
import { Plus, Trash2 } from 'lucide-react'; // นำเข้าไอคอน Plus และ Trash2

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001';

/**
 * Component สำหรับ Form เพิ่ม/แก้ไขข้อมูลบริการ
 * @param {Object} props - Props สำหรับ Component
 * @param {Object|null} props.initialData - ข้อมูลบริการเริ่มต้นสำหรับแก้ไข (null ถ้าเป็นการเพิ่มใหม่)
 * @param {function} props.onSaveSuccess - ฟังก์ชันที่จะถูกเรียกเมื่อบันทึกสำเร็จ
 * @param {function} props.onCancel - ฟังก์ชันที่จะถูกเรียกเมื่อยกเลิกการแก้ไข/เพิ่ม
 */
const ServiceForm = ({ initialData, onSaveSuccess, onCancel }) => {
  const [serviceName, setServiceName] = useState('');
  const [description, setDescription] = useState('');
  // selectedAdviceEntries: เก็บรายการของ { tempId: uniqueId, adviceId: 'value', adviceText: 'label' }
  const [selectedAdviceEntries, setSelectedAdviceEntries] = useState([]);
  const [preparationGuidanceAllOptions, setPreparationGuidanceAllOptions] = useState([]); // ตัวเลือกคำแนะนำทั้งหมด
  const [price, setPrice] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Effect สำหรับดึงตัวเลือกคำแนะนำการเตรียมตัวทั้งหมดจาก Backend
  useEffect(() => {
    const fetchPreparationGuidanceOptions = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/guide`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setPreparationGuidanceAllOptions(response.data.map(item => ({
          value: item.advice_id.toString(),
          label: item.advice_text
        })));
      } catch (err) {
        console.error('Failed to fetch preparation guidance options:', err);
        setError('ไม่สามารถโหลดตัวเลือกคำแนะนำการเตรียมตัวได้');
      }
    };
    fetchPreparationGuidanceOptions();
  }, []);

  // Effect สำหรับตั้งค่าข้อมูลเริ่มต้นเมื่อ initialData เปลี่ยน (สำหรับการแก้ไข)
  useEffect(() => {
    if (initialData) {
      setServiceName(initialData.service_name || '');
      setDescription(initialData.description || '');
      setPrice(initialData.price?.toString() || '');
      // โหลดคำแนะนำที่เลือกไว้เดิม
      if (initialData.preparation_guidances && Array.isArray(initialData.preparation_guidances)) {
        setSelectedAdviceEntries(
          initialData.preparation_guidances.map(advice => ({
            tempId: crypto.randomUUID(), // สร้าง tempId สำหรับ key
            adviceId: advice.advice_id.toString(),
            adviceText: advice.advice_text
          }))
        );
      } else {
        setSelectedAdviceEntries([]);
      }
    } else {
      // สำหรับการเพิ่มใหม่, เคลียร์ฟอร์ม
      setServiceName('');
      setDescription('');
      setSelectedAdviceEntries([]);
      setPrice('');
    }
    setError('');
  }, [initialData]);

  // ฟังก์ชันสำหรับเพิ่มช่องเลือกคำแนะนำใหม่
  const handleAddAdviceField = () => {
    setSelectedAdviceEntries(prevEntries => [
      ...prevEntries,
      { tempId: crypto.randomUUID(), adviceId: '', adviceText: '' } // เพิ่มช่องว่างพร้อม tempId
    ]);
  };

  // ฟังก์ชันสำหรับลบช่องเลือกคำแนะนำ
  const handleRemoveAdviceField = (tempIdToRemove) => {
    setSelectedAdviceEntries(prevEntries =>
      prevEntries.filter(entry => entry.tempId !== tempIdToRemove)
    );
  };

  // ฟังก์ชันสำหรับจัดการการเปลี่ยนแปลงค่าในแต่ละ Dropdown
  const handleAdviceChange = (tempIdToUpdate, newAdviceId) => {
    setSelectedAdviceEntries(prevEntries =>
      prevEntries.map(entry => {
        if (entry.tempId === tempIdToUpdate) {
          const selectedOption = preparationGuidanceAllOptions.find(opt => opt.value === newAdviceId);
          return {
            ...entry,
            adviceId: newAdviceId,
            adviceText: selectedOption ? selectedOption.label : ''
          };
        }
        return entry;
      })
    );
  };

  // ฟังก์ชันสำหรับกรองตัวเลือกที่ยังไม่ถูกเลือก
  const getAvailableOptions = (currentAdviceId) => {
    const currentlySelectedIds = selectedAdviceEntries
      .map(entry => entry.adviceId)
      .filter(id => id && id !== currentAdviceId); // กรองเฉพาะที่ถูกเลือกแล้วและไม่ใช่ตัวปัจจุบัน

    return preparationGuidanceAllOptions.filter(option =>
      !currentlySelectedIds.includes(option.value)
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const adviceIdsToSend = selectedAdviceEntries
      .map(entry => parseInt(entry.adviceId, 10))
      .filter(id => !isNaN(id)); // กรองเฉพาะ ID ที่ถูกต้อง

    // Validation
    if (!serviceName.trim() || !description.trim() || !price || adviceIdsToSend.length === 0) {
      setError('กรุณากรอกข้อมูลให้ครบถ้วนและเลือกคำแนะนำอย่างน้อยหนึ่งรายการ');
      setLoading(false);
      return;
    }
    if (isNaN(price) || parseFloat(price) <= 0) {
      setError('ราคากรุณาระบุเป็นตัวเลขที่มากกว่า 0');
      setLoading(false);
      return;
    }

    const serviceData = {
      service_name: serviceName.trim(),
      description: description.trim(),
      price: parseFloat(price),
      advice_ids: adviceIdsToSend,
    };

    try {
      if (initialData && initialData.service_id) {
        // อัปเดตบริการ
        await axios.put(`${API_BASE_URL}/api/services/${initialData.service_id}`, serviceData, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
      } else {
        // สร้างบริการใหม่
        await axios.post(`${API_BASE_URL}/api/services`, serviceData, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
      }
      onSaveSuccess(); // แจ้ง Parent ว่าบันทึกสำเร็จ
    } catch (err) {
      console.error('Error saving service:', err);
      setError(err.response?.data?.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูลบริการ');
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

      {/* ชื่อบริการ */}
      <FormGroup
        label="ชื่อบริการ"
        type="text"
        id="serviceName"
        name="serviceName"
        value={serviceName}
        onChange={(e) => setServiceName(e.target.value)}
        placeholder="เช่น ตรวจภายใน, ฝากครรภ์"
        required
        className="mb-4"
      />

      {/* คำอธิบาย */}
      <FormGroup
        label="คำอธิบาย"
        as="textarea"
        id="description"
        name="description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="รายละเอียดของบริการ"
        rows={4}
        required
        className="mb-4"
      />

      {/* ส่วนสำหรับจัดการคำแนะนำการเตรียมตัวแบบ Dynamic */}
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          คำแนะนำการเตรียมตัว <span className="text-red-500">*</span>
        </label>
        {selectedAdviceEntries.map((entry, index) => (
          <div key={entry.tempId} className="flex items-center gap-2 mb-2">
            <FormGroup
              as="select"
              id={`preparationGuidance-${entry.tempId}`}
              name={`preparationGuidance-${entry.tempId}`}
              value={entry.adviceId}
              onChange={(e) => handleAdviceChange(entry.tempId, e.target.value)}
              options={getAvailableOptions(entry.adviceId)} // กรองตัวเลือก
              required
              className="flex-grow mb-0" // mb-0 เพื่อไม่ให้มี margin-bottom ซ้ำซ้อน
            />
            <Button
              type="button"
              variant="danger"
              onClick={() => handleRemoveAdviceField(entry.tempId)}
              className="p-2 h-10 w-10 flex items-center justify-center rounded-lg" // จัดปุ่มให้เป็นวงกลมเล็กๆ
            >
              <Trash2 size={18} />
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="secondary"
          onClick={handleAddAdviceField}
          className="w-full flex items-center justify-center gap-2 mt-2"
          disabled={selectedAdviceEntries.length >= preparationGuidanceAllOptions.length} // ปิดปุ่มถ้าเลือกครบแล้ว
        >
          <Plus size={18} />
          เพิ่มคำแนะนำ
        </Button>
        {selectedAdviceEntries.length === 0 && (
          <p className="text-red-500 text-xs mt-1">กรุณาเลือกคำแนะนำอย่างน้อยหนึ่งรายการ</p>
        )}
      </div>

      {/* ราคา */}
      <FormGroup
        label="ราคา (บาท)"
        type="number"
        id="price"
        name="price"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        placeholder="เช่น 1500"
        required
        className="mb-6"
      />

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
          {loading ? 'กำลังบันทึก...' : (initialData ? 'บันทึกการแก้ไข' : 'เพิ่มบริการ')}
        </Button>
      </div>
    </form>
  );
};

export default ServiceForm;