import React from 'react'
import { Outlet } from 'react-router-dom'

const HeadNurseDashboard = () => {
  return (
    <div>
      {/* Child Route */}
      <div>
        <Outlet/> 
      </div>
    </div>
  )
}

export default HeadNurseDashboard
