import React from 'react'
import {assets} from '../assets/assets'
const ServiceDetail = () => {
  return (
    <div className='flex flex-col mt-20'>
      <div id='detail-unit-1' className='flex sm:flex-col md:flex-row items-center justify-between bg-secondary-light'>
        <div className='ml-10 w-full flex flex-col gap-4'>
            <h1 className='text-2xl md:text-3xl lg:text-4xl font-medium'>นรีเวชทั่วไป</h1>
            <p className=''>ดูแลสุขภาพสตรีในทุกช่วงวัย ตรวจภายใน<br/>ปรึกษาอาการผิดปกติ และโรคทางนรีเวชที่พบบ่อย</p>
            <ul className='list-disc list-inside space-y-2'>
                <li>ปวดประจำเดือน ประจำเดือนมาไม่ปกติ</li>
                <li>ตกขาวผิดปกติ / กลิ่นไม่พึงประสงค์</li>
                <li>วางแผนครอบครัว / คุมกำเนิด</li>
                <li>ตรวจคัดกรองมะเร็งปากมดลูก (Pap smear, HPV DNA)</li>
                <li>รักษาซีสต์ รังไข่ และเนื้องอกมดลูก</li>
            </ul>
        </div>
        <img className='w-1/2' src={assets.reproductive_unit} alt="" />
      </div>
      <div id='detail-unit-2' className='flex sm:flex-col md:flex-row items-center justify-between bg-primary-darklight'>
        <img className='w-1/2' src={assets.cancer_unit} alt="" />
        <div className='ml-10 w-full flex flex-col gap-4'>
            <h1 className='text-2xl md:text-3xl lg:text-4xl font-medium'>เวชศาสตร์การเจริญพันธุ์</h1>
            <p className=''>พร้อมดูแลและให้คำปรึกษา<br/>ผู้มีบุตรยากด้วยเทคโนโลยีการเจริญพันธุ์สมัยใหม่</p>
            <ul className='list-disc list-inside space-y-2'>
                <li>ตรวจหาสาเหตุภาวะมีบุตรยาก</li>
                <li>กระตุ้นไข่ ตรวจการตกไข่</li>
                <li>วางแผนครอบครัว / คุมกำเนิด</li>
                <li>ผสมเทียม (IUI) / เด็กหลอดแก้ว (IVF, ICSI)</li>
                <li>ฝากไข่ เตรียมพร้อมก่อนแต่งงาน</li>
                <li>วินิจฉัยโรคทางพันธุกรรมก่อนตั้งครรภ์</li>
            </ul>
        </div>
      </div>
      <div id='detail-unit-3' className='flex sm:flex-col md:flex-row items-center justify-between bg-primary-light'>
        <div className='ml-10 w-full flex flex-col gap-4 '>
            <h1 className='text-2xl md:text-3xl lg:text-4xl font-medium'>เวชศาสตร์มารดาและทารก</h1>
            <p className=''>ดูดูแลครรภ์คุณแม่อย่างใกล้ชิดโดยเฉพาะ<br/>ผู้มีครรภ์เสี่ยงสูง และทารกในครรภ์ที่ต้องการดูแลพิเศษ</p>
            <ul className='list-disc list-inside space-y-2'>
                <li>ตรวจครรภ์ความเสี่ยงสูง เช่น เบาหวาน ความดัน</li>
                <li>อัลตราซาวด์ดูพัฒนาการทารก</li>
                <li>เจาะน้ำคร่ำ ตรวจพันธุกรรม</li>
                <li>ติดตามครรภ์แฝด / ภาวะแทรกซ้อน</li>
                <li>ให้คำปรึกษาก่อนคลอดโดยแพทย์เฉพาะทาง</li>
            </ul>
        </div>
        <img className='w-1/2' src={assets.maternal_fetal_unit} alt="" />
      </div>
      <div id='detail-unit-4' className='flex sm:flex-col md:flex-row items-center justify-between bg-primary-darklight'>
        <img className='w-1/2' src={assets.pelvic_surgery_unit} alt="" />
        <div className='ml-10 w-full flex flex-col gap-4'>
            <h1 className='text-2xl md:text-3xl lg:text-4xl font-medium'>มะเร็งนรีเวช </h1>
            <p className=''>ตรวจคัดกรอง วินิจฉัย<br/>และรักษาโรคมะเร็งระบบสืบพันธุ์สตรีแบบครบวงจร</p>
            <ul className='list-disc list-inside space-y-2'>
                <li>มะเร็งปากมดลูก มะเร็งรังไข่ มดลูก ช่องคลอด</li>
                <li>ตรวจเชื้อ HPV และ Pap Smear</li>
                <li>ตรวจชิ้นเนื้อ วินิจฉัยความผิดปกติ</li>
                <li>ผ่าตัด เคมีบำบัด รังสีรักษา</li>
                <li>ติดตามผลและดูแลระยะฟื้นฟู</li>
            </ul>
        </div>
      </div>
    </div>
  )
}

export default ServiceDetail
