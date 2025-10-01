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
                service_id,
                doctor_id,
                room_id,
                appointment_date,
                appointment_time,
                status,
                appointmentType
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        slot.ers_id,
        patient_id,
        symptoms,
        slot.ds_id,
        slot.service_id,
        slot.doctor_id,
        slot.room_id,
        slot.schedule_date, // Use schedule_date from ds
        slot.slot_start, // Use slot_start as appointment_time
        "pending", // Initial status is 'pending'
        appointment_type,
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
      // Only approved appointments count towards blacklist
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
      if (!incrementResult) {
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
  const [rows] = await db.execute(
    `SELECT
        a.appointment_id,
        a.appointment_date,
        a.appointment_time,
        a.status,
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
     WHERE a.status = 'approved'
       AND a.confirmCheckInTime IS NOT NULL
       AND a.service_id = ?
     ORDER BY a.appointment_date, a.appointment_time`,
    [serviceId]
  );
  return rows;
};


