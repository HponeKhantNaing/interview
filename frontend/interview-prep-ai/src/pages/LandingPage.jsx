import React, { useState, useContext } from "react";
import HERO_IMG from "../assets/hero-img.png";
import { APP_FEATURES } from "../utils/data";
import { useNavigate } from "react-router-dom";
import { MdAssessment } from "react-icons/md"; // Icon for Interview Mock Test
import { AiOutlineAppstoreAdd } from "react-icons/ai"; // Icon for Key2Career
import Modal from "../components/Modal";
import Login from "./Auth/Login";
import SignUp from "./Auth/SignUp";
import { UserContext } from "../context/userContext";
import ProfileInfoCard from "../components/Cards/ProfileInfoCard";

const LandingPage = () => {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  const [openAuthModal, setOpenAuthModal] = useState(false);
  const [currentPage, setCurrentPage] = useState("login");

  const handleCTA = () => {
    if (!user) {
      setOpenAuthModal(true);
    } else {
      navigate("/dashboard");
    }
  };

  return (
    <>
      {/* Main Landing Page Wrapper */}
      <div className="relative bg-gradient-to-r from-[#A0C9F7] to-[#CDE4FF] min-h-screen">
        {/* Background Image Blurred Effect */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-[#A0C9F7] to-[#CDE4FF] opacity-20 blur-[70px]"></div>

        {/* Container */}
        <div className="container mx-auto px-6 pt-12 pb-20 relative z-10">
          {/* Header */}
          <header className="flex justify-between items-center mb-16">
            <div className="flex items-center gap-3 text-3xl font-extrabold text-white">
              {/* Icon before Key2Career */}
              <AiOutlineAppstoreAdd size={30} /> 
              Key2Career
            </div>
            {user ? (
              <ProfileInfoCard />
            ) : (
              <button
                className="bg-gradient-to-r from-[#FF9324] to-[#FCD760] text-sm font-semibold text-white px-8 py-3 rounded-full hover:bg-[#FF9E30] border border-white transition-colors"
                onClick={() => setOpenAuthModal(true)}
              >
                Login / Sign Up
              </button>
            )}
          </header>

          {/* Hero Section */}
          <div className="flex flex-col md:flex-row items-center gap-8 mb-12">
            <div className="w-full md:w-1/2 pr-4">
              <div className="mb-4">
                <div className="inline-flex items-center gap-3 text-sm font-medium text-[#6D9CE0] bg-[#D1E4F9] px-3 py-2 rounded-full border border-[#A0C9F7]">
                  <MdAssessment /> Key2Career
                </div>
              </div>
              <h1 className="text-5xl font-semibold text-white mb-6 leading-tight">
                Job Interviews with{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF9324] to-[#FCD760] animate-text-shine font-bold">
                  AI-Powered
                </span>{" "}
                Learning
              </h1>
              <p className="text-lg text-white mb-6">
                Elevate your preparation with role-specific questions, deep dives, and expert guidance.
              </p>
              <button
                className="bg-white text-sm font-semibold text-[#6D9CE0] px-8 py-3 rounded-full hover:bg-[#A0C9F7] hover:text-white border border-[#A0C9F7] transition-colors cursor-pointer"
                onClick={handleCTA}
              >
                Get Started
              </button>
            </div>

            <div className="w-full md:w-1/2">
              <img
                src={HERO_IMG}
                alt="Hero Image"
                className="w-full rounded-xl shadow-lg"
              />
            </div>
          </div>
        </div>
      </div>

    

      {/* Footer */}
      <div className="bg-white text-center py-6 text-sm text-[#6D9CE0]">
        © {new Date().getFullYear()} Key2Career. All rights reserved.
      </div>

      {/* Auth Modal */}
      <Modal
        isOpen={openAuthModal}
        onClose={() => {
          setOpenAuthModal(false);
          setCurrentPage("login");
        }}
        hideHeader
      >
        <div>
          {currentPage === "login" && <Login setCurrentPage={setCurrentPage} />}
          {currentPage === "signup" && (
            <SignUp setCurrentPage={setCurrentPage} />
          )}
        </div>
      </Modal>
    </>
  );
};

export default LandingPage;