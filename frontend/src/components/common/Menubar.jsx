import { Link, NavLink, useLocation } from "react-router-dom";
import { useState } from "react";
function Menubar({ items = [], className = "" }) {
  const location = useLocation();
  console.log("Menubar items:", items);
  return (
    <div
      className={`
                flex justify-between items-center 
                ${className}
            `}
    >
      {/* Logo section */}
      <div>logo</div>
      {/* Menu section */}
      <div>
        <ul className="flex gap-16">
            {items.map((item, index)=>(
                <NavLink to={item.path}>
                    <li >{item.text}</li>
                    <hr className='border-none outline-none h-0.5 bg-primary-default w-3/5 m-auto hidden'/>
                </NavLink>
            ))}
        </ul>
      </div>
      {/* Profile section */}
      <div className="flex gap-2">
        <div className="w-6 h-6 bg-stromboli-900 rounded-full "></div>
        <div className="w-6 h-6 bg-secondary-default rounded-full ">.</div>
      </div>
    </div>
  );
}

export default Menubar;
