import React from 'react'
import headerImg from '../../public/assets/header.jpg';
import Button from './common/Button';
import { useNavigate } from 'react-router-dom';
const HeroSection = () => {
  const navigate = useNavigate();
  return (
    <div className='relative rounded-lg overflow-hidden'>
      <img src={headerImg} alt="" className='w-full h-[600px] object-cover'/>
      {/* overlay */}
      <div className='absolute inset-0 bg-primary-default opacity-50'></div>
      
      <div className='absolute inset-0 flex flex-col items-start justify-center px-6 sm:px-12 md:px-20 lg:px-28 gap-8'>
        <div className='flex flex-col gap-6'>
          <div className="text-3xl md:text-4xl lg:text-5xl text-white font-semibold">
            <p className='leading-[60px]'>เข้าใจทุกช่วงชีวิตผู้หญิง<br/>ด้วยความใส่ใจจากผู้เชี่ยวชาญ</p>
          </div>
          <p className='text-white'>จองคิวตรวจกับแพทย์เฉพาะทางนรีเวชที่คุณไว้วางใจได้ง่ายๆ<br/>ผ่านระบบออนไลน์ สะดวก ปลอดภัย และเป็นส่วนตัว<br/>พร้อมดูแลสุขภาพคุณผู้หญิงอย่างครบวงจร</p>
        </div>
        <Button onClick={()=>navigate('/patient/create-appointment')} className="bg-secondary-default hover:bg-secondary-dark">สร้างนัดหมายเลย</Button>
      </div>
    </div>
  )
}

export default HeroSection
