import React from 'react'
import ProfileInfoCard from "../Cards/ProfileInfoCard";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <div className="h-16 bg-white border boredr-b border-gray-200/50 backdrop-blur-[2px] py-2.5 px-4 md:px-0 sticky top-0 z-30">
      <div className="container mx-auto flex items-center justify-between gap-5">
        <Link to="/dashboard">
          <h2 className="text-lg md:text-xl font-medium text-black leading-5">
            Key2Career
          </h2>
        </Link>
        <div className="flex-1 flex justify-center gap-8">
          <Link to="/dashboard" className="text-base font-medium text-orange-600 hover:underline">
            Dashboard
          </Link>
          <Link to="/interview-test" className="text-base font-medium text-orange-600 hover:underline">
            Interview Test
          </Link>
        </div>
        <ProfileInfoCard />
      </div>
    </div>
  )
}

export default Navbar