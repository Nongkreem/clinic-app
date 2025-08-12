import React from 'react'
import { assets } from '../../public/assets/assets'

const BookingProcedure = () => {
  return (
    <div className='flex w-full mt-20 bg-primary-default rounded-tl-[100px]'>
      {/* Left side */}
      <div className='w-1/2'>
        <div className='flex flex-col items-center justify-center mt-16 gap-4'>
            <h1 className='text-white text-4xl font-semibold'>ไม่ต้องกังวล</h1>
            <div className='flex flex-col items-center gap-2'>
                <p className='text-white text-2xl font-medium align-middle'>ถ้าไม่รู้ว่าเข้ารับบริการเเบบไหน</p>
                <p className='text-white text-2xl font-medium align-middle'>เรามีแบบประเมินอาการ</p>
            </div>
        </div>
        <img className='bottom-0' src={assets.doctorSayYes} alt="" />
      </div>
      {/* Right side */}
      <div className='w-1/2 grid grid-cols-2 gap-4 m-6'>
        <div className="bg-secondary-light p-4 rounded-lg">A</div>
        <div className="bg-primary-light p-4 rounded-lg ">B</div>
        <div className="bg-primary-light p-4 rounded-lg ">C</div>
        <div className="bg-secondary-light p-4 rounded-lg">D</div>
      </div>
    </div>
  )
}

export default BookingProcedure
