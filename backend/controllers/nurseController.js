const Nurse = require('../models/Nurse');

exports.createNurese = async (req, res) => {
    const { nurse_id, first_name, last_name, gmail, phone, service_id } = req.body;
    
    if (!nurse_id || !first_name || !last_name || !gmail || !service_id ) {
        return res.status(400).json({ message: 'ข้อมูลพยาบาลไม่สมบูรณ์: รหัสพยาบาล ชื่อ-นามสกุล อีเมล และบริการจำเป็นต้องระบุ'});
    }
    if (nurse_id.length != 6 || !/^N\d{5}$/.test(nurse_id)) {
        return res.status(400).json({ message: 'รหัสประจำตัวพยาบาลต้องขึ้นต้นด้วย N และตามด้วยตัวเลข 5 หลัก'});
    }
    if (!gmail.endsWith('@vejnaree.ac.th')) {
        return res.status(400).json({ message: 'อีเมลต้องลงท้ายด้วย @vejnaree.ac.th เท่านั้น' });
    }


    try {
        const newNurse = await Nurse.createNurese({ nurse_id, first_name, last_name, gmail, phone, service_id });
        res.status(201).json({ message: 'บันทึกข้อมูลพยาบาลสำเร็จ!', nurse: newNurse });
    } catch (error) {
        console.error('Error in createNurse controller:', error);
        if(error.code == 'ER_DUP_ENTRY'){
            return res.status(409).json({ message: 'รหัสประจำตัวพยาบาลนี้มีอยู่ในระบบแล้ว' });
        }
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการบันทึกข้อมูลพยาบาล' });
    }
};

exports.getAllNurses = async (req, res) => {
  try {
    const nurses = await Nurse.getAllNurses();
    console.log("[getAllNurses] data:", nurses)
    res.status(200).json(nurses);
  } catch (error) {
    console.error('Error in getAllNurses controller:', error);
    res.status(500).json({ message: 'ไม่สามารถดึงข้อมูลพยาบาลได้' });
  }
};

exports.deleteNurse = async (req, res) => {
    const { id } = req.params;
    try {
        const deleted = await Nurse.deleteNurse(id);
        if (deleted) {
          res.status(200).json({ message: 'ลบข้อมูลแพทย์สำเร็จ!' });
        } else {
          res.status(404).json({ message: 'ไม่พบข้อมูลแพทย์ที่ต้องการลบ' });
        }
      } catch (error) {
        console.error('Error in deleteGuidance controller:', error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการลบพยาบาล' });
      }
}

exports.updateNurse = async (req, res) => {
  const { id } = req.params;
  const { first_name, last_name, gmail, phone, service_id } = req.body;

  if (!first_name || !last_name || !gmail || !service_id) {
    return res.status(400).json({ message: 'ข้อมูลไม่ครบถ้วน' });
  }

  if (!gmail.endsWith('@vejnaree.ac.th')) {
    return res.status(400).json({ message: 'อีเมลต้องลงท้ายด้วย @vejnaree.ac.th เท่านั้น' });
  }

  try {
    const updated = await Nurse.updateNurse(id, {
      first_name,
      last_name,
      gmail,
      phone,
      service_id,
    });

    if (updated) {
      res.status(200).json({ message: 'อัปเดตข้อมูลพยาบาลสำเร็จ!' });
    } else {
      res.status(404).json({ message: 'ไม่พบข้อมูลพยาบาลที่ต้องการอัปเดต' });
    }
  } catch (error) {
    console.error('Error in updateNurse controller:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการอัปเดตข้อมูลพยาบาล' });
  }
};
