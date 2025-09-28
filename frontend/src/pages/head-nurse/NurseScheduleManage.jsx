import React, { useState, useEffect } from 'react';
import NurseScheduleForm from '../../components/head-nurse/NurseScheduleForm';
import Button from '../../components/common/Button';
import Popup from '../../components/common/Popup';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001';

const NurseScheduleManage = () => {
  const [groupSchedules, setGroupSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // ---- Group schedules by date ----
  const groupSchedulesByDate = (schedules) => {
    const group = {};
    schedules.forEach(schedule => {
      const date = new Date(schedule.schedule_date).toLocaleDateString('th-TH');

      if (!group[date]) {
        group[date] = {
          date,
          nurses: []
        };
      }
      group[date].nurses.push(schedule);
    });
    return Object.values(group);
  };

  // ---- Fetch Schedules ----
  const fetchSchedules = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`${API_BASE_URL}/api/nurse-schedules`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setGroupSchedules(groupSchedulesByDate(res.data));
    } catch (err) {
      console.error('Failed to fetch nurse schedules:', err);
      setError(err.response?.data?.message || 'ไม่สามารถโหลดข้อมูลตารางพยาบาลได้');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  // ---- Add/Edit ----
  const handleAddItem = () => {
    setEditingItem(null);
    setIsPopupOpen(true);
    setError('');
    setMessage('');
  };

  const handleEditItem = (item) => {
    setEditingItem(item);
    setIsPopupOpen(true);
    setError('');
    setMessage('');
  };

  const handleDeleteItem = async (id) => {
    if (!window.confirm('คุณแน่ใจหรือไม่ที่จะลบตารางนี้?')) return;

    setLoading(true);
    try {
      const res = await axios.delete(`${API_BASE_URL}/api/nurse-schedules/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setMessage(res.data.message || 'ลบตารางสำเร็จ');
      fetchSchedules();
    } catch (err) {
      console.error('Error deleting schedule:', err);
      setError(err.response?.data?.message || 'เกิดข้อผิดพลาดในการลบ');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (nurse_id, currentStatus) => {
    try {
      await axios.put(`${API_BASE_URL}/api/counter-terminal-schedules/toggle-status/${nurse_id}`,
        { status: !currentStatus },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      fetchSchedules();
      setMessage('อัปเดตสถานะสำเร็จ');
    } catch (err) {
      console.error('Error toggling status:', err);
      setError('เกิดข้อผิดพลาดในการเปลี่ยนสถานะ');
    }
  };

  const handleSaveSuccess = () => {
    setIsPopupOpen(false);
    setEditingItem(null);
    fetchSchedules();
    setMessage('บันทึกตารางสำเร็จ!');
  };

  const handleClosePopup = () => {
    setIsPopupOpen(false);
    setEditingItem(null);
    setError('');
    setMessage('');
  };

  // ---- Render rows ----
  const renderNurseRow = (nurse) => (
    <div key={nurse.ct_id} className="bg-gray-50 border rounded p-3 mb-2">
      <div className="flex justify-between items-center">
        <div>
          <div className="font-medium text-sm text-gray-800">
            {nurse.first_name} {nurse.last_name}
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => handleEditItem(nurse)}
            className="px-2 py-1 text-xs bg-primary-default text-white rounded hover:bg-primary-dark"
          >
            แก้ไข
          </button>
          <button
            onClick={() => handleDeleteItem(nurse.ct_id)}
            className="px-2 py-1 text-xs bg-secondary-default text-white rounded hover:bg-secondary-dark"
          >
            ลบ
          </button>
          <button
            onClick={() => handleToggleStatus(nurse.nurse_id, nurse.is_at_counter_terminal)}
            className={`px-2 py-1 text-xs text-white rounded ${nurse.is_at_counter_terminal ? 'bg-green-500' : 'bg-red-500'}`}
          >
            {nurse.is_at_counter_terminal ? 'เปิด' : 'ปิด'}
          </button>
        </div>
      </div>
    </div>
  );

  const renderGroupedRow = (group, index) => (
    <tr key={group.date} className="hover:bg-gray-50 border-t border-gray-200">
      <td className="py-4 px-4 whitespace-nowrap text-sm font-medium">{index + 1}</td>
      <td className="py-4 px-4 whitespace-nowrap text-sm font-medium">{group.date}</td>
      <td className="py-4 px-4 text-sm">
        {group.nurses.length > 0 ? group.nurses.map(renderNurseRow) : <span className="text-gray-400">-</span>}
      </td>
    </tr>
  );

  return (
    <div className="m-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-primary-default">จัดการตารางพยาบาลประจำ Counter Terminal</h2>
        <Button variant="success" onClick={handleAddItem}>
          + เพิ่มตาราง
        </Button>
      </div>

      {/* Messages */}
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">{error}</div>}
      {message && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-4">{message}</div>}

      {/* Table */}
      {loading && groupSchedules.length === 0 ? (
        <p className="text-center text-gray-600">กำลังโหลด...</p>
      ) : groupSchedules.length === 0 ? (
        <p className="text-center text-gray-600">ยังไม่มีตาราง</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-stromboli-100">
              <tr>
                <th className="py-3 px-4 text-left text-xs font-semibold uppercase">ลำดับ</th>
                <th className="py-3 px-4 text-left text-xs font-semibold uppercase">วันที่</th>
                <th className="py-3 px-4 text-left text-xs font-semibold uppercase">พยาบาลประจำ</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {groupSchedules.map((g, i) => renderGroupedRow(g, i))}
            </tbody>
          </table>
        </div>
      )}

      {/* Popup */}
      <Popup
        isOpen={isPopupOpen}
        onClose={handleClosePopup}
        title={editingItem ? 'แก้ไขตารางพยาบาล' : 'เพิ่มตารางพยาบาลใหม่'}
      >
        <NurseScheduleForm
          initialData={editingItem}
          onSaveSuccess={handleSaveSuccess}
          onCancel={handleClosePopup}
        />
      </Popup>
    </div>
  );
};

export default NurseScheduleManage;
