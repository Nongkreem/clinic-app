import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { assets } from "../../public/assets/assets";

const BookingProcedure = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <div
      ref={ref}
      className="relative w-full mt-24 py-20 overflow-hidden"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[url('/assets/pattern-bg.svg')] opacity-5"></div>

      {/* Center content */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-6 md:px-20">
        
        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-4xl md:text-5xl font-semibold text-primary-default mb-6"
        >
          ไม่ต้องกังวล
        </motion.h1>

        {/* Subtext */}
        <motion.p
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1.2, delay: 0.3 }}
          className="text-2xl md:text-3xl text-gray-800 font-medium leading-relaxed"
        >
          หากคุณไม่แน่ใจว่าควรเข้ารับบริการแบบใด
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1.2, delay: 0.6 }}
          className="text-2xl md:text-3xl text-gray-800 font-medium leading-relaxed mb-10"
        >
          ระบบของเรามี “แบบประเมินอาการ” เพื่อช่วยแนะนำให้คุณได้
        </motion.p>

        {/* Doctor image */}
        <motion.img
          initial={{ opacity: 0, scale: 0.8 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.9 }}
          src={assets.doctorSayYes}
          alt="Doctor illustration"
          className="w-[320px] md:w-[420px] mt-10"
        />

        {/* CTA */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1, delay: 1.2 }}
          className="mt-10 bg-primary-default text-white px-8 py-3 rounded-full text-lg hover:bg-primary-dark transition-all shadow-md"
        >
          เริ่มทำแบบประเมินอาการ
        </motion.button>
      </div>
    </div>
  );
};

export default BookingProcedure;
