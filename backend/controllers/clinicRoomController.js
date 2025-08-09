const Room = require('../models/ClinicRoom');


exports.createRoom = async (req, res) => {
    console.log('Received req body: ', req.body)
  const { room_name, service_ids } = req.body;
  if (!room_name || !Array.isArray(service_ids) || service_ids.length === 0) {
    return res.status(400).json({ message: 'ข้อมูลห้องตรวจไม่สมบูรณ์ กรุณากรอกให้ครบถ้วน' });
  }

  try {
    const newRoom = await Room.createRoom({ room_name, service_ids });
    res.status(201).json({ message: 'บันทึกข้อมูลห้องตรวจสำเร็จ!', room: newRoom });
  } catch (error) {
    console.error('Error in createRoom controller:', error);
    if (error.code === 'ER_DUP_ENTRY') { 
      return res.status(409).json({ message: 'รหัสห้องตรวจนี้มีอยู่ในระบบแล้ว' });
    }
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการบันทึกข้อมูลห้องตรวจ' });
  }
};


exports.getAllRooms = async (req, res) => {
  try {
    const rooms = await Room.getAllRooms();
    console.log('Sending rooms to frontend:', rooms); // ✅ เพิ่ม Log
    res.status(200).json(rooms);
  } catch (error) {
    console.error('Error in getAllRooms controller:', error);
    res.status(500).json({ message: 'ไม่สามารถดึงข้อมูลห้องตรวจได้' });
  }
};


exports.updateRoom = async (req, res) => {
  const { id } = req.params;
  const { room_name, service_ids } = req.body;
  if (!room_name || !Array.isArray(service_ids) || service_ids.length === 0) {
    return res.status(400).json({ message: 'ข้อมูลห้องตรวจไม่สมบูรณ์'});
  }

  try {
    const updated = await Room.updateRoom(id, { room_name, service_ids });
    if (updated) {
      res.status(200).json({ message: 'อัปเดตข้อมูลห้องตรวจสำเร็จ!' });
    } else {
      res.status(404).json({ message: 'ไม่พบข้อมูลห้องตรวจที่ต้องการอัปเดต' });
    }
  } catch (error) {
    console.error('Error in updateRoom controller:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการอัปเดตข้อมูลห้องตรวจ' });
  }
};


exports.deleteRoom = async (req, res) => {
  const { id } = req.params; //room_id
  try {
    const deleted = await Room.deleteRoom(id);
    if (deleted) {
      res.status(200).json({ message: 'ลบข้อมูลห้องตรวจสำเร็จ!' });
    } else {
      res.status(404).json({ message: 'ไม่พบข้อมูลห้องตรวจที่ต้องการลบ' });
    }
  } catch (error) {
    console.error('Error in deleteRoom controller:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการลบข้อมูลห้องตรวจ' });
  }
};

exports.getRoomsByService = async (req, res) => {
  const { serviceId } = req.params; // ดึง serviceId จาก URL parameter
  console.log('test serviceId: ', serviceId);
  try {
    const rooms = await Room.getRoomsByService(parseInt(serviceId, 10));
    res.status(200).json(rooms);
  } catch (error) {
    console.error('Error in getRoomsByService controller:', error);
    res.status(500).json({ message: 'ไม่สามารถดึงข้อมูลห้องตรวจตามบริการได้' });
  }
};

exports.getAvailableRoomsByTime = async (req, res) => {
    const { scheduleDate, timeStart, timeEnd, serviceId } = req.query;

    if (!scheduleDate || !timeStart || !timeEnd || !serviceId) {
        return res.status(400).json({ message: 'ต้องระบุวันที่, ช่วงเวลา, และบริการ' });
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(scheduleDate) || !/^\d{2}:\d{2}$/.test(timeStart) || !/^\d{2}:\d{2}$/.test(timeEnd)) {
        return res.status(400).json({ message: 'รูปแบบวันที่หรือเวลาไม่ถูกต้อง (YYYY-MM-DD, HH:MM)' });
    }
    const parsedServiceId = parseInt(serviceId, 10);
    if (isNaN(parsedServiceId)) {
        return res.status(400).json({ message: 'รหัสบริการไม่ถูกต้อง' });
    }

    try {
        const rooms = await Room.getAvailableRoomsByTime(scheduleDate, timeStart + ':00', timeEnd + ':00', parsedServiceId); // Add ':00' for SS
        res.status(200).json(rooms);
    } catch (error) {
        console.error('Error in getAvailableRoomsByTime controller:', error);
        res.status(500).json({ message: 'ไม่สามารถดึงข้อมูลห้องตรวจที่ว่างได้' });
    }
};