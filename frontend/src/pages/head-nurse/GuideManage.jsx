import React, { useState, useEffect } from 'react';
import GuideForm from '../../components/nurse/GuideForm';
import ManagePageTemplate from '../../components/common/ManagePageTemplate'
const GuideManage = () => {

  // กำหนด Headers สำหรับตาราง
  const tableHeaders = [
    { key: 'advice_id', label: 'ID' },
    { key: 'advice_text', label: 'ข้อความคำแนะนำ' },
    { key: 'actions', label: '' }, // คอลัมน์สำหรับปุ่ม แก้ไข/ลบ
  ];

    // ฟังก์ชันสำหรับ Render แต่ละแถวของตาราง (ส่งให้ Template)
  const renderGuidanceTableRow = (guidance, index, handleEdit, handleDelete) => (
    <tr key={guidance.advice_id} className="hover:bg-gray-50">
      <td className="py-3 px-4 whitespace-nowrap text-sm text-gray-700">{index + 1}</td>
      <td className="py-3 px-4 text-sm text-gray-700">{guidance.advice_text}</td>
      <td className="py-3 px-4 whitespace-nowrap text-sm">
        <div className="flex space-x-2">
          <button
            onClick={() => handleEdit(guidance)}
            className="px-3 py-1 text-xs bg-primary-default text-white rounded-lg hover:bg-primary-dark transition duration-200"
          >
            แก้ไข
          </button>
          <button
            onClick={() => handleDelete(guidance.advice_id)}
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
      pageTitle="จัดการคำแนะนำการเตรียมตัว"
      addButtonLabel="+ เพิ่มคำแนะนำ"
      tableHeaders={tableHeaders}
      renderTableRow={renderGuidanceTableRow}
      PopupFormComponent={GuideForm} // ส่ง Form Component เข้าไป
      fetchItemsApi="/api/guide" // Endpoint สำหรับดึงข้อมูล
      deleteItemApi="/api/guide" // Endpoint สำหรับลบข้อมูล
      itemIdentifierKey="advice_id" // Key ที่ใช้ระบุ ID
      popupTitlePrefix="คำแนะนำการเตรียมตัว"
    />
  );
};

export default GuideManage;
