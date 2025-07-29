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