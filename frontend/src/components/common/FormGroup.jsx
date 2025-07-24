/**
 * Component สำหรับกลุ่ม Form Input (Label + Input, Textarea, Select)
 * @param {Object} props - Props สำหรับ Component
 * @param {string} props.label - ข้อความ Label
 * @param {string} [props.as='input'] - ชนิดของ Element ที่จะ Render ('input', 'textarea', 'select')
 * @param {string} [props.type='text'] - ชนิดของ input (สำหรับ as='input' เท่านั้น: text, email, password, number ฯลฯ)
 * @param {string} props.id - ID สำหรับ input และ htmlFor ของ label
 * @param {string} props.name - ชื่อสำหรับ input
 * @param {string|number} props.value - ค่าปัจจุบันของ input
 * @param {function} props.onChange - Handler เมื่อค่า input เปลี่ยน
 * @param {boolean} [props.required=false] - กำหนดว่า input นี้จำเป็นต้องกรอกหรือไม่
 * @param {string} [props.placeholder] - Placeholder text
 * @param {string} [props.className] - Custom CSS class เพิ่มเติม
 * @param {Array<Object>} [props.options=[]] - Array ของ { value: string|number, label: string } สำหรับ as='select'
 * @param {number} [props.rows=3] - จำนวนแถวสำหรับ as='textarea'
 * @param {boolean} [props.readOnly=false] - กำหนดว่า input เป็นแบบอ่านอย่างเดียวหรือไม่
 */
const FormGroup = ({
  label,
  as = 'input', // 'input', 'textarea', 'select'
  type = 'text', // only for as='input'
  id,
  name,
  value,
  onChange,
  placeholder,
  required = false,
  className,
  options = [], // for as='select'
  rows = 3, // for as='textarea'
  readOnly = false // for auto-generated fields
}) => {
  const commonProps = {
    id,
    name,
    value,
    onChange,
    placeholder,
    required,
    className: `shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ${readOnly ? 'bg-gray-100 cursor-not-allowed' : ''}`
  };

  let inputElement;
  if (as === 'textarea') {
    inputElement = (
      <textarea
        {...commonProps}
        rows={rows}
        readOnly={readOnly}
      />
    );
  } else if (as === 'select') {
    inputElement = (
      <select
        {...commonProps}
        // สำหรับ select, ใช้ disabled แทน readOnly เพื่อป้องกันการเปลี่ยนแปลงค่า
        disabled={readOnly}
      >
        <option value="">-- เลือก --</option> {/* ตัวเลือกเริ่มต้น */}
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    );
  } else { // default to 'input'
    inputElement = (
      <input
        {...commonProps}
        type={type}
        readOnly={readOnly}
      />
    );
  }

  return (
    <div className={`mb-4 ${className || ''}`}>
      <label htmlFor={id} className="block text-gray-700 text-sm font-bold mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {inputElement}
    </div>
  );
};

export default FormGroup;