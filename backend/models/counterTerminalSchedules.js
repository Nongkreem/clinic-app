const db = require("../config/db");

exports.getAllSchedules = async () => {
    try {
        const [nurseSchedules] = await db.execute(
            `
                SELECT
                    ct.ct_id,
                    ct.schedule_date,
                    n.nurse_id,
                    n.first_name,
                    n.last_name,
                    s.service_id,
                    s.service_name,
                    ua.is_counter_terminal
                FROM counterTerminalSchedules ct
                JOIN nurse n ON ct.nurse_id = n.nurse_id
                JOIN services s ON n.service_id = s.service_id
                JOIN user_accounts ua ON ua.entity_id = n.nurse_id
            `
        );
        return nurseSchedules;
    } catch (error) {
        console.error('Error fetching nurse schedules:', error);
        throw error;
    }
}

exports.deleteSchedule = async (ct_id) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const [result] = await connection.execute(
            "DELETE FROM counterTerminalSchedules WHERE ct_id = ?",
            [ct_id]
        );

        await connection.commit();
        return result.affectedRows > 0;
    } catch (error) {
        await connection.rollback();
    console.error("Error deleting counter terminal schedule:", error);
    throw error;
  } finally {
    connection.release();
  }
    
}

exports.toggleCounterStatus = async (nurse_id, status) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const [result] = await connection.execute(
            `UPDATE user_accounts SET is_counter_terminal = ? WHERE entity_id = ? AND role = 'nurse'`,
            [status, nurse_id]
        );

        await connection.commit();
        return result.affectedRows > 0;
    } catch (error) {
        await connection.rollback();
        console.error("Error toggling counter terminal status:", error);
        throw error;
    } finally {
        connection.release();
    }
};

exports.createSchedule = async ({ scheduleEntries, scheduleDates }) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // เตรียมข้อมูลสำหรับ bulk insert
        const values = [];
        for (const { nurse_id } of scheduleEntries) {
            for (const date of scheduleDates) {
                values.push([nurse_id, date]);
            }
        }

        if (values.length === 0) {
            await connection.rollback();
            return 0;
        }

        // ใช้ INSERT IGNORE หรือ ON DUPLICATE KEY UPDATE เพื่อกันซ้ำ
        const [result] = await connection.query(
            `
            INSERT INTO counterTerminalSchedules (nurse_id, schedule_date)
            VALUES ?
            ON DUPLICATE KEY UPDATE nurse_id = VALUES(nurse_id)
            `,
            [values]
        );

        await connection.commit();
        return result.affectedRows;  // จำนวนแถวที่ insert หรือ update สำเร็จ
    } catch (error) {
        await connection.rollback();
        console.error("Error creating counter terminal schedule:", error);
        throw error;
    } finally {
        connection.release();
    }
}