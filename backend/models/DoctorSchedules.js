// backend/models/DoctorSchedule.js
const db = require("../config/db");

/* ------------------------ Helper function ------------------------ */
// generate 15-minute time slots between start and end times.
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

/**
 * Helper function to generate all dates for a specific day of the week
 * within a given date range, based on local timezone.
 * @param {number} dayOfWeekIndex - Day of week (0 for Sunday, 1 for Monday, ..., 6 for Saturday)
 * @param {string} startDateStr - Start date string (YYYY-MM-DD)
 * @param {string} endDateStr - End date string (YYYY-MM-DD)
 * @returns {Array<string>} Array of date strings (YYYY-MM-DD)
 */
const generateDatesForSchedule = (dayOfWeekIndex, startDateStr, endDateStr) => {
  console.log(
    `[Backend Helper] generateDatesForSchedule: Target dayOfWeekIndex = ${dayOfWeekIndex}, StartDate = ${startDateStr}, EndDate = ${endDateStr}`
  );

  const dates = [];
  const [startYear, startMonth, startDay] = startDateStr.split('-').map(Number);
  let currentDate = new Date(startYear, startMonth - 1, startDay); 

  const [endYear, endMonth, endDay] = endDateStr.split('-').map(Number);
  const endDate = new Date(endYear, endMonth - 1, endDay);

  endDate.setHours(23, 59, 59, 999); 

  console.log(
    `[Backend Helper] Initial currentDate (Local): ${currentDate.toLocaleString()} (Day: ${currentDate.getDay()})`
  );

  while (currentDate.getDay() !== dayOfWeekIndex && currentDate <= endDate) {
    currentDate.setDate(currentDate.getDate() + 1); 
    console.log(
      `[Backend Helper] Advancing date to ${currentDate.toLocaleString()} (Day: ${currentDate.getDay()})`
    );
  }

  while (currentDate <= endDate) {
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const day = String(currentDate.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;

    dates.push(formattedDate);
    console.log(`[Backend Helper] Added date: ${formattedDate}`);
    currentDate.setDate(currentDate.getDate() + 7);
  }
  console.log(`[Backend Helper] Final generated dates:`, dates);
  return dates;
};

/**
 * Checks for overlapping schedules for a given doctor on a specific date and time range.
 * @param {string} doctorId - The ID of the doctor
 * @param {string} scheduleDate - The date (YYYY-MM-DD)
 * @param {string} timeStart - The start time (HH:MM:SS)
 * @param {string} timeEnd - The end time (HH:MM:SS)
 * @param {number|null} [excludeDsId=null] - Optional: ds_id to exclude from the check (for update operations)
 * @returns {Promise<boolean>} True if an overlap is found, false otherwise.
 */
exports.checkOverlapSchedules = async (doctorId, scheduleDate, timeStart, timeEnd, excludeDsId = null) => {
    try {
        let query = `
            SELECT COUNT(*) AS count
            FROM doctorSchedules -- ✅ ใช้ชื่อตารางตามที่คุณยืนยัน
            WHERE doctor_id = ?
              AND schedule_date = ?
              AND (
                    (time_start < ? AND time_end > ?) OR  -- new schedule overlaps existing
                    (? < time_end AND ? > time_start)    -- existing schedule overlaps new
                  )
        `;
        const params = [doctorId, scheduleDate, timeEnd, timeStart, timeEnd, timeStart];

        if (excludeDsId) {
            query += ` AND ds_id != ?`;
            params.push(excludeDsId);
        }

        console.log(`[Backend Model] checkOverlapSchedules Query: ${query}`, params);
        const [rows] = await db.execute(query, params);
        
        return rows[0].count > 0;
    } catch (error) {
        console.error('Error checking overlapping schedules:', error);
        throw error;
    }
};

/* ------------------------ CRUD ------------------------ */

/**
 * Creates new doctor schedules based on recurring pattern.
 * This function now expects a single object containing recurring schedule data.
 * It will skip schedules that overlap with existing ones for the same doctor.
 * @param {object} recurringScheduleData - Object: { selectedDayOfWeek, startDate, endDate, scheduleEntries: Array<{ service_id, doctor_id, room_id, time_start, time_end }> }
 * @returns {Promise<{createdSchedules: Array<Object>, skippedSchedules: Array<Object>}>} Object with created and skipped schedules
 */
exports.createSchedules = async (recurringScheduleData) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const { selectedDayOfWeek, startDate, endDate, scheduleEntries } = recurringScheduleData;
    const createdSchedules = [];
    const skippedSchedules = [];

    console.log(`[Backend Model] createSchedules received: dayOfWeek=${selectedDayOfWeek}, startDate=${startDate}, endDate=${endDate}, entries=${scheduleEntries.length}`);

    // 1. Generate all specific dates for the recurring pattern
    const dayOfWeekInt = parseInt(selectedDayOfWeek, 10);
    const actualScheduleDates = generateDatesForSchedule(
      dayOfWeekInt,
      startDate,
      endDate
    );

    if (actualScheduleDates.length === 0) {
      throw new Error(
        "No valid dates found for the selected recurring schedule."
      );
    }

    // 2. For each actual date, and for each schedule entry template, check for overlaps and then create
    for (const scheduleDate of actualScheduleDates) {
        for (const entryTemplate of scheduleEntries) {
            const { service_id, doctor_id, room_id, time_start, time_end } = entryTemplate;

            const isOverlap = await exports.checkOverlapSchedules(
                doctor_id,
                scheduleDate,
                time_start,
                time_end
            );

            if (isOverlap) {
                skippedSchedules.push({
                    schedule_date: scheduleDate,
                    doctor_id: doctor_id,
                    time_start: time_start,
                    time_end: time_end,
                    reason: 'Overlaps with existing schedule'
                });
                console.log(`[Backend Model] Skipping overlapping schedule for Doctor ${doctor_id} on ${scheduleDate} from ${time_start} to ${time_end}`);
                continue;
            }

            // Insert into doctorSchedules table
            const [scheduleResult] = await connection.execute(
                "INSERT INTO doctorSchedules (service_id, doctor_id, room_id, schedule_date, time_start, time_end) VALUES (?, ?, ?, ?, ?, ?)", // ✅ ใช้ชื่อตารางตามที่คุณยืนยัน
                [service_id, doctor_id, room_id, scheduleDate, time_start, time_end]
            );

            const ds_id = scheduleResult.insertId;

            // Generate and insert 15-minute slots into examRoomSlots table
            const timeSlots = generateTimeSlots(time_start, time_end);
            if (timeSlots.length > 0) {
                const slotValues = timeSlots.map(slot => [ds_id, slot.slot_start, slot.slot_end, false]);
                await connection.query(
                    "INSERT INTO examRoomSlots (ds_id, slot_start, slot_end, is_booked) VALUES ?", // ✅ ใช้ชื่อตารางตามที่คุณยืนยัน
                    [slotValues]
                );
            }
            createdSchedules.push({ ds_id, schedule_date: scheduleDate, ...entryTemplate });
        }
    }

    await connection.commit();
    return { createdSchedules, skippedSchedules };
  } catch (error) {
    await connection.rollback();
    console.error("Error creating recurring doctor schedules:", error);
    throw error;
  } finally {
    connection.release();
  }
};

