import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import DashboardLayout from "../../components/layouts/DashboardLayout";

const Feedback = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [sessionData, setSessionData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const response = await axiosInstance.get(API_PATHS.SESSION.GET_ONE(sessionId));
        if (response.data && response.data.session) {
          setSessionData(response.data.session);
        }
      } catch (err) {
        // handle error
      } finally {
        setLoading(false);
      }
    };
    fetchSession();
  }, [sessionId]);

  if (loading) return <DashboardLayout><div className="p-10 text-center">Loading...</div></DashboardLayout>;
  if (!sessionData?.feedback) return <DashboardLayout><div className="p-10 text-center">No feedback available.</div></DashboardLayout>;

  const feedback = sessionData.feedback;

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto mt-10 p-6 rounded-lg bg-gray-50 border border-gray-200">
        <button
          className="mb-6 px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors"
          onClick={() => navigate(`/interview-prep/${sessionId}`)}
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

export default Feedback; 