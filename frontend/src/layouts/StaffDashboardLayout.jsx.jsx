import { Outlet } from "react-router-dom";
import Sidebar from "../components/common/Sidebar";

const StaffDashboardLayout = () => {
  return (
    <div className="flex bg-white h-screen">
      <Sidebar />
      <div className="flex-1 m-2 w-screen bg-gray-100 rounded-lg overflow-auto">
        <Outlet />
      </div>
    </div>
  );
};

export default StaffDashboardLayout;