exports.getAllSchedules = async (filters = {}) => {
  const { serviceId = null, scheduleDate = null } = filters;
  try {
    let query = `
            SELECT
                ds.ds_id,
                ds.schedule_date,
                ds.time_start,
                ds.time_end,
                s.service_id,
                s.service_name,
                d.doctor_id,
                d.full_name AS doctor_full_name,
                er.room_id,
                er.room_name
            FROM doctorSchedules ds  -- ✅ ใช้ชื่อตารางตามที่คุณยืนยัน
            JOIN services s ON ds.service_id = s.service_id
            JOIN doctors d ON ds.doctor_id = d.doctor_id
            JOIN examRoom er ON ds.room_id = er.room_id -- ✅ ใช้ชื่อตารางตามที่คุณยืนยัน
        `;
    const params = [];
    const conditions = [];

    if (serviceId) {
      conditions.push(`ds.service_id = ?`);
      params.push(serviceId);
    }
    if (scheduleDate) {
      conditions.push(`ds.schedule_date = ?`);
      params.push(scheduleDate);
    }

    if (conditions.length > 0) {
      query += ` WHERE ` + conditions.join(" AND ");
    }

    query += ` ORDER BY ds.schedule_date ASC, ds.time_start ASC`;

    const [schedules] = await db.execute(query, params);
    return schedules;
  } catch (error) {
    console.error("Error fetching all doctor schedules:", error);
    throw error;
  }
};

