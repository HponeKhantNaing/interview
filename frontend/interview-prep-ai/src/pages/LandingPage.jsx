import React, { useState, useContext, Component } from "react";
import HERO_IMG from "../assets/hero-img.png";
import { useNavigate } from "react-router-dom";
import { MdAssessment } from "react-icons/md"; // Icon for Interview Mock Test
import { AiOutlineQuestionCircle } from "react-icons/ai"; // Icon for Interview Q&A
import Modal from "../components/Modal";
import Login from "./Auth/Login";
import SignUp from "./Auth/SignUp";
import { UserContext } from "../context/userContext";
import ProfileInfoCard from "../components/Cards/ProfileInfoCard";
import AnimatedSphere3D from "../components/AnimatedSphere3D";

// Error Boundary for 3D Component
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('3D Component Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-96 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center">
          <div className="text-center">
            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <p className="text-gray-600 text-sm font-medium">3D Interview Room</p>
            <p className="text-gray-500 text-xs mt-1">Interactive 3D View</p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Fallback component in case 3D fails to load
const SphereFallback = () => (
  <div className="w-full h-96 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center">
    <div className="text-center">
      <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
        </svg>
      </div>
      <p className="text-gray-600 text-sm font-medium">3D Animated Sphere</p>
      <p className="text-gray-500 text-xs mt-1">Loading...</p>
    </div>
  </div>
);

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
      <div className="min-h-screen w-full bg-white relative text-gray-800">
        {/* Crosshatch Art - Light Pattern */}
        <div
          className="absolute inset-0 z-0 pointer-events-none"
          style={{
            backgroundImage: `
              repeating-linear-gradient(22.5deg, transparent, transparent 2px, rgba(75, 85, 99, 0.06) 2px, rgba(75, 85, 99, 0.06) 3px, transparent 3px, transparent 8px),
              repeating-linear-gradient(67.5deg, transparent, transparent 2px, rgba(107, 114, 128, 0.05) 2px, rgba(107, 114, 128, 0.05) 3px, transparent 3px, transparent 8px),
              repeating-linear-gradient(112.5deg, transparent, transparent 2px, rgba(55, 65, 81, 0.04) 2px, rgba(55, 65, 81, 0.04) 3px, transparent 3px, transparent 8px),
              repeating-linear-gradient(157.5deg, transparent, transparent 2px, rgba(31, 41, 55, 0.03) 2px, rgba(31, 41, 55, 0.03) 3px, transparent 3px, transparent 8px)
            `,
          }}
        />
        
        {/* Container */}
        <div className="container mx-auto px-6 pt-12 pb-20 relative z-10">
          {/* Header */}
          <header className="flex justify-between items-center mb-16">
            <div className="flex items-center gap-3 text-3xl font-extrabold text-gray-800">
              <AiOutlineQuestionCircle size={30} /> 
              Interview Q&A
            </div>
            {user ? (
              <ProfileInfoCard />
            ) : (
              <button
                className="bg-blue-600 text-sm font-semibold text-white px-8 py-3 rounded-full hover:bg-blue-700 border border-blue-600 transition-colors"
                onClick={() => setOpenAuthModal(true)}
              >
                Login / Sign Up
              </button>
            )}
          </header>

          {/* Hero Section */}
          <div className="flex flex-col md:flex-row items-center gap-8 mb-12">
            {/* Left Side - Content */}
            <div className="w-full md:w-1/2 pr-4">
              <div className="mb-4">
                <div className="inline-flex items-center gap-3 text-sm font-medium text-blue-600 bg-blue-50 px-3 py-2 rounded-full border border-blue-200">
                  <MdAssessment /> Interview Q&A
                </div>
              </div>
              <h1 className="text-5xl font-semibold text-gray-800 mb-6 leading-tight">
                Master Interviews with{" "}
                <span className="font-bold" style={{ color: 'oklch(0.52 0.28 283.3)' }}>
                  AI-Powered
                </span>{" "}
                Q&A Practice
              </h1>
              <p className="text-lg text-gray-600 mb-6">
                Practice with personalized questions, get instant feedback, and ace your technical interviews with confidence.
              </p>
              <button
                className="text-sm font-semibold text-white px-8 py-3 rounded-full border transition-colors cursor-pointer"
                style={{ 
                  background: 'linear-gradient(to right, rgb(47 114 47), oklch(0.51 0.2 145.36))',
                  borderColor: 'oklch(0.51 0.2 145.36)'
                }}
                onClick={handleCTA}
              >
                Start Practicing
              </button>
            </div>

            {/* Right Side - 3D Animated Sphere */}
            <div className="w-full md:w-1/2">
              <ErrorBoundary>
                <React.Suspense fallback={<SphereFallback />}>
                  <AnimatedSphere3D />
                </React.Suspense>
              </ErrorBoundary>
            </div>
          </div>

          {/* Portfolio Section - System Explanation & Guides */}
          <section className="py-16 md:py-20">
            <div className="max-w-7xl mx-auto">
              {/* Section Header */}
              <div className="text-center mb-12 md:mb-16">
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 leading-tight">
                  How Our{" "}
                  <span style={{ color: 'oklch(0.52 0.28 283.3)' }}>Interview System</span>{" "}
                  Works
                </h2>
                <p className="text-lg md:text-xl text-gray-700 max-w-4xl mx-auto leading-relaxed">
                  Discover our comprehensive AI-powered interview preparation platform designed to help you succeed in technical interviews.
                </p>
              </div>

              {/* Features Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-12 md:mb-16">
                {/* Feature 1: AI-Powered Questions */}
                <div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className="w-14 h-14 md:w-16 md:h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4 md:mb-6">
                    <svg className="w-6 h-6 md:w-8 md:h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-3 md:mb-4">AI-Powered Questions</h3>
                  <p className="text-gray-700 leading-relaxed text-sm md:text-base">
                    Our advanced AI analyzes your resume and generates personalized technical and behavioral questions tailored to your experience level and role.
                  </p>
                </div>

                {/* Feature 2: Real-time Feedback */}
                <div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className="w-14 h-14 md:w-16 md:h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 md:mb-6">
                    <svg className="w-6 h-6 md:w-8 md:h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-3 md:mb-4">Real-time Feedback</h3>
                  <p className="text-gray-700 leading-relaxed text-sm md:text-base">
                    Get instant, detailed feedback on your answers with specific suggestions for improvement and areas of strength.
                  </p>
                </div>

                {/* Feature 3: Performance Analytics */}
                <div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className="w-14 h-14 md:w-16 md:h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4 md:mb-6">
                    <svg className="w-6 h-6 md:w-8 md:h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-3 md:mb-4">Performance Analytics</h3>
                  <p className="text-gray-700 leading-relaxed text-sm md:text-base">
                    Track your progress with detailed analytics, skill breakdowns, and performance metrics to identify areas for improvement.
                  </p>
                </div>

                {/* Feature 4: Timed Sessions */}
                <div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className="w-14 h-14 md:w-16 md:h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4 md:mb-6">
                    <svg className="w-6 h-6 md:w-8 md:h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-3 md:mb-4">Timed Sessions</h3>
                  <p className="text-gray-700 leading-relaxed text-sm md:text-base">
                    Practice under realistic interview conditions with timed sessions that simulate actual interview environments.
                  </p>
                </div>

                {/* Feature 5: PDF Resume Analysis */}
                <div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className="w-14 h-14 md:w-16 md:h-16 bg-red-100 rounded-full flex items-center justify-center mb-4 md:mb-6">
                    <svg className="w-6 h-6 md:w-8 md:h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-3 md:mb-4">PDF Resume Analysis</h3>
                  <p className="text-gray-700 leading-relaxed text-sm md:text-base">
                    Upload your resume and let our AI extract relevant information to create personalized interview questions.
                  </p>
                </div>

                {/* Feature 6: Concept Explanations */}
                <div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className="w-14 h-14 md:w-16 md:h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4 md:mb-6">
                    <svg className="w-6 h-6 md:w-8 md:h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-3 md:mb-4">Concept Explanations</h3>
                  <p className="text-gray-700 leading-relaxed text-sm md:text-base">
                    Get detailed explanations of technical concepts when you need help understanding complex topics.
                  </p>
                </div>
              </div>

              {/* How It Works Section */}
              <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl mb-12 md:mb-16">
                <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 md:mb-8 text-center">How It Works</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                  {/* Step 1 */}
                  <div className="text-center">
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'oklch(0.52 0.28 283.3)' }}>
                      <span className="text-white text-xl md:text-2xl font-bold">1</span>
                    </div>
                    <h4 className="text-base md:text-lg font-semibold text-gray-900 mb-2">Upload Resume</h4>
                    <p className="text-gray-700 text-sm md:text-base">Upload your PDF resume to get personalized questions</p>
                  </div>

                  {/* Step 2 */}
                  <div className="text-center">
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'oklch(0.52 0.28 283.3)' }}>
                      <span className="text-white text-xl md:text-2xl font-bold">2</span>
                    </div>
                    <h4 className="text-base md:text-lg font-semibold text-gray-900 mb-2">Create Session</h4>
                    <p className="text-gray-700 text-sm md:text-base">Set your role, experience level, and topics to focus on</p>
                  </div>

                  {/* Step 3 */}
                  <div className="text-center">
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'oklch(0.52 0.28 283.3)' }}>
                      <span className="text-white text-xl md:text-2xl font-bold">3</span>
                    </div>
                    <h4 className="text-base md:text-lg font-semibold text-gray-900 mb-2">Practice Interviews</h4>
                    <p className="text-gray-700 text-sm md:text-base">Answer questions in a timed, realistic environment</p>
                  </div>

                  {/* Step 4 */}
                  <div className="text-center">
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'oklch(0.52 0.28 283.3)' }}>
                      <span className="text-white text-xl md:text-2xl font-bold">4</span>
                    </div>
                    <h4 className="text-base md:text-lg font-semibold text-gray-900 mb-2">Get Feedback</h4>
                    <p className="text-gray-700 text-sm md:text-base">Receive detailed AI feedback and performance analysis</p>
                  </div>
                </div>
              </div>

                             {/* Interview Tips Section */}
               <div className="bg-white rounded-3xl p-8 md:p-12 shadow-lg">
                 <h3 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8 text-center text-gray-900">Interview Success Tips</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  <div className="bg-white rounded-xl p-4 md:p-6 shadow-lg hover:shadow-xl transition-shadow">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <h4 className="text-base md:text-lg font-bold mb-2 md:mb-3 text-gray-900">Research the Company</h4>
                    <p className="text-gray-700 text-sm md:text-base leading-relaxed">Understand the company's mission, values, and recent news before your interview.</p>
                  </div>
                  <div className="bg-white rounded-xl p-4 md:p-6 shadow-lg hover:shadow-xl transition-shadow">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h4 className="text-base md:text-lg font-bold mb-2 md:mb-3 text-gray-900">Practice STAR Method</h4>
                    <p className="text-gray-700 text-sm md:text-base leading-relaxed">Structure your answers using Situation, Task, Action, and Result format.</p>
                  </div>
                  <div className="bg-white rounded-xl p-4 md:p-6 shadow-lg hover:shadow-xl transition-shadow">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                      <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h4 className="text-base md:text-lg font-bold mb-2 md:mb-3 text-gray-900">Prepare Questions</h4>
                    <p className="text-gray-700 text-sm md:text-base leading-relaxed">Have thoughtful questions ready to ask about the role and company.</p>
                  </div>
                  <div className="bg-white rounded-xl p-4 md:p-6 shadow-lg hover:shadow-xl transition-shadow">
                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                      <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <h4 className="text-base md:text-lg font-bold mb-2 md:mb-3 text-gray-900">Dress Appropriately</h4>
                    <p className="text-gray-700 text-sm md:text-base leading-relaxed">Research the company culture and dress accordingly for the interview.</p>
                  </div>
                  <div className="bg-white rounded-xl p-4 md:p-6 shadow-lg hover:shadow-xl transition-shadow">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                      <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h4 className="text-base md:text-lg font-bold mb-2 md:mb-3 text-gray-900">Follow Up</h4>
                    <p className="text-gray-700 text-sm md:text-base leading-relaxed">Send a thank-you email within 24 hours after your interview.</p>
                  </div>
                  <div className="bg-white rounded-xl p-4 md:p-6 shadow-lg hover:shadow-xl transition-shadow">
                    <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                      <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <h4 className="text-base md:text-lg font-bold mb-2 md:mb-3 text-gray-900">Stay Confident</h4>
                    <p className="text-gray-700 text-sm md:text-base leading-relaxed">Maintain positive body language and speak clearly throughout the interview.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
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