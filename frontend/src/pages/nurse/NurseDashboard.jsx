//nurse layout
import React from 'react'
import DoctorsManage from '../head-nurse/DoctorsManage'
import ServiceManage from '../head-nurse/ServiceManage'
import { Outlet } from 'react-router-dom'

const NurseDashboard = () => {
  return (
    <div>
      {/* Child Route */}
      <div>
        <Outlet/>
      </div>
    </div>
  )
}

export default NurseDashboard