/**
 * Updates an existing doctor schedule.
 * Deletes existing slots and generates new ones based on updated time range.
 * @param {number} ds_id - The ID of the schedule to update
 * @param {Object} scheduleData - Data to update: { service_id, doctor_id, room_id, schedule_date, time_start, time_end }
 * @returns {boolean} True if updated, false otherwise.
 */
exports.updateSchedule = async (
  ds_id,
  { service_id, doctor_id, room_id, schedule_date, time_start, time_end }
) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const isOverlap = await exports.checkOverlapSchedules(
        doctor_id,
        schedule_date,
        time_start,
        time_end,
        ds_id
    );

    if (isOverlap) {
        await connection.rollback();
        throw new Error(`ตารางออกตรวจของแพทย์ ${doctor_id} ในวันที่ ${schedule_date} เวลา ${time_start}-${time_end} ทับซ้อนกับตารางเดิม`);
    }

    // 1. Update doctorSchedules table
    const [updateResult] = await connection.execute(
      `UPDATE doctorSchedules -- ✅ ใช้ชื่อตารางตามที่คุณยืนยัน
             SET service_id = ?, doctor_id = ?, room_id = ?, schedule_date = ?, time_start = ?, time_end = ?
             WHERE ds_id = ?`,
      [
        service_id,
        doctor_id,
        room_id,
        schedule_date,
        time_start,
        time_end,
        ds_id,
      ]
    );

    // 2. Delete existing slots for this schedule
    await connection.execute("DELETE FROM examRoomSlots WHERE ds_id = ?", [ // ✅ ใช้ชื่อตารางตามที่คุณยืนยัน
      ds_id,
    ]);

    // 3. Generate and insert new 15-minute slots
    const timeSlots = generateTimeSlots(time_start, time_end);
    if (timeSlots.length > 0) {
      const slotValues = timeSlots.map((slot) => [
        ds_id,
        slot.slot_start,
        slot.slot_end,
        false,
      ]);
      await connection.query(
        "INSERT INTO examRoomSlots (ds_id, slot_start, slot_end, is_booked) VALUES ?", // ✅ ใช้ชื่อตารางตามที่คุณยืนยัน
        [slotValues]
      );
    }

    await connection.commit();
    return updateResult.affectedRows > 0;
  } catch (error) {
    await connection.rollback();
    console.error("Error updating doctor schedule:", error);
    throw error;
  } finally {
    connection.release();
  }
};

/**
 * Deletes a doctor schedule and its associated time slots.
 * @param {number} ds_id - The ID of the schedule to delete
 * @returns {boolean} True if deleted, false otherwise.
 */
exports.deleteSchedule = async (ds_id) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const [result] = await connection.execute(
      "DELETE FROM doctorSchedules WHERE ds_id = ?", // ✅ ใช้ชื่อตารางตามที่คุณยืนยัน
      [ds_id]
    );

    await connection.commit();
    return result.affectedRows > 0;
  } catch (error) {
    await connection.rollback();
    console.error("Error deleting doctor schedule:", error);
    throw error;
  } finally {
    connection.release();
  }
};

