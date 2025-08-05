import React from 'react'
import ProfileInfoCard from "../Cards/ProfileInfoCard";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <div className="h-16 bg-white/80 backdrop-blur-md border-b border-white/20 shadow-sm py-2.5 px-4 md:px-0 sticky top-0 z-30">
      <div className="container mx-auto flex items-center justify-between gap-5">
        <Link to="/dashboard">
          <h2 className="text-lg md:text-xl font-bold bg-gradient-to-r from-orange-600 to-purple-600 bg-clip-text text-transparent leading-5">
            Key2Career
          </h2>
        </Link>
        <div className="flex-1 flex justify-center gap-8">
          <Link to="/dashboard" className="text-base font-medium text-gray-700 hover:text-orange-600 transition-colors duration-200 relative group">
            Dashboard
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-orange-500 to-purple-500 transition-all duration-200 group-hover:w-full"></span>
          </Link>
          <Link to="/interview-test" className="text-base font-medium text-gray-700 hover:text-orange-600 transition-colors duration-200 relative group">
            Coding Test
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-orange-500 to-purple-500 transition-all duration-200 group-hover:w-full"></span>
          </Link>
        </div>
        <ProfileInfoCard />
      </div>
    </div>
  )
}

export default Navbar