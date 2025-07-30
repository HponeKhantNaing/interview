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
          <div className="mb-4 text-2xl font-bold text-orange-500">
            {session.role}
          </div>
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
            <h2 className="text-lg font-semibold color-black">Interview Q & A</h2>
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
              <div className="text-center mt-6 px-4 py-2 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border border-blue-200 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300 backdrop-blur-sm">
                <div className="text-blue-800 font-medium text-sm flex items-center justify-center gap-2">
                  <span className="text-blue-600"></span>
                  This session has been submitted. You may only review your answers.
                  <span className="text-blue-600"></span>
                </div>
              </div>
            )}

            {/* Feedback Section */}
            {isFinalSubmitted && session.feedback && (
              <div className="flex justify-center mt-8">
                <button
                  className="bg-orange-500 text-white px-6 py-2 rounded hover:bg-orange-600 transition-colors"
                  onClick={() => navigate(`/interview-test/${sessionId}/feedback`)}
                >
                  Show Feedback
                </button>
              </div>
            )}

            {/* User Feedback Form */}
            {isFinalSubmitted && (
              <div className="mt-8 p-6 rounded-lg bg-white border border-gray-200">
                <h3 className="text-lg font-bold mb-2 text-orange-600">Your Feedback</h3>
                {session.userFeedback ? (
                  <div className="mb-2">
                    <div className="text-gray-700">{session.userFeedback}</div>
                  </div>
                ) : (
                  <form onSubmit={handleUserFeedback}>
                    <textarea
                      className="w-full border border-gray-300 rounded p-2 mb-2"
                      rows={4}
                      placeholder="Share your thoughts about this session..."
                      value={userFeedbackInput}
                      onChange={(e) => setUserFeedbackInput(e.target.value)}
                      required
                    />
                    <button
                      type="submit"
                      className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 transition-colors"
                      disabled={isSavingUserFeedback || !userFeedbackInput.trim()}
                    >
                      {isSavingUserFeedback ? "Saving..." : "Submit Feedback"}
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* Feedback Modal/Page */}
            {showFeedback && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                <div className="bg-white rounded-lg p-8 max-w-xl w-full relative">
                  <button
                    className="absolute top-2 right-2 text-gray-500 hover:text-black"
                    onClick={() => setShowFeedback(false)}
                  >
                    ×
                  </button>
                  <h3 className="text-xl font-bold mb-4 text-orange-600">Feedback</h3>
                  {session.feedback?.skillsBreakdown && (
                    <div className="mb-4">
                      <h4 className="font-semibold mb-2">Skills Breakdown</h4>
                      {(() => {
                        const breakdown = session.feedback.skillsBreakdown;
                        const totalScore = breakdown.reduce((sum, item) => sum + (item.score || 0), 0);
                        const maxScore = breakdown.length * 5;
                        const percent = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;
                        return (
                          <div className="mb-2 text-sm font-semibold text-green-700">
                            Overall: {percent}%
                          </div>
                        );
                      })()}
                      <ul className="list-disc list-inside">
                        {session.feedback.skillsBreakdown.map((item, idx) => (
                          <li key={idx}>
                            <span className="font-medium">{item.skill}:</span> <span className="text-blue-700">{item.score}/5</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {session.feedback?.strengths && (
                    <div className="mb-4">
                      <h4 className="font-semibold mb-2">Strengths</h4>
                      <ul className="list-disc list-inside">
                        {session.feedback.strengths.map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {session.feedback?.areasForImprovement && (
                    <div className="mb-4">
                      <h4 className="font-semibold mb-2">Areas for Improvement</h4>
                      <ul className="list-disc list-inside">
                        {session.feedback.areasForImprovement.map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {session.feedback?.summary && (
                    <div className="mb-4">
                      <h4 className="font-semibold mb-2">Summary</h4>
                      <p>{session.feedback.summary}</p>
                    </div>
                  )}
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