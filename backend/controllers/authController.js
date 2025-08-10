const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db'); // สมมุติว่าเชื่อม MySQL ได้แล้ว
const User = require('../models/User');
require('dotenv').config();

// ช่วยเช็คว่าเป็น email โรงพยาบาลมั้ย
const isHospitalEmail = (email) => {
  return email.endsWith('@hospital.com');
};

// เปลี่ยนชื่อจาก registerUser เป็น register ให้สอดคล้องกับ AuthContext
exports.register = async (req, res) => {
    // Destructure all required fields from the request body
    const { email, password, role, hn, firstName, lastName, dateOfBirth, phoneNumber } = req.body;

    // Basic validation for all fields
    if (!email || !password || !role || !hn || !firstName || !lastName || !dateOfBirth || !phoneNumber) {
        return res.status(400).json({ success: false, message: 'กรุณากรอกข้อมูลให้ครบถ้วน' });
    }

    // Check if it's a hospital email (still apply if desired)
    if (isHospitalEmail(email)) {
        return res.status(403).json({ success: false, message: 'บุคลากรไม่สามารถลงทะเบียนเองได้' });
    }

    // Ensure that only 'patient' role can be registered via this public endpoint
    if (role !== 'patient') {
        return res.status(400).json({ success: false, message: 'บทบาทไม่ถูกต้องสำหรับการลงทะเบียนนี้ ผู้ป่วยเท่านั้นที่ลงทะเบียนได้' });
    }

    try {
        // Call the User model's register function with all collected data
        // ส่ง email เป็น username
        const result = await User.register(email, password, role, hn, firstName, lastName, dateOfBirth, phoneNumber);
        
        if (result.success) {
            res.status(201).json(result); // 201 Created
        } else {
            // Handle specific error messages returned from the model
            if (result.message.includes('อีเมลนี้ถูกใช้ลงทะเบียนแล้ว') || result.message.includes('หมายเลข HN นี้ถูกใช้ลงทะเบียนแล้ว')) {
                return res.status(409).json(result); // 409 Conflict for duplicate data
            }
            res.status(500).json(result); // Generic server error for other issues
        }
    } catch (error) {
        console.error('Registration controller error:', error);
        res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์' });
    }
};

// เปลี่ยนชื่อจาก loginUser เป็น login ให้สอดคล้องกับ AuthContext
exports.login = async (req, res) => {
  const { email, password } = req.body; // email ที่รับเข้ามาคือ user_name

  if (!email || !password) {
    return res.status(400).json({ message: 'กรุณากรอกอีเมลและรหัสผ่าน' });
  }

  try {
    // ใช้ findByUsername แทน findByEmail
    const user = await User.findByUserEmail(email);
    if (!user) return res.status(401).json({ message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' });

    // เปรียบเทียบรหัสผ่าน (user.password คือคอลัมน์ password ใน User_account)
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) return res.status(401).json({ message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' });

    // สร้าง JWT token
    const token = jwt.sign({ id: user.id, role: user.role, email: user.user_name }, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.json({
      message: 'เข้าสู่ระบบสำเร็จ',
      token,
      user: {
        id: user.id,
        email: user.user_name, // ส่ง user_name กลับไปเป็น email ใน Frontend
        role: user.role,
        entity_id: user.entity_id
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: err.message });
  }
};