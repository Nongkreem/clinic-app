import React, { useState, useEffect } from 'react';
import DoctorScheduleForm from '../../components/head-nurse/DoctorScheduleForm';
import FormGroup from '../../components/common/FormGroup';
import Button from '../../components/common/Button';
import Popup from '../../components/common/Popup';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001';

const DoctorScheduleManage = () => {
  const [filterServiceId, setFilterServiceId] = useState('');
  const [allServiceOptions, setAllServiceOptions] = useState([]);
  const [groupSchedules, setGroupSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // ฟังก์ชันจัดกลุ่มตารางออกตรวจตามวันที่
  const groupSchedulesByDate = (schedules) => {
    const group = {};
    schedules.forEach(schedule => {
      const date = new Date(schedule.schedule_date).toLocaleDateString('th-TH');
      
      if (!group[date]) {
        group[date] = {
          date: date,
          morning: [], // เก็บตารางช่วงเช้า (08:00-12:00)
          afternoon: [], // เก็บตารางช่วงบ่าย (13:00-16:00)
          fullDay: [] // เก็บตารางทั้งวัน (08:00-16:00)
        };
      }
      
      // ตรวจสอบเวลา
      const timeStart = schedule.time_start;
      const timeEnd = schedule.time_end;
      const hourStart = parseInt(timeStart.split(':')[0]);
      const hourEnd = parseInt(timeEnd.split(':')[0]);
      
      // หากเริ่ม 08:00 และจบ 16:00 หรือใกล้เคียง ถือว่าทั้งวัน
      if (hourStart <= 8 && hourEnd >= 16) {
        group[date].fullDay.push(schedule);
      } else if (hourStart >= 8 && hourStart < 12) {
        group[date].morning.push(schedule);
      } else if (hourStart >= 13 && hourStart <= 16) {
        group[date].afternoon.push(schedule);
      }
    });
    return Object.values(group);
  };

  // ฟังก์ชันดึงข้อมูลตารางออกตรวจ
  const fetchSchedules = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/schedules${filterServiceId ? `?serviceId=${filterServiceId}` : ''}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );
      const groupedData = groupSchedulesByDate(response.data);
      setGroupSchedules(groupedData);
    } catch (err) {
      console.error('Failed to fetch schedules:', err);
      if (err.response && (err.response.status === 401 || err.response.status === 403)) {
        setError('ไม่ได้รับอนุญาตให้เข้าถึง กรุณาเข้าสู่ระบบด้วยบัญชีที่มีสิทธิ์');
      } else {
        setError('ไม่สามารถโหลดข้อมูลตารางออกตรวจได้');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, [filterServiceId]);

  // ดึงข้อมูลบริการสำหรับ filter dropdown
  useEffect(() => {
    const fetchServiceOptions = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_BASE_URL}/api/services`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAllServiceOptions([
          { value: '', label: 'ทั้งหมด' },
          ...response.data.map(item => ({
            value: item.service_id.toString(),
            label: item.service_name
          }))
        ]);
      } catch (err) {
        console.error('Failed to fetch service options for filter:', err);
      }
    };
    fetchServiceOptions();
  }, []);

  // ฟังก์ชันเพิ่มตารางใหม่
  const handleAddItem = () => {
    setEditingItem(null);
    setIsPopupOpen(true);
    setError('');
    setMessage('');
  };

  // ฟังก์ชันแก้ไขตาราง
  const handleEditItem = (item) => {
    console.log('Item to edit:', item);
    setEditingItem(item);
    setIsPopupOpen(true);
    setError('');
    setMessage('');
  };

  // ฟังก์ชันลบตาราง
  const handleDeleteItem = async (id) => {
    if (!window.confirm('คุณแน่ใจหรือไม่ที่จะลบตารางออกตรวจนี้?')) {
      return;
    }
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const response = await axios.delete(`${API_BASE_URL}/api/schedules/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setMessage(response.data.message || 'ลบตารางออกตรวจสำเร็จ!');
      fetchSchedules(); // ดึงข้อมูลใหม่หลังจากลบ
    } catch (err) {
      console.error('Error deleting schedule:', err);
      if (err.response && (err.response.status === 401 || err.response.status === 403)) {
        setError('ไม่ได้รับอนุญาตให้ลบข้อมูล กรุณาเข้าสู่ระบบด้วยบัญชีที่มีสิทธิ์');
      } else {
        setError(err.response?.data?.message || 'เกิดข้อผิดพลาดในการลบตารางออกตรวจ');
      }
    } finally {
      setLoading(false);
    }
  };

  // ฟังก์ชันเมื่อบันทึกสำเร็จ
  const handleSaveSuccess = () => {
    setIsPopupOpen(false);
    setEditingItem(null);
    fetchSchedules(); // ดึงข้อมูลใหม่
    setMessage('บันทึกข้อมูลตารางออกตรวจสำเร็จ!');
  };

  // ฟังก์ชันปิด popup
  const handleClosePopup = () => {
    setIsPopupOpen(false);
    setEditingItem(null);
    setError('');
    setMessage('');
  };

  // ฟังก์ชันแสดงรายการแพทย์ในแต่ละช่วงเวลา
  const renderDoctorSchedules = (schedules) => {
    if (schedules.length === 0) {
      return <span className="text-gray-400">-</span>;
    }

    return (
      <div className="space-y-2">
        {schedules.map(schedule => (
          <div key={schedule.ds_id} className="bg-gray-50 p-2 rounded border">
            <div className="font-medium text-sm text-gray-800">
              {schedule.doctor_full_name}
            </div>
            <div className="text-xs text-gray-600">
              {schedule.service_name}
            </div>
            <div className="text-xs text-gray-500 mb-1">
              {schedule.time_start.slice(0, 5)} - {schedule.time_end.slice(0, 5)}
            </div>
            <div className="flex space-x-1">
              <button
                onClick={() => handleEditItem(schedule)}
                className="px-2 py-1 text-xs bg-primary-default text-white rounded hover:bg-stromboli-800 transition duration-200"
              >
                แก้ไข
              </button>
              <button
                onClick={() => handleDeleteItem(schedule.ds_id)}
                className="px-2 py-1 text-xs bg-secondary-default text-white rounded hover:bg-pavlova-700 transition duration-200"
              >
                ลบ
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // ฟังก์ชันแสดงแพทย์ทั้งวัน
  const renderFullDaySchedules = (schedules) => {
    if (schedules.length === 0) {
      return null;
    }

    return (
      <div className="  ">
        <div className="space-y-2">
          {schedules.map(schedule => (
            <div key={schedule.ds_id} className="bg-pavlova-50 border border-pavlova-200 p-3 rounded-lg">
              <div className="font-medium text-sm text-secondary-dark">
                {schedule.doctor_full_name}
              </div>
              <div className="text-xs text-secondary-dark">
                {schedule.service_name}
              </div>
              <div className="text-xs text-secondary-dark mb-2">
                {schedule.time_start.slice(0, 5)} - {schedule.time_end.slice(0, 5)}
              </div>
              <div className="flex space-x-1">
                <button
                  onClick={() => handleEditItem(schedule)}
                  className="px-2 py-1 text-xs bg-primary-default text-white rounded hover:bg-stromboli-800 transition duration-200"
                >
                  แก้ไข
                </button>
                <button
                  onClick={() => handleDeleteItem(schedule.ds_id)}
                  className="px-2 py-1 text-xs bg-secondary-default text-white rounded hover:bg-pavlova-700 transition duration-200"
                >
                  ลบ
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // ฟังก์ชันแสดงแต่ละแถวในตาราง
  const renderGroupedScheduleRow = (group, index) => {
    const hasFullDay = group.fullDay.length > 0;
    
    return (
      <tr key={group.date} className="hover:bg-gray-50 border-t border-gray-200">
        <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-700 font-medium">{index + 1}</td>
        <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-700 font-medium">{group.date}</td>
        <td className="py-4 px-4 text-sm text-gray-700">
            {renderDoctorSchedules(group.morning)}
        </td>
        <td className="py-4 px-4 text-sm text-gray-700">
            {renderDoctorSchedules(group.afternoon)}
        </td>
        <td className="py-4 px-4 text-sm text-gray-700">
          {renderFullDaySchedules(group.fullDay)}
        </td>
            
      </tr>
    );
  };

  return (
    <div className="m-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-primary-default">จัดการตารางออกตรวจ</h2>
        <Button variant="success" onClick={handleAddItem}>
          + เพิ่มตารางออกตรวจ
        </Button>
      </div>

      {/* Filter Section */}
      <div className="mb-4 w-full md:w-1/3">
        <FormGroup
          as="select"
          label="กรองตามบริการ"
          id="filterService"
          name="filterService"
          value={filterServiceId}
          onChange={(e) => setFilterServiceId(e.target.value)}
          options={allServiceOptions}
          className="mb-0"
        />
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-4" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      {message && (
        <div className="bg-stromboli-100 border border-stromboli-400 text-primary-default px-4 py-3 rounded-lg relative mb-4" role="alert">
          <span className="block sm:inline">{message}</span>
        </div>
      )}

      {/* Table */}
      {loading && groupSchedules.length === 0 ? (
        <div className="flex items-center justify-center h-24">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
          <p className="ml-4 text-gray-700">กำลังโหลดตารางออกตรวจ...</p>
        </div>
      ) : groupSchedules.length === 0 ? (
        <p className="text-gray-600 text-center">ยังไม่มีตารางออกตรวจ</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-stromboli-100">
              <tr>
                <th className="py-3 px-4 text-left text-xs font-semibold text-black uppercase tracking-wider">
                  ลำดับ
                </th>
                <th className="py-3 px-4 text-left text-xs font-semibold text-black uppercase tracking-wider">
                  วันที่
                </th>
                <th className="py-3 px-4 text-left text-xs font-semibold text-black uppercase tracking-wider">
                  ช่วงเช้า (08:00-12:00)
                </th>
                <th className="py-3 px-4 text-left text-xs font-semibold text-black uppercase tracking-wider">
                  ช่วงบ่าย (13:00-16:00)
                </th>
                <th className="py-3 px-4 text-left text-xs font-semibold text-black uppercase tracking-wider">
                  ทั้งวัน (08:00-16:00)
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {groupSchedules.map((group, index) => (
                <React.Fragment key={group.date}>
                  {renderGroupedScheduleRow(group, index)}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Popup Modal */}
      <Popup
        isOpen={isPopupOpen}
        onClose={handleClosePopup}
        title={editingItem ? 'แก้ไขตารางออกตรวจ' : 'เพิ่มตารางออกตรวจใหม่'}
      >
        <DoctorScheduleForm
          initialData={editingItem}
          onSaveSuccess={handleSaveSuccess}
          onCancel={handleClosePopup}
        />
      </Popup>
    </div>
  );
};

export default DoctorScheduleManage;