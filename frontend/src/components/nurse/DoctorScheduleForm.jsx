// frontend/src/components/nurse/DoctorScheduleForm.jsx
import React, { useState, useEffect } from 'react';
import FormGroup from '../common/FormGroup';
import Button from '../common/Button';
import axios from 'axios';
import { Plus } from 'lucide-react'; 

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001';

// Array of days of the week for dropdown options
const dayOfWeekOptions = [
  { value: '', label: 'เลือกวันในสัปดาห์' },
  { value: '1', label: 'จันทร์' }, // Monday is day 1
  { value: '2', label: 'อังคาร' },
  { value: '3', label: 'พุธ' },
  { value: '4', label: 'พฤหัสบดี' },
  { value: '5', label: 'ศุกร์' },
  { value: '6', label: 'เสาร์' },
  { value: '0', label: 'อาทิตย์' } // Sunday is day 0
];

/**
 * Helper function to generate all dates for a specific day of the week
 * within a given date range, based on local timezone.
 */
const generateDatesForScheduleClient = (dayOfWeekIndex, startDateStr, endDateStr) => {
  const dates = [];
  const [startYear, startMonth, startDay] = startDateStr.split('-').map(Number);
  let currentDate = new Date(startYear, startMonth - 1, startDay); 

  const [endYear, endMonth, endDay] = endDateStr.split('-').map(Number);
  const endDate = new Date(endYear, endMonth - 1, endDay);
  endDate.setHours(23, 59, 59, 999); 

  while (currentDate.getDay() !== dayOfWeekIndex && currentDate <= endDate) {
    currentDate.setDate(currentDate.getDate() + 1); 
  }

  while (currentDate <= endDate) {
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const day = String(currentDate.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;

    dates.push(formattedDate);
    currentDate.setDate(currentDate.getDate() + 7);
  }
  return dates;
};

/**
 * Helper function to parse HH:MM time string to total minutes from midnight
 */
const parseTime = (timeStr) => {
  if (!timeStr) return -1; // Handle empty/invalid time
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};

/**
 * Helper function to check if two time ranges overlap
 * @param {string} start1 - HH:MM string for first range start
 * @param {string} end1 - HH:MM string for first range end
 * @param {string} start2 - HH:MM string for second range start
 * @param {string} end2 - HH:MM string for second range end
 * @returns {boolean} True if ranges overlap, false otherwise
 */
const timesOverlap = (start1, end1, start2, end2) => {
    const s1 = parseTime(start1);
    const e1 = parseTime(end1);
    const s2 = parseTime(start2);
    const e2 = parseTime(end2);

    // If any time is invalid, consider them not overlapping to prevent unexpected behavior
    if (s1 === -1 || e1 === -1 || s2 === -1 || e2 === -1) {
        return false;
    }

    // Overlap condition: (Start1 < End2) AND (End1 > Start2)
    return s1 < e2 && e1 > s2;
};


/**
 * Component สำหรับ Form เพิ่ม/แก้ไขตารางออกตรวจของแพทย์
 * @param {Object} props - Props สำหรับ Component
 * @param {Object|null} props.initialData - ข้อมูลตารางออกตรวจเริ่มต้นสำหรับแก้ไข (null ถ้าเป็นการเพิ่มใหม่)
 * @param {function} props.onSaveSuccess - ฟังก์ชันที่จะถูกเรียกเมื่อบันทึกสำเร็จ
 * @param {function} props.onCancel - ฟังก์ชันที่จะถูกเรียกเมื่อยกเลิกการแก้ไข/เพิ่ม
 */
const DoctorScheduleForm = ({ initialData, onSaveSuccess, onCancel }) => {
  const [selectedDayOfWeek, setSelectedDayOfWeek] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [schedules, setSchedules] = useState([]);

  const [allServiceOptions, setAllServiceOptions] = useState([]);
  const [fetchedDoctorsByService, setFetchedDoctorsByService] = useState({});
  const [fetchedRoomsByScheduleRow, setFetchedRoomsByScheduleRow] = useState({}); 

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');

  // --- Fetch initial data (All Services) ---
  useEffect(() => {
    const fetchInitialOptions = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };

        const servicesRes = await axios.get(`${API_BASE_URL}/api/services`, { headers });
        setAllServiceOptions(servicesRes.data.map(item => ({
          value: item.service_id.toString(),
          label: item.service_name
        })));

      } catch (err) {
        console.error('Failed to fetch initial options:', err);
        setError('ไม่สามารถโหลดตัวเลือกบริการได้');
      }
    };
    fetchInitialOptions();
  }, []);

  // --- Effect for setting initial data when editing (single schedule) ---
  useEffect(() => {
    if (initialData) {
      const dateObj = new Date(initialData.schedule_date);
      setSelectedDayOfWeek(dateObj.getDay().toString());
      setStartDate(initialData.schedule_date.split('T')[0]);
      setEndDate(initialData.schedule_date.split('T')[0]);

      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch doctors and rooms for the initial data
      Promise.all([
        axios.get(`${API_BASE_URL}/api/doctors/by-service/${initialData.service_id}`, { headers }),

        axios.get(`${API_BASE_URL}/api/rooms/available`, { 
            headers, 
            params: {
                scheduleDate: initialData.schedule_date.split('T')[0],
                timeStart: initialData.time_start.slice(0,5),
                timeEnd: initialData.time_end.slice(0,5),
                serviceId: initialData.service_id
            }
        })
      ]).then(([doctorsRes, roomsRes]) => {
        setFetchedDoctorsByService(prev => ({
          ...prev,
          [initialData.service_id]: doctorsRes.data.map(item => ({ value: item.doctor_id, label: item.full_name }))
        }));
        // For initial data, we don't apply in-form filtering initially, as it's a single entry.
        // It will be filtered later if user adds more rows.
        setFetchedRoomsByScheduleRow(prev => ({
          ...prev,
          [initialData.tempId]: roomsRes.data.map(item => ({ value: item.room_id.toString(), label: item.room_name }))
        }));
        setSchedules([{
          tempId: crypto.randomUUID(),
          serviceId: initialData.service_id.toString(),
          doctorId: initialData.doctor_id,
          roomId: initialData.room_id.toString(),
          timeStart: initialData.time_start.slice(0, 5),
          timeEnd: initialData.time_end.slice(0, 5)
        }]);
      }).catch(err => {
        console.error('Failed to fetch related options for initialData:', err);
        setError('ไม่สามารถโหลดข้อมูลแพทย์และห้องตรวจที่เกี่ยวข้องได้');
      });

    } else {
      setSelectedDayOfWeek('');
      setStartDate('');
      setEndDate('');
      setSchedules([{
        tempId: crypto.randomUUID(),
        serviceId: '',
        doctorId: '',
        roomId: '',
        timeStart: '08:00',
        timeEnd: '16:00'
      }]);
    }
    setError('');
    setInfoMessage(''); // Clear info message on initial load/edit
  }, [initialData]);

  // --- Dynamic Schedule Entry Templates Management ---
  const handleAddScheduleRow = () => {
    setSchedules(prevSchedules => [
      ...prevSchedules,
      {
        tempId: crypto.randomUUID(),
        serviceId: '',
        doctorId: '',
        roomId: '',
        timeStart: '08:00',
        timeEnd: '16:00'
      }
    ]);
  };

  const handleRemoveScheduleRow = (tempIdToRemove) => {
    setSchedules(prevSchedules =>
      prevSchedules.filter(schedule => schedule.tempId !== tempIdToRemove)
    );
    setFetchedRoomsByScheduleRow(prev => {
      const newState = { ...prev };
      delete newState[tempIdToRemove];
      return newState;
    });
  };

  // --- Handle changes in dynamic schedule entry templates ---
  const handleScheduleChange = (tempIdToUpdate, field, value) => {
    setSchedules(prevSchedules =>
      prevSchedules.map(schedule => {
        if (schedule.tempId === tempIdToUpdate) {
          const updatedSchedule = { ...schedule, [field]: value };

          // Reset doctor and room if service changes
          if (field === 'serviceId') {
            updatedSchedule.doctorId = '';
            updatedSchedule.roomId = '';
            if (value) {
              const token = localStorage.getItem('token');
              const headers = { Authorization: `Bearer ${token}` };
              
              axios.get(`${API_BASE_URL}/api/doctors/by-service/${value}`, { headers })
                .then(res => {
                  setFetchedDoctorsByService(prev => ({
                    ...prev,
                    [value]: res.data.map(item => ({ value: item.doctor_id, label: item.full_name }))
                  }));
                })
                .catch(err => {
                  console.error(`Frontend: Failed to fetch doctors for service ${value}:`, err);
                });

              // Clear rooms for this specific row if service changes, as new rooms might be needed
              setFetchedRoomsByScheduleRow(prev => { 
                const newState = { ...prev };
                delete newState[value]; 
                return newState;
              });

            } else { // If service is cleared
              setFetchedDoctorsByService(prev => {
                const newState = { ...prev };
                delete newState[value]; 
                return newState;
              });
              setFetchedRoomsByScheduleRow(prev => {
                const newState = { ...prev };
                delete newState[tempIdToUpdate];
                return newState;
              });
            }
          } 
          
          const currentServiceId = (field === 'serviceId') ? value : updatedSchedule.serviceId;
          const currentTimeStart = (field === 'timeStart') ? value : updatedSchedule.timeStart;
          const currentTimeEnd = (field === 'timeEnd') ? value : updatedSchedule.timeEnd;
          
          // Only fetch rooms if all necessary time/service info is available
          if ((!initialData && selectedDayOfWeek && startDate && currentServiceId && currentTimeStart && currentTimeEnd) ||
              (initialData && currentServiceId && currentTimeStart && currentTimeEnd)) {
            
            const scheduleDateToQuery = initialData ? initialData.schedule_date.split('T')[0] : 
                                       (generateDatesForScheduleClient(parseInt(selectedDayOfWeek, 10), startDate, endDate)[0] || null);

            if (scheduleDateToQuery) {
              const token = localStorage.getItem('token');
              const headers = { Authorization: `Bearer ${token}` };

              axios.get(`${API_BASE_URL}/api/rooms/available`, { 
                headers, 
                params: {
                  scheduleDate: scheduleDateToQuery, 
                  timeStart: currentTimeStart,
                  timeEnd: currentTimeEnd,
                  serviceId: currentServiceId
                }
              })
              .then(res => {
                const availableRoomsFromBackend = res.data; 

                // ✅ Collect rooms and their time slots from other rows in the *current form*
                const roomsOccupiedInFormWithTimes = prevSchedules
                  .filter(s => s.tempId !== tempIdToUpdate) // Exclude the current row being updated
                  .map(s => ({
                    roomId: s.roomId,
                    timeStart: s.timeStart,
                    timeEnd: s.timeEnd
                  }))
                  .filter(s => s.roomId && s.timeStart && s.timeEnd); // Only include valid selections

                // ✅ Filter out rooms that are occupied by other rows in this form *for overlapping times*
                const filteredRooms = availableRoomsFromBackend.filter(backendRoom => {
                  const isOccupiedByAnotherFormRow = roomsOccupiedInFormWithTimes.some(occupied => {
                    return (
                      occupied.roomId === backendRoom.room_id.toString() &&
                      // ✅ แก้ไขตรงนี้: ใช้ currentTimeStart และ currentTimeEnd ที่ถูกต้อง
                      timesOverlap(occupied.timeStart, occupied.timeEnd, currentTimeStart, currentTimeEnd) 
                    );
                  });
                  return !isOccupiedByAnotherFormRow;
                }).map(item => ({ value: item.room_id.toString(), label: item.room_name }));

                setFetchedRoomsByScheduleRow(prev => ({
                  ...prev,
                  [tempIdToUpdate]: filteredRooms
                }));

                // ✅ If the previously selected room is no longer in the filtered list, clear it
                if (updatedSchedule.roomId && 
                    !filteredRooms.some(room => room.value === updatedSchedule.roomId)) {
                  updatedSchedule.roomId = '';
                }
              })
              .catch(err => {
                console.error(`Frontend: Failed to fetch available rooms for row ${tempIdToUpdate}:`, err);
                setFetchedRoomsByScheduleRow(prev => ({ ...prev, [tempIdToUpdate]: [] }));
                updatedSchedule.roomId = '';
              });
            } else { // No valid recurring date or initialData.schedule_date
              setFetchedRoomsByScheduleRow(prev => ({ ...prev, [tempIdToUpdate]: [] }));
              updatedSchedule.roomId = '';
            }
          }
          else { // Not enough info to fetch rooms (e.g., missing service, time, or date range)
            setFetchedRoomsByScheduleRow(prev => ({ ...prev, [tempIdToUpdate]: [] }));
            updatedSchedule.roomId = '';
          }

          return updatedSchedule;
        }
        return schedule;
      })
    );
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setInfoMessage(''); 
    setLoading(true);

    if (!initialData) { 
      if (!selectedDayOfWeek || !startDate || !endDate) {
        setError('กรุณาเลือกวันในสัปดาห์และระบุช่วงวันที่สำหรับตารางออกตรวจแบบประจำ');
        setLoading(false);
        return;
      }
      if (new Date(startDate) > new Date(endDate)) {
        setError('วันที่เริ่มต้นต้องไม่เกินวันที่สิ้นสุด');
        setLoading(false);
        return;
      }
    }

    if (schedules.length === 0) {
      setError('กรุณาเพิ่มรายละเอียดตารางออกตรวจอย่างน้อยหนึ่งรายการ');
      setLoading(false);
      return;
    }

    const scheduleEntriesToSend = [];
    // ✅ NEW: ตรวจสอบความซ้ำซ้อนของห้อง/เวลาในฟอร์มก่อนส่งไปยัง Backend
    const roomTimeOverlapMap = {}; // Key: roomId, Value: Array of { timeStart, timeEnd }

    for (const entry of schedules) {
      const { serviceId, doctorId, roomId, timeStart, timeEnd } = entry;

      if (!serviceId || !doctorId || !roomId || !timeStart || !timeEnd) {
        setError('กรุณากรอกข้อมูลตารางออกตรวจให้ครบถ้วนในทุกรายการ');
        setLoading(false);
        return;
      }

      const startMinutes = parseTime(timeStart);
      const endMinutes = parseTime(timeEnd);

      if (startMinutes >= endMinutes) {
        setError('เวลาเริ่มต้นต้องน้อยกว่าเวลาสิ้นสุด');
        setLoading(false);
        return;
      }
      if (startMinutes < parseTime('08:00') || endMinutes > parseTime('16:00')) {
        setError('เวลาออกตรวจต้องอยู่ระหว่าง 08:00 ถึง 16:00');
        setLoading(false);
        return;
      }

      // ✅ ตรวจสอบความซ้ำซ้อนของห้อง/เวลาในฟอร์ม
      if (roomTimeOverlapMap[roomId]) {
          const hasOverlap = roomTimeOverlapMap[roomId].some(existingSlot => 
              timesOverlap(existingSlot.timeStart, existingSlot.timeEnd, timeStart, timeEnd)
          );
          if (hasOverlap) {
              const roomName = fetchedRoomsByScheduleRow[entry.tempId]?.find(r => r.value === roomId)?.label || `Room ID ${roomId}`;
              setError(`ห้องตรวจ '${roomName}' ถูกใช้ซ้ำซ้อนในช่วงเวลาที่ทับซ้อนกันในรายการอื่น กรุณาแก้ไข`);
              setLoading(false);
              return;
          }
          roomTimeOverlapMap[roomId].push({ timeStart, timeEnd });
      } else {
          roomTimeOverlapMap[roomId] = [{ timeStart, timeEnd }];
      }

      scheduleEntriesToSend.push({
        service_id: parseInt(serviceId, 10),
        doctor_id: doctorId,
        room_id: parseInt(roomId, 10),
        time_start: timeStart + ':00',
        time_end: timeEnd + ':00'
      });
    }

    try {
      if (initialData && initialData.ds_id) {
        const scheduleDataForUpdate = {
          ...scheduleEntriesToSend[0],
          schedule_date: initialData.schedule_date.split('T')[0]
        };
        const response = await axios.put(`${API_BASE_URL}/api/schedules/${initialData.ds_id}`, scheduleDataForUpdate, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        onSaveSuccess();
        setInfoMessage(response.data.message);
      } else {
        const recurringScheduleData = {
          selectedDayOfWeek,
          startDate,
          endDate,
          scheduleEntries: scheduleEntriesToSend,
        };
        const response = await axios.post(`${API_BASE_URL}/api/schedules`, recurringScheduleData, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        onSaveSuccess();
        setInfoMessage(response.data.message);
      }
    } catch (err) {
      console.error('Error saving doctor schedule:', err);
      if (err.response && err.response.status === 409) {
        setError(err.response.data.message);
      } else {
        setError(err.response?.data?.message || 'เกิดข้อผิดพลาดในการบันตารางออกตรวจ');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-4" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      {infoMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg relative mb-4" role="alert">
          <span className="block sm:inline">{infoMessage}</span>
        </div>
      )}

      {!initialData && (
        <>
          <FormGroup
            as="select"
            label="เลือกวันในสัปดาห์"
            id="selectedDayOfWeek"
            name="selectedDayOfWeek"
            value={selectedDayOfWeek}
            onChange={(e) => setSelectedDayOfWeek(e.target.value)}
            options={dayOfWeekOptions}
            required
            className="mb-4"
          />
          <FormGroup
            label="วันที่เริ่มต้น (สำหรับตารางแบบประจำ)"
            type="date"
            id="startDate"
            name="startDate"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
            className="mb-4"
          />
          <FormGroup
            label="วันที่สิ้นสุด (สำหรับตารางแบบประจำ)"
            type="date"
            id="endDate"
            name="endDate"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            required
            className="mb-4"
          />
          {selectedDayOfWeek && startDate && endDate && (
            <p className="text-gray-600 text-sm mb-4">
              ระบบจะสร้างตารางออกตรวจสำหรับทุกวัน **{dayOfWeekOptions.find(opt => opt.value === selectedDayOfWeek)?.label}**
              ระหว่างวันที่ **{new Date(startDate).toLocaleDateString('th-TH')}** ถึง **{new Date(endDate).toLocaleDateString('th-TH')}**
            </p>
          )}
        </>
      )}

      {initialData && (
        <p className="text-gray-600 text-sm mb-4">
          กำลังแก้ไขตารางออกตรวจสำหรับวันที่: {new Date(initialData.schedule_date).toLocaleDateString('th-TH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      )}


      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          รายละเอียดตารางออกตรวจ (สำหรับแต่ละวันในแบบประจำ) <span className="text-red-500">*</span>
        </label>
        <div className="max-h-96 overflow-y-auto pr-2"> 
          {schedules.map((schedule, index) => (
            <div key={schedule.tempId} className="relative flex flex-col md:flex-row items-end gap-2 mb-4 p-3 border rounded-lg bg-gray-50"> 
              <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                <FormGroup
                  as="select"
                  label="บริการ"
                  id={`service-${schedule.tempId}`}
                  name={`service-${schedule.tempId}`}
                  value={schedule.serviceId}
                  onChange={(e) => handleScheduleChange(schedule.tempId, 'serviceId', e.target.value)}
                  options={allServiceOptions}
                  required
                  className="mb-0"
                />
                <FormGroup
                  as="select"
                  label="แพทย์"
                  id={`doctor-${schedule.tempId}`}
                  name={`doctor-${schedule.tempId}`}
                  value={schedule.doctorId}
                  onChange={(e) => handleScheduleChange(schedule.tempId, 'doctorId', e.target.value)}
                  options={fetchedDoctorsByService[schedule.serviceId] || []}
                  required
                  className="mb-0"
                  disabled={!schedule.serviceId}
                />
                <FormGroup
                  as="select"
                  label="ห้องตรวจ"
                  id={`room-${schedule.tempId}`}
                  name={`room-${schedule.tempId}`}
                  value={schedule.roomId}
                  onChange={(e) => handleScheduleChange(schedule.tempId, 'roomId', e.target.value)}
                  options={fetchedRoomsByScheduleRow[schedule.tempId] || []} 
                  required
                  className="mb-0"
                  disabled={!schedule.serviceId || !schedule.timeStart || !schedule.timeEnd} 
                />
                <FormGroup
                  label="เวลาเริ่มต้น (08:00 - 16:00)"
                  type="time"
                  id={`timeStart-${schedule.tempId}`}
                  name={`timeStart-${schedule.tempId}`}
                  value={schedule.timeStart}
                  onChange={(e) => handleScheduleChange(schedule.tempId, 'timeStart', e.target.value)}
                  min="08:00"
                  max="16:00"
                  required
                  className="mb-0"
                />
                <FormGroup
                  label="เวลาสิ้นสุด (08:00 - 16:00)"
                  type="time"
                  id={`timeEnd-${schedule.tempId}`}
                  name={`timeEnd-${schedule.tempId}`}
                  value={schedule.timeEnd}
                  onChange={(e) => handleScheduleChange(schedule.tempId, 'timeEnd', e.target.value)}
                  min="08:00"
                  max="16:00"
                  required
                  className="mb-0"
                />
              </div>
              {schedules.length > 1 && (
                <button 
                  type="button"
                  onClick={() => handleRemoveScheduleRow(schedule.tempId)}
                  className="absolute top-2 right-2 h-6 w-6 flex items-center justify-center rounded-full bg-red-200 text-red-700 hover:bg-red-300 focus:outline-none focus:ring-2 focus:ring-red-400 text-xl font-bold"
                  aria-label="ลบรายละเอียดตารางออกตรวจนี้" 
                >
                  -
                </button>
              )}
            </div>
          ))}
        </div> 

        <Button
          type="button"
          variant="secondary"
          onClick={handleAddScheduleRow}
          className="w-full flex items-center justify-center gap-2 mt-2"
        >
          <Plus size={18} />
          เพิ่มรายละเอียดตาราง
        </Button>
        {schedules.length === 0 && (
          <p className="text-red-500 text-xs mt-1">กรุณาเพิ่มรายละเอียดตารางออกตรวจอย่างน้อยหนึ่งรายการ</p>
        )}
      </div>

      <div className="flex space-x-2 mt-4 justify-end">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={loading}
        >
          ยกเลิก
        </Button>
        <Button
          type="submit"
          variant={initialData ? 'primary' : 'success'}
          disabled={loading}
        >
          {loading ? 'กำลังบันทึก...' : (initialData ? 'บันทึกการแก้ไข' : 'เพิ่มตารางออกตรวจ')}
        </Button>
      </div>
    </form>
  );
};

export default DoctorScheduleForm;
