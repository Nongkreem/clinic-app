const DoctorSchedule = require('../models/DoctorSchedules');
const Appointment = require('../models/Appointment');

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
    const patient_id = req.user.entity_id; // Assuming entity_id stores patient_id for patient role

    if (!ers_id || !patient_id || !symptoms || !appointment_type) {
        return res.status(400).json({ message: 'ข้อมูลการจองไม่สมบูรณ์' });
    }

    try {
        const result = await Appointment.createAppointment(ers_id, patient_id, symptoms, appointment_type);
        
        if (result.success) {
            res.status(201).json(result);
        } else {
            res.status(409).json(result); // Conflict if slot is already booked or other issues
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
    const patient_id = req.user.entity_id; // Get patient_id from authenticated user
    console.log('Fetching appointments for patient ID:', patient_id);
    if (!patient_id) {
        return res.status(400).json({ message: 'ไม่พบรหัสผู้ป่วยในข้อมูลผู้ใช้' });
    }

    try {
        const appointments = await Appointment.getPatientAppointments(patient_id);
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
        // Assume this endpoint is for staff (nurse, head_nurse) so no patient_id filter by default
        const appointments = await Appointment.getFilteredAppointments(filters);
        res.status(200).json(appointments);
    } catch (error) {
        console.error('Error fetching appointments with filters:', error);
        res.status(500).json({ message: 'ไม่สามารถดึงข้อมูลนัดหมายได้' });
    }

}

exports.updateAppointmentStatus = async (req, res) => {
    const { id } = req.params;
    const { newStatus, confirmCheckInTime } = req.body;

    if (!newStatus) {
        return res.status(400).json({ message: 'ต้องระบุสถานะใหม่' });
    }

    try {
        const updated = await Appointment.updateAppointmentStatus(id, newStatus, confirmCheckInTime);
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


exports.cancelAppointment = async (req, res) => {
    const { id } = req.params;
    try {
        const cancelled = await Appointment.cancelAppointment(id);
        if (cancelled) {
            res.status(200).json({ message: 'ยกเลิกนัดหมายสำเร็จ' });
        } else {
            res.status(404).json({ message: 'ไม่พบข้อมูลนัดหมายที่ต้องการยกเลิก' });
        }
    } catch (error) {
        console.error('Error cancelling appointment:', error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการยกเลิกนัดหมาย' });
    }
};
