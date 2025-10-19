import React from 'react'
import { Outlet } from 'react-router-dom'

const HeadNurseLayout = () => {
  return (
    <div>
      {/* Child Route */}
      <div>
        <Outlet/> 
      </div>
    </div>
  )
}

export default HeadNurseLayout
