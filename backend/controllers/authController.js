const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db'); // สมมุติว่าเชื่อม MySQL ได้แล้ว
const User = require('../models/User');
require('dotenv').config();

// ช่วยเช็คว่าเป็น email โรงพยาบาลมั้ย
const isHospitalEmail = (email) => {
  return email.endsWith('@hospital.com');
};

exports.registerUser = async (req, res) => {
  const { email, password } = req.body;
  if (isHospitalEmail(email)) {
    return res.status(403).json({ message: 'บุคลากรไม่สามารถลงทะเบียนเองได้' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const sql = 'INSERT INTO user_accounts (email, password_hash, role) VALUES (?, ?, ?)';
    const [result] = await db.execute(sql, [email, hashedPassword, 'patient']);
    res.status(201).json({ message: 'สมัครสมาชิกสำเร็จ' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findByEmail(email);
    if (!user) return res.status(401).json({ message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' });

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) return res.status(401).json({ message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' });

    const token = jwt.sign({ id: user.id, role: user.role, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.json({
      message: 'เข้าสู่ระบบสำเร็จ',
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        entity_id: user.entity_id
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
