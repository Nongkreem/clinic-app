console.log('Loading appointmentController.js file'); // ✅ เพิ่ม Log นี้ที่บรรทัดแรกสุดของไฟล์

const DoctorSchedule = require('../models/DoctorSchedules');
const Appointment = require('../models/Appointment');
const PatientModel = require('../models/Patient');

exports.getAvailableSlotsByDateAndService = async (req, res) => {
    const { scheduleDate, serviceId } = req.query;

    if (!scheduleDate || !serviceId) {
        return res.status(400).json({ message: 'ต้องระบุวันที่และบริการ' });
    }

    const parsedServiceId = parseInt(serviceId, 10);
    if (isNaN(parsedServiceId)) {
        return res.status(400).json({ message: 'รหัสบริการไม่ถูกต้อง' });
    }

    try {
        const slots = await DoctorSchedule.getAggregatedAvailableSlots(scheduleDate, parsedServiceId);
        console.log('Available slots for booking:', slots);
        res.status(200).json(slots);
    } catch (error) {
        console.error('Error fetching available slots for booking:', error);
        res.status(500).json({ message: 'ไม่สามารถดึงข้อมูล Slot เวลาที่ว่างได้' });
    }
};

exports.bookNewAppointment = async (req, res) => {
    const { ers_id, symptoms, appointment_type } = req.body;
    console.log('Booking new appointment with data:', req.body);
    const patient_id = req.user.entity_id;

    if (!ers_id || !patient_id || !symptoms || !appointment_type) {
        return res.status(400).json({ message: 'ข้อมูลการจองไม่สมบูรณ์' });
    }

    try {
        const result = await Appointment.createAppointment(ers_id, patient_id, symptoms, appointment_type);
        
        if (result.success) {
            res.status(201).json(result);
        } else {
            res.status(409).json(result);
        }
    } catch (error) {
        console.error('Error booking new appointment:', error);
        res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการสร้างนัดหมาย' });
    }
};

exports.getAppointmentById = async (req, res) => {
    const { id } = req.params;
    try {
        const appointment = await Appointment.getAppointmentById(id);
        if (!appointment) {
            return res.status(404).json({ message: 'ไม่พบข้อมูลนัดหมาย' });
        }
        res.status(200).json(appointment);
    } catch (error) {
        console.error('Error getting appointment by ID:', error);
        res.status(500).json({ message: 'ไม่สามารถดึงข้อมูลนัดหมายได้' });
    }
};


exports.getPatientAppointments = async (req, res) => {
    const patient_id = req.user.entity_id;
    console.log('Fetching appointments for patient ID:', patient_id);

    if (!patient_id) {
        console.log('[Debug] no patient_id found in user data');
        return res.status(400).json({ message: 'ไม่พบรหัสผู้ป่วยในข้อมูลผู้ใช้' });
    }

    try {
        const appointments = await Appointment.getPatientAppointments(patient_id);
        console.log('[Debug] Fetched appointments for patient:', appointments);
        if (appointments.length === 0) {
            console.log('[DEBUG] getPatientAppointments - No appointments found for this patient.'); // ✅ บรรทัดนี้
        }
        res.status(200).json(appointments);
    } catch (error) {
        console.error('Error fetching patient appointments:', error);
        res.status(500).json({ message: 'ไม่สามารถดึงข้อมูลนัดหมายของผู้ป่วยได้' });
    }
};

// ฟังก์ชันดึงรายการนัดหมายตามบริการ
exports.getAppointments = async (req, res) => {
    const { serviceId, status } = req.query;
    
    const filters = {};
    if (serviceId) {
        const parsedServiceId = parseInt(serviceId, 10);
        if (!isNaN(parsedServiceId)) {
            filters.serviceId = parsedServiceId;
        } else {
            return res.status(400).json({ message: 'รหัสบริการไม่ถูกต้อง' });
        }
    }
    if (status) {
        filters.status = status;
    }

    try {
        const appointments = await Appointment.getFilteredAppointments(filters);
        res.status(200).json(appointments);
    } catch (error) {
        console.error('Error fetching appointments with filters:', error);
        res.status(500).json({ message: 'ไม่สามารถดึงข้อมูลนัดหมายได้' });
    }

}

