import ManagePageTemplate from '../../components/common/ManagePageTemplate';
import ClinicRoomForm from '../../components/nurse/ClinicRoomForm';

const ClinicRoomManage = () => {
  const tableHeaders = [
    { label: 'ลำดับ' },
    { key: 'room_name', label: 'ชื่อห้อง' },
    { key: 'services', label: 'บริการที่รองรับ' },
    { key: 'actions', label: '' }
  ];

  const renderRoomTableRow = (room, index, handleEdit, handleDelete) => (
    <tr key={room.room_id} className="hover:bg-gray-50">
      <td className="py-3 px-4 whitespace-nowrap text-sm text-gray-700">{index + 1}</td>
      <td className="py-3 px-4 whitespace-nowrap text-sm text-gray-700">{room.room_name}</td>
      <td className="py-3 px-4 text-sm text-gray-700">
        {/* แสดงบริการเป็นรายการ */}
        {room.services && room.services.length > 0 ? (
          <ul className="list-disc list-inside">
            {room.services.map(service => (
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
            onClick={() => handleEdit(room)}
            className="px-3 py-1 text-xs bg-primary-default text-white rounded-lg hover:bg-primary-dark transition duration-200"
          >
            แก้ไข
          </button>
          <button
            onClick={() => handleDelete(room.room_id)}
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
      pageTitle="จัดการข้อมูลห้องตรวจ"
      addButtonLabel="+ เพิ่มห้อง"
      tableHeaders={tableHeaders}
      renderTableRow={renderRoomTableRow}
      PopupFormComponent={ClinicRoomForm}
      fetchItemsApi="/api/rooms" // Endpoint สำหรับดึงข้อมูลแพทย์
      deleteItemApi="/api/rooms" // Endpoint สำหรับลบข้อมูลแพทย์
      itemIdentifierKey="room_id" // Key ที่ใช้ระบุ ID ของแพทย์
      popupTitlePrefix="ห้องตรวจ"
    />
  )
}

export default ClinicRoomManage
