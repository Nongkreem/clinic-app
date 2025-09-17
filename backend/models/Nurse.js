const db = require('../config/db');

exports.createNurese = async ({ nurse_id, first_name, last_name, gmail, phone, service_id }) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // 1. Insert into doctors table
    const [nurseResult] = await connection.execute(
      'INSERT INTO nurse (nurse_id, first_name, last_name, gmail, phone, service_id) VALUES (?, ?, ?, ?, ?, ?)',
      [nurse_id, first_name, last_name, gmail, phone || null, service_id]
    );

    await connection.execute(
      'INSERT INTO user_accounts (email, password_hash, role, entity_id) VALUES (?, ?, ?, ?)',
      [gmail, null, 'nurse', nurse_id]
    );

    await connection.commit();
    return { nurse_id, first_name, last_name, gmail, phone, service_id };
  } catch (error) {
    await connection.rollback();
    console.error('Error creating doctor:', error);
    throw error;
  } finally {
    connection.release();
  }
};

exports.getAllNurses = async () => {
    try {
        const [nurses] = await db.execute(
            `SELECT 
                n.nurse_id, 
                n.first_name, 
                n.last_name, 
                n.gmail, 
                n.phone, 
                s.service_id, 
                s.service_name
            FROM nurse n
            INNER JOIN services s ON n.service_id = s.service_id
            ORDER BY n.nurse_id`
        );
        console.log("[Nurse model] fetch nurse: ", nurses);
        return nurses;
    } catch (error) {
        console.error('Error fetching all nurses:', error);
        throw error;
    }
}