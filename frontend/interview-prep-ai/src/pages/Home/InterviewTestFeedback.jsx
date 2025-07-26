import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import SpinnerLoader from "../../components/Loader/SpinnerLoader";

const InterviewTestFeedback = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await axiosInstance.get(API_PATHS.ACTUAL.GET_ONE(sessionId));
        setSession(res.data.session || res.data);
      } finally {
        setLoading(false);
      }
    };
    fetchSession();
  }, [sessionId]);

  if (loading) return <DashboardLayout><SpinnerLoader /></DashboardLayout>;
  if (!session?.feedback) return <DashboardLayout><div className="p-10 text-center">No feedback available.</div></DashboardLayout>;

  const feedback = session.feedback;

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto mt-10 p-6 rounded-lg bg-gray-50 border border-gray-200">
        <button
          className="mb-6 px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors"
          onClick={() => navigate(`/interview-test/${sessionId}`)}
        >
          ← Back to Questions & Answers
        </button>
        <h3 className="text-2xl font-bold mb-4 text-orange-600">Feedback</h3>
        {feedback.skillsBreakdown && (
          <div className="mb-4">
            <h4 className="font-semibold mb-2">Skills Breakdown</h4>
            {/* Overall Percentage Calculation */}
            {(() => {
              const breakdown = feedback.skillsBreakdown;
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
              {feedback.skillsBreakdown.map((item, idx) => (
                <li key={idx}>
                  <span className="font-medium">{item.skill}:</span> <span className="text-blue-700">{item.score}/5</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        {feedback.strengths && (
          <div className="mb-4">
            <h4 className="font-semibold mb-2">Strengths</h4>
            <ul className="list-disc list-inside">
              {feedback.strengths.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>
        )}
        {feedback.areasForImprovement && (
          <div className="mb-4">
            <h4 className="font-semibold mb-2">Areas for Improvement</h4>
            <ul className="list-disc list-inside">
              {feedback.areasForImprovement.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>
        )}
        {feedback.summary && (
          <div className="mb-4">
            <h4 className="font-semibold mb-2">Summary</h4>
            <p>{feedback.summary}</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default InterviewTestFeedback; 