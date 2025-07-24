import React from 'react';
import { X } from 'lucide-react'; // สำหรับ icon ปิด

/**
 * Component สำหรับ Modal/Popup
 * @param {Object} props - Props สำหรับ Component
 * @param {boolean} props.isOpen - สถานะว่า Modal เปิดอยู่หรือไม่
 * @param {function} props.onClose - ฟังก์ชันที่จะถูกเรียกเมื่อต้องการปิด Modal
 * @param {React.ReactNode} props.children - เนื้อหาที่จะแสดงภายใน Modal
 * @param {string} [props.title] - หัวข้อของ Modal
 * @param {string} [props.className] - Custom CSS class สำหรับ Modal content
 */
const Popup = ({ isOpen, onClose, children, title, className }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className={`bg-white rounded-lg shadow-xl max-w-lg w-full transform transition-all duration-300 scale-100 opacity-100 ${className || ''}`}>
        {/* Modal Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Popup;