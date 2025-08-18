// frontend/src/pages/AppoinmentBooking.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Button from '../../components/common/Button';
import Popup from '../../components/common/Popup'; 
import { useAuth } from '../../context/AuthContext';
import { ChevronDown, ChevronUp, CalendarDays, Clock, CheckCircle, XCircle } from 'lucide-react'; // Icons

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001';

const AppoinmentBooking = () => {
    const { user, loading: authLoading } = useAuth(); // Get authenticated user data
    const patientId = user?.entity_id; // patient_id from AuthContext

    const [step, setStep] = useState(1);
    const [services, setServices] = useState([]);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    // Step 1 States
    const [expandedServiceId, setExpandedServiceId] = useState(null);
    const [selectedService, setSelectedService] = useState(null);
    const [symptoms, setSymptoms] = useState('');

    // Step 2 States
    const [selectedDate, setSelectedDate] = useState('');
    const [availableTimeBlocks, setAvailableTimeBlocks] = useState([]); // ✅ เปลี่ยนชื่อ state ให้ชัดเจนขึ้น
    const [selectedTimeBlock, setSelectedTimeBlock] = useState(null); 
    const [selectedSlot, setSelectedSlot] = useState(null); // stores the actual ers_id
    const [showConfirmPopup, setShowConfirmPopup] = useState(false);

    // Step 3 States
    const [bookedAppointmentId, setBookedAppointmentId] = useState(null);
    const [finalBookingDetails, setFinalBookingDetails] = useState(null);

    // Fetch services on component mount
    useEffect(() => {
        const fetchServices = async () => {
            if (!user || authLoading) return; // Wait for user data to be loaded
            setLoading(true);
            try {
                const response = await axios.get(`${API_BASE_URL}/api/services`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                setServices(response.data);
            } catch (err) {
                console.error('Failed to fetch services:', err);
                setError('ไม่สามารถโหลดข้อมูลบริการได้');
            } finally {
                setLoading(false);
            }
        };
        fetchServices();
    }, [user, authLoading]); // Re-run if user or authLoading changes

    // Fetch available time blocks when selectedService or selectedDate changes (Step 2)
    useEffect(() => {
        const fetchAvailableTimeBlocks = async () => {
            if (step === 2 && selectedService && selectedDate) {
                setLoading(true);
                setError('');
                try {
                    const response = await axios.get(`${API_BASE_URL}/api/appointments/available-slots`, {
                        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                        params: {
                            scheduleDate: selectedDate,
                            serviceId: selectedService.service_id
                        }
                    });
                    setAvailableTimeBlocks(response.data);
                    setSelectedTimeBlock(null);
                    setSelectedSlot(null);      
                } catch (err) {
                    console.error('Failed to fetch available time blocks:', err);
                    setError('ไม่สามารถโหลด Slot เวลาที่ว่างได้สำหรับวันนี้');
                    setAvailableTimeBlocks([]);
                } finally {
                    setLoading(false);
                }
            } else {
                setAvailableTimeBlocks([]); // Clear time blocks if conditions not met
            }
        };
        fetchAvailableTimeBlocks();
    }, [step, selectedService, selectedDate]);

    // Handle navigation between steps
    const handleNextStep = () => {
        setError('');
        setMessage('');
        if (step === 1) {
            if (!selectedService || !symptoms.trim()) {
                setError('กรุณาเลือกบริการและกรอกอาการเบื้องต้น');
                return;
            }
        } else if (step === 2) {
            // ตรวจสอบแค่ Time Block เพราะ selectedSlot จะถูกเลือกโดยอัตโนมัติเมื่อเลือก Time Block
            if (!selectedDate || !selectedTimeBlock) {
                setError('กรุณาเลือกวันและช่วงเวลาที่ต้องการนัดหมาย');
                return;
            }
            // Prepare booking details for confirmation Popup
            setFinalBookingDetails({
                serviceName: selectedService.service_name,
                serviceDescription: selectedService.description,
                appointmentDate: selectedDate,
                appointmentTime: selectedTimeBlock.slot_start,
                slotEnd: selectedTimeBlock.slot_end,
                symptoms: symptoms,
                ers_id: selectedSlot // selectedSlot คือ ers_id ที่ถูกเลือกโดยอัตโนมัติแล้ว
            });
            setShowConfirmPopup(true);
            console.log(showConfirmPopup);
            return; // Prevent step advance immediately
        }
        setStep(prevStep => prevStep + 1);
    };

    const handlePrevStep = () => {
        setError('');
        setMessage('');
        setStep(prevStep => prevStep - 1);
        setSelectedTimeBlock(null); // Clear selected time block if going back from step 2
        setSelectedSlot(null);      // Clear selected actual slot if going back from step 2
    };

    const handleServiceSelect = (service) => {
        setSelectedService(service);
        setExpandedServiceId(null); // Collapse the service card
    };

    const handleTimeBlockSelect = (block) => {
        // หากเลือก Time Block เดิม ให้ยกเลิกการเลือก
        if (selectedTimeBlock?.slot_start === block.slot_start && selectedTimeBlock?.slot_end === block.slot_end) {
            setSelectedTimeBlock(null);
            setSelectedSlot(null);
        } else {
            setSelectedTimeBlock(block);
            setSelectedSlot(block.ers_ids_in_block[0]); 
        }
    }

    const handleConfirmBooking = async () => {
        setShowConfirmPopup(false); // Close modal
        setLoading(true);
        setError('');
        setMessage('');

        if (!patientId) {
            setError('ไม่พบข้อมูลผู้ป่วย กรุณาลองเข้าสู่ระบบอีกครั้ง');
            setLoading(false);
            return;
        }

        try {
            const response = await axios.post(`${API_BASE_URL}/api/appointments`, {
                ers_id: selectedSlot,
                symptoms: finalBookingDetails.symptoms,
                appointment_type: 'patient_booking'
            }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });

            if (response.data.success) {
                setMessage(response.data.message);
                setBookedAppointmentId(response.data.appointmentId);
                setStep(3); // Advance to step 3 on successful booking
            } else {
                setError(response.data.message);
            }
        } catch (err) {
            console.error('Error booking appointment:', err);
            setError(err.response?.data?.message || 'เกิดข้อผิดพลาดในการสร้างนัดหมาย');
        } finally {
            setLoading(false);
        }
    };

    const handleCancelBookingPopup = () => {
        setShowConfirmPopup(false);
    };

    const navigateToMyAppointments = () => {
        alert('นำทางไปยังหน้า "นัดหมายของฉัน"');
    };

    const getFormattedDate = (dateString) => {
        if (!dateString) return '';
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('th-TH', options);
    };


    // Render logic based on steps
    const renderStepContent = () => {
        if (loading || authLoading) {
            return <div className="text-center py-8">กำลังโหลด...</div>;
        }
        if (error) {
            return (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-4" role="alert">
                    <span className="block sm:inline">{error}</span>
                </div>
            );
        }
        if (message) {
            return (
                <div className="bg-green-50 border border-green-500 text-green-700 px-4 py-3 rounded-lg relative mb-4" role="alert">
                    <span className="block sm:inline">{message}</span>
                </div>
            );
        }

        switch (step) {
            case 1: // Select Service
                return (
                    <>
                        <h3 className="text-2xl font-semibold text-primary-default mb-6">1. เลือกบริการที่คุณต้องการ</h3>
                        <div className="grid gap-8">
                            {services.length > 0 ? (
                                services.map(service => (
                                    <div 
                                        key={service.service_id} 
                                        className={`bg-white rounded-xl p-6 border-2 transition-all duration-300
                                            ${selectedService && selectedService.service_id === service.service_id ? 'border-stromboli-400' : 'border-gray-200 hover:border-stromboli-300'}`}
                                    >
                                        <div className="flex justify-between items-start mb-4 gap-6">
                                            <div className="flex-shrink-0 mr-4 w-56">
                                                <img 
                                                    src={`../../assets/${service.img_path}`}
                                                    alt={service.service_name} 
                                                    className="w-full h-32 object-cover rounded-lg shadow-sm" 
                                                    onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/80x80/cccccc/ffffff?text=No+Img" }}
                                                />
                                            </div>
                                            <div className="flex-grow">
                                                <h4 className="text-xl font-bold text-primary-default">{service.service_name}</h4>
                                                <p className="text-sm text-gray-600 mb-2">{service.description}</p>
                                                <p className="text-lg font-bold text-secondary-default">{service.price} THB</p>
                                            </div>
                                            <button 
                                                onClick={() => setExpandedServiceId(expandedServiceId === service.service_id ? null : service.service_id)}
                                                className="p-2 rounded-full text-gray-500 hover:bg-gray-200"
                                            >
                                                {expandedServiceId === service.service_id ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                                            </button>
                                        </div>
                                        {expandedServiceId === service.service_id && (
                                            <div className="mt-4 pt-4 border-t border-gray-200">
                                                <label htmlFor={`symptoms-${service.service_id}`} className="block text-gray-700 text-sm font-semibold mb-2">
                                                    อาการเบื้องต้น:
                                                </label>
                                                <textarea
                                                    id={`symptoms-${service.service_id}`}
                                                    className="shadow-sm appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition duration-200"
                                                    rows="3"
                                                    value={symptoms}
                                                    onChange={(e) => setSymptoms(e.target.value)}
                                                    placeholder="กรุณาอธิบายอาการเบื้องต้นของคุณ"
                                                    required
                                                ></textarea>
                                                <Button 
                                                    variant="success" 
                                                    className="w-full mt-4"
                                                    onClick={() => handleServiceSelect(service)}
                                                >
                                                    เลือกบริการนี้
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <p className="col-span-full text-center text-gray-500">ไม่พบข้อมูลบริการ</p>
                            )}
                        </div>
                        <div className="flex justify-end mt-8">
                            <Button 
                                variant="primary" 
                                onClick={handleNextStep} 
                                disabled={!selectedService || !symptoms.trim()}
                            >
                                ถัดไป <span className="ml-2">&rarr;</span>
                            </Button>
                        </div>
                    </>
                );

            case 2: // Select Date and Time
                return (
                    <>
                        <h3 className="text-2xl font-semibold text-primary-default mb-6">2. เลือกวันและเวลาสำหรับ "{selectedService?.service_name}"</h3>
                        
                        <div className="mb-6">
                            <label htmlFor="appointmentDate" className="block text-gray-700 text-sm font-semibold mb-2">เลือกวันนัดหมาย:</label>
                            <input
                                type="date"
                                id="appointmentDate"
                                className="shadow-sm appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition duration-200"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                min={new Date().toISOString().split('T')[0]} // Cannot select past dates
                            />
                        </div>

                        {selectedDate && availableTimeBlocks.length > 0 ? (
                            <div className="mb-6">
                                <h4 className="text-lg font-semibold text-primary-default mb-4">Slot เวลาที่ว่างสำหรับ {getFormattedDate(selectedDate)}:</h4>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                    {availableTimeBlocks.map(block => (
                                        console.log('Available time block:', block),
                                        <button
                                            key={`${block.slot_start}-${block.slot_end}`}
                                            onClick={() => handleTimeBlockSelect(block)} 
                                            className={`p-3 rounded-lg border-2 text-center transition-all duration-200
                                                ${selectedTimeBlock?.slot_start === block.slot_start && selectedTimeBlock?.slot_end === block.slot_end ? 'bg-secondary-default text-secondary-dark shadow-lg' : 'bg-white text-gray-800 border-gray-300 hover:bg-secondary-light hover:text-secondary-default'}`}
                                        >
                                            <span className="font-medium text-lg">{block.slot_start.slice(0, 5)} - {block.slot_end.slice(0, 5)}</span>
                                            <span className="block text-sm">ว่าง: {block.total_available_slots_in_time_block} คิว</span> 
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : selectedDate && !loading && (
                            <p className="text-center text-gray-500 mb-6">ไม่มี Slot เวลาที่ว่างสำหรับบริการ "{selectedService?.service_name}" ในวันที่ {getFormattedDate(selectedDate)}</p>
                        )}

                        <div className="flex justify-between mt-8">
                            <Button variant="secondary" onClick={handlePrevStep}>
                                &larr; ย้อนกลับ
                            </Button>
                            <Button 
                                variant="primary" 
                                onClick={handleNextStep} 
                                disabled={!selectedDate || !selectedTimeBlock}
                            >
                                ถัดไป <span className="ml-2">&rarr;</span>
                            </Button>
                        </div>
                    </>
                );
            case 3: // Waiting for Approval
                return (
                    <div className="text-center bg-white p-8 rounded-xl shadow-lg">
                        <CheckCircle size={80} className="text-green-500 mx-auto mb-6" />
                        <h3 className="text-3xl font-bold text-gray-800 mb-4">นัดหมายสำเร็จ!</h3>
                        <p className="text-gray-600 mb-6">นัดหมายของคุณกำลังรอการตอบกลับจากพยาบาล</p>
                        {finalBookingDetails && (
                            <div className="bg-stromboli-50 p-4 rounded-lg text-left mb-6">
                                <h4 className="font-semibold text-lg text-secondary-default mb-2">รายละเอียดนัดหมายของคุณ:</h4>
                                <p><span className="font-medium">บริการ:</span> {finalBookingDetails.serviceName}</p>
                                <p><span className="font-medium">วันนัด:</span> {getFormattedDate(finalBookingDetails.appointmentDate)}</p>
                                <p><span className="font-medium">เวลา:</span> {finalBookingDetails.appointmentTime.slice(0,5)} - {finalBookingDetails.slotEnd.slice(0,5)} น.</p>
                                <p><span className="font-medium">อาการเบื้องต้น:</span> {finalBookingDetails.symptoms}</p>
                            </div>
                        )}
                        <Button 
                            variant="secondary" 
                            onClick={navigateToMyAppointments} 
                            className="w-full sm:w-auto"
                        >
                            <CalendarDays size={20} className="inline-block mr-2" />
                            ดูนัดหมายของฉัน
                        </Button>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className='flex flex-col items-center min-h-screen p-4 pt-10'>
            <h2 className="text-4xl font-extrabold text-primary-default mb-8">สร้างนัดหมายของคุณ</h2>
            
            {/* Progress Indicators */}
            <div className="flex justify-between items-center w-full max-w-2xl mb-10">
                <div className={`flex flex-col items-center flex-1 ${step >= 1 ? 'text-primary-default' : 'text-gray-400'}`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${step >= 1 ? 'bg-primary-default' : 'bg-stromboli-100'}`}>1</div>
                    <span className="mt-2 text-sm text-center">เลือกบริการ</span>
                </div>
                <div className="flex-1 border-b-2 border-gray-300 mt-5"></div>
                <div className={`flex flex-col items-center flex-1 ${step >= 2 ? 'text-primary-default' : 'text-gray-400'}`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${step >= 2 ? 'bg-primary-default' : 'bg-stromboli-100'}`}>2</div>
                    <span className="mt-2 text-sm text-center">เลือกวันและเวลา</span>
                </div>
                <div className="flex-1 border-b-2 border-gray-300 mt-5"></div>
                <div className={`flex flex-col items-center flex-1 ${step >= 3 ? 'text-primary-default' : 'text-gray-400'}`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${step >= 3 ? 'bg-primary-default' : 'bg-stromboli-100'}`}>3</div>
                    <span className="mt-2 text-sm text-center">รอการตอบกลับ</span>
                </div>
            </div>
            {/* Content */}
            <div className="bg-white p-8 w-full max-w-4xl min-h-[500px]">
                {renderStepContent()}
            </div>

            {/* Confirmation Modal */}
            <Popup
                isOpen={showConfirmPopup}
                onClose={handleCancelBookingPopup}
                title="ยืนยันการจองนัดหมาย"
            >
                <div className="p-4">
                    <p className="mb-4 text-gray-700">คุณต้องการยืนยันการจองนัดหมายนี้หรือไม่?</p>
                    {finalBookingDetails && (
                        <div className="bg-stromboli-50 p-4 rounded-lg text-left text-gray-800">
                            <h4 className="font-semibold text-lg text-secondary-default mb-2">รายละเอียด:</h4>
                            <p><span className="font-medium">บริการ:</span> {finalBookingDetails.serviceName}</p>
                            <p><span className="font-medium">วันนัด:</span> {getFormattedDate(finalBookingDetails.appointmentDate)}</p>
                            <p><span className="font-medium">เวลา:</span> {finalBookingDetails.appointmentTime.slice(0,5)} - {finalBookingDetails.slotEnd.slice(0,5)} น.</p>
                            <p><span className="font-medium">อาการเบื้องต้น:</span> {finalBookingDetails.symptoms}</p>
                        </div>
                    )}
                    <div className="flex justify-end gap-3 mt-6">
                        <Button variant="secondary" onClick={handleCancelBookingPopup}>ยกเลิก</Button>
                        <Button variant="success" onClick={handleConfirmBooking}>ยืนยันการจอง</Button>
                    </div>
                </div>
            </Popup>
        </div>
    );
};

export default AppoinmentBooking;