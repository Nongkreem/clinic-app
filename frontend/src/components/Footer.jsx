import React from 'react'
import {assets} from '../../public/assets/assets.js'

const Footer = () => {
  return (
    <div className='md:mx-10'>
      <div className='flex flex-col sm:grid grid-cols-[3fr_1fr_1fr] gap-14 my-10 mt-40 text-sm'>
        {/* ----- Left Section ----- */}
        <div>
            <img className='mb-5 w-40' src={assets.logo} alt="" />
            <div>
                <p>คลินิกในเวลาราชการ</p>
                <p className='w-full md:w-2/3 text-gray-600 leading-6'>
                    วันจันทร์-ศุกร์ เวลา 08.00–16.00 น. (ยกเว้นวันหยุดนักขัตฤกษ์)
                </p>
            </div>
            <div className='mt-6'>
                <p>คลินิกพิเศษนอกเวลาราชการ</p>
                <p className='w-full md:w-2/3 text-gray-600 leading-6'>
                    วันจันทร์ อังคาร พุธและศุกร์ เวลา 16.00-20.00 น.<br/>วันเสาร์,อาทิตย์ เวลา 09.00–12.00 น.
                </p>
            </div>
        </div>
        {/* ----- Center Section ----- */}
        <div>
            <p className='text-xl font-medium mb-5'>COMPANY</p>
            <ul className='flex flex-col gap-2 text-gray-600'>
                <li>Home</li>
                <li>About us</li>
                <li>Contact us</li>
                <li>Privacy policy</li>
            </ul>
        </div>
        {/* ----- Right Section ----- */}
        <div>
            <p>GET IN TOUCH</p>
            <ul className='flex flex-col gap-2 text-gray-600'>
                <li>+2-849-6600</li>
                <li>clinic@gmail.com</li>
            </ul>
        </div>
      </div>
      {/* ------ copyright text ------- */}
      <div>
        <hr />
        <p className='py-5 text-sm text-center'>Copyright 2025@ Clinic - All Right Reserved.</p>
      </div>
    </div>
  )
}

export default Footer
