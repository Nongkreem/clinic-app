import React, { useState, useEffect } from 'react';
import ManagePageTemplate from '../../components/common/ManagePageTemplate';
import DoctorScheduleForm from '../../components/nurse/DoctorScheduleForm';
import FormGroup from '../../components/common/FormGroup'; 
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001';

const DoctorScheduleManage = () => {
  const [filterServiceId, setFilterServiceId] = useState(''); 
  const [allServiceOptions, setAllServiceOptions] = useState([]); 

  // Fetch all services for the filter dropdown
  useEffect(() => {
    const fetchServiceOptions = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_BASE_URL}/api/services`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAllServiceOptions([
          { value: '', label: 'ทั้งหมด' },
          ...response.data.map(item => ({
            value: item.service_id.toString(),
            label: item.service_name
          }))
        ]);
      } catch (err) {
        console.error('Failed to fetch service options for filter:', err);
      }
    };
    fetchServiceOptions();
  }, []);

  // Headers for the table
  const tableHeaders = [
    { label: 'ลำดับ' },
    { key: 'schedule_date', label: 'วันที่' },
    { key: 'time_range', label: 'เวลา' },
    { key: 'service_name', label: 'บริการ' },
    { key: 'doctor_full_name', label: 'แพทย์' },
    { key: 'room_name', label: 'ห้องตรวจ' },
    { key: 'actions', label: 'การดำเนินการ' }
  ];

  // Function to render each table row (passed to ManagePageTemplate)
  const renderScheduleTableRow = (schedule, index, handleEdit, handleDelete) => (
    
    <tr key={schedule.ds_id} className="hover:bg-gray-50">
      <td className="py-3 px-4 whitespace-nowrap text-sm text-gray-700">{index + 1}</td>
      <td className="py-3 px-4 whitespace-nowrap text-sm text-gray-700">
        {new Date(schedule.schedule_date).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' })}
      </td>
      <td className="py-3 px-4 whitespace-nowrap text-sm text-gray-700">
        {schedule.time_start.slice(0, 5)} - {schedule.time_end.slice(0, 5)}
      </td>
      <td className="py-3 px-4 whitespace-nowrap text-sm text-gray-700">{schedule.service_name}</td>
      <td className="py-3 px-4 whitespace-nowrap text-sm text-gray-700">{schedule.doctor_full_name}</td>
      <td className="py-3 px-4 whitespace-nowrap text-sm text-gray-700">{schedule.room_name}</td>
      <td className="py-3 px-4 whitespace-nowrap text-sm">
        <div className="flex space-x-2">
          <button
            onClick={() => handleEdit(schedule)}
            className="px-3 py-1 text-xs bg-primary-default text-white rounded-lg hover:bg-primary-dark transition duration-200"
          >
            แก้ไข
          </button>
          <button
            onClick={() => handleDelete(schedule.ds_id)}
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
      pageTitle="จัดการตารางออกตรวจ"
      addButtonLabel="+ เพิ่มตารางออกตรวจ"
      tableHeaders={tableHeaders}
      renderTableRow={renderScheduleTableRow}
      PopupFormComponent={DoctorScheduleForm}
      fetchItemsApi={`/api/schedules${filterServiceId ? `?serviceId=${filterServiceId}` : ''}`}
      deleteItemApi="/api/schedules"
      itemIdentifierKey="ds_id"
      popupTitlePrefix="ตารางออกตรวจ"
    >
      <div className="mb-4 w-full md:w-1/3">
        <FormGroup
          as="select"
          label="กรองตามบริการ"
          id="filterService"
          name="filterService"
          value={filterServiceId}
          onChange={(e) => setFilterServiceId(e.target.value)}
          options={allServiceOptions}
          className="mb-0"
        />
      </div>
    </ManagePageTemplate>
  );
};

export default DoctorScheduleManage;