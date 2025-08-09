const Doctor = require('../models/Doctor');

/**
 * สร้างแพทย์ใหม่
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.createDoctor = async (req, res) => {
    console.log('Received req body: ', req.body)
  const { doctor_id, full_name, phone_number, email, service_ids } = req.body;
  if (!doctor_id || !full_name || !Array.isArray(service_ids) || service_ids.length === 0) {
    return res.status(400).json({ message: 'ข้อมูลแพทย์ไม่สมบูรณ์: รหัสแพทย์, ชื่อเต็ม, และบริการที่ให้จำเป็นต้องระบุ' });
  }
  if (doctor_id.length !== 6 || !/^D\d{5}$/.test(doctor_id)) {
    return res.status(400).json({ message: 'รหัสประจำตัวแพทย์ต้องขึ้นต้นด้วย D และตามด้วยตัวเลข 5 หลัก' });
  }

  try {
    const newDoctor = await Doctor.createDoctor({ doctor_id, full_name, phone_number, email, service_ids });
    res.status(201).json({ message: 'บันทึกข้อมูลแพทย์สำเร็จ!', doctor: newDoctor });
  } catch (error) {
    console.error('Error in createDoctor controller:', error);
    if (error.code === 'ER_DUP_ENTRY') { // ถ้า doctor_id ซ้ำ
      return res.status(409).json({ message: 'รหัสประจำตัวแพทย์นี้มีอยู่ในระบบแล้ว' });
    }
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการบันทึกข้อมูลแพทย์' });
  }
};

/**
 * ดึงข้อมูลแพทย์ทั้งหมด
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.getAllDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.getAllDoctors();
    console.log('doctor data')
    res.status(200).json(doctors);
  } catch (error) {
    console.error('Error in getAllDoctors controller:', error);
    res.status(500).json({ message: 'ไม่สามารถดึงข้อมูลแพทย์ได้' });
  }
};

/**
 * อัปเดตข้อมูลแพทย์
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.updateDoctor = async (req, res) => {
  const { id } = req.params; // doctor_id
  const { full_name, phone_number, email, service_ids } = req.body;
  if (!full_name || !Array.isArray(service_ids) || service_ids.length === 0) {
    return res.status(400).json({ message: 'ข้อมูลแพทย์ไม่สมบูรณ์: ชื่อเต็มและบริการที่ให้จำเป็นต้องระบุ' });
  }

  try {
    const updated = await Doctor.updateDoctor(id, { full_name, phone_number, email, service_ids });
    if (updated) {
      res.status(200).json({ message: 'อัปเดตข้อมูลแพทย์สำเร็จ!' });
    } else {
      res.status(404).json({ message: 'ไม่พบข้อมูลแพทย์ที่ต้องการอัปเดต' });
    }
  } catch (error) {
    console.error('Error in updateDoctor controller:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการอัปเดตข้อมูลแพทย์' });
  }
};

/**
 * ลบข้อมูลแพทย์
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.deleteDoctor = async (req, res) => {
  const { id } = req.params; // doctor_id
  try {
    const deleted = await Doctor.deleteDoctor(id);
    if (deleted) {
      res.status(200).json({ message: 'ลบข้อมูลแพทย์สำเร็จ!' });
    } else {
      res.status(404).json({ message: 'ไม่พบข้อมูลแพทย์ที่ต้องการลบ' });
    }
  } catch (error) {
    console.error('Error in deleteDoctor controller:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการลบข้อมูลแพทย์' });
  }
};

exports.getDoctorsByService = async (req, res) => {
  const { serviceId } = req.params; // ดึง serviceId จาก URL parameter
  try {
    const doctors = await Doctor.getDoctorsByService(parseInt(serviceId, 10));
    res.status(200).json(doctors);
  } catch (error) {
    console.error('Error in getDoctorsByService controller:', error);
    res.status(500).json({ message: 'ไม่สามารถดึงข้อมูลแพทย์ตามบริการได้' });
  }
};