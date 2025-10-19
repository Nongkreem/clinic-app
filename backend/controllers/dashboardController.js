import db from "../config/db.js";

// 1. Top Services
export const getTopServices = async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT s.service_name, COUNT(a.appointment_id) AS count
      FROM appointment a
      JOIN services s ON a.service_id = s.service_id
      GROUP BY s.service_name
      ORDER BY count DESC
      LIMIT 5
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 2. Peak Booking Hours
export const getPeakHours = async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT HOUR(appointment_time) AS hour, COUNT(*) AS total
      FROM appointment
      GROUP BY hour
      ORDER BY hour
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 3. Monthly Bookings
export const getMonthlyBookings = async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT DATE_FORMAT(appointment_date, '%Y-%m') AS month, COUNT(*) AS total
      FROM appointment
      GROUP BY month
      ORDER BY month
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 4. Department
export const getDepartmentDistribution = async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT s.service_name, COUNT(a.appointment_id) AS total
      FROM appointment a
      JOIN services s ON a.service_id = s.service_id
      GROUP BY s.service_name
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 5. Doctor Load
export const getDoctorLoad = async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT d.full_name AS doctor_name, COUNT(a.appointment_id) AS total
      FROM appointment a
      JOIN doctorSchedules ds ON a.doctor_id = ds.doctor_id
      JOIN doctors d ON d.doctor_id = ds.doctor_id
      GROUP BY doctor_name
      ORDER BY total DESC
      LIMIT 5
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 6. Room Utilization
export const getRoomUtilization = async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT er.room_name,
       COUNT(*) - SUM(CASE WHEN e.is_booked THEN 1 ELSE 0 END) AS used
      FROM examRoomSlots e
      JOIN doctorSchedules d ON e.ds_id = d.ds_id
      JOIN examRoom er ON d.room_id = er.room_id
      GROUP BY d.room_id;
    `);
    res.json(rows);
    console.log('room utilization', rows)
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 7. Appointment Status
export const getAppointmentStatus = async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT status, COUNT(*) AS total
      FROM appointment
      GROUP BY status
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
