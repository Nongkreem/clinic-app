const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../config/db"); // สมมุติว่าเชื่อม MySQL ได้แล้ว
const User = require("../models/User");
require("dotenv").config();

// ช่วยเช็คว่าเป็น email โรงพยาบาลมั้ย
const isHospitalEmail = (email) => {
  return email.endsWith("@hospital.com");
};

exports.register = async (req, res) => {
  const {
    email,
    password,
    role,
    hn,
    firstName,
    lastName,
    dateOfBirth,
    phoneNumber,
    gender,
  } = req.body;

  if (
    !email ||
    !password ||
    !role ||
    !hn ||
    !firstName ||
    !lastName ||
    !dateOfBirth ||
    !phoneNumber ||
    !gender
  ) {
    return res
      .status(400)
      .json({ success: false, message: "กรุณากรอกข้อมูลให้ครบถ้วน" });
  }

  if (isHospitalEmail(email)) {
    return res
      .status(403)
      .json({ success: false, message: "บุคลากรไม่สามารถลงทะเบียนเองได้" });
  }

  if (role !== "patient") {
    return res
      .status(400)
      .json({
        success: false,
        message:
          "บทบาทไม่ถูกต้องสำหรับการลงทะเบียนนี้ ผู้ป่วยเท่านั้นที่ลงทะเบียนได้",
      });
  }

  try {
    const result = await User.register(
      email,
      password,
      role,
      hn,
      firstName,
      lastName,
      dateOfBirth,
      phoneNumber,
      gender
    );

    if (result.success) {
      res.status(201).json(result);
    } else {
      if (
        result.message.includes("อีเมลนี้ถูกใช้ลงทะเบียนแล้ว") ||
        result.message.includes("หมายเลข HN นี้ถูกใช้ลงทะเบียนแล้ว")
      ) {
        return res.status(409).json(result);
      }
      res.status(500).json(result);
    }
  } catch (error) {
    console.error("Registration controller error:", error);
    res
      .status(500)
      .json({ success: false, message: "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์" });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "กรุณากรอกอีเมลและรหัสผ่าน" });
  }

  try {
    let user = await User.findByUserEmail(email);
    if (!user) {
      return res.status(401).json({ message: "ไม่พบข้อมูลผู้ใช้งานในระบบ" });
    }

    // ตรวจสอบว่าเป็นบุคลากรหรือไม่
    const isHospitalStaff = user.role === "doctor" || user.role === "nurse" || user.role === "head_nurse";

    // ถ้าเป็นบุคลากร และยังไม่มี account ใน user_accounts
    if (isHospitalStaff && !user.id) {
      const hashedPassword = await bcrypt.hash(password, 10);
      const [insertRes] = await db.execute(
        `INSERT INTO user_accounts (email, password_hash, role, entity_id, is_counter_terminal)
         VALUES (?, ?, ?, ?, ?)`,
        [email, hashedPassword, user.role, user.entity_id, 0]
      );
      user.id = insertRes.insertId;
      user.password_hash = hashedPassword;
    }

    // ถ้าไม่ใช่บุคลากร และไม่มี account ให้ปฏิเสธการ login
    if (!isHospitalStaff && !user.id) {
      return res.status(401).json({
        message: "ไม่พบบัญชีผู้ใช้งาน กรุณาลงทะเบียนก่อนเข้าสู่ระบบ",
      });
    }

    // ตรวจสอบ password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" });
    }

    // กรณี Nurse
    let isTodayScheduled = false;
    // เช็คตารางเวรพยาบาลและอัปเดตสถานะ
    if (user.role === "nurse") {
      const today = new Date().toISOString().split("T")[0]; //YYYY-MM-DD
      const [rows] = await db.execute(
        `SELECT COUNT(*) as count
          FROM counterTerminalSchedules
          WHERE nurse_id = ? AND schedule_date = CURDATE()
          LIMIT 1
        `,
        [user.entity_id]
      );
      isTodayScheduled = rows.length > 0;
    }

    const canBeCounter = user.is_counter_terminal === 1 // หัวหน้าพยาบาลกำหนดให้ประจำที่ counter
    const isCounterTerminal = canBeCounter && isTodayScheduled; // รวมผลลัพธ์ สิทธิ์จากหัวหน้าพยาบาล + ตารางวันนี้
    
    // ---- service ids ----
    let serviceIds = [];
    if (user.role === "doctor" && user.service_ids) {
      serviceIds = user.service_ids;
    } else if (user.role === "nurse" && user.nurse_service_id) {
      serviceIds = [user.nurse_service_id];
    }


    // สร้าง JWT token
    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
        email: user.email,
        entity_id: user.entity_id,
        service_id: serviceIds,
        is_counter_terminal: isCounterTerminal
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "เข้าสู่ระบบสำเร็จ",
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        entity_id: user.entity_id,
        service_id: serviceIds,
        is_counter_terminal: isCounterTerminal
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: err.message });
  }
};
