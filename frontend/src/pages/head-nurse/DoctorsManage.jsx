import React from 'react';
import ManagePageTemplate from '../../components/common/ManagePageTemplate';
import DoctorForm from '../../components/head-nurse/DoctorForm'; // นำเข้า DoctorForm

const DoctorsManage = () => {

  // กำหนด Headers สำหรับตาราง
  const tableHeaders = [
    { key: 'doctor_id', label: 'รหัสแพทย์' },
    { key: 'full_name', label: 'ชื่อเต็ม' },
    { key: 'phone_number', label: 'เบอร์โทร' },
    { key: 'email', label: 'อีเมล' },
    { key: 'services', label: 'บริการที่ให้' }, // คอลัมน์สำหรับแสดงบริการ
    { key: 'actions', label: '' }, // คอลัมน์สำหรับปุ่ม แก้ไข/ลบ
  ];

  // ฟังก์ชันสำหรับ Render แต่ละแถวของตาราง (ส่งให้ ManagePageTemplate)
  const renderDoctorTableRow = (doctor, index, handleEdit, handleDelete) => (
    <tr key={doctor.doctor_id} className="hover:bg-gray-50">
      <td className="py-3 px-4 whitespace-nowrap text-sm text-gray-700">{doctor.doctor_id}</td>
      <td className="py-3 px-4 whitespace-nowrap text-sm text-gray-700">{doctor.full_name}</td>
      <td className="py-3 px-4 whitespace-nowrap text-sm text-gray-700">{doctor.phone_number || '-'}</td>
      <td className="py-3 px-4 text-sm text-gray-700">{doctor.email || '-'}</td>
      <td className="py-3 px-4 text-sm text-gray-700">
        {/* แสดงบริการเป็นรายการ */}
        {doctor.services && doctor.services.length > 0 ? (
          <ul className="list-disc list-inside">
            {doctor.services.map(service => (
              <li key={service.service_id}>{service.service_name}</li>
            ))}
          </ul>
        ) : (
          '-'
        )}
      </td>
      <td className="py-3 px-4 whitespace-nowrap text-sm">
        <div className="flex space-x-2">
          <button
            onClick={() => handleEdit(doctor)}
            className="px-3 py-1 text-xs bg-primary-default text-white rounded-lg hover:bg-primary-dark transition duration-200"
          >
            แก้ไข
          </button>
          <button
            onClick={() => handleDelete(doctor.doctor_id)}
            className="px-3 py-1 text-xs bg-secondary-default text-white rounded-lg hover:bg-secondary-dark transition duration-200"
          >
            ลบ
          </button>
        </div>
      </td>
    </tr>
  );

  return (
    <ManagePageTemplate
      pageTitle="จัดการข้อมูลแพทย์"
      addButtonLabel="+ เพิ่มแพทย์"
      tableHeaders={tableHeaders}
      renderTableRow={renderDoctorTableRow}
      PopupFormComponent={DoctorForm}
      fetchItemsApi="/api/doctors" // Endpoint สำหรับดึงข้อมูลแพทย์
      deleteItemApi="/api/doctors" // Endpoint สำหรับลบข้อมูลแพทย์
      itemIdentifierKey="doctor_id" // Key ที่ใช้ระบุ ID ของแพทย์
      popupTitlePrefix="แพทย์"
    />
  );
};

export default DoctorsManage;