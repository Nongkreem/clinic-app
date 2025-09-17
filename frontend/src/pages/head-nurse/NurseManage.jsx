import React from 'react'
import ManagePageTemplate from '../../components/common/ManagePageTemplate'
import NurseForm from '../../components/head-nurse/NurseForm'


const NurseManage = () => {

    const tableHeaders = [
        { key: 'nurse_id', label: 'รหัสแพทย์' },
        { key: 'full_name', label: 'ชื่อ-นามสกุล' },
        { key: 'phone', label: 'เบอร์โทร' },
        { key: 'gmail', label: 'อีเมล' },
        { key: 'service_name', label: 'บริการ' }, // คอลัมน์สำหรับแสดงบริการ
        { key: 'actions', label: '' }, // คอลัมน์สำหรับปุ่ม แก้ไข/ลบ
    ];

    // ฟังก์ชันสำหรับ Render แต่ละแถวของตาราง (ส่งให้ ManagePageTemplate)
  const renderNurseTableRow = (nurse, index, handleEdit, handleDelete) => (
    <tr key={nurse.nurse_id} className="hover:bg-gray-50">
      <td className="py-3 px-4 whitespace-nowrap text-sm text-gray-700">{nurse.nurse_id}</td>
      <td className="py-3 px-4 whitespace-nowrap text-sm text-gray-700">{nurse.first_name} {nurse.last_name}</td>
      <td className="py-3 px-4 whitespace-nowrap text-sm text-gray-700">{nurse.phone || '-'}</td>
      <td className="py-3 px-4 text-sm text-gray-700">{nurse.gmail}</td>
      <td className="py-3 px-4 text-sm text-gray-700">{nurse.service_name}</td>
      <td className="py-3 px-4 whitespace-nowrap text-sm">
        <div className="flex space-x-2">
          <button
            onClick={() => handleEdit(nurse)}
            className="px-3 py-1 text-xs bg-primary-default text-white rounded-lg hover:bg-primary-dark transition duration-200"
          >
            แก้ไข
          </button>
          <button
            onClick={() => handleDelete(nurse.nurse_id)}
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
      pageTitle="จัดการข้อมูลพยาบาล"
      addButtonLabel="+ เพิ่มพยาบาล"
      tableHeaders={tableHeaders}
      renderTableRow={renderNurseTableRow}
      PopupFormComponent={NurseForm}
      fetchItemsApi="/api/nurses"
      deleteItemApi="/api/nurses"
      itemIdentifierKey="nurse_id"
      popupTitlePrefix="พยาบาล"
    />
  )
}

export default NurseManage
