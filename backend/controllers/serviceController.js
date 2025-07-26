const Service = require('../models/Service');

exports.createService = async (req, res) => {
    const {service_name, description, price, advice_ids } = req.body;
    if (!service_name || !description || !price || !Array.isArray(advice_ids)) {
        return res.status(400).json({ message: 'ช้อมูลบริการไม่สมบูรณ์'});
    }
    if (isNaN(price) || parseFloat(price) <= 0) {
        return res.status(400).json({ message: 'กรุณาระบุราคาเป็นตัวเลขที่มากกว่า 0'})
    }

    try {
        const newService = await Service.createService({ service_name, description, price, advice_ids});
        res.status(201).json({ message: 'บันทึกข้อมูลบริการสำเร็จ!', service: newService });
  } catch (error) {
    console.error('Error in createService controller:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการบันทึกข้อมูลบริการ' });
  }
};

exports.getAllServices = async (req, res) => {
  try {
    const services = await Service.getAllServices();
    res.status(200).json(services);
  } catch (error) {
    console.error('Error in getAllServices controller:', error);
    res.status(500).json({ message: 'ไม่สามารถดึงข้อมูลบริการได้' });
  }
};

exports.updateService = async (req, res) => {
  const { id } = req.params; // service_id
  const { service_name, description, price, advice_ids } = req.body; // ไม่มี service_code แล้ว
  if (!service_name || !description || !price || !Array.isArray(advice_ids)) {
    return res.status(400).json({ message: 'ข้อมูลบริการไม่สมบูรณ์' });
  }
  if (isNaN(price) || parseFloat(price) <= 0) {
    return res.status(400).json({ message: 'ราคากรุณาระบุเป็นตัวเลขที่มากกว่า 0' });
  }

  try {
    const updated = await Service.updateService(id, { service_name, description, price, advice_ids });
    if (updated) {
      res.status(200).json({ message: 'อัปเดตข้อมูลบริการสำเร็จ!' });
    } else {
      res.status(404).json({ message: 'ไม่พบข้อมูลบริการที่ต้องการอัปเดต' });
    }
  } catch (error) {
    console.error('Error in updateService controller:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการอัปเดตข้อมูลบริการ' });
  }
};

exports.deleteService = async (req, res) => {
  const { id } = req.params; // service_id
  try {
    const deleted = await Service.deleteService(id);
    if (deleted) {
      res.status(200).json({ message: 'ลบข้อมูลบริการสำเร็จ!' });
    } else {
      res.status(404).json({ message: 'ไม่พบข้อมูลบริการที่ต้องการลบ' });
    }
  } catch (error) {
    console.error('Error in deleteService controller:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการลบข้อมูลบริการ' });
  }
};