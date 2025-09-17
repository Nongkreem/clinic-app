// frontend/src/pages/MyAppointment.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; 
import Button from '../../components/common/Button';
import Popup from '../../components/common/Popup'; 
import { FileText, Info } from 'lucide-react'; 

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001';

const MyAppointment = () => {
    const { user, loading: authLoading } = useAuth();
    const patientId = user?.entity_id;

    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [patientBlacklistStatus, setPatientBlacklistStatus] = useState(null); 

    // States for confirmation popup
    const [showConfirmPopup, setShowConfirmPopup] = useState(false);
    const [actionType, setActionType] = useState(''); 
    const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);
    const [confirmMessage, setConfirmMessage] = useState('');

    // State for Appointment Card Popup
    const [showAppointmentCardPopup, setShowAppointmentCardPopup] = useState(false);
    const [appointmentCardDetails, setAppointmentCardDetails] = useState(null);

    const navigate = useNavigate();

    // Fetch patient's blacklist status on mount and after actions
    const fetchBlacklistStatus = async () => {
        if (!patientId) return;
        try {
            const response = await axios.get(`${API_BASE_URL}/api/patients/${patientId}/blacklist-status`, { 
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setPatientBlacklistStatus(response.data);
            console.log("Blacklist Status:", response.data);
        } catch (err) {
            console.error('Error fetching blacklist status:', err);
        }
    };

    // Fetch appointments for the logged-in patient
    const fetchMyAppointments = async () => {
        if (!patientId || authLoading) {
            setLoading(false); 
            return; 
        }

        setLoading(true);
        setError('');
        try {
            const response = await axios.get(`${API_BASE_URL}/api/appointments/my-appointments`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setAppointments(response.data);
            console.log('My Appointments:', response.data);
        } catch (err) {
            console.error('Failed to fetch my appointments:', err);
            setError('ไม่สามารถโหลดรายการนัดหมายของคุณได้');
            setAppointments([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMyAppointments();
        fetchBlacklistStatus();
    }, [patientId, authLoading]); 

    const willCauseBlacklist = (appointment) => {
        if (appointment.status !== 'approved') return false;

        const appointmentDateTime = new Date(`${appointment.appointment_date}T${appointment.appointment_time}`);
        const twentyFourHoursBeforeAppointment = new Date(appointmentDateTime.getTime() - (24 * 60 * 60 * 1000));
        const currentTime = new Date();
        
        return currentTime > twentyFourHoursBeforeAppointment;
    };

    const handleCancelClick = (appointment) => {
        setSelectedAppointmentId(appointment.appointment_id);
        setActionType('cancel');
        if (willCauseBlacklist(appointment)) {
            setConfirmMessage('การยกเลิกนัดหมายนี้อาจทำให้จำนวนการยกเลิกของคุณเพิ่มขึ้น และอาจถูกบันทึกเข้า Blacklist หากเกิน 3 ครั้ง คุณแน่ใจหรือไม่ที่จะยกเลิก?');
        } else {
            setConfirmMessage('คุณแน่ใจหรือไม่ที่จะยกเลิกนัดหมายนี้?');
        }
        setShowConfirmPopup(true);
    };

    const handleCompleteClick = (appointmentId) => {
        setSelectedAppointmentId(appointmentId);
        setActionType('confirmed');
        setConfirmMessage('คุณแน่ใจหรือไม่ว่าได้เข้ารับบริการนี้แล้ว?');
        setShowConfirmPopup(true);
    };

    const handleConfirmAction = async () => {
        setShowConfirmPopup(false);
        setLoading(true);
        setError('');

        try {
            let response;
            if (actionType === 'cancel') {
                response = await axios.put(`${API_BASE_URL}/api/appointments/${selectedAppointmentId}/patient-cancel`, {}, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
            } else if (actionType === 'confirmed') {
                response = await axios.put(`${API_BASE_URL}/api/appointments/${selectedAppointmentId}/patient-complete`, {}, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
            }

            if (response.status === 200) {
                alert(`${actionType === 'cancel' ? 'ยกเลิก' : 'ยืนยันเข้ารับบริการ'}สำเร็จ!`);
                await fetchMyAppointments(); 
                if (actionType === 'cancel') {
                    await fetchBlacklistStatus(); 
                }
            } else {
                setError(response.data?.message || 'เกิดข้อผิดพลาดในการดำเนินการ');
            }
        } catch (err) {
            console.error(`Error ${actionType}ing appointment:`, err);
            setError(err.response?.data?.message || 'เกิดข้อผิดพลาดในการดำเนินการ');
        } finally {
            setLoading(false);
            setSelectedAppointmentId(null);
            setActionType('');
            setConfirmMessage('');
        }
    };

    const handleCancelPopup = () => {
        setShowConfirmPopup(false);
        setSelectedAppointmentId(null);
        setActionType('');
        setConfirmMessage('');
    };

    const handleViewAppointmentCard = (appointment) => {
        setAppointmentCardDetails(appointment);
        setShowAppointmentCardPopup(true);
    };

    const handleCloseAppointmentCardPopup = () => {
        setShowAppointmentCardPopup(false);
        setAppointmentCardDetails(null);
    };

    const getFormattedDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' });
    };

    const getFormattedTime = (timeString) => {
        if (!timeString) return '-';
        return timeString.slice(0, 5); 
    };

    const getStatusDisplay = (status) => {
        switch (status) {
            case 'pending': return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">รออนุมัติ</span>;
            case 'approved': return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">อนุมัติแล้ว</span>;
            case 'rejected': return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">ถูกปฏิเสธ</span>;
            case 'confirmed': return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">เข้ารับบริการ</span>;
            case 'cancelled': return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">ยกเลิกแล้ว</span>;
            default: return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">{status}</span>;
        }
    };

    if (authLoading || loading) {
        return <div className="flex justify-center items-center min-h-screen text-lg">กำลังโหลดข้อมูลนัดหมาย...</div>;
    }

    return (
        <div className="container mx-auto p-4 md:p-8">
            <h2 className="text-3xl font-bold text-primary-default mb-6">นัดหมายของฉัน</h2>

            {/* Blacklist Status Display */}
            {patientBlacklistStatus?.isBlacklisted && (
                <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
                    <Info size={20} /> 
                    <p className="text-sm font-semibold">
                        คุณถูก Blacklist ไม่สามารถจองคิวได้
                        {patientBlacklistStatus.blacklistUntil ? ` จนถึงวันที่ ${new Date(patientBlacklistStatus.blacklistUntil).toLocaleDateString('th-TH')}` : ''}
                        เนื่องจากยกเลิกนัดหมายบ่อยเกินไป (ยกเลิกแล้ว {patientBlacklistStatus.cancellation_count || 0} ครั้ง)
                    </p>
                </div>
            )}

            {!loading && appointments.length === 0 ? (
                <div className="bg-white p-6 text-center">
                    <p className="text-gray-600">คุณยังไม่มีนัดหมายในระบบ</p>
                    <p className="mt-2 text-secondary-default text-sm cursor-pointer hover:text-pavlova-600" onClick={()=>navigate('/patient/create-appointment')}>ลองสร้างนัดหมายใหม่ได้เลย!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {appointments.map(app => (
                        <div key={app.appointment_id} className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
                            <h3 className="text-lg font-bold text-gray-800 mb-2">{app.service_name}</h3>
                            <p className="text-sm text-gray-600 mb-1">
                                <span className="font-semibold">วันที่:</span> {getFormattedDate(app.appointment_date)}
                            </p>
                            <p className="text-sm text-gray-600 mb-1">
                                <span className="font-semibold">เวลา:</span> {getFormattedTime(app.appointment_time)} น.
                            </p>
                            <p className="text-sm text-gray-600 mb-1">
                                <span className="font-semibold">สถานะ:</span> {getStatusDisplay(app.status)}
                            </p>
                            <p className="text-sm text-gray-600 mb-3">
                                <span className="font-semibold">แพทย์:</span> {app.doctor_full_name || 'ไม่ได้ระบุ'}
                            </p>
                            <p className="text-sm text-gray-600 mb-3">
                                <span className="font-semibold">ห้องตรวจ:</span> {app.room_name || 'ไม่ได้ระบุ'}
                            </p>
                            
                            <div className="flex flex-col gap-2 mt-4 border-t pt-4 border-gray-100">
                                {app.status === 'pending' && (
                                    <Button 
                                        variant="danger" 
                                        onClick={() => handleCancelClick(app)}
                                        className="w-full flex items-center justify-center gap-2"
                                        disabled={loading}
                                    >
                                        ยกเลิกคำขอนัดหมาย
                                    </Button>
                                )}
                                {app.status === 'approved' && (
                                    <>
                                        <Button 
                                            variant="success" 
                                            onClick={() => handleCompleteClick(app.appointment_id)}
                                            className="w-full flex items-center justify-center gap-2"
                                            disabled={loading}
                                        >
                                            ยืนยันเข้ารับบริการ
                                        </Button>
                                        <Button 
                                            variant="danger" 
                                            onClick={() => handleCancelClick(app)}
                                            className="w-full flex items-center justify-center gap-2 text-pavlova-600 bg-pavlova-300 hover:bg-pavlova-400"
                                            disabled={loading}
                                        >
                                            {willCauseBlacklist(app) ? 'ยกเลิก (ติด Blacklist หากเกิน 3 ครั้ง)' : 'ยกเลิกนัดหมาย'}
                                        </Button>
                                    </>
                                )}
                                {app.status === 'confirmed' && (
                                    <Button 
                                        variant="primary" 
                                        onClick={() => handleViewAppointmentCard(app)}
                                        className="w-full flex items-center justify-center gap-2"
                                    >
                                        <FileText size={18} /> ดูบัตรนัด
                                    </Button>
                                )}
                                {app.status === 'rejected' && (
                                  <div className="flex flex-col gap-2">
                                    <p className="text-sm text-gray-600">เหตุผลที่ปฏิเสธ:</p>
                                    <p>{app.rejection_reason}</p>
                                  </div>
                                )} 
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Confirmation Popup (for Cancel/Complete) */}
            <Popup
                isOpen={showConfirmPopup}
                onClose={handleCancelPopup}
                title={actionType === 'cancel' ? 'ยืนยันการยกเลิกนัดหมาย' : 'ยืนยันการเข้ารับบริการ'}
            >
                <div className="p-4">
                    <p className="mb-4 text-gray-700">
                        {confirmMessage}
                    </p>
                    <div className="flex justify-end gap-3 mt-6">
                        <Button variant="secondary" onClick={handleCancelPopup}>ยกเลิก</Button>
                        <Button 
                            variant={actionType === 'cancel' ? 'danger' : 'success'} 
                            onClick={handleConfirmAction}
                            disabled={loading}
                        >
                            {loading ? 'กำลังดำเนินการ...' : (actionType === 'cancel' ? 'ยืนยันยกเลิก' : 'ยืนยันเข้ารับบริการ')}
                        </Button>
                    </div>
                </div>
            </Popup>

            {/* Appointment Card Popup */}
            <Popup
                isOpen={showAppointmentCardPopup}
                onClose={handleCloseAppointmentCardPopup}
                title="บัตรนัดหมาย"
            >
                {appointmentCardDetails && (
                    <div className="p-6 bg-white rounded-lg shadow-md max-w-sm mx-auto my-4 border-t-4 border-stromboli-400">
                        <div className="text-center mb-6">
                            <h3 className="text-2xl font-bold text-primary-default mb-2">บัตรนัดหมาย</h3>
                            <p className="text-gray-600 text-sm">โปรดแสดงบัตรนี้ที่เคาน์เตอร์</p>
                        </div>

                        <div className="space-y-3 text-gray-700">
                            <div className="flex justify-between items-center border-b pb-2">
                                <span className="font-semibold">HN:</span>
                                <span>{appointmentCardDetails.patient_hn}</span>
                            </div>
                            <div className="flex justify-between items-center border-b pb-2">
                                <span className="font-semibold">ผู้ป่วย:</span>
                                <span>{appointmentCardDetails.patient_first_name} {appointmentCardDetails.patient_last_name}</span>
                            </div>
                            <div className="flex justify-between items-center border-b pb-2">
                                <span className="font-semibold">บริการ:</span>
                                <span>{appointmentCardDetails.service_name}</span>
                            </div>
                            <div className="flex justify-between items-center border-b pb-2">
                                <span className="font-semibold">วันที่นัด:</span>
                                <span>{getFormattedDate(appointmentCardDetails.appointment_date)}</span>
                            </div>
                            <div className="flex justify-between items-center border-b pb-2">
                                <span className="font-semibold">เวลา:</span>
                                <span>{getFormattedTime(appointmentCardDetails.appointment_time)} น.</span>
                            </div>
                            <div className="flex justify-between items-center border-b pb-2">
                                <span className="font-semibold">แพทย์:</span>
                                <span>{appointmentCardDetails.doctor_full_name || '-'}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="font-semibold">ห้องตรวจ:</span>
                                <span>{appointmentCardDetails.room_name || '-'}</span>
                            </div>
                        </div>

                        <div className="mt-8 text-center text-sm text-gray-500">
                            <p>โปรดมาถึงคลินิกก่อนเวลานัด 15 นาที</p>
                            <p className="font-bold text-gray-600 mt-2">คลินิกนรีเวชวิวัฒน์</p>
                        </div>
                    </div>
                )}
            </Popup>
        </div>
    );
};

export default MyAppointment;
