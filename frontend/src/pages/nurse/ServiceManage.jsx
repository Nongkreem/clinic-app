import React from 'react';
import ManagePageTemplate from '../../components/common/ManagePageTemplate';
import ServiceForm from '../../components/nurse/ServiceForm'; // นำเข้า ServiceForm

const ServiceManage = () => {

  // กำหนด Headers สำหรับตาราง (ไม่มี service_code แล้ว)
  const tableHeaders = [
    { key: 'service_id', label: 'ID' },
    { key: 'service_name', label: 'ชื่อบริการ' },
    { key: 'description', label: 'รายละเอียด' },
    { key: 'price', label: 'ราคา' },
    { key: 'preparation_guidances', label: 'คำแนะนำการเตรียมตัว' }, // คอลัมน์สำหรับแสดงคำแนะนำ
    { key: 'actions', label: '' }, // คอลัมน์สำหรับปุ่ม แก้ไข/ลบ
  ];


  // ฟังก์ชันสำหรับ Render แต่ละแถวของตาราง (ส่งให้ ManagePageTemplate)
  const renderServiceTableRow = (service, index, handleEdit, handleDelete) => (
    <tr key={service.service_id} className="hover:bg-gray-50">
      <td className="py-3 px-4 whitespace-nowrap text-sm text-gray-700">{index + 1}</td>
      {/* ไม่มี service.service_code แล้ว */}
      <td className="py-3 px-4 text-sm text-gray-700">{service.service_name}</td>
      <td className="py-3 px-4 text-sm text-gray-700">{service.description}</td>
      <td className="py-3 px-4 whitespace-nowrap text-sm text-gray-700">{service.price}</td>
      <td className="py-3 px-4 text-sm text-gray-700">
        {/* แสดงคำแนะนำเป็นรายการ */}
        {service.advice_arr && service.advice_arr.length > 0 ? (
          <ul className="list-disc list-inside">
            {service.advice_arr.map(advice => (
              <li key={advice.advice_id}>{advice.advice_text}</li>
            ))}
          </ul>
        ) : (
          '-'
        )}
      </td>
      <td className="py-3 px-4 whitespace-nowrap text-sm">
        <div className="flex space-x-2">
          <button
            onClick={() => handleEdit(service)}
            className="px-3 py-1 text-xs bg-primary-default text-white rounded-lg hover:bg-stromboli-800 transition duration-200"
          >
            แก้ไข
          </button>
          <button
            onClick={() => handleDelete(service.service_id)}
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
      pageTitle="จัดการข้อมูลบริการ"
      addButtonLabel="+ เพิ่มบริการ"
      tableHeaders={tableHeaders}
      renderTableRow={renderServiceTableRow}
      PopupFormComponent={ServiceForm}
      fetchItemsApi="/api/services" // Endpoint สำหรับดึงข้อมูลบริการ
      deleteItemApi="/api/services" // Endpoint สำหรับลบข้อมูลบริการ
      itemIdentifierKey="service_id" // Key ที่ใช้ระบุ ID ของบริการ
      popupTitlePrefix="บริการ"
    />
  );
};

export default ServiceManage;