exports.updateAppointmentStatus = async (req, res) => {
    const { id } = req.params;
    const { newStatus, confirmCheckInTime, rejectionReason } = req.body;
    console.log('test: ', rejectionReason);
    if (!newStatus) {
        return res.status(400).json({ message: 'ต้องระบุสถานะใหม่' });
    }

    if (newStatus === 'rejected' && !rejectionReason) {
        return res.status(400).json({ message: 'ต้องระบุเหตุผลในการปฏิเสธ' });
    }

    try {
        const updated = await Appointment.updateAppointmentStatus(id, newStatus, confirmCheckInTime, rejectionReason);
        if (updated) {
            res.status(200).json({ message: 'อัปเดตสถานะนัดหมายสำเร็จ' });
        } else {
            res.status(404).json({ message: 'ไม่พบข้อมูลนัดหมายที่ต้องการอัปเดต' });
        }
    } catch (error) {
        console.error('Error updating appointment status:', error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการอัปเดตสถานะนัดหมาย' });
    }
};


exports.cancelPatientAppointment = async (req, res) => {
    const { id } = req.params; 
    const patient_id = req.user.entity_id; 

    if (!patient_id) {
        return res.status(401).json({ message: 'ไม่ได้รับอนุญาต: ไม่พบข้อมูลผู้ป่วย' });
    }

    try {
        const success = await Appointment.cancelAppointment(id, patient_id);
        if (success) {
            res.status(200).json({ message: 'ยกเลิกนัดหมายสำเร็จ' });
        } else {
            res.status(404).json({ message: 'ไม่พบข้อมูลนัดหมายหรือคุณไม่ได้รับอนุญาตให้ยกเลิกนัดหมายนี้' });
        }
    } catch (error) {
        console.error('Error cancelling patient appointment:', error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการยกเลิกนัดหมาย' });
    }
};

exports.completePatientAppointment = async (req, res) => {
    const { id } = req.params; 
    const patient_id = req.user.entity_id; 
    console.log('[DEBUG AppointmentController] Patient ID: ' , patient_id);
    if (!patient_id) {
        return res.status(401).json({ message: 'ไม่ได้รับอนุญาต: ไม่พบข้อมูลผู้ป่วย' });
    }

    try {
        const success = await Appointment.completeAppointment(id, patient_id);
        if (success) {
            res.status(200).json({ message: 'ยืนยันเข้ารับบริการสำเร็จ' });
        } else {
            res.status(400).json({ message: 'ไม่สามารถยืนยันเข้ารับบริการได้ (อาจยังไม่ได้รับการอนุมัติ)' });
        }
    } catch (error) {
        console.error('Error completing patient appointment:', error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการยืนยันเข้ารับบริการ' });
    }
};

exports.getPatientBlacklistStatus = async (req, res) => {
    const { patientId } = req.params; // รับ patientId จาก URL params
    console.log('Fetching blacklist status for patient ID:', patientId);
    // ตรวจสอบว่า patientId ที่ส่งมาตรงกับ entity_id ของผู้ใช้ที่ Login อยู่หรือไม่
    if (parseInt(patientId, 10) !== req.user.entity_id) {
        return res.status(403).json({ message: 'ไม่ได้รับอนุญาต: คุณไม่สามารถเข้าถึงข้อมูล Blacklist ของผู้ป่วยรายอื่นได้' });
    }

    try {
        const status = await PatientModel.checkAndHandleBlacklistStatus(parseInt(patientId, 10));
        res.status(200).json(status);
    } catch (error) {
        console.error('Error fetching patient blacklist status:', error);
        res.status(500).json({ message: 'ไม่สามารถดึงสถานะ Blacklist ได้' });
    }
};

exports.getApprovedCheckedInForService = async (req, res) => {
  try {
    const { serviceId } = req.query;
    if (!serviceId) return res.status(400).json({ message: 'ต้องระบุ serviceId' });

    const parsedServiceId = parseInt(serviceId, 10);
    if (isNaN(parsedServiceId)) return res.status(400).json({ message: 'serviceId ไม่ถูกต้อง' });

    const rows = await Appointment.getApprovedCheckedInAppointments(parsedServiceId);
    res.status(200).json(rows);
  } catch (err) {
    console.error('Error getApprovedCheckedInForService:', err);
    res.status(500).json({ message: 'ไม่สามารถดึงรายการนัดหมายได้' });
  }
};
