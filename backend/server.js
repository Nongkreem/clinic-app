const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const path = require('path');
const db = require('./config/db');

const app = express();
const port = process.env.PORT || 5001;

const corsOptions = {
  origin: 'http://localhost:5173', // frontend URL
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
};


app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// log ทุก request
app.use((req, res, next) => {
  console.log(`${req.method} ${req.originalUrl}`);
  next();
});


// Middleware
app.use(bodyParser.json());


// ให้เสิร์ฟไฟล์ในโฟลเดอร์ /uploads แบบ static
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// --- Routes ---
const authRoutes = require('./routes/authRoutes');
const guideRoutes = require('./routes/guideRoutes')
const serviceRoutes = require('./routes/serviceRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const clinicRoomRoutes = require('./routes/clinicRoomRoutes');
const doctorScheduleRoutes = require('./routes/doctorScheduleRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const patientRoutes = require('./routes/patientRoutes');
const nurseRoutes = require('./routes/nurseRoutes');
const nurseScheduleRoutes = require('./routes/counterTerminalSchedulesRoutes')
const precheckRoutes = require('./routes/precheckRoutes')
const medicalRecordRoutes = require('./routes/medicalRecordRoutes')
const medicalCertificateRoutes = require('./routes/medicalCertificateRoutes')
const symptomAssessmentRoutses = require('./routes/symptomAssessmentRoutes')

app.use('/api/auth', authRoutes); // กำหนด prefix /api/auth สำหรับ Auth Routes
app.use('/api/guide', guideRoutes);
app.use('/api', serviceRoutes);
app.use('/api', doctorRoutes);
app.use('/api', clinicRoomRoutes);
app.use('/api', doctorScheduleRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/patients', patientRoutes); // กำหนด prefix /api/patients สำหรับ Patient Routes
app.use('/api/nurses', nurseRoutes); // กำหนด prefix /api/nurses สำหรับ Nurse Routes
app.use('/api/nurse-schedules', nurseScheduleRoutes);
app.use('/api/precheck', precheckRoutes);
app.use('/api/medical-record', medicalRecordRoutes);
app.use('/api/medical-certificates', medicalCertificateRoutes);
app.use('/api/symptom-assessment', symptomAssessmentRoutses);

// --- ทดสอบ Protected Route (ต้อง Login ก่อน) ---
const { authenticateToken } = require('./middleware/authMiddleware');
const { authorizeRole } = require('./middleware/authorization');

app.get('/api/protected_data', authenticateToken, (req, res) => {
    res.json({
        message: `ยินดีต้อนรับ, ${req.user.userEmail}! บทบาทของคุณคือ ${req.user.role}. นี่คือข้อมูลที่ต้องมีการยืนยันตัวตน.`,
        userDetails: req.user
    });
});

app.get('/api/nurse_only_data', authenticateToken, authorizeRole(['nurse', 'head_nurse', 'admin']), (req, res) => {
    res.json({
        message: `คุณคือ ${req.user.role} และมีสิทธิ์เข้าถึงข้อมูลพยาบาลเท่านั้น`,
        data: 'ข้อมูลลับเฉพาะพยาบาล'
    });
});


// --- Start Server ---
app.listen(port, () => {
  console.log(`Backend server running on http://localhost:${port}`);
});