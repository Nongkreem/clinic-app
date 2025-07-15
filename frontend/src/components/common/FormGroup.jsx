// frontend/src/components/common/FormGroup.jsx
import React from 'react';

/**
 * JSDoc Comment
 * Component สำหรับกลุ่ม Form Input (Label + Input)
 * @param {Object} props - Props สำหรับ Component
 * @param {string} props.label - ข้อความ Label
 * @param {string} props.id - ID สำหรับ input และ htmlFor ของ label
 * @param {string} props.type - ชนิดของ input (text, email, password, number ฯลฯ)
 * @param {string} props.value - ค่าปัจจุบันของ input
 * @param {function} props.onChange - Handler เมื่อค่า input เปลี่ยน
 * @param {boolean} [props.required=false] - กำหนดว่า input นี้จำเป็นต้องกรอกหรือไม่
 * @param {string} [props.placeholder] - Placeholder text
 * @param {string} [props.className] - Custom CSS class
 */
const FormGroup = ({ label, type = 'text', id, name, value, onChange, placeholder, required = false, className }) => {
  return (
    <div className={`mb-4 ${className || ''}`}>
      <label htmlFor={id} className="block text-gray-700 text-sm font-bold mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
      />
    </div>
  );
};

export default FormGroup;