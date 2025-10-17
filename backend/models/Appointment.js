// backend/models/Appointment.js
const db = require("../config/db");
const Patient = require("./Patient");

exports.createAppointment = async (
  ers_id,
  patient_id,
  symptoms,
  appointment_type
) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const [slotDetails] = await connection.execute(
      `SELECT
                ers.ers_id, ers.slot_start, ers.slot_end, ers.is_booked,
                ds.ds_id, ds.schedule_date, ds.doctor_id, ds.room_id, ds.service_id
             FROM examRoomSlots ers
             JOIN doctorSchedules ds ON ers.ds_id = ds.ds_id
             WHERE ers.ers_id = ?`,
      [ers_id]
    );

    if (slotDetails.length === 0) {
      await connection.rollback();
      return { success: false, message: "ไม่พบ Slot เวลาที่เลือก" };
    }

    const slot = slotDetails[0];

    // 2. Check if the slot is already booked
    if (slot.is_booked) {
      await connection.rollback();
      return { success: false, message: "Slot เวลานี้ถูกจองไปแล้ว" };
    }

    // 3. Mark the exam room slot as booked
    const [slotUpdateResult] = await connection.execute(
      `UPDATE examRoomSlots SET is_booked = TRUE WHERE ers_id = ?`,
      [ers_id]
    );

    if (slotUpdateResult.affectedRows === 0) {
      await connection.rollback();
      return { success: false, message: "ไม่สามารถอัปเดตสถานะ Slot เวลาได้" };
    }

    // 4. Insert the new appointment record
    const [appointmentResult] = await connection.execute(
      `INSERT INTO appointment (
      ers_id,
      patient_id,
      symptoms,
      ds_id,
      appointment_date,
      appointment_time,
      status,
      appointmentType,
      service_id,
      doctor_id,
      room_id
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        slot.ers_id,
        patient_id,
        symptoms,
        slot.ds_id,
        slot.schedule_date,
        slot.slot_start,
        "pending",
        appointment_type,
        slot.service_id,
        slot.doctor_id,
        slot.room_id,
      ]
    );

    await connection.commit();
    console.log(
      `[Appointment Model] New appointment created: ${appointmentResult.insertId}`
    );
    return {
      success: true,
      appointmentId: appointmentResult.insertId,
      message: "สร้างนัดหมายสำเร็จ รอยืนยันจากพยาบาล",
    };
  } catch (error) {
    await connection.rollback();
    console.error("Error creating appointment:", error);
    throw error;
  } finally {
    connection.release();
  }
};

exports.getAppointmentById = async (appointmentId) => {
  try {
    const [rows] = await db.execute(
      `SELECT
    a.appointment_id,
    a.appointment_date,
    a.appointment_time,
    a.status,
    a.confirmCheckInTime,
    a.symptoms,
    a.appointmentType,
    a.rejection_reason,
    a.service_id,
    s.service_name,
    a.doctor_id,
    d.full_name AS doctor_full_name,
    a.room_id,
    er.room_name,
    p.first_name AS patient_first_name,
    p.last_name AS patient_last_name,
    p.hn AS patient_hn
FROM appointment a
LEFT JOIN services s ON a.service_id = s.service_id
LEFT JOIN doctors d ON a.doctor_id = d.doctor_id
LEFT JOIN examRoom er ON a.room_id = er.room_id
LEFT JOIN patient p ON a.patient_id = p.patient_id
WHERE a.appointment_id = ?`,
      [appointmentId]
    );
    return rows[0] || null;
  } catch (error) {
    console.error("Error fetching appointment by ID:", error);
    throw error;
  }
};

exports.getPatientAppointments = async (patientId) => {
  try {
    const [rows] = await db.execute(
      `SELECT
          a.appointment_id,
          a.appointment_date,
          a.appointment_time,
          a.status,
          a.confirmCheckInTime,
          a.symptoms,
          a.appointmentType,
          a.rejection_reason,
          a.service_id,
          s.service_name,
          a.doctor_id,
          d.full_name AS doctor_full_name,
          a.room_id,
          er.room_name,
          p.hn AS patient_hn,
          p.first_name AS patient_first_name,
          p.last_name AS patient_last_name
       FROM appointment a
       JOIN patient p ON a.patient_id = p.patient_id
       LEFT JOIN services s ON a.service_id = s.service_id
       LEFT JOIN doctors d ON a.doctor_id = d.doctor_id
       LEFT JOIN examRoom er ON a.room_id = er.room_id
       WHERE a.patient_id = ?
       ORDER BY a.appointment_date DESC, a.appointment_time DESC`,
      [patientId]
    );
    return rows;
  } catch (error) {
    console.error("Error fetching patient appointments:", error);
    throw error;
  }
};

exports.getFilteredAppointments = async (filters = {}) => {
  const { serviceId, status } = filters;
  let query = `
        SELECT
          a.appointment_id,
          a.appointment_date,
          a.appointment_time,
          a.status,
          a.symptoms,
          a.appointmentType,
          a.rejection_reason,
          a.service_id,
          s.service_name,
          a.doctor_id,
          d.full_name AS doctor_full_name,
          a.room_id,
          er.room_name,
          p.hn,
          p.first_name AS patient_first_name,
          p.last_name AS patient_last_name
      FROM appointment a
      JOIN patient p ON a.patient_id = p.patient_id
      LEFT JOIN services s ON a.service_id = s.service_id
      LEFT JOIN doctors d ON a.doctor_id = d.doctor_id
      LEFT JOIN examRoom er ON a.room_id = er.room_id
    `;
  const conditions = [];
  const params = [];

  if (serviceId) {
    conditions.push(`s.service_id = ?`);
    params.push(serviceId);
  }
  if (status) {
    conditions.push(`a.status = ?`);
    params.push(status);
  }

  if (conditions.length > 0) {
    query += ` WHERE ` + conditions.join(" AND ");
  }

  query += ` ORDER BY a.appointment_date DESC, a.appointment_time DESC`;

  try {
    const [rows] = await db.execute(query, params);
    return rows;
  } catch (error) {
    console.error("Error fetching filtered appointments:", error);
    throw error;
  }
};

exports.updateAppointmentStatus = async (
  appointmentId,
  newStatus,
  confirmCheckInTime = null,
  rejectionReason = null
) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // ดึง ers_id ก่อนอัปเดตสถานะ
    const [appointmentInfo] = await connection.execute(
      `SELECT ers_id FROM appointment WHERE appointment_id = ?`,
      [appointmentId]
    );

    if (appointmentInfo.length === 0) {
      await connection.rollback();
      return false; // ไม่พบนัดหมาย
    }
    const ers_id = appointmentInfo[0].ers_id;

    let query = `UPDATE appointment SET status = ?`;
    const params = [newStatus];

    if (newStatus === "confirmed" && confirmCheckInTime) {
      query += `, confirmCheckInTime = ?`;
      params.push(confirmCheckInTime);
    }
    // หากสถานะเปป็น 'rejected' ให้บันทึกเหตุผล
    if (newStatus === "rejected") {
      query += `, rejection_reason = ?`;
      params.push(rejectionReason);
    } else {
      // หากเปลี่ยนสถานะอื่นที่ไม่ใช่ 'rejected' ให้ clear เหตุผลการปฏิเสธ
      query += `, rejection_reason = NULL`;
    }

    query += ` WHERE appointment_id = ?`;
    params.push(appointmentId);

    const [result] = await db.execute(query, params);

    if (result.affectedRows === 0) {
      await connection.rollback();
      return false;
    }

    // 3. คืน Slot หากสถานะใหม่เป็น 'rejected' หรือ 'cancelled'
    if (newStatus === "rejected" || newStatus === "cancelled") {
      const [slotUpdateResult] = await connection.execute(
        `UPDATE examRoomSlots SET is_booked = FALSE WHERE ers_id = ?`,
        [ers_id]
      );
      if (slotUpdateResult.affectedRows === 0) {
        console.warn(
          `[Appointment Model] ไม่สามารถอัปเดต examRoomSlots สำหรับ ers_id ${ers_id} ระหว่างการเปลี่ยนสถานะเป็น ${newStatus}.`
        );
      } else {
        console.log(
          `[Appointment Model] Slot ers_id ${ers_id} ถูกคืนสถานะว่างแล้ว เนื่องจากนัดหมายถูกเปลี่ยนเป็น ${newStatus}.`
        );
      }
    }
    await connection.commit();
    return true;
  } catch (error) {
    console.error("Error updating appointment status:", error);
    throw error;
  } finally {
    connection.release();
  }
};
// ยกเลิกนัด
exports.cancelAppointment = async (appointmentId, patientId) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const [appointmentRows] = await connection.execute(
      `SELECT ers_id, status, appointment_date, appointment_time, patient_id
             FROM appointment WHERE appointment_id = ? AND patient_id = ?`,
      [appointmentId, patientId]
    );
    if (appointmentRows.length === 0) {
      await connection.rollback();
      console.warn(
        `[Appointment Model] Attempt to cancel non-existent or unauthorized appointment: ${appointmentId} for patient ${patientId}`
      );
      return false;
    }
    const {
      ers_id,
      status: currentStatus,
      appointment_date,
      appointment_time,
      patient_id: affectedPatientId,
    } = appointmentRows[0];

    let incrementBlacklist = false;
    if (currentStatus === "approved") {
      const appointmentDateTime = new Date(
        `${appointment_date
          .toISOString()
          .slice(0, 10)}T${appointment_time.slice(0, 8)}`
      );
      const twentyFourHoursBeforeAppointment = new Date(
        appointmentDateTime.getTime() - 24 * 60 * 60 * 1000
      );
      const currentTime = new Date();

      if (currentTime > twentyFourHoursBeforeAppointment) {
        incrementBlacklist = true;
      }
    }

    const [updateAppointmentResult] = await connection.execute(
      `UPDATE appointment SET status = 'cancelled' WHERE appointment_id = ?`,
      [appointmentId]
    );

    const [updateSlotResult] = await connection.execute(
      `UPDATE examRoomSlots SET is_booked = FALSE WHERE ers_id = ?`,
      [ers_id]
    );

    if (incrementBlacklist) {
      const incrementResult = await Patient.incrementCancellationCount(
        affectedPatientId
      );
      if (incrementResult && incrementResult.newCount !== undefined) {
        console.log(
          `[Appointment Model] Patient ${affectedPatientId} has ${incrementResult.newCount} cancellations`
        );
        resultInfo = incrementResult; // ส่งต่อไปยัง controller เพื่อแจ้งผู้ป่วย
      } else {
        console.error(
          `[Appointment Model] Failed to increment cancellation count for patient ${affectedPatientId}`
        );
      }
    }

    if (
      updateAppointmentResult.affectedRows === 0 ||
      updateSlotResult.affectedRows === 0
    ) {
      await connection.rollback();
      return false;
    }

    await connection.commit();
    console.log(
      `[Appointment Model] Appointment ${appointmentId} cancelled for patient ${patientId}. Blacklist incremented: ${incrementBlacklist}`
    );
    return true;
  } catch (error) {
    await connection.rollback();
    console.error("Error cancelling appointment:", error);
    throw error;
  } finally {
    connection.release();
  }
};

exports.incrementCancellationCount = async (patientId) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // ดึงข้อมูลปัจจุบัน
    const [rows] = await connection.execute(
      `SELECT cancellation_count, is_blacklisted FROM patient WHERE patient_id = ?`,
      [patientId]
    );

    if (rows.length === 0) {
      await connection.rollback();
      console.warn(`[Patient Model] ไม่พบข้อมูลผู้ป่วย ID: ${patientId}`);
      return false;
    }

    const { cancellation_count, is_blacklisted } = rows[0];
    if (is_blacklisted) {
      await connection.rollback();
      console.log(`[Patient Model] Patient ${patientId} ถูก blacklist แล้ว`);
      return true;
    }

    const newCount = cancellation_count + 1;
    let newBlacklistStatus = false;
    if (newCount >= 3) {
      newBlacklistStatus = true;
    }

    await connection.execute(
      `UPDATE patient 
       SET cancellation_count = ?, is_blacklisted = ? 
       WHERE patient_id = ?`,
      [newCount, newBlacklistStatus, patientId]
    );

    await connection.commit();

    console.log(
      `[Patient Model] Patient ${patientId} cancellation_count = ${newCount}, blacklist = ${newBlacklistStatus}`
    );
    return { newCount, isBlacklisted: newBlacklistStatus };
  } catch (err) {
    await connection.rollback();
    console.error("Error incrementing cancellation count:", err);
    throw err;
  } finally {
    connection.release();
  }
};

exports.completeAppointment = async (appointmentId, patientId) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const [appointmentCheck] = await connection.execute(
      `SELECT appointment_id, status FROM appointment WHERE appointment_id = ? AND patient_id = ?`,
      [appointmentId, patientId]
    );

    if (
      appointmentCheck.length === 0 ||
      appointmentCheck[0].status !== "approved"
    ) {
      await connection.rollback();
      console.warn(
        `[Appointment Model] Attempt to complete non-existent, unauthorized or non-approved appointment: ${appointmentId} for patient ${patientId}`
      );
      return false;
    }

    const now = new Date();
    const [result] = await connection.execute(
      `UPDATE appointment SET status = 'confirmed', confirmCheckInTime = ? WHERE appointment_id = ?`,
      [now, appointmentId]
    );

    if (result.affectedRows === 0) {
      await connection.rollback();
      return false;
    }

    await connection.commit();
    console.log(
      `[Appointment Model] Appointment ${appointmentId} completed for patient ${patientId}.`
    );
    return true;
  } catch (error) {
    await connection.rollback();
    console.error("Error completing appointment:", error);
    throw error;
  } finally {
    connection.release();
  }
};

exports.getApprovedCheckedInAppointments = async (serviceId) => {
  const today = new Date().toLocaleDateString("en-CA", {
    timeZone: "Asia/Bangkok",
  });
  const [rows] = await db.execute(
    `SELECT
        a.appointment_id,
        a.appointment_date,
        a.appointment_time,
        a.status,
        a.appointmentType,
        a.confirmCheckInTime,
        a.symptoms,
        p.patient_id,
        p.hn,
        p.first_name AS patient_first_name,
        p.last_name AS patient_last_name,
        d.full_name AS doctor_full_name,
        a.doctor_id,
        er.room_name,
        a.room_id,
        s.service_name,
        a.service_id
     FROM appointment a
     JOIN patient p ON a.patient_id = p.patient_id
     LEFT JOIN doctors d ON a.doctor_id = d.doctor_id
     LEFT JOIN examRoom er ON a.room_id = er.room_id
     JOIN services s ON a.service_id = s.service_id
     WHERE a.status = 'confirmed'
       AND a.confirmCheckInTime IS NOT NULL
       AND a.service_id = ?
       AND a.appointment_date = ? 
       AND a.appointmentType IN ('patient_booking', 'doctor_follow_up')
     ORDER BY a.appointment_date, a.appointment_time`,
    [serviceId, today]
  );
  return rows;
};

exports.getDoctorPrecheckedAppointmentsForToday = async (doctorId) => {
  // ดึงนัดของหมอวันนี้ ที่สถานะ 'prechecked'
  // รวม patient, service, room และ precheck ล่าสุด

  const today = new Date().toLocaleDateString("en-CA", {
    timeZone: "Asia/Bangkok",
  });

  const [rows] = await db.execute(
    `
    SELECT
      a.appointment_id,
      a.appointment_date,
      a.appointment_time,
      a.status,
      a.symptoms,

      p.patient_id,
      p.hn,
      p.first_name AS patient_first_name,
      p.last_name AS patient_last_name,

      s.service_id,
      s.service_name,
      er.room_id,
      er.room_name,

      pr.precheck_id,
      pr.blood_pressure,
      pr.heart_rate,
      pr.temperature,
      pr.weight,
      pr.height,
      pr.other_notes

    FROM appointment a
    JOIN patient p       ON a.patient_id = p.patient_id
    JOIN services s      ON a.service_id = s.service_id
    JOIN examRoom er     ON a.room_id = er.room_id
    LEFT JOIN patient_precheck pr
           ON pr.appointment_id = a.appointment_id
    WHERE a.status = 'prechecked'
      AND a.doctor_id = ?
      AND a.appointment_date = ?
      AND a.appointmentType IN ('patient_booking', 'doctor_follow_up')
    ORDER BY a.appointment_time ASC
    `,
    [doctorId, today]
  );
  return rows;
};

exports.createFollowUp = async ({
  previous_appointment_id,
  ers_id,
  doctor_id,
  appointment_date,
  appointment_time,
}) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // ดึง patient จากนัดเดิม
    const [[oldAppt]] = await conn.execute(
      `SELECT patient_id FROM appointment WHERE appointment_id = ?`,
      [previous_appointment_id]
    );
    if (!oldAppt) throw new Error("ไม่พบนัดหมายเดิม");

    // ดึงข้อมูล slot ที่เลือก
    const [[slot]] = await conn.execute(
      `SELECT ers.ers_id, ers.ds_id, ds.service_id, ds.room_id
       FROM examRoomSlots ers
       JOIN doctorSchedules ds ON ers.ds_id = ds.ds_id
       WHERE ers.ers_id = ? AND ers.is_booked = 0`,
      [ers_id]
    );
    if (!slot) throw new Error("slot นี้ถูกจองไปแล้ว หรือไม่พบข้อมูล slot");

    // เพิ่ม appointment
    const [insert] = await conn.execute(
      `INSERT INTO appointment (
        ers_id, ds_id, patient_id, doctor_id, service_id, room_id,
        appointment_date, appointment_time, appointmentType, status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'doctor_follow_up', 'approved')`,
      [
        slot.ers_id,
        slot.ds_id,
        oldAppt.patient_id,
        doctor_id,
        slot.service_id,
        slot.room_id,
        appointment_date,
        appointment_time,
      ]
    );

    // อัปเดต slot เป็น booked
    await conn.execute(
      `UPDATE examRoomSlots SET is_booked = 1, updated_at = NOW() WHERE ers_id = ?`,
      [slot.ers_id]
    );

    await conn.commit();
    return { success: true, appointment_id: insert.insertId };
  } catch (error) {
    await conn.rollback();
    console.error("[Appointment Model] createFollowUp error:", error);
    throw error;
  } finally {
    conn.release();
  }
};
