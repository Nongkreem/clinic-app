import React, { useState, useEffect } from "react";
import { useNavigate, Link, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import FormGroup from "../components/common/FormGroup";
import Button from "../components/common/Button";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, loading, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const [shouldRedirect, setShouldRedirect] = useState(false);

  // ป้องกัน auto-redirect ถ้า user login แล้ว
  useEffect(() => {
    if (isAuthenticated && user?.role && shouldRedirect) {
      const redirectPath = {
        patient: "/patient/landing",
        doctor: "/doctor",
        nurse: "/nurse",
        head_nurse: "/head_nurse",
      }[user.role] || "/";

      navigate(redirectPath, { replace: true });
    }
  }, [isAuthenticated, user, navigate, shouldRedirect]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation(); //ป้องกัน bubbling ที่อาจ trigger native submit

    try {
      const result = await login(email, password);

      console.log("=== LOGIN DEBUG ===");
      console.log("Login result:", result);
      console.log("Result success:", result?.success);
      console.log("Result message:", result?.message);
      console.log("isAuthenticated after login:", isAuthenticated);
      console.log("===================");

      if (result?.success) {
        console.log("✅ Login SUCCESS - Showing success toast");
        toast.success("เข้าสู่ระบบสำเร็จ");

        // รอให้ toast แสดงก่อน redirect
        setTimeout(() => {
          setShouldRedirect(true); // อนุญาตให้ redirect
          const userData = JSON.parse(localStorage.getItem("user"));
          if (userData?.role) {
            const redirectPath =
              {
                patient: "/patient/landing",
                doctor: "/doctor",
                nurse: "/nurse",
                head_nurse: "/head_nurse",
              }[userData.role] || "/";

            navigate(redirectPath, { replace: true });
          }
        });
      } else {
        const errorMessage =
          result?.message || "เข้าสู่ระบบไม่สำเร็จ กรุณาลองอีกครั้ง";
        console.log("Error message:", errorMessage);
        console.log("About to call toast.error...");

        // เรียก toast.error
        const toastId = toast.error(errorMessage, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "light",
        });

        console.log("Toast.error called with ID:", toastId);
        console.log("Toast should be visible now!");
      }
    } catch (error) {
      console.error("❌ Exception during login:", error);
      toast.error("เกิดข้อผิดพลาดในการเข้าสู่ระบบ");
    }
  };

  // ถ้า login แล้วจะไม่แสดงหน้า login
  if (isAuthenticated && user?.role) {
    const redirectPath =
      {
        patient: "/patient/landing",
        doctor: "/doctor",
        nurse: "/nurse",
        head_nurse: "/head_nurse",
      }[user.role] || "/";

    return <Navigate to={redirectPath} replace />;
  }

  return (
    <>
      <div
        className="min-h-screen flex"
        style={{ position: "relative", zIndex: 1 }}
      >
        {/* ซ้าย: พื้นหลัง */}
        <div
          className="hidden lg:flex w-1/2 items-center justify-center bg-cover bg-center relative"
          style={{ backgroundImage: "url('/assets/doctor-talking.jpg')" }}
        >
          <div className="absolute inset-0 bg-stromboli-900/70"></div>
          <div className="relative text-white text-5xl font-bold drop-shadow-lg z-10">
            ยินดีต้อนรับ
          </div>
        </div>

        {/* ขวา: ฟอร์ม */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-4">
          <div className="w-96 max-w-lg">
            <h2 className="text-3xl font-bold text-center text-primary-default mb-8">
              เข้าสู่ระบบ
            </h2>
            {console.log("Render form now")}
            <form onSubmit={handleSubmit}>
              <FormGroup
                label="อีเมล"
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ใส่อีเมลของคุณ"
                required
                inputClassName="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-default h-12"
              />

              <FormGroup
                label="รหัสผ่าน"
                type="password"
                id="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="ใส่รหัสผ่านของคุณ"
                required
                inputClassName="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-default h-12"
              />

              <button
                type="submit"
                className="w-full bg-primary-default hover:bg-stromboli-800 text-white py-3 rounded-lg mt-6"
                // onClick={(e)=>e.preventDefault()}
              >
                {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
              </button>

              <p className="text-center text-sm mt-4 text-gray-600">
                ยังไม่มีบัญชีใช่ไหม?{" "}
                <Link
                  to="/register"
                  className="text-secondary-default hover:underline font-semibold"
                >
                  ลงทะเบียนที่นี่
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