exports.getScheduleById = async (ds_id) => {
  try {
    const [rows] = await db.execute(
      `SELECT
                ds.ds_id,
                ds.schedule_date,
                ds.time_start,
                ds.time_end,
                s.service_id,
                s.service_name,
                d.doctor_id,
                d.full_name AS doctor_full_name,
                er.room_id,
                er.room_name
            FROM doctorSchedules ds -- ✅ ใช้ชื่อตารางตามที่คุณยืนยัน
            JOIN services s ON ds.service_id = s.service_id
            JOIN doctors d ON ds.doctor_id = d.doctor_id
            JOIN examRoom er ON ds.room_id = er.room_id -- ✅ ใช้ชื่อตารางตามที่คุณยืนยัน
            WHERE ds.ds_id = ?`,
      [ds_id]
    );
    if (rows.length === 0) return null;

    const schedule = rows[0];
    const [slots] = await db.execute(
      `SELECT ers_id, slot_start, slot_end, is_booked
             FROM examRoomSlots -- ✅ ใช้ชื่อตารางตามที่คุณยืนยัน
             WHERE ds_id = ?
             ORDER BY slot_start`,
      [ds_id]
    );
    schedule.slots = slots;
    return schedule;
  } catch (error) {
    console.error("Error fetching schedule by ID:", error);
    throw error;
  }
};

exports.getAggregatedAvailableSlots = async (scheduleDate, serviceId) => {
  try {
    const [rows] = await db.execute(
      `SELECT
                ers.slot_start,
                ers.slot_end,
                COUNT(DISTINCT ds.ds_id) AS available_schedules_count,
                GROUP_CONCAT(DISTINCT ds.ds_id ORDER BY ds.ds_id SEPARATOR ',') AS ds_ids_available
            FROM examRoomSlots ers -- ✅ ใช้ชื่อตารางตามที่คุณยืนยัน
            JOIN doctorSchedules ds ON ers.ds_id = ds.ds_id -- ✅ ใช้ชื่อตารางตามที่คุณยืนยัน
            WHERE ds.schedule_date = ?
              AND ds.service_id = ?
              AND ers.is_booked = FALSE
            GROUP BY ers.slot_start, ers.slot_end
            ORDER BY ers.slot_start ASC`,
      [scheduleDate, serviceId]
    );

    return rows.map((row) => ({
      ...row,
      ds_ids_available: row.ds_ids_available
        ? row.ds_ids_available.split(",").map(Number)
        : [],
    }));
  } catch (error) {
    console.error("Error fetching aggregated available slots:", error);
    throw error;
  }
};

exports.bookSlot = async (ers_id, patient_id, ds_id) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const [slotUpdateResult] = await connection.execute(
      `UPDATE examRoomSlots SET is_booked = TRUE WHERE ers_id = ? AND is_booked = FALSE`, // ✅ ใช้ชื่อตารางตามที่คุณยืนยัน
      [ers_id]
    );

    if (slotUpdateResult.affectedRows === 0) {
      await connection.rollback();
      return false;
    }

    const [scheduleDetails] = await db.execute(
      `SELECT ds.schedule_date, ers.slot_start
             FROM doctorSchedules ds -- ✅ ใช้ชื่อตารางตามที่คุณยืนยัน
             JOIN examRoomSlots ers ON ds.ds_id = ers.ds_id -- ✅ ใช้ชื่อตารางตามที่คุณยืนยัน
             WHERE ers.ers_id = ?`,
      [ers_id]
    );

    if (scheduleDetails.length === 0) {
      await connection.rollback();
      throw new Error("Could not find schedule details for the booked slot.");
    }

    const { schedule_date, slot_start } = scheduleDetails[0];

    const [appointmentResult] = await connection.execute(
      `INSERT INTO appointments (patient_id, ds_id, ers_id, appointment_date, appointment_time, status)
             VALUES (?, ?, ?, ?, ?, 'booked')`,
      [patient_id, ds_id, ers_id, schedule_date, slot_start]
    );

    await connection.commit();
    return appointmentResult.affectedRows > 0;
  } catch (error) {
    await connection.rollback();
    console.error("Error booking slot:", error);
    throw error;
  } finally {
    connection.release();
  }
};
