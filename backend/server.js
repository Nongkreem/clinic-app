const express = require('express');
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

// ✅ 1. CORS ต้องมาก่อน
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// ✅ 2. Body parser ต้องมาก่อน routes และ log
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ 3. Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ✅ 4. Log middleware (หลัง body parser)
app.use((req, res, next) => {
  console.log(`${req.method} ${req.originalUrl}`);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('Body:', req.body);
  }
  next();
});

// --- Routes ---
const authRoutes = require('./routes/authRoutes');
const guideRoutes = require('./routes/guideRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const clinicRoomRoutes = require('./routes/clinicRoomRoutes');
const doctorScheduleRoutes = require('./routes/doctorScheduleRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const patientRoutes = require('./routes/patientRoutes');
const nurseRoutes = require('./routes/nurseRoutes');
const nurseScheduleRoutes = require('./routes/counterTerminalSchedulesRoutes');
const precheckRoutes = require('./routes/precheckRoutes');
const medicalRecordRoutes = require('./routes/medicalRecordRoutes');
const medicalCertificateRoutes = require('./routes/medicalCertificateRoutes');
const symptomAssessmentRoutes = require('./routes/symptomAssessmentRoutes');

console.log("✅ AuthRoutes loaded from", require.resolve('./routes/authRoutes'));

// ✅ Routes - เรียงจากเฉพาะเจาะจงไปทั่วไป
app.use('/api/auth', authRoutes);
app.use('/api/guide', guideRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/nurses', nurseRoutes);
app.use('/api/nurse-schedules', nurseScheduleRoutes);
app.use('/api/precheck', precheckRoutes);
app.use('/api/medical-record', medicalRecordRoutes);
app.use('/api/medical-certificates', medicalCertificateRoutes);
app.use('/api/symptom-assessment', symptomAssessmentRoutes);

// ⚠️ Generic routes ควรอยู่หลังสุด
app.use('/api', serviceRoutes);
app.use('/api', doctorRoutes);
app.use('/api', clinicRoomRoutes);
app.use('/api', doctorScheduleRoutes);

// --- Protected Routes ---
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

// ✅ Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working!', timestamp: new Date() });
});

// ✅ List all routes (for debugging)
console.log('\n📍 Registered Routes:');
app._router.stack.forEach(r => {
  if (r.route && r.route.path) {
    console.log(`  ${Object.keys(r.route.methods).join(', ').toUpperCase()} ${r.route.path}`);
  } else if (r.name === 'router' && r.regexp) {
    const path = r.regexp.source
      .replace('\\/?', '')
      .replace('(?=\\/|$)', '')
      .replace(/\\/g, '');
    console.log(`  Router mounted at: ${path}`);
  }
});

// ✅ 404 handler - ต้องอยู่หลังสุด
app.use((req, res) => {
  console.log('❌ 404 - Route not found:', req.path);
  res.status(404).json({ 
    success: false, 
    message: 'Route not found',
    path: req.path,
    method: req.method
  });
});

// ✅ Error handler
app.use((err, req, res, next) => {
  console.error('❌ Error:', err);
  res.status(500).json({ 
    success: false, 
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// --- Start Server ---
app.listen(port, () => {
  console.log(`\n🚀 Backend server running on http://localhost:${port}`);
  console.log(`✅ Auth routes available at http://localhost:${port}/api/auth`);
  console.log(`✅ Test endpoint: http://localhost:${port}/api/test\n`);
});