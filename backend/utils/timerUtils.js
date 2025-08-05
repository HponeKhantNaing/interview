const Session = require("../models/Session");
const Actual = require("../models/Actual");
const { generateFeedback } = require("../controllers/aiController");
const axios = require("axios");

// Calculate remaining time in seconds
const calculateRemainingTime = (startTime, duration) => {
  const now = new Date();
  const elapsed = Math.floor((now - new Date(startTime)) / 1000);
  const remaining = Math.max(0, duration - elapsed);
  return remaining;
};

// Check if timer has expired
const isTimerExpired = (startTime, duration) => {
  return calculateRemainingTime(startTime, duration) <= 0;
};

// Auto-submit session when timer expires
const autoSubmitSession = async (sessionId, sessionType = 'session') => {
  try {
    const Model = sessionType === 'actual' ? Actual : Session;
    const session = await Model.findById(sessionId).populate('questions');
    
    if (!session || session.isFinalSubmitted) {
      return;
    }

    // Collect all user answers (including empty ones for feedback)
    const answers = {};
    session.questions.forEach(q => {
      answers[q._id] = q.userAnswer || "";
    });

    // Calculate submission time
    const submissionTime = Math.floor((new Date() - new Date(session.timerStartTime)) / 1000);
    
    // Mark as submitted
    session.isFinalSubmitted = true;
    session.submissionTime = submissionTime;

          // Generate personalized feedback using AI with detailed performance analysis
        try {
          // Prepare detailed performance analysis for AI
          const performanceAnalysis = {
            totalQuestions: totalQuestions,
            answeredQuestions: answeredQuestions,
            correctAnswers: correctAnswers,
            percentageScore: percentageScore,
            submissionTime: submissionTime,
            role: session.role,
            experience: session.experience,
            topicsToFocus: session.topicsToFocus,
            questions: session.questions.map(q => ({
              question: q.question,
              userAnswer: q.userAnswer || answers[q._id] || "",
              correctAnswer: q.answer,
              type: q.type,
              isAnswered: (q.userAnswer || answers[q._id] || "").trim().length > 0,
              answerLength: (q.userAnswer || answers[q._id] || "").length,
              hasCode: (q.userAnswer || answers[q._id] || "").includes('```'),
              timeSpent: q.timeSpent || 0
            })),
            performanceMetrics: {
              answerRate: (answeredQuestions / totalQuestions) * 100,
              accuracyRate: percentageScore,
              averageAnswerLength: session.questions.reduce((sum, q) => sum + ((q.userAnswer || answers[q._id] || "").length), 0) / answeredQuestions || 0,
              codeQuestionsAnswered: session.questions.filter(q => q.type === 'coding' && (q.userAnswer || answers[q._id] || "").trim().length > 0).length,
              technicalQuestionsAnswered: session.questions.filter(q => q.type === 'technical' && (q.userAnswer || answers[q._id] || "").trim().length > 0).length,
              questionsWithCode: session.questions.filter(q => (q.userAnswer || answers[q._id] || "").includes('```')).length,
              timeEfficiency: submissionTime ? (answeredQuestions / submissionTime) * 60 : 0
            },
            strengths: [],
            weaknesses: [],
            improvementAreas: []
          };

          // Analyze patterns for strengths and weaknesses
          const codingQuestions = session.questions.filter(q => q.type === 'coding');
          const technicalQuestions = session.questions.filter(q => q.type === 'technical');
          
          const answeredCoding = codingQuestions.filter(q => (q.userAnswer || answers[q._id] || "").trim().length > 0);
          const answeredTechnical = technicalQuestions.filter(q => (q.userAnswer || answers[q._id] || "").trim().length > 0);
          
          if (answeredCoding.length > 0) {
            performanceAnalysis.strengths.push('Demonstrated coding skills');
          }
          if (answeredTechnical.length > 0) {
            performanceAnalysis.strengths.push('Showed theoretical knowledge');
          }
          if (performanceAnalysis.performanceMetrics.averageAnswerLength > 100) {
            performanceAnalysis.strengths.push('Provided detailed explanations');
          }
          if (performanceAnalysis.performanceMetrics.questionsWithCode > 0) {
            performanceAnalysis.strengths.push('Used code examples in responses');
          }
          
          if (answeredCoding.length === 0 && codingQuestions.length > 0) {
            performanceAnalysis.weaknesses.push('Avoided coding questions');
          }
          if (answeredTechnical.length === 0 && technicalQuestions.length > 0) {
            performanceAnalysis.weaknesses.push('Struggled with theoretical questions');
          }
          if (performanceAnalysis.performanceMetrics.answerRate < 50) {
            performanceAnalysis.weaknesses.push('Low completion rate');
          }
          if (performanceAnalysis.performanceMetrics.averageAnswerLength < 50) {
            performanceAnalysis.weaknesses.push('Brief responses');
          }

          // Generate personalized feedback using AI
          const feedbackData = {
            role: session.role,
            experience: session.experience,
            topicsToFocus: session.topicsToFocus,
            performanceAnalysis: performanceAnalysis,
            questions: session.questions.map(q => ({
              question: q.question,
              userAnswer: q.userAnswer || answers[q._id] || "",
              correctAnswer: q.answer,
              type: q.type,
              isAnswered: (q.userAnswer || answers[q._id] || "").trim().length > 0,
              answerLength: (q.userAnswer || answers[q._id] || "").length,
              hasCode: (q.userAnswer || answers[q._id] || "").includes('```'),
              timeSpent: q.timeSpent || 0
            }))
          };

          let feedback = await generateFeedback(feedbackData);
          
          // Clean and parse the AI response
          let rawText = feedback;
          if (typeof rawText === 'string') {
            const cleanedText = rawText
              .replace(/^```json\s*/, "")
              .replace(/```$/, "")
              .trim();
            feedback = JSON.parse(cleanedText);
          }
          
          session.feedback = feedback;
        } catch (err) {
        console.error("Auto-submission feedback generation failed:", err);
        // Create fallback feedback for auto-submission with proper scoring
        // Calculate score based on percentage of total questions
        let score;
        if (percentageScore === 0) {
          score = 0;
        } else {
          // Convert percentage to score out of total questions
          score = Math.round((percentageScore / 100) * totalQuestions);
          // Ensure score doesn't exceed total questions
          score = Math.min(score, totalQuestions);
        }
        
        session.feedback = {
          skillsBreakdown: [
            { skill: "Technical Knowledge", score: score, total: totalQuestions },
            { skill: "Problem Solving", score: score, total: totalQuestions },
            { skill: "Communication", score: score, total: totalQuestions },
            { skill: "Code Quality", score: score, total: totalQuestions },
            { skill: "System Design", score: score, total: totalQuestions }
          ],
          strengths: percentageScore > 0 ? ["Session completed successfully"] : [],
          areasForImprovement: percentageScore === 0 ? ["No answers were provided", "Complete all questions to get meaningful feedback"] : ["AI feedback generation failed", "Please try again later"],
          summary: percentageScore === 0 ? "No answers were provided for this session. Please complete all questions to receive proper feedback." : `Session completed with ${percentageScore}% accuracy. AI feedback generation encountered an error.`
        };
      }

    await session.save();
    console.log(`Auto-submitted ${sessionType} session: ${sessionId}`);
  } catch (error) {
    console.error(`Error auto-submitting ${sessionType} session:`, error);
  }
};

// Check and auto-submit expired sessions
const checkAndAutoSubmitExpiredSessions = async () => {
  try {
    // Check regular sessions
    const expiredSessions = await Session.find({
      isFinalSubmitted: false,
      timerStartTime: { $exists: true }
    });

    for (const session of expiredSessions) {
      if (isTimerExpired(session.timerStartTime, session.timerDuration)) {
        await autoSubmitSession(session._id, 'session');
      }
    }

    // Check actual sessions
    const expiredActualSessions = await Actual.find({
      isFinalSubmitted: false,
      timerStartTime: { $exists: true }
    });

    for (const session of expiredActualSessions) {
      if (isTimerExpired(session.timerStartTime, session.timerDuration)) {
        await autoSubmitSession(session._id, 'actual');
      }
    }
  } catch (error) {
    console.error('Error checking expired sessions:', error);
  }
};

module.exports = {
  calculateRemainingTime,
  isTimerExpired,
  autoSubmitSession,
  checkAndAutoSubmitExpiredSessions
}; 