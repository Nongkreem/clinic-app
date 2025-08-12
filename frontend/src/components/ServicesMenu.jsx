import React from 'react'
import { assets } from '../../public/assets/assets'
const ServicesMenu = () => {
    const scrollToSection = (id)=>{
        const section = document.getElementById(id);
        if (section){
            section.scrollIntoView({ behavior: 'smooth'});
        }
    }
  return (
    <div className='mt-9 flex justify-between'>
      <div 
        className='flex flex-col items-center justify-center gap-5 bg-primary-darklight w-[250px] h-[200px] rounded-lg cursor-pointer'
        onClick={() => scrollToSection('detail-unit-1')}
        >
        <img className='w-[80px]' src={assets.gyncIcon_unit1} alt="" />
        <p>นรีเวชทั่วไป</p>
      </div>
      <div 
        className='flex flex-col items-center justify-center gap-5 bg-primary-light w-[250px] h-[200px] rounded-lg cursor-pointer'
        onClick={() => scrollToSection('detail-unit-2')}
        >
        <img className='w-[80px]' src={assets.gyncIcon_unit2} alt="" />
        <p>เวชศาสตร์การเจริญพันธุ์</p>
      </div>
      <div 
        className='flex flex-col items-center justify-center gap-5 bg-secondary-light w-[250px] h-[200px] rounded-lg cursor-pointer'
        onClick={() => scrollToSection('detail-unit-3')}
        >
        <img className='w-[80px]' src={assets.gyncIcon_unit3} alt="" />
        <p>เวชศาสตร์มารดาและทารก</p>
      </div>
      <div 
        className='flex flex-col items-center justify-center gap-5 bg-primary-light w-[250px] h-[200px] rounded-lg cursor-pointer'
        onClick={() => scrollToSection('detail-unit-4')}
        >
        <img className='w-[80px]' src={assets.gyncIcon_unit4} alt="" />
        <p>มะเร็งนรีเวช</p>
      </div>
    </div>
  )
}

export default ServicesMenu
