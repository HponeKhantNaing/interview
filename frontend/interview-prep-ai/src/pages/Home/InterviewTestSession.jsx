import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import SpinnerLoader from "../../components/Loader/SpinnerLoader";
import QuestionCard from "../../components/Cards/QuestionCard";
import moment from "moment";
import RoleInfoHeader from "../InterviewPrep/components/RoleInfoHeader";

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
          <div className="mb-4 mt-8 text-2xl font-bold text-orange-500">
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
                  isFinalSubmitted={false}
                  id={`question-card-${data._id}`}
                  questionNumber={startIdx + index + 1}
                  type={data.type}
                />
              ));
            })()}

            {session.questions && session.questions.length > QUESTIONS_PER_PAGE && (
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
    </DashboardLayout>
  );
};

export default InterviewTestSession; 