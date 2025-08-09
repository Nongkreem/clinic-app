const db = require('../config/db');

const generateTimeSlots = (startTime, endTime) => {
    const slots = [];
    let current = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);

    while (current < end) {
        const slotStart = current.toTimeString().slice(0, 8);
        current.setMinutes(current.getMinutes() + 15);
        const slotEnd = current.toTimeString().slice(0, 8);
        slots.push({ slot_start: slotStart, slot_end: slotEnd });
    }
    return slots;
};

exports.createRoom = async ({ room_name, service_ids}) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // 1. Insert into examRoom table
    const [roomResult] = await connection.execute(
      'INSERT INTO examRoom (room_name) VALUES (?)',
      [room_name]
    );

    const newRoomId = roomResult.insertId
    // 2. Insert into examRoomService junction table
    if (service_ids && service_ids.length > 0) {
      const examRoomServiceValues = service_ids.map(serviceId => [newRoomId, serviceId]);
      await connection.query(
        'INSERT INTO examRoomService (room_id, service_id) VALUES ?',
        [examRoomServiceValues]
      );
    }

    await connection.commit();
    return { room_id: newRoomId, room_name, service_ids };
  } catch (error) {
    await connection.rollback();
    console.error('Error creating examination room:', error);
    throw error;
  } finally {
    connection.release();
  }
};


exports.getAllRooms = async () => {
  try {
    // ดึงแพทย์ทั้งหมด
    const [rooms] = await db.execute(
      'SELECT r.room_id, r.room_name FROM examRoom r ORDER BY r.room_name'
    );

    // สำหรับแต่ละแพทย์, ดึงบริการที่เกี่ยวข้อง
    for (let room of rooms) {
      const [services] = await db.execute(
        `SELECT s.service_id, s.service_name
         FROM examRoomService rs
         JOIN services s ON rs.service_id = s.service_id
         WHERE rs.room_id = ?`,
        [room.room_id]
      );
      room.services = services; // เพิ่ม array ของบริการเข้าไปใน object แพทย์
    }
    return rooms;
  } catch (error) {
    console.error('Error fetching all examination rooms:', error);
    throw error;
  }
};

exports.updateRoom = async (room_id, { room_name, service_ids }) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // 1. Update examRoom table
    const [updateRoomResult] = await connection.execute(
      'UPDATE examRoom SET room_name = ? WHERE room_id = ?',
      [room_name, room_id]
    );

    // 2. Delete existing entries from examRoomService for this room_id
    await connection.execute('DELETE FROM examRoomService WHERE room_id = ?', [room_id]);

    // 3. Insert new entries into examRoomService
    if (service_ids && service_ids.length > 0) {
      const examRoomServiceValues = service_ids.map(serviceId => [room_id, serviceId]);
      await connection.query(
        'INSERT INTO examRoomService (room_id, service_id) VALUES ?',
        [examRoomServiceValues]
      );
    }

    await connection.commit();
    return updateRoomResult.affectedRows > 0;
  } catch (error) {
    await connection.rollback();
    console.error('Error updating examination room:', error);
    throw error;
  } finally {
    connection.release();
  }
};


exports.deleteRoom = async (room_id) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // 1. Delete from examRoomService
    await connection.execute('DELETE FROM examRoomService WHERE room_id = ?', [room_id]);

    // 2. Delete from examRoom table
    const [result] = await connection.execute('DELETE FROM examRoom WHERE room_id = ?', [room_id]);

    await connection.commit();
    return result.affectedRows > 0;
  } catch (error) {
    await connection.rollback();
    console.error('Error deleting examination room:', error);
    throw error;
  } finally {
    connection.release();
  }
};

exports.getRoomsByService = async (serviceId) => {
  try {
    const [rooms] = await db.execute(
      `SELECT er.room_id, er.room_name
       FROM examRoom er
       JOIN examRoomService ers ON er.room_id = ers.room_id
       WHERE ers.service_id = ?
       ORDER BY er.room_name`,
      [serviceId]
    );
    return rooms;
  } catch (error) {
    console.error('Error fetching rooms by service:', error);
    throw error;
  }
};

exports.getAvailableRoomsByTime = async (scheduleDate, timeStart, timeEnd, serviceId) => {
    try {
        const query = `
            SELECT DISTINCT er.room_id, er.room_name
            FROM examRoom er  -- ✅ ใช้ชื่อตารางตามที่คุณยืนยัน
            JOIN examRoomService ersrv ON er.room_id = ersrv.room_id -- ✅ ใช้ชื่อตารางตามที่คุณยืนยัน
            WHERE ersrv.service_id = ?
              AND er.room_id NOT IN (
                  SELECT ds.room_id
                  FROM doctorSchedules ds  -- ✅ ใช้ชื่อตารางตามที่คุณยืนยัน
                  WHERE ds.schedule_date = ?
                    AND (
                          ds.time_start < ? AND ds.time_end > ?
                        )
              )
            ORDER BY er.room_name`;
        
        const params = [serviceId, scheduleDate, timeEnd, timeStart];

        console.log(`[ClinicRoom Model] getAvailableRoomsByTime Query:`);
        console.log(query);
        console.log(`[ClinicRoom Model] getAvailableRoomsByTime Params:`, params);
        
        const [rooms] = await db.execute(query, params);
        
        console.log(`[ClinicRoom Model] getAvailableRoomsByTime Result:`, rooms);
        return rooms;
    } catch (error) {
        console.error('Error fetching available rooms by time:', error);
        throw error;
    }
};