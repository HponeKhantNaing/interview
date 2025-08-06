import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import moment from "moment";
import { AnimatePresence, motion } from "framer-motion";
import { LuCircleAlert, LuListCollapse, LuArrowUp } from "react-icons/lu";
import SpinnerLoader from "../../components/Loader/SpinnerLoader";
import { toast } from "react-hot-toast";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import RoleInfoHeader from "./components/RoleInfoHeader";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import QuestionCard from "../../components/Cards/QuestionCard";
import Drawer from "../../components/Drawer";
import SkeletonLoader from "../../components/Loader/SkeletonLoader";
import AIResponsePreview from "./components/AIResponsePreview";
import Timer from "../../components/Timer/Timer";
import ConfirmationModal from "../../components/Modal/ConfirmationModal";

const InterviewPrep = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();

  const [sessionData, setSessionData] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  const [openLeanMoreDrawer, setOpenLeanMoreDrawer] = useState(false);
  const [explanation, setExplanation] = useState(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isUpdateLoader, setIsUpdateLoader] = useState(false);
  const [score, setScore] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [scrollToQuestionId, setScrollToQuestionId] = useState(null);
  const [timer, setTimer] = useState(60 * 60); // 1 hour in seconds
  const [isTimerExpired, setIsTimerExpired] = useState(false);
  const [isTimerStopped, setIsTimerStopped] = useState(false);
  const QUESTIONS_PER_PAGE = 5;
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [userFeedbackInput, setUserFeedbackInput] = useState("");
  const [isSavingUserFeedback, setIsSavingUserFeedback] = useState(false);
  const [userFeedbackSaved, setUserFeedbackSaved] = useState(false);
  const [showSubmitConfirmation, setShowSubmitConfirmation] = useState(false);

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
    if (isTimerExpired && sessionData && !sessionData.isFinalSubmitted) {
      const autoSubmit = async () => {
        try {
          // First, ensure all answers are saved to database
          const savePromises = sessionData.questions.map(async (q) => {
            if (q.userAnswer && q.userAnswer.trim() !== '') {
              try {
                await axiosInstance.post(API_PATHS.QUESTION.ANSWER(q._id), {
                  answer: q.userAnswer,
                });
                console.log('Auto-saved answer for question:', q._id);
              } catch (error) {
                console.error('Failed to auto-save answer for question:', q._id, error);
              }
            }
          });
          
          await Promise.all(savePromises);
          
          const answerMap = {};
          sessionData.questions.forEach((q) => {
            // Include all answers (including empty ones) for proper feedback
            answerMap[q._id] = q.userAnswer || "";
          });

          await axiosInstance.post(API_PATHS.SESSION.SUBMIT(sessionId), {
            answers: answerMap,
          });

          toast.success("⏰ Time's up! Session auto-submitted.");
          fetchSessionDetailsById(); // reload session state
        } catch (err) {
          toast.error("❌ Auto-submission failed.");
          console.error("Auto-submission error:", err);
        }
      };
      
      autoSubmit();
    }
  }, [isTimerExpired, sessionData, sessionId]);

  // Handle final submit
  const handleFinalSubmit = async () => {
    try {
      // Stop the timer
      setIsTimerStopped(true);
      
      // First, ensure all answers are saved to database
      const savePromises = sessionData.questions.map(async (q) => {
        if (q.userAnswer && q.userAnswer.trim() !== '') {
          try {
            await axiosInstance.post(API_PATHS.QUESTION.ANSWER(q._id), {
              answer: q.userAnswer,
            });
            console.log('Saved answer for question:', q._id);
          } catch (error) {
            console.error('Failed to save answer for question:', q._id, error);
          }
        }
      });
      
      await Promise.all(savePromises);
      
      const answerMap = {};
      sessionData.questions.forEach((q) => {
        // Include all answers (including empty ones) for proper feedback
        answerMap[q._id] = q.userAnswer || "";
      });

      await axiosInstance.post(API_PATHS.SESSION.SUBMIT(sessionId), {
        answers: answerMap,
      });

      toast.success("✅ Submitted successfully!");
      fetchSessionDetailsById(); // reload session state
    } catch (err) {
      toast.error(err?.response?.data?.message || "❌ Submission failed.");
      console.error("Submission error:", err);
    }
  };

  // Fetch session data by session id
  const fetchSessionDetailsById = async () => {
    try {
      const response = await axiosInstance.get(
        API_PATHS.SESSION.GET_ONE(sessionId)
      );

      if (response.data && response.data.session) {
        const session = response.data.session;
        console.log("Session data:", session);
        console.log("Session feedback:", session.feedback);
        console.log("Is final submitted:", session.isFinalSubmitted);
        setSessionData(session);
        
        // Set timer from session data
        if (session.remainingTime !== undefined) {
          setTimer(session.remainingTime);
          if (session.remainingTime <= 0) {
            setIsTimerExpired(true);
          }
        }
      
        // ✅ Calculate score only if submitted
        if (session.isFinalSubmitted) {
          const correct = session.questions.filter(
            (q) => q.userAnswer && q.userAnswer === q.answer
          ).length;
          setScore(correct);
          // Stop timer if session is already submitted
          setIsTimerStopped(true);
        }
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  // Generate Concept Explanation
  const generateConceptExplanation = async (question) => {
    try {
      setErrorMsg("");
      setExplanation(null);

      setIsLoading(true);
      setOpenLeanMoreDrawer(true);

      const response = await axiosInstance.post(
        API_PATHS.AI.GENERATE_EXPLANATION,
        {
          question,
        }
      );

      if (response.data) {
        setExplanation(response.data);
      }
    } catch (error) {
      setExplanation(null);
      setErrorMsg("Failed to generate explanation, Try again later");
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Pin Question
  const toggleQuestionPinStatus = async (questionId) => {
    try {
      const response = await axiosInstance.post(
        API_PATHS.QUESTION.PIN(questionId)
      );

      console.log(response);

      if (response.data && response.data.question) {
        // toast.success('Question Pinned Successfully')
        fetchSessionDetailsById();
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  // Add more questions to a session
  const uploadMoreQuestions = async () => {
    try {
      setIsUpdateLoader(true);

      // Call AI API to generate questions
      const aiResponse = await axiosInstance.post(
        API_PATHS.AI.GENERATE_QUESTIONS,
        {
          role: sessionData?.role,
          experience: sessionData?.experience,
          topicsToFocus: sessionData?.topicsToFocus,
          numberOfQuestions: 10,
        }
      );

      // Should be array like [{question, answer}, ...]
      const generatedQuestions = aiResponse.data;

      const response = await axiosInstance.post(
        API_PATHS.QUESTION.ADD_TO_SESSION,
        {
          sessionId,
          questions: generatedQuestions,
        }
      );

      if (response.data) {
        toast.success("Added More Q&A!!");
        fetchSessionDetailsById();
      }
    } catch (error) {
      if (error.response && error.response.data.message) {
        setError(error.response.data.message);
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setIsUpdateLoader(false);
    }
  };

  useEffect(() => {
    fetchSessionDetailsById();
    // eslint-disable-next-line
  }, [sessionId]);

  // Add this useEffect to handle scrolling after pagination
  useEffect(() => {
    if (scrollToQuestionId) {
      const el = document.getElementById(scrollToQuestionId);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        setScrollToQuestionId(null); // reset after scroll
      }
    }
  }, [currentPage, scrollToQuestionId]);

  // Back to top scroll listener
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 200);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <DashboardLayout>
      <RoleInfoHeader
        role={sessionData?.role || ""}
        topicsToFocus={sessionData?.topicsToFocus || ""}
        experience={sessionData?.experience || "-"}
        questions={sessionData?.questions?.length || "-"}
        description={sessionData?.description || ""}
        lastUpdated={
          sessionData?.updatedAt
            ? moment(sessionData.updatedAt).format("Do MMM YYYY")
            : ""
        }
        isCodingTest={false}
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
          {sessionData?.questions && sessionData.questions.length > 0 && (
            <div className="bg-transparent rounded-lg p-4 mt-4">
              {/* <h3 className="text-md font-semibold mb-3">Mini Map</h3> */}
              <div className="flex flex-row flex-wrap gap-x-1">
                {(() => {
                  const questions = sessionData.questions;
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

                        return (
                          <button
                            key={q._id}
                            className={`w-10 h-10 flex items-center justify-center rounded border border-gray-300 text-base font-semibold shadow-sm hover:bg-orange-100 focus:outline-none focus:ring-2 focus:ring-orange-400 ${
                              isCurrentPage
                                ? "bg-orange-100 border-orange-400"
                                : "bg-white"
                            }`}
                            onClick={() => {
                              if (page !== currentPage) {
                                setCurrentPage(page);
                                setScrollToQuestionId(`question-card-${q._id}`); // <-- set scroll target
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
          <h2 className="text-base font-semibold color-black">Interview Q & A</h2>
          <div className="flex items-center space-x-4">
            {/* Removed EyeIcon for cheating detection */}
          </div>
          {/* Right-side Pagination Controls */}
          {sessionData?.questions && sessionData.questions.length > QUESTIONS_PER_PAGE && (
            <div className="flex items-center gap-1">
              {/* Left Arrow */}
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
              {/* Page Numbers */}
              {(() => {
                const totalPages = Math.ceil(sessionData.questions.length / QUESTIONS_PER_PAGE);
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
              {/* Right Arrow */}
              <button
                className="px-3 py-1 rounded border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-50"
                onClick={() => {
                  setCurrentPage((prev) => {
                    const nextPage = Math.min(prev + 1, Math.ceil(sessionData.questions.length / QUESTIONS_PER_PAGE));
                    if (nextPage === Math.ceil(sessionData.questions.length / QUESTIONS_PER_PAGE)) {
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                    return nextPage;
                  });
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                disabled={currentPage === Math.ceil(sessionData.questions.length / QUESTIONS_PER_PAGE)}
                aria-label="Next Page"
              >
                &#8594;
              </button>
            </div>
          )}
        </div>
  
        <div className="w-full gap-4 mt-5 mb-10">
          <div
            className={`col-span-12 ${
              openLeanMoreDrawer ? "md:col-span-7" : "md:col-span-8"
            } `}
          >
            {/* Remove AnimatePresence and motion.div for pagination animation */}
            {(() => {
              if (!sessionData?.questions) return null;
              const startIdx = (currentPage - 1) * QUESTIONS_PER_PAGE;
              const endIdx = startIdx + QUESTIONS_PER_PAGE;
              const paginatedQuestions = sessionData.questions.slice(startIdx, endIdx);
              return paginatedQuestions.map((data, index) => (
                <QuestionCard
                  key={data._id}
                  questionId={data._id}
                  question={data.question}
                  answer={data.answer}
                  userAnswer={data.userAnswer}
                  isFinalSubmitted={sessionData?.isFinalSubmitted}
                  id={`question-card-${data._id}`}
                  questionNumber={startIdx + index + 1}
                  type={data.type} // Pass type prop
                />
              ));
            })()}

            {/* Pagination Controls */}
            {sessionData?.questions && sessionData.questions.length > QUESTIONS_PER_PAGE && (
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
                  Page {currentPage} of {Math.ceil(sessionData.questions.length / QUESTIONS_PER_PAGE)}
                </span>
                <button
                  className="px-3 py-1 rounded border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-50"
                  onClick={() => {
                    setCurrentPage((prev) =>
                      Math.min(prev + 1, Math.ceil(sessionData.questions.length / QUESTIONS_PER_PAGE))
                    );
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  disabled={currentPage === Math.ceil(sessionData.questions.length / QUESTIONS_PER_PAGE)}
                >
                  Next
                </button>
              </div>
            )}
  
            {/* ✅ Final Submit Button */}
            {!sessionData?.isFinalSubmitted && sessionData?.questions?.length > 0 && (
            <div className="flex justify-center mt-8">
              <button
                className="bg-black text-white px-6 py-2 rounded hover:bg-orange-600 transition-colors"
                onClick={() => setShowSubmitConfirmation(true)}
              >
                Final Submit
              </button>
            </div>
          )}
  
            {sessionData?.isFinalSubmitted && (
              <div className="flex justify-center mt-8 mb-6">
                <div className="max-w-md w-full bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/30 shadow-2xl relative overflow-hidden">
                  {/* Water glass layers */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl"></div>
                  <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-green-50/20 to-blue-50/20 rounded-2xl"></div>
                  
                  <div className="relative z-10 text-center">
                    <div className="flex items-center justify-center mb-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse mr-3"></div>
                      <h3 className="text-lg font-semibold text-green-800">Session Submitted</h3>
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse ml-3"></div>
                    </div>
                    <p className="text-green-700 font-medium text-sm leading-relaxed">
                      This session has been submitted. You may only review your answers.
                    </p>
                  </div>
                </div>
              </div>
            )}

          {score !== null && (
            null
          )}

          {/* Feedback Section */}
          {sessionData?.isFinalSubmitted && (
            <div className="flex justify-center mt-8">
              {sessionData?.feedback ? (
                <button
                  className="bg-orange-500 text-white px-6 py-2 rounded hover:bg-orange-600 transition-colors"
                  onClick={() => navigate(`/interview-prep/${sessionId}/feedback`)}
                >
                  Show Feedback
                </button>
              ) : (
                <div className="text-center p-4 bg-yellow-50 border border-yellow-200 rounded">
                  <p className="text-yellow-700">Feedback is being generated...</p>
                  <button
                    className="mt-2 bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 transition-colors"
                    onClick={() => fetchSessionDetailsById()}
                  >
                    Refresh
                  </button>
                </div>
              )}
            </div>
          )}

          {/* User Feedback Form - HIDDEN */}
          </div>
        </div>
  
        {/* Learn More Drawer */}
        <Drawer
          isOpen={openLeanMoreDrawer}
          onClose={() => setOpenLeanMoreDrawer(false)}
          title={!isLoading && explanation?.title}
        >
          {errorMsg && (
            <p className="flex gap-2 text-sm text-amber-600 font-medium">
              <LuCircleAlert className="mt-1" /> {errorMsg}
            </p>
          )}
          {isLoading && <SkeletonLoader />}
          {!isLoading && explanation && (
            <AIResponsePreview content={explanation?.explanation} />
          )}
        </Drawer>
      </div> {/* closes the right container */}
    </div> {/* closes the main flex container for the page */}
    {/* Back to Top Button */}
    {showBackToTop && (
      <button
        className="fixed bottom-8 right-8 z-50 w-14 h-14 flex items-center justify-center rounded-full bg-orange-500 text-white shadow-lg hover:bg-orange-600 transition-colors"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        aria-label="Back to top"
      >
        <LuArrowUp className="text-3xl" />
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

export default InterviewPrep;
