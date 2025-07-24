const Guide = require('../models/Guide');

// ดึงคำแนะนำทั้งหมด
exports.getAllGuidances = async (req, res) => {
  try {
    const guidances = await Guide.getAll();
    res.status(200).json(guidances);
  } catch (error) {
    console.error('Error in getAllGuidances controller:', error);
    res.status(500).json({ message: 'ไม่สามารถดึงข้อมูลคำแนะนำการเตรียมตัวได้' });
  }
};

// สร้างคำแนะนำใหม่
exports.createGuidance = async (req, res) => {
  // รับ advice_text จาก req.body
  const { advice_text } = req.body;
  if (!advice_text || advice_text.trim() === '') { // ตรวจสอบว่ามีข้อมูลหรือไม่
    return res.status(400).json({ message: 'ข้อความคำแนะนำจำเป็นต้องระบุ' });
  }
  try {
    // ส่ง advice_text ไปยัง Model
    const newGuidance = await Guide.create({ advice_text });
    res.status(201).json({ message: 'เพิ่มคำแนะนำสำเร็จ!', guidance: newGuidance });
  } catch (error) {
    console.error('Error in createGuidance controller:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการเพิ่มคำแนะนำ' });
  }
};

// อัปเดตคำแนะนำ
exports.updateGuidance = async (req, res) => {
  // รับ advice_id จาก req.params และ advice_text จาก req.body
  const { id } = req.params; // ID ที่ส่งมาใน URL คือ advice_id
  const { advice_text } = req.body;
  if (!advice_text || advice_text.trim() === '') { // ตรวจสอบว่ามีข้อมูลหรือไม่
    return res.status(400).json({ message: 'ข้อความคำแนะนำจำเป็นต้องระบุ' });
  }
  try {
    // ส่ง advice_id และ advice_text ไปยัง Model
    const updated = await Guide.update(id, { advice_text });
    if (updated) {
      res.status(200).json({ message: 'อัปเดตคำแนะนำสำเร็จ!' });
    } else {
      res.status(404).json({ message: 'ไม่พบคำแนะนำที่ต้องการอัปเดต' });
    }
  } catch (error) {
    console.error('Error in updateGuidance controller:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการอัปเดตคำแนะนำ' });
  }
};

// ลบคำแนะนำ
exports.deleteGuidance = async (req, res) => {
  const { id } = req.params; // ID ที่ส่งมาใน URL คือ advice_id
  try {
    const deleted = await Guide.delete(id);
    if (deleted) {
      res.status(200).json({ message: 'ลบคำแนะนำสำเร็จ!' });
    } else {
      res.status(404).json({ message: 'ไม่พบคำแนะนำที่ต้องการลบ' });
    }
  } catch (error) {
    console.error('Error in deleteGuidance controller:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการลบคำแนะนำ' });
  }
};
