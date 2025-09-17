import React from 'react'
import axios from "axios";
import ServiceDropdown from "../../components/common/ServiceDropdown";
import Button from "../../components/common/Button";
import Popup from "../../components/common/Popup";

const API_BASE_URL =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:5001";

const AppointmentManage = () => {
  // const [allServiceOptions, setAllServiceOptions] = useState([]);
  // const [selectedFilterService, setSelectedFilterService] = useState(null); 
  // ดึงข้อมูลบริการทั้งหมด
  // useEffect(() => {
  //   const fetchServiceOptions = async () => {
  //       setLoading(true);
  //       setError("");
  //     try {
  //       const response = await axios.get(`${API_BASE_URL}/api/services`, {
  //         headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  //       });
  //       setAllServiceOptions(response.data);
  //       console.log("Fetched service options:", response.data);
  //     } catch (err) {
  //       console.error("Failed to fetch service options:", err);
  //       setError("ไม่สามารถโหลดตัวเลือกบริการได้");
  //     } finally {
  //       setLoading(false);
  //     }
  //   };
  //   fetchServiceOptions();
  // }, []);
  
  // ดึงข้อมูลนัดหมายทั้งหมดที่มีสถานะเป็น "confirmed"


  return (
    <div className='m-8'>
      <h2 className="mb-6 text-2xl font-bold text-primary-default">
        จัดการนัดหมาย
      </h2>
    </div>
  )
}

export default AppointmentManage
