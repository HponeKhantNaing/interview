const Session = require("../models/Session");
const Actual = require("../models/Actual");
const { generateFeedback } = require("../controllers/aiController");

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

    // Generate feedback
    try {
      const questionsForFeedback = session.questions.map(q => ({
        question: q.question,
        answer: q.answer,
        userAnswer: answers[q._id] || ""
      }));

      const feedbackRes = await new Promise((resolve, reject) => {
        generateFeedback({
          body: {
            role: session.role,
            experience: session.experience,
            topicsToFocus: session.topicsToFocus,
            questions: questionsForFeedback,
            submissionTime: submissionTime
          }
        }, {
          status: (code) => ({
            json: (data) => code === 200 ? resolve(data) : reject(data)
          })
        });
      });
      
      // Validate feedback - if no answers provided, force all scores to 0
      let feedback = feedbackRes;
      const hasAnyAnswers = questionsForFeedback.some(q => q.userAnswer && q.userAnswer.trim() !== "");
      if (!hasAnyAnswers && feedback && feedback.skillsBreakdown) {
        feedback.skillsBreakdown = feedback.skillsBreakdown.map(skill => ({
          ...skill,
          score: 0
        }));
        feedback.strengths = [];
        feedback.areasForImprovement = ["No answers were provided", "Complete all questions to get meaningful feedback"];
        feedback.summary = "No answers were provided for this session. Please complete all questions to receive proper feedback.";
      }
      
      session.feedback = feedback;
    } catch (err) {
      session.feedback = { error: "Failed to generate feedback" };
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