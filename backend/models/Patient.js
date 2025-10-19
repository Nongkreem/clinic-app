// backend/models/Patient.js
const db = require("../config/db");

const BLACKLIST_THRESHOLD = 3; // จำนวนครั้งที่ยกเลิกก่อนจะถูก Blacklist
const BLACKLIST_DURATION_DAYS = 30; // ระยะเวลาที่ถูก Blacklist เป็นวัน

exports.createPatient = async (userData) => {
  const {
    first_name,
    last_name,
    birth_date,
    gender,
    hn,
    phone_number,
    address,
    id_card_number,
    patient_id,
  } = userData;
  try {
    const [result] = await db.execute(
      `INSERT INTO patient (patient_id, first_name, last_name, birth_date, gender, hn, phone_number, address, id_card_number)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        patient_id,
        first_name,
        last_name,
        birth_date,
        gender,
        hn,
        phone_number,
        address,
        id_card_number,
      ]
    );
    return result.insertId;
  } catch (error) {
    console.error("Error creating patient:", error);
    throw error;
  }
};

exports.findPatientByUserId = async (userId) => {
  try {
    const [rows] = await db.execute(
      "SELECT * FROM patient WHERE patient_id = ?",
      [userId]
    );
    return rows[0];
  } catch (error) {
    console.error("Error finding patient by user ID:", error);
    throw error;
  }
};

exports.getPatientProfile = async (patientId) => {
  try {
    const [rows] = await db.execute(
      `SELECT
                p.patient_id,
                p.first_name,
                p.last_name,
                p.birth_date,
                p.gender,
                p.hn,
                p.phone_number,
                p.address,
                p.id_card_number,
                p.cancellation_count,
                p.blacklist_until
             FROM patient p
             WHERE p.patient_id = ?`,
      [patientId]
    );
    return rows[0] || null;
  } catch (error) {
    console.error("Error fetching patient profile:", error);
    throw error;
  }
};

exports.updatePatientProfile = async (patientId, updates) => {
  const fields = [];
  const values = [];

  for (const key in updates) {
    if (updates[key] !== undefined) {
      fields.push(`${key} = ?`);
      values.push(updates[key]);
    }
  }

  if (fields.length === 0) {
    return true; // No updates to perform
  }

  const query = `UPDATE patient SET ${fields.join(", ")} WHERE patient_id = ?`;
  values.push(patientId);

  try {
    const [result] = await db.execute(query, values);
    return result.affectedRows > 0;
  } catch (error) {
    console.error("Error updating patient profile:", error);
    throw error;
  }
};

exports.incrementCancellationCount = async (patientId) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // ดึงข้อมูล patient ปัจจุบัน
    const [patient] = await connection.execute(
      `SELECT cancellation_count, blacklist_until FROM patient WHERE patient_id = ?`,
      [patientId]
    );

    if (patient.length === 0) {
      await connection.rollback();
      console.warn(
        `Patient with ID ${patientId} not found for cancellation count increment.`
      );
      return false;
    }

    let { cancellation_count, blacklist_until } = patient[0];
    cancellation_count = (cancellation_count || 0) + 1; // เพิ่มจำนวนยกเลิก

    let updateQuery = `UPDATE patient SET cancellation_count = ?`;
    const updateParams = [cancellation_count, patientId];

    // ตรวจสอบว่าถึงเกณฑ์ Blacklist หรือไม่
    if (cancellation_count >= BLACKLIST_THRESHOLD) {
      // ✅ ใช้ BLACKLIST_THRESHOLD ที่กำหนดไว้
      const newBlacklistUntil = new Date();
      newBlacklistUntil.setDate(
        newBlacklistUntil.getDate() + BLACKLIST_DURATION_DAYS
      ); // ✅ ใช้ BLACKLIST_DURATION_DAYS

      updateQuery += `, blacklist_until = ?, is_blacklisted = 1`;
      updateParams.splice(1, 0, newBlacklistUntil); // ใส่ newBlacklistUntil ก่อน patientId
    } else if (blacklist_until !== null) {
      // ถ้าจำนวนยกเลิกน้อยกว่า threshold แล้ว และเคยติด blacklist ให้ล้าง blacklist_until
      updateQuery += `, blacklist_until = NULL`;
    }

    updateQuery += ` WHERE patient_id = ?`;

    const [result] = await connection.execute(updateQuery, updateParams);

    if (result.affectedRows === 0) {
      await connection.rollback();
      console.error(
        `Failed to update cancellation count or blacklist status for patient ${patientId}`
      );
      return false;
    }

    await connection.commit();
    console.log(
      `[Patient Model] Cancellation count incremented to ${cancellation_count} for patient ${patientId}. Blacklist status updated.`
    );
    return true;
  } catch (error) {
    await connection.rollback();
    console.error("Error incrementing cancellation count:", error);
    throw error;
  } finally {
    connection.release();
  }
};

exports.checkAndHandleBlacklistStatus = async (patientId) => {
  try {
    const [rows] = await db.execute(
      `SELECT cancellation_count, blacklist_until 
       FROM patient 
       WHERE patient_id = ?`,
      [patientId]
    );

    if (rows.length === 0) {
      return {
        isBlacklisted: false,
        cancellation_count: 0,
        blacklistUntil: null,
      };
    }

    const { cancellation_count, blacklist_until } = rows[0];
    const currentTime = new Date();

    // ✅ ยังติด blacklist อยู่
    if (blacklist_until && new Date(blacklist_until) > currentTime) {
      return {
        isBlacklisted: true,
        cancellation_count,
        blacklistUntil: new Date(blacklist_until),
      };
    }

    // ✅ เคยติด blacklist แต่หมดอายุแล้ว
    else if (blacklist_until && new Date(blacklist_until) <= currentTime) {
      await db.execute(
        `UPDATE patient SET blacklist_until = NULL, cancellation_count = 0 WHERE patient_id = ?`,
        [patientId]
      );
      return {
        isBlacklisted: false,
        cancellation_count: 0,
        blacklistUntil: null,
      };
    }

    // ✅ เกิน threshold แต่ยังไม่ถูกตั้ง blacklist
    if (cancellation_count >= BLACKLIST_THRESHOLD && !blacklist_until) {
      const newBlacklistUntil = new Date();
      newBlacklistUntil.setDate(
        newBlacklistUntil.getDate() + BLACKLIST_DURATION_DAYS
      );

      await db.execute(
        `UPDATE patient SET blacklist_until = ? WHERE patient_id = ?`,
        [newBlacklistUntil, patientId]
      );

      return {
        isBlacklisted: true,
        cancellation_count,
        blacklistUntil: newBlacklistUntil,
      };
    }

    // ✅ กรณีปกติ (ยังไม่เกิน threshold)
    return { isBlacklisted: false, cancellation_count, blacklistUntil: null };
  } catch (error) {
    console.error("Error checking and handling blacklist status:", error);
    throw error;
  }
};

exports.getPatientBlacklistStatus = async (patientId) => {
  try {
    const [rows] = await db.execute(
      `SELECT cancellation_count, blacklist_until FROM patient WHERE patient_id = ?`,
      [patientId]
    );

    if (rows.length === 0) {
      return {
        isBlacklisted: false,
        cancellation_count: 0,
        blacklistUntil: null,
      };
    }

    const { cancellation_count, blacklist_until } = rows[0];
    const currentTime = new Date();
    let isBlacklisted = false;
    let finalBlacklistUntil = null;

    if (blacklist_until && new Date(blacklist_until) > currentTime) {
      isBlacklisted = true;
      finalBlacklistUntil = new Date(blacklist_until);
    } else if (blacklist_until && new Date(blacklist_until) <= currentTime) {
      // ถ้า blacklist หมดอายุแล้ว ให้ล้างค่าใน DB และนับว่าไม่ติด blacklist
      await db.execute(
        `UPDATE patient SET blacklist_until = NULL, cancellation_count = 0 WHERE patient_id = ?`,
        [patientId]
      );
    }

    return {
      isBlacklisted: isBlacklisted,
      cancellation_count: cancellation_count || 0,
      blacklistUntil: finalBlacklistUntil,
    };
  } catch (error) {
    console.error("Error getting patient blacklist status:", error);
    throw error;
  }
};

exports.getAllPatients = async () => {
  try {
    const [rows] = await db.execute(
      `SELECT 
                patient_id, first_name, last_name, hn, phone_number,
                cancellation_count, blacklist_until
            FROM patient`
    );
    return rows;
  } catch (error) {
    console.error("Error fetching all patients:", error);
    throw error;
  }
};
