const db = require('../config/db');

exports.createNurese = async ({ nurse_id, first_name, last_name, gmail, phone, service_id }) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // 1. Insert into nurse table
    const [nurseResult] = await connection.execute(
      'INSERT INTO nurse (nurse_id, first_name, last_name, gmail, phone, service_id) VALUES (?, ?, ?, ?, ?, ?)',
      [nurse_id, first_name, last_name, gmail, phone || null, service_id]
    );

    await connection.commit();
    return { nurse_id, first_name, last_name, gmail, phone, service_id };
  } catch (error) {
    await connection.rollback();
    console.error('Error creating nurse:', error);
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

exports.deleteNurse = async (nurse_id) => {
  try {
    const [result] = await db.execute('DELETE FROM nurse WHERE nurse_id = ?', [nurse_id]);
    return result.affectedRows > 0;
  } catch (error) {
    console.error('Error deleting nurse:', error);
    throw error;
  }
}


exports.updateNurse = async (nurse_id, data) => {
  const { first_name, last_name, gmail, phone, service_id } = data;
  const [result] = await db.execute(
    `UPDATE nurse 
     SET first_name = ?, last_name = ?, gmail = ?, phone = ?, service_id = ?
     WHERE nurse_id = ?`,
    [first_name, last_name, gmail, phone, service_id, nurse_id]
  );

  return result.affectedRows > 0;
};
