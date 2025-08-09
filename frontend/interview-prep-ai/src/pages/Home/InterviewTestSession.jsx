import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import SpinnerLoader from "../../components/Loader/SpinnerLoader";
import QuestionCard from "../../components/Cards/QuestionCard";
import moment from "moment";
import RoleInfoHeader from "../InterviewPrep/components/RoleInfoHeader";
import { toast } from "react-hot-toast";
import Timer from "../../components/Timer/Timer";
import ConfirmationModal from "../../components/Modal/ConfirmationModal";

const QUESTIONS_PER_PAGE = 5;

const InterviewTestSession = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [scrollToQuestionId, setScrollToQuestionId] = useState(null);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [isFinalSubmitted, setIsFinalSubmitted] = useState(false);
  const [userFeedbackInput, setUserFeedbackInput] = useState("");
  const [isSavingUserFeedback, setIsSavingUserFeedback] = useState(false);
  const [userFeedbackSaved, setUserFeedbackSaved] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showSubmitConfirmation, setShowSubmitConfirmation] = useState(false);
  const [timer, setTimer] = useState(60 * 60); // 1 hour in seconds
  const [isTimerExpired, setIsTimerExpired] = useState(false);
  const [isTimerStopped, setIsTimerStopped] = useState(false);

  const fetchSession = async () => {
    setIsLoading(true);
    try {
      const res = await axiosInstance.get(API_PATHS.ACTUAL.GET_ONE(sessionId));
      setSession(res.data.session || res.data);
    } catch (err) {
      setError("Failed to fetch session");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSession();
    // eslint-disable-next-line
  }, [sessionId]);

  // Timer effect
  useEffect(() => {
    if (timer <= 0 || isTimerStopped) {
      if (timer <= 0) {
        setIsTimerExpired(true);
      }
      return;
    }
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          setIsTimerExpired(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timer, isTimerStopped]);

  // Auto-submit when timer expires
  useEffect(() => {
    if (isTimerExpired && session && !session.isFinalSubmitted) {
      const autoSubmit = async () => {
        try {
          // First, ensure all answers are saved to database
          const savePromises = session.questions.map(async (q) => {
            if (q.userAnswer && q.userAnswer.trim() !== '') {
              try {
                await axiosInstance.post(API_PATHS.ACTUAL.ANSWER(q._id), {
                  answer: q.userAnswer,
                });
                console.log('Auto-saved actual answer for question:', q._id);
              } catch (error) {
                console.error('Failed to auto-save actual answer for question:', q._id, error);
              }
            }
          });
          
          await Promise.all(savePromises);
          
          const answerMap = {};
          session.questions.forEach((q) => {
            // Include all answers (including empty ones) for proper feedback
            answerMap[q._id] = q.userAnswer || "";
          });

          await axiosInstance.post(API_PATHS.ACTUAL.SUBMIT(sessionId), {
            answers: answerMap,
          });

          toast.success("⏰ Time's up! Session auto-submitted.");
          fetchSession(); // reload session state
        } catch (err) {
          toast.error("❌ Auto-submission failed.");
          console.error("Auto-submission error:", err);
        }
      };
      
      autoSubmit();
    }
  }, [isTimerExpired, session, sessionId]);

  useEffect(() => {
    if (session) {
      setIsFinalSubmitted(session.isFinalSubmitted);
      
      // Set timer from session data
      if (session.remainingTime !== undefined) {
        setTimer(session.remainingTime);
        if (session.remainingTime <= 0) {
          setIsTimerExpired(true);
        }
      }
      
      // Stop timer if session is already submitted
      if (session.isFinalSubmitted) {
        setIsTimerStopped(true);
      }
    }
  }, [session]);

  // Final submit
  const handleFinalSubmit = async () => {
    try {
      // Stop the timer
      setIsTimerStopped(true);
      
      // First, ensure all answers are saved to database
      const savePromises = session.questions.map(async (q) => {
        if (q.userAnswer && q.userAnswer.trim() !== '') {
          try {
            await axiosInstance.post(API_PATHS.ACTUAL.ANSWER(q._id), {
              answer: q.userAnswer,
            });
            console.log('Saved actual answer for question:', q._id);
          } catch (error) {
            console.error('Failed to save actual answer for question:', q._id, error);
          }
        }
      });
      
      await Promise.all(savePromises);
      
      const answerMap = {};
      session.questions.forEach((q) => {
        // Include all answers (including empty ones) for proper feedback
        answerMap[q._id] = q.userAnswer || "";
      });
      await axiosInstance.post(API_PATHS.ACTUAL.SUBMIT(sessionId), {
        answers: answerMap,
      });
      toast.success("✅ Submitted successfully!");
      fetchSession();
    } catch (err) {
      toast.error(err?.response?.data?.message || "❌ Submission failed.");
    }
  };

  // Save user feedback
  const handleUserFeedback = async (e) => {
    e.preventDefault();
    setIsSavingUserFeedback(true);
    try {
      await axiosInstance.post(API_PATHS.ACTUAL.USER_FEEDBACK(sessionId), {
        userFeedback: userFeedbackInput,
      });
      toast.success("Your feedback has been saved!");
      setUserFeedbackSaved(true);
      fetchSession();
    } catch (err) {
      toast.error("Failed to save feedback");
    } finally {
      setIsSavingUserFeedback(false);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 200);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (scrollToQuestionId) {
      const el = document.getElementById(scrollToQuestionId);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        setScrollToQuestionId(null);
      }
    }
  }, [currentPage, scrollToQuestionId]);

  if (isLoading) return <DashboardLayout><SpinnerLoader /></DashboardLayout>;
  if (error) return <DashboardLayout><div className="p-10 text-center text-red-500">{error}</div></DashboardLayout>;
  if (!session) return <DashboardLayout><div className="p-10 text-center">Session not found.</div></DashboardLayout>;

  return (
    <DashboardLayout>
      
      <RoleInfoHeader
        role={session?.role || ""}
        topicsToFocus={session?.topicsToFocus || ""}
        experience={session?.experience || "-"}
        questions={session?.questions?.length || "-"}
        description={session?.description || ""}
        lastUpdated={
          session?.updatedAt
            ? moment(session.updatedAt).format("Do MMM YYYY")
            : ""
        }
        isCodingTest={true}
      />
      <div className="flex flex-row w-full">
        {/* left panel: Mini Map */}
        <div className="container w-1/4 max-h-[80vh] sticky flex flex-col items-center top-20">
          {/* Timer display */}
          <Timer 
            initialTime={timer}
            onExpire={() => setIsTimerExpired(true)}
            className="mb-4 mt-8"
            isStopped={isTimerStopped}
          />
          {/* Removed role display to match interview prep layout */}
          {session.questions && session.questions.length > 0 && (
            <div className="bg-transparent rounded-lg p-4 mt-4">
              <div className="flex flex-row flex-wrap gap-x-1">
                {(() => {
                  const questions = session.questions;
                  const columns = Math.ceil(questions.length / 5);
                  const grouped = Array.from({ length: columns }, (_, colIdx) =>
                    questions.slice(colIdx * 5, colIdx * 5 + 5)
                  );
                  return grouped.map((group, colIndex) => (
                    <div key={colIndex} className="flex flex-col gap-y-1">
                      {group.map((q, i) => {
                        const idx = colIndex * 5 + i;
                        const page = Math.floor(idx / QUESTIONS_PER_PAGE) + 1;
                        const isCurrentPage = page === currentPage;
                        
                        // Determine button styling based on answer status
                        let buttonClass = `w-10 h-10 flex items-center justify-center rounded border text-base font-semibold shadow-sm hover:bg-orange-100 focus:outline-none focus:ring-2 focus:ring-orange-400 transition-all duration-200`;
                        
                        if (isFinalSubmitted) {
                          // After submission - show correct/incorrect based on stored isCorrect field
                          if (q.userAnswer && q.userAnswer.trim() !== '') {
                            if (q.isCorrect === true) {
                              buttonClass += " bg-green-100 border-green-400 text-green-700 hover:bg-green-200";
                            } else if (q.isCorrect === false) {
                              buttonClass += " bg-red-100 border-red-400 text-red-700 hover:bg-red-200";
                            } else {
                              // Fallback: if isCorrect is not set, use simple comparison
                              const isCorrect = q.userAnswer && q.answer && q.userAnswer.trim().toLowerCase() === q.answer.trim().toLowerCase();
                              if (isCorrect) {
                                buttonClass += " bg-green-100 border-green-400 text-green-700 hover:bg-green-200";
                              } else {
                                buttonClass += " bg-red-100 border-red-400 text-red-700 hover:bg-red-200";
                              }
                            }
                          } else {
                            // No answer submitted
                            buttonClass += " bg-red-100 border-red-400 text-red-700 hover:bg-red-200";
                          }
                        } else {
                          // Before submission - show answered/unanswered
                          if (q.userAnswer && q.userAnswer.trim() !== '') {
                            // Has answer
                            buttonClass += " bg-blue-100 border-blue-400 text-blue-700 hover:bg-blue-200";
                          } else {
                            // No answer
                            if (isCurrentPage) {
                              buttonClass += " bg-orange-100 border-orange-400";
                            } else {
                              buttonClass += " bg-white border-gray-300";
                            }
                          }
                        }
                        
                        return (
                          <button
                            key={q._id}
                            className={buttonClass}
                            onClick={() => {
                              if (page !== currentPage) {
                                setCurrentPage(page);
                                setScrollToQuestionId(`question-card-${q._id}`);
                              } else {
                                const el = document.getElementById(`question-card-${q._id}`);
                                if (el) {
                                  el.scrollIntoView({ behavior: "smooth", block: "center" });
                                }
                              }
                            }}
                            aria-label={`Go to question ${idx + 1}`}
                          >
                            {idx + 1}
                          </button>
                        );
                      })}
                    </div>
                  ));
                })()}
              </div>
            </div>
          )}
        </div>

        {/* right container */}
        <div className="container w-3/4 flex-1 flex flex-col pt-4 pb-4 px-6 md:px-8">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold color-black">Coding Q & A</h2>
            <div className="flex items-center space-x-4">
              
            </div>
            {session.questions && session.questions.length > QUESTIONS_PER_PAGE && (
              <div className="flex items-center gap-1">
                <button
                  className="px-2 py-1 rounded border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-50"
                  onClick={() => {
                    setCurrentPage((prev) => Math.max(prev - 1, 1));
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  disabled={currentPage === 1}
                  aria-label="Previous Page"
                >
                  &#8592;
                </button>
                {(() => {
                  const totalPages = Math.ceil(session.questions.length / QUESTIONS_PER_PAGE);
                  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
                  return pages.map((page) => (
                    <button
                      key={page}
                      className={`px-2 py-1 rounded border border-gray-300 bg-white hover:bg-gray-100 ${
                        currentPage === page ? 'bg-orange-100 border-orange-400' : 'bg-white'
                      }`}
                      onClick={() => {
                        setCurrentPage(page);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      disabled={currentPage === page}
                    >
                      {page}
                    </button>
                  ));
                })()}
                <button
                  className="px-3 py-1 rounded border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-50"
                  onClick={() => {
                    setCurrentPage((prev) => {
                      const nextPage = Math.min(prev + 1, Math.ceil(session.questions.length / QUESTIONS_PER_PAGE));
                      if (nextPage === Math.ceil(session.questions.length / QUESTIONS_PER_PAGE)) {
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }
                      return nextPage;
                    });
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  disabled={currentPage === Math.ceil(session.questions.length / QUESTIONS_PER_PAGE)}
                  aria-label="Next Page"
                >
                  &#8594;
                </button>
              </div>
            )}
          </div>

          <div className="w-full gap-4 mt-5 mb-10">
            {(() => {
              if (!session?.questions) return null;
              const startIdx = (currentPage - 1) * QUESTIONS_PER_PAGE;
              const endIdx = startIdx + QUESTIONS_PER_PAGE;
              const paginatedQuestions = session.questions.slice(startIdx, endIdx);
              return paginatedQuestions.map((data, index) => (
                <QuestionCard
                  key={data._id}
                  questionId={data._id}
                  question={data.question}
                  answer={data.answer}
                  userAnswer={data.userAnswer}
                  isFinalSubmitted={isFinalSubmitted}
                  id={`question-card-${data._id}`}
                  questionNumber={startIdx + index + 1}
                  type={data.type}
                  customApiEndpoint={API_PATHS.ACTUAL.ANSWER(data._id)}
                />
              ));
            })()}

            {/* Pagination Controls */}
            {session?.questions && session.questions.length > QUESTIONS_PER_PAGE && (
              <div className="flex justify-center mt-6 gap-2">
                <button
                  className="px-3 py-1 rounded border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-50"
                  onClick={() => {
                    setCurrentPage((prev) => Math.max(prev - 1, 1));
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  disabled={currentPage === 1}
                >
                  Previous
                </button>
                <span className="px-2 py-1 font-medium">
                  Page {currentPage} of {Math.ceil(session.questions.length / QUESTIONS_PER_PAGE)}
                </span>
                <button
                  className="px-3 py-1 rounded border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-50"
                  onClick={() => {
                    setCurrentPage((prev) =>
                      Math.min(prev + 1, Math.ceil(session.questions.length / QUESTIONS_PER_PAGE))
                    );
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  disabled={currentPage === Math.ceil(session.questions.length / QUESTIONS_PER_PAGE)}
                >
                  Next
                </button>
              </div>
            )}

            {/* Final Submit Button */}
            {!isFinalSubmitted && session.questions?.length > 0 && (
              <div className="flex justify-center mt-8">
                <button
                  className="bg-black text-white px-6 py-2 rounded hover:bg-orange-600 transition-colors"
                  onClick={() => setShowSubmitConfirmation(true)}
                >
                  Final Submit
                </button>
              </div>
            )}

            {/* Submission Message */}
            {isFinalSubmitted && (
              <div className="flex justify-center mt-8 mb-6">
                <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 max-w-md w-full">
                  <div className="text-center">
                    <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-3">
                      <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <h3 className="text-base font-semibold text-gray-900 mb-1">All Set!</h3>
                    <p className="text-sm text-gray-600">Your coding test has been submitted successfully. You're now in review mode.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Feedback Section */}
            {isFinalSubmitted && session.feedback && (
              <div className="flex justify-center mt-8">
                <button
                  className="text-white px-6 py-2 rounded hover:opacity-90 transition-opacity"
                  style={{ 
                    background: 'linear-gradient(to right, rgb(47, 114, 47), oklch(0.51 0.2 145.36))'
                  }}
                  onClick={() => navigate(`/interview-test/${sessionId}/feedback`)}
                >
                  Show Feedback
                </button>
              </div>
            )}

            {/* User Feedback Form - HIDDEN */}

            {/* Feedback Modal/Page - Dashboard Design */}
            {showFeedback && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm">
                <div className="bg-white/95 backdrop-blur-md rounded-2xl p-8 max-w-5xl w-full relative shadow-2xl border border-white/30 max-h-[90vh] overflow-y-auto">
                  <button
                    className="absolute top-4 right-4 text-gray-500 hover:text-black w-8 h-8 flex items-center justify-center rounded-full bg-white/50 backdrop-blur-sm hover:bg-white/80 transition-all duration-300"
                    onClick={() => setShowFeedback(false)}
                  >
                    ×
                  </button>
                  
                  <div className="min-h-screen bg-white">
                    <div className="max-w-5xl mx-auto p-4">
                      
                      {/* Water-like Header */}
                      <div className="mb-6">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <div className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium shadow-lg backdrop-blur-sm">
                              Key2Career
                            </div>
                            <div className="bg-white/20 backdrop-blur-md border border-white/30 text-cyan-800 px-4 py-2 rounded-xl text-sm font-medium shadow-lg">
                              {session?.role || "Coding Test"}
                            </div>
                            <div className="bg-white/20 backdrop-blur-md border border-white/30 text-cyan-800 px-4 py-2 rounded-xl text-sm font-medium shadow-lg">
                              {session?.topicsToFocus || "Topics to Focus"}
                            </div>
                          </div>
                          <button
                            className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl hover:from-cyan-600 hover:to-blue-600 transition-all duration-300 text-sm font-medium shadow-lg backdrop-blur-sm"
                            onClick={() => setShowFeedback(false)}
                          >
                            ← Close Feedback
                          </button>
                        </div>
                      </div>

                      {/* Water-like Grid Layout */}
                      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                        
                        {/* Overall Performance - Water Droplet Style */}
                        <div className="lg:col-span-1">
                          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/30 shadow-2xl sticky top-4 relative overflow-hidden">
                            {/* Water droplet effect */}
                            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl"></div>
                            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-cyan-100/20 to-blue-100/20 rounded-2xl"></div>
                            
                            <div className="relative z-10">
                              <h3 className="text-sm font-semibold text-cyan-800 mb-3 text-center">Overall</h3>
                              <div className="text-center">
                                <div className="relative w-20 h-20 mx-auto mb-3">
                                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center shadow-lg">
                                    <div className="w-16 h-16 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center">
                                      <span className="text-lg font-bold text-cyan-700">
                                        {(() => {
                                          const breakdown = session.feedback?.skillsBreakdown;
                                          if (!breakdown) return 0;
                                          const totalScore = breakdown.reduce((sum, item) => sum + (item.score || 0), 0);
                                          const maxScore = breakdown.length * 5;
                                          return maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;
                                        })()}%
                                      </span>
                                    </div>
                                  </div>
                                  {/* Water ripple effect */}
                                  <div className="absolute inset-0 rounded-full bg-cyan-300/30 animate-ping"></div>
                                </div>
                                <div className="text-xs text-cyan-700 font-medium">
                                  Performance
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Main Content Area */}
                        <div className="lg:col-span-4 space-y-4">
                          
                          {/* Skills Breakdown - Water Glass Effect */}
                          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/30 shadow-2xl relative overflow-hidden">
                            {/* Water glass layers */}
                            <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent rounded-2xl"></div>
                            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-cyan-50/20 to-blue-50/20 rounded-2xl"></div>
                            
                            <div className="relative z-10">
                              <h3 className="text-lg font-semibold text-cyan-800 mb-4 flex items-center">
                                <div className="w-1 h-6 bg-gradient-to-b from-cyan-500 to-blue-500 rounded-full mr-3"></div>
                                Skills Breakdown
                              </h3>
                              
                              {session.feedback?.skillsBreakdown && (
                                <div className="space-y-4">
                                  {session.feedback.skillsBreakdown.map((item, idx) => {
                                    const total = item.total || 5;
                                    const percentage = total > 0 ? Math.round((item.score / total) * 100) : 0;
                                    
                                    return (
                                      <div key={idx} className="border-b border-white/30 pb-4 last:border-b-0 last:pb-0">
                                        <div className="flex justify-between items-center mb-2">
                                          <span className="font-medium text-cyan-800 text-sm">{item.skill}</span>
                                          <span className="text-xs bg-cyan-100/50 backdrop-blur-sm text-cyan-700 px-2 py-1 rounded-md font-medium border border-cyan-200/30">
                                            {item.score}/{total}
                                          </span>
                                        </div>
                                        <div className="w-full bg-white/30 backdrop-blur-sm rounded-full h-2 overflow-hidden border border-white/20">
                                          <div 
                                            className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full transition-all duration-500 ease-out shadow-sm"
                                            style={{ width: `${percentage}%` }}
                                          ></div>
                                        </div>
                                        <div className="text-xs text-cyan-600 mt-1 font-medium">
                                          {percentage}% proficiency
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Strengths and Improvements - Water Droplets */}
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            
                            {/* Strengths Card - Water Droplet */}
                            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/30 shadow-2xl relative overflow-hidden">
                              {/* Water droplet layers */}
                              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl"></div>
                              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-teal-50/20 to-green-50/20 rounded-2xl"></div>
                              
                              <div className="relative z-10">
                                <div className="flex items-center mb-3">
                                  <div className="w-6 h-6 bg-gradient-to-r from-teal-500 to-green-500 rounded-full flex items-center justify-center mr-2 shadow-lg">
                                    <span className="text-white text-xs">✓</span>
                                  </div>
                                  <h3 className="text-sm font-semibold text-teal-800">Strengths</h3>
                                </div>
                                {session.feedback?.strengths && session.feedback.strengths.length > 0 ? (
                                  <ul className="space-y-2">
                                    {session.feedback.strengths.slice(0, 4).map((item, idx) => (
                                      <li key={idx} className="flex items-start">
                                        <span className="text-gray-600 mr-2 mt-0.5 text-xs">•</span>
                                        <span className="text-gray-700 text-sm">{item}</span>
                                      </li>
                                    ))}
                                  </ul>
                                ) : (
                                  <p className="text-gray-600 italic text-sm">No specific strengths identified.</p>
                                )}
                              </div>
                            </div>

                            {/* Areas for Improvement Card - Water Droplet */}
                            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/30 shadow-2xl relative overflow-hidden">
                              {/* Water droplet layers */}
                              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl"></div>
                              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-cyan-50/20 to-blue-50/20 rounded-2xl"></div>
                              
                              <div className="relative z-10">
                                <div className="flex items-center mb-3">
                                  <div className="w-6 h-6 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center mr-2 shadow-lg">
                                    <span className="text-white text-xs">×</span>
                                  </div>
                                  <h3 className="text-sm font-semibold text-rose-700">Areas for Improvement</h3>
                                </div>
                                {session.feedback?.areasForImprovement && session.feedback.areasForImprovement.length > 0 ? (
                                  <ul className="space-y-2">
                                    {session.feedback.areasForImprovement.slice(0, 4).map((item, idx) => (
                                      <li key={idx} className="flex items-start">
                                        <span className="text-gray-600 mr-2 mt-0.5 text-xs">•</span>
                                        <span className="text-gray-700 text-sm">{item}</span>
                                      </li>
                                    ))}
                                  </ul>
                                ) : (
                                  <p className="text-gray-600 italic text-sm">No specific areas identified.</p>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Summary Section - Water Glass */}
                          {session.feedback?.summary && (
                            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/30 shadow-2xl relative overflow-hidden">
                              {/* Water glass layers */}
                              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl"></div>
                              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-50/20 to-cyan-50/20 rounded-2xl"></div>
                              
                              <div className="relative z-10">
                                <div className="flex items-center mb-3">
                                  <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mr-2 shadow-lg">
                                    <span className="text-white text-xs">!</span>
                                  </div>
                                  <h3 className="text-sm font-semibold text-blue-800">Summary</h3>
                                </div>
                                
                                {/* Enhanced Summary Content */}
                                <div className="space-y-4">
                                  {/* Main Summary */}
                                  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 border border-white/30">
                                    <p className="text-gray-700 text-sm leading-relaxed">
                                      {session.feedback.summary}
                                    </p>
                                  </div>
                                  
                                  {/* Performance Quality Assessment */}
                                  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 border border-white/30">
                                    <h4 className="text-xs font-semibold text-gray-800 mb-2 flex items-center">
                                      <span className="w-2 h-2 bg-gray-600 rounded-full mr-2"></span>
                                      Performance Quality Assessment
                                    </h4>
                                    <div className="text-gray-700 text-sm leading-relaxed">
                                      {(() => {
                                        const breakdown = session.feedback?.skillsBreakdown;
                                        if (!breakdown) return null;
                                        const totalScore = breakdown.reduce((sum, item) => sum + (item.score || 0), 0);
                                        const maxScore = breakdown.length * 5;
                                        const overallPercent = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;
                                        
                                        return overallPercent >= 80 ? (
                                          <p>🎯 <strong>Excellent Performance:</strong> You demonstrated exceptional knowledge and problem-solving skills. Your responses were well-structured, accurate, and showed deep understanding of the concepts.</p>
                                        ) : overallPercent >= 60 ? (
                                          <p>✅ <strong>Good Performance:</strong> You showed solid understanding of core concepts with room for improvement in specific areas. Your approach was generally correct with some minor gaps.</p>
                                        ) : overallPercent >= 40 ? (
                                          <p>⚠️ <strong>Fair Performance:</strong> You have a basic understanding but need more practice in several key areas. Focus on strengthening fundamental concepts and problem-solving techniques.</p>
                                        ) : (
                                          <p>📚 <strong>Needs Improvement:</strong> Consider revisiting the foundational concepts and practicing more problems. Focus on understanding core principles before tackling advanced topics.</p>
                                        );
                                      })()}
                                    </div>
                                  </div>
                                  
                                  {/* Additional Suggestions */}
                                  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 border border-white/30">
                                    <h4 className="text-xs font-semibold text-gray-800 mb-2 flex items-center">
                                      <span className="w-2 h-2 bg-gray-600 rounded-full mr-2"></span>
                                      Additional Suggestions
                                    </h4>
                                    <div className="space-y-2">
                                      <div className="text-gray-700 text-sm">
                                        <p className="mb-2"><strong>📖 Study Recommendations:</strong></p>
                                        <ul className="list-disc list-inside space-y-1 text-xs ml-2 text-gray-700">
                                          <li>Review the topics where you scored lowest</li>
                                          <li>Practice similar problems to build confidence</li>
                                          <li>Focus on understanding underlying concepts rather than memorizing</li>
                                          <li>Consider joining study groups or finding a mentor</li>
                                        </ul>
                                      </div>
                                      
                                      <div className="text-gray-700 text-sm">
                                        <p className="mb-2"><strong>⏰ Time Management:</strong></p>
                                        <ul className="list-disc list-inside space-y-1 text-xs ml-2 text-gray-700">
                                          <li>Practice with time constraints to improve speed</li>
                                          <li>Learn to quickly identify problem types</li>
                                          <li>Develop a systematic approach to problem-solving</li>
                                        </ul>
                                      </div>
                                      
                                      <div className="text-gray-700 text-sm">
                                        <p className="mb-2"><strong>🎯 Next Steps:</strong></p>
                                        <ul className="list-disc list-inside space-y-1 text-xs ml-2 text-gray-700">
                                          <li>Take more practice sessions focusing on weak areas</li>
                                          <li>Review this feedback after each practice session</li>
                                          <li>Track your progress over time</li>
                                          <li>Consider scheduling regular review sessions</li>
                                        </ul>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  {/* Encouragement Message */}
                                  <div className="bg-gradient-to-r from-gray-50/50 to-slate-50/50 backdrop-blur-sm rounded-xl p-3 border border-gray-200/30">
                                    <p className="text-gray-700 text-sm leading-relaxed">
                                      💪 <strong>Keep Going!</strong> Every practice session is a step toward improvement. Focus on progress rather than perfection, and remember that consistent practice is the key to success.
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {showBackToTop && (
        <button
          className="fixed bottom-8 right-8 z-50 w-14 h-14 flex items-center justify-center rounded-full bg-orange-500 text-white shadow-lg hover:bg-orange-600 transition-colors"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="Back to top"
        >
          ↑
        </button>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showSubmitConfirmation}
        onClose={() => setShowSubmitConfirmation(false)}
        onConfirm={handleFinalSubmit}
        title="Final Submit"
        message="Do you want to final submit this session? This action cannot be undone."
        confirmText="Yes, Submit"
        cancelText="Cancel"
      />
    </DashboardLayout>
  );
};

export default InterviewTestSession; 