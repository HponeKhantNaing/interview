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

  // Extract percentage from summary text for accurate overall score
  let overallPercent = 0;
  if (feedback.summary) {
    const match = feedback.summary.match(/(\d+)% accuracy/);
    if (match) {
      overallPercent = parseInt(match[1]);
    }
  }

  return (
    <DashboardLayout>
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
                  {sessionData?.role || "Target Role"}
                </div>
                <div className="bg-white/20 backdrop-blur-md border border-white/30 text-cyan-800 px-4 py-2 rounded-xl text-sm font-medium shadow-lg">
                  {sessionData?.topicsToFocus || "Topics to Focus"}
                </div>
              </div>
              <button
                className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl hover:from-cyan-600 hover:to-blue-600 transition-all duration-300 text-sm font-medium shadow-lg backdrop-blur-sm"
                onClick={() => navigate(`/interview-prep/${sessionId}`)}
              >
                ← Back to Dashboard
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
                          <span className="text-lg font-bold text-cyan-700">{overallPercent}%</span>
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
                  
                  {feedback.skillsBreakdown && (
                    <div className="space-y-4">
                      {feedback.skillsBreakdown.map((item, idx) => {
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
                    {feedback.strengths && feedback.strengths.length > 0 ? (
                      <ul className="space-y-2">
                        {feedback.strengths.slice(0, 4).map((item, idx) => (
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
                    {feedback.areasForImprovement && feedback.areasForImprovement.length > 0 ? (
                      <ul className="space-y-2">
                        {feedback.areasForImprovement.slice(0, 4).map((item, idx) => (
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
              {feedback.summary && (
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
                          {feedback.summary}
                        </p>
                      </div>
                      
                      {/* Performance Quality Assessment */}
                      <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 border border-white/30">
                        <h4 className="text-xs font-semibold text-gray-800 mb-2 flex items-center">
                          <span className="w-2 h-2 bg-gray-600 rounded-full mr-2"></span>
                          Performance Quality Assessment
                        </h4>
                        <div className="text-gray-700 text-sm leading-relaxed">
                          {overallPercent >= 80 ? (
                            <p>🎯 <strong>Excellent Performance:</strong> You demonstrated exceptional knowledge and problem-solving skills. Your responses were well-structured, accurate, and showed deep understanding of the concepts.</p>
                          ) : overallPercent >= 60 ? (
                            <p>✅ <strong>Good Performance:</strong> You showed solid understanding of core concepts with room for improvement in specific areas. Your approach was generally correct with some minor gaps.</p>
                          ) : overallPercent >= 40 ? (
                            <p>⚠️ <strong>Fair Performance:</strong> You have a basic understanding but need more practice in several key areas. Focus on strengthening fundamental concepts and problem-solving techniques.</p>
                          ) : (
                            <p>📚 <strong>Needs Improvement:</strong> Consider revisiting the foundational concepts and practicing more problems. Focus on understanding core principles before tackling advanced topics.</p>
                          )}
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
        
        <style jsx>{`
          @keyframes ping {
            75%, 100% {
              transform: scale(2);
              opacity: 0;
            }
          }
          .animate-ping {
            animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;
          }
        `}</style>
      </div>
    </DashboardLayout>
  );
};

export default Feedback; 