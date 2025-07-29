import React, { useState, useEffect } from 'react';
import Button from './Button';
import Popup from './Popup';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001';


const ManagePageTemplate = ({
  pageTitle,
  addButtonLabel,
  tableHeaders,
  renderTableRow,
  PopupFormComponent,
  fetchItemsApi,
  deleteItemApi,
  itemIdentifierKey,
  popupTitlePrefix
}) => {
  const [items, setItems] = useState([]); // รายการข้อมูลทั้งหมด
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const [isPopupOpen, setIsPopupOpen] = useState(false); // สถานะ Modal
  const [editingItem, setEditingItem] = useState(null); // เก็บข้อมูลที่กำลังแก้ไข

  // ฟังก์ชันสำหรับดึงข้อมูลทั้งหมด
  const fetchItems = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`${API_BASE_URL}${fetchItemsApi}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setItems(response.data);
    } catch (err) {
      console.error(`Failed to fetch ${popupTitlePrefix} items:`, err);
      if (err.response && (err.response.status === 401 || err.response.status === 403)) {
        setError('ไม่ได้รับอนุญาตให้เข้าถึง กรุณาเข้าสู่ระบบด้วยบัญชีที่มีสิทธิ์');
      } else {
        setError(`ไม่สามารถโหลดข้อมูล${popupTitlePrefix}ได้`);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems(); // ดึงข้อมูลเมื่อ Component โหลดครั้งแรก
  }, [fetchItemsApi]); // ดึงใหม่ถ้า API endpoint เปลี่ยน

  const handleAddItem = () => {
    setEditingItem(null); // เคลียร์ข้อมูลสำหรับการเพิ่มใหม่
    setIsPopupOpen(true); // เปิด Modal
    setError(''); // เคลียร์ error
    setMessage(''); // เคลียร์ message
  };

  const handleEditItem = (item) => {
    setEditingItem(item); // ตั้งค่าข้อมูลที่จะแก้ไข
    setIsPopupOpen(true); // เปิด Modal
    setError(''); // เคลียร์ error
    setMessage(''); // เคลียร์ message
  };

  const handleDeleteItem = async (id) => {
    if (!window.confirm(`คุณแน่ใจหรือไม่ที่จะลบ${popupTitlePrefix}นี้?`)) {
      return;
    }
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const response = await axios.delete(`${API_BASE_URL}${deleteItemApi}/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setMessage(response.data.message || `ลบ${popupTitlePrefix}สำเร็จ!`);
      fetchItems(); // ดึงข้อมูลใหม่หลังจากลบ
    } catch (err) {
      console.error(`Error deleting ${popupTitlePrefix}:`, err);
      if (err.response && (err.response.status === 401 || err.response.status === 403)) {
        setError('ไม่ได้รับอนุญาตให้ลบข้อมูล กรุณาเข้าสู่ระบบด้วยบัญชีที่มีสิทธิ์');
      } else {
        setError(err.response?.data?.message || `เกิดข้อผิดพลาดในการลบ${popupTitlePrefix}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSuccess = () => {
    setIsPopupOpen(false); // ปิด Modal
    setEditingItem(null); // เคลียร์ข้อมูลที่แก้ไข
    fetchItems(); // ดึงข้อมูลใหม่
    setMessage(`บันทึกข้อมูล${popupTitlePrefix}สำเร็จ!`); // แสดง Success message ที่หน้าหลัก
  };

  const handleClosePopup = () => {
    setIsPopupOpen(false);
    setEditingItem(null); // เคลียร์ข้อมูลที่แก้ไข
    setError(''); // เคลียร์ error
    setMessage(''); // เคลียร์ message
  };

  return (
    <div className="m-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-primary-default">{pageTitle}</h2>
        <Button variant="success" onClick={handleAddItem}>
          {addButtonLabel}
        </Button>
      </div>

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

      {/* ตารางแสดงรายการ */}
      {loading && items.length === 0 ? (
        <div className="flex items-center justify-center h-24">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
          <p className="ml-4 text-gray-700">กำลังโหลด{popupTitlePrefix}...</p>
        </div>
      ) : items.length === 0 ? (
        <p className="text-gray-600 text-center">ยังไม่มี{popupTitlePrefix}</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-stromboli-100">
              <tr>
                {tableHeaders.map((header, index) => (
                  <th key={index} className="py-3 px-4 text-left text-xs font-semibold text-black uppercase tracking-wider">
                    {header.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {items.map((item, index) => (
                // renderTableRow จะรับ item, handleEditItem, handleDeleteItem ไปสร้างแต่ละแถว
                <React.Fragment key={item[itemIdentifierKey]}>
                  {renderTableRow(item, index ,handleEditItem, handleDeleteItem)}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal สำหรับเพิ่ม/แก้ไขข้อมูล */}
      <Popup
        isOpen={isPopupOpen}
        onClose={handleClosePopup}
        title={editingItem ? `แก้ไข${popupTitlePrefix}` : `เพิ่ม${popupTitlePrefix}ใหม่`}
      >
        {/* ModalFormComponent จะถูกส่งเข้ามาเป็น Prop */}
        <PopupFormComponent
          initialData={editingItem}
          onSaveSuccess={handleSaveSuccess}
          onCancel={handleClosePopup}
        />
      </Popup>
    </div>
  );
};

export default ManagePageTemplate;
