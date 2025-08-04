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
        
        // Calculate scoring based on correct answers for auto-submission
        let correctAnswers = 0;
        let totalQuestions = session.questions.length;
        let answeredQuestions = 0;
        
        await Promise.all(session.questions.map(async (q) => {
          // Get the user answer from the database (updated question) or from request body
          const userAnswer = q.userAnswer || answers[q._id] || "";
          if (!userAnswer || userAnswer.trim() === "") return; // Skip empty answers
          
          answeredQuestions++;
          console.log(`Checking timer answer for question ${q._id}:`, {
            question: q.question.substring(0, 50) + '...',
            userAnswer: userAnswer.substring(0, 50) + '...',
            correctAnswer: q.answer.substring(0, 50) + '...'
          });
          
          try {
            const aiRes = await axios.post(
              `${API_BASE}/api/ai/check-answer`,
              {
                question: q.question,
                userAnswer,
                correctAnswer: q.answer
              },
              {
                headers: { Authorization: `Bearer ${process.env.JWT_SECRET}` }
              }
            );
            
            console.log(`AI response for timer question ${q._id}:`, aiRes.data);
            
            if (aiRes.data && aiRes.data.isCorrect) {
              correctAnswers++;
              console.log(`✅ Timer question ${q._id} marked as correct`);
            } else {
              console.log(`❌ Timer question ${q._id} marked as incorrect`);
            }
          } catch (err) {
            console.error(`AI check failed for timer question ${q._id}:`, err.message);
            // If AI fails, use a more flexible assessment as fallback
            const userAnswerLower = userAnswer.toLowerCase().trim();
            
            // Extract key technical terms and concepts that indicate understanding
            const technicalTerms = ['javascript', 'java', 'python', 'react', 'node', 'express', 'mongodb', 'sql', 'api', 'http', 'json', 'html', 'css', 'git', 'docker', 'kubernetes', 'aws', 'azure', 'database', 'server', 'client', 'frontend', 'backend', 'fullstack', 'microservices', 'rest', 'graphql', 'authentication', 'authorization', 'encryption', 'security', 'testing', 'deployment', 'ci/cd', 'agile', 'scrum', 'oop', 'functional', 'async', 'promise', 'callback', 'closure', 'hoisting', 'prototype', 'inheritance', 'polymorphism', 'encapsulation', 'abstraction', 'interface', 'abstract', 'static', 'final', 'volatile', 'synchronized', 'thread', 'process', 'memory', 'garbage', 'collection', 'algorithm', 'data structure', 'array', 'linked list', 'stack', 'queue', 'tree', 'graph', 'hash', 'map', 'set', 'sort', 'search', 'binary', 'linear', 'recursion', 'iteration', 'complexity', 'big o', 'time', 'space'];
            
            const userWords = userAnswerLower.split(/\s+/);
            
            // Check for technical term presence (indicates understanding)
            const userTechnicalTerms = userWords.filter(word => 
              technicalTerms.includes(word.toLowerCase())
            );
            
            // Check for meaningful answer length and content
            const meaningfulWords = userWords.filter(word => word.length > 3);
            const hasSubstantialContent = meaningfulWords.length >= 3;
            const hasTechnicalKnowledge = userTechnicalTerms.length >= 1;
            
            // More lenient assessment - if user shows technical knowledge or substantial content
            if (hasTechnicalKnowledge || hasSubstantialContent) {
              correctAnswers++;
              console.log(`✅ Timer question ${q._id} marked as correct (fallback: technical terms: ${userTechnicalTerms.length}, content words: ${meaningfulWords.length})`);
            } else {
              console.log(`❌ Timer question ${q._id} marked as incorrect (fallback: insufficient content or technical terms)`);
            }
          }
        }));
        
        // Calculate percentage score
        const percentageScore = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
        
        // Calculate skill scores based on performance
        const calculateSkillScores = (percentageScore, answeredCount, totalQuestions) => {
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
          
          return [
            { skill: "Technical Knowledge", score: score, total: totalQuestions },
            { skill: "Problem Solving", score: score, total: totalQuestions },
            { skill: "Communication", score: score, total: totalQuestions },
            { skill: "Code Quality", score: score, total: totalQuestions },
            { skill: "System Design", score: score, total: totalQuestions }
          ];
        };
        
        // Generate strengths and areas for improvement based on performance
        const generateStrengths = (percentageScore, answeredCount, totalQuestions) => {
          if (percentageScore === 0) return [];
          if (percentageScore >= 80) return ["Excellent understanding of concepts", "Strong problem-solving skills", "Good communication of ideas"];
          if (percentageScore >= 60) return ["Good grasp of fundamentals", "Shows potential for growth", "Demonstrates learning ability"];
          if (percentageScore >= 40) return ["Made effort to answer questions", "Shows initiative", "Has basic understanding"];
          return ["Attempted to answer questions", "Shows willingness to learn"];
        };
        
        const generateAreasForImprovement = (percentageScore, answeredCount, totalQuestions) => {
          if (percentageScore === 0) return ["No answers were provided", "Complete all questions to get meaningful feedback"];
          if (percentageScore >= 80) return ["Continue practicing advanced concepts", "Focus on edge cases", "Work on time management"];
          if (percentageScore >= 60) return ["Review fundamental concepts", "Practice more coding problems", "Improve explanation clarity"];
          if (percentageScore >= 40) return ["Study core concepts more thoroughly", "Practice more questions", "Focus on accuracy"];
          return ["Study the basics more thoroughly", "Practice answering all questions", "Focus on understanding concepts"];
        };
        
        const generateSummary = (percentageScore, answeredCount, totalQuestions, correctAnswers) => {
          if (answeredCount === 0) {
            return "No answers were provided for this session. Please complete all questions to receive proper feedback.";
          }
          
          const scoreDescription = percentageScore >= 90 ? "excellent" : 
                                 percentageScore >= 80 ? "very good" : 
                                 percentageScore >= 70 ? "good" : 
                                 percentageScore >= 60 ? "fair" : 
                                 percentageScore >= 40 ? "needs improvement" : "poor";
          
          return `You answered ${answeredCount} out of ${totalQuestions} questions with ${correctAnswers} correct answers (${percentageScore}% accuracy). Your performance is ${scoreDescription}. ${answeredCount < totalQuestions ? "Consider answering all questions for a complete assessment." : ""}`;
        };
        
        // Update feedback with calculated scores
        let feedback = feedbackRes;
        if (feedback) {
          feedback.skillsBreakdown = calculateSkillScores(percentageScore, answeredQuestions, totalQuestions);
          feedback.strengths = generateStrengths(percentageScore, answeredQuestions, totalQuestions);
          feedback.areasForImprovement = generateAreasForImprovement(percentageScore, answeredQuestions, totalQuestions);
          feedback.summary = generateSummary(percentageScore, answeredQuestions, totalQuestions, correctAnswers);
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