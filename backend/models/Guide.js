// backend/models/PreparationGuidance.js
const db = require('../config/db');


exports.getAll = async () => {
  try {
    const [rows] = await db.execute('SELECT advice_id, advice_text FROM advice ORDER BY advice_text');
    return rows;
  } catch (error) {
    console.error('Error fetching all preparation guidances:', error);
    throw error;
  }
};

// create
exports.create = async ({ advice_text }) => {
  try {
    const [result] = await db.execute(
      'INSERT INTO advice (advice_text) VALUES (?)',
      [advice_text]
    );
    return { advice_id: result.insertId, advice_text};
  } catch (error) {
    console.error('Error creating preparation guidance:', error);
    throw error;
  }
};


// update
exports.update = async (advice_id, { advice_text }) => {
  try {
    // อัปเดตคอลัมน์ advice_text โดยใช้ advice_id เป็นเงื่อนไข
    const [result] = await db.execute(
      'UPDATE advice SET advice_text = ? WHERE advice_id = ?',
      [advice_text, advice_id]
    );
    return result.affectedRows > 0;
  } catch (error) {
    console.error('Error updating preparation guidance:', error);
    throw error;
  }
};


exports.delete = async (advice_id) => {
  try {
    // ลบโดยใช้ advice_id
    const [result] = await db.execute('DELETE FROM advice WHERE advice_id = ?', [advice_id]);
    return result.affectedRows > 0;
  } catch (error) {
    console.error('Error deleting preparation guidance:', error);
    throw error;
  }
};