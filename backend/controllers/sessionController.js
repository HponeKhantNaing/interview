const Session = require("../models/Session");
const Question = require("../models/Question");
const { generateFeedback } = require("./aiController");
const { calculateRemainingTime } = require("../utils/timerUtils");
const stringSimilarity = require('string-similarity');
const axios = require('axios');
const API_BASE = process.env.API_BASE_URL || `http://localhost:${process.env.PORT || 5000}`;

// @desc    Create a new session and linked questions
// @route   POST /api/sessions/create
// @access  Private
exports.createSession = async (req, res) => {
  try {
    const { role, experience, topicsToFocus, description, questions } =
      req.body;
    const userId = req.user._id; // Assuming you have a middleware setting req.user

    const session = await Session.create({
      user: userId,
      role,
      experience,
      topicsToFocus,
      description,
    });

    const questionDocs = await Promise.all(
      questions.map(async (q) => {
        const question = await Question.create({
          session: session._id,
          question: q.question,
          answer: q.answer,
          type: q.type, // Save the type field
        });
        return question._id;
      })
    );

    session.questions = questionDocs;
    await session.save();

    res.status(201).json({ success: true, session });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// @desc    Get all sessions for the logged-in user
// @route   GET /api/sessions/my-sessions
// @access  Private
exports.getMySessions = async (req, res) => {
  try {
    const sessions = await Session.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .populate("questions");
    res.status(200).json(sessions);
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// @desc    Get a session by ID with populated questions
// @route   GET /api/sessions/:id
// @access  Private
exports.getSessionById = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id).populate("questions");

    if (!session) {
      return res
        .status(404)
        .json({ success: false, message: "Session not found" });
    }

    // Calculate remaining time
    const remainingTime = calculateRemainingTime(session.timerStartTime, session.timerDuration);
    
    res.status(200).json({ 
      success: true, 
      session: {
        ...session.toObject(),
        remainingTime
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// @desc    Delete a session and its questions
// @route   DELETE /api/sessions/:id
// @access  Private
exports.deleteSession = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    // Check if the logged-in user owns this session
    if (session.user.toString() !== req.user.id) {
      return res
        .status(401)
        .json({ message: "Not authorized to delete this session" });
    }

    // First, delete all questions linked to this session
    await Question.deleteMany({ session: session._id });

    // Then, delete the session
    await session.deleteOne();

    res.status(200).json({ message: "Session deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// @desc    Submit all answers and lock the session
// @route   POST /api/sessions/:id/submit
// @access  Private
exports.finalSubmitSession = async (req, res) => {
  try {
    const { answers } = req.body;

    // Allow submission even with no answers - feedback will handle this case
    if (!answers || typeof answers !== 'object') {
      answers = {};
    }

    const session = await Session.findById(req.params.id).populate("questions");
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    // Check if already submitted
    if (session.isFinalSubmitted) {
      return res.status(400).json({ message: "Session already submitted" });
    }

    // Check ownership
    if (session.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to submit this session" });
    }

    // Validate and update answers
    const updates = [];
    for (const question of session.questions) {
      const userAnswer = answers[question._id];
      if (userAnswer) {
        updates.push(
          Question.findByIdAndUpdate(
            question._id,
            { userAnswer },
            { new: true }
          )
        );
      }
    }

    await Promise.all(updates);

    // Calculate submission time
    const submissionTime = Math.floor((new Date() - new Date(session.timerStartTime)) / 1000);
    
    // Lock session
    session.isFinalSubmitted = true;
    session.submissionTime = submissionTime;
    await session.save();

    // AI-based scoring system (handle empty answers)
    let score = 0;
    const token = req.headers.authorization;
    await Promise.all(session.questions.map(async (q) => {
      const userAnswer = answers[q._id] || "";
      if (!userAnswer || userAnswer.trim() === "") return; // Skip empty answers
      try {
        const aiRes = await axios.post(
          `${API_BASE}/api/ai/check-answer`,
          {
            question: q.question,
            userAnswer,
            correctAnswer: q.answer
          },
          {
            headers: { Authorization: token }
          }
        );
        if (aiRes.data && aiRes.data.isRelevant) score += 1;
      } catch (err) {
        // If AI fails, do not count as correct
      }
    }));

    // Prepare questions array for feedback (include all questions even with empty answers)
    const questionsForFeedback = session.questions.map(q => ({
      question: q.question,
      answer: q.answer,
      userAnswer: answers[q._id] || ""
    }));

    // Generate feedback using AI
    const feedbackPrompt = require('../utils/prompts').feedbackPrompt;
    const prompt = feedbackPrompt(session.role, session.experience, session.topicsToFocus, questionsForFeedback, submissionTime);
    
    // Debug log to see what data is being sent
    console.log('=== DEBUG: Questions for feedback ===');
    questionsForFeedback.forEach((q, index) => {
      console.log(`Question ${index + 1}:`, {
        question: q.question,
        userAnswer: q.userAnswer,
        hasAnswer: q.userAnswer && q.userAnswer.trim() !== '',
        answerLength: q.userAnswer ? q.userAnswer.length : 0
      });
    });
    console.log('=== END DEBUG ===');
    
    // Call AI directly
    const { GoogleGenAI } = require("@google/genai");
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-lite",
      contents: prompt,
    });
    
    let rawText = response.text;
    const cleanedText = rawText
      .replace(/^```json\s*/, "")
      .replace(/```$/, "")
      .trim();
    const feedbackResponse = JSON.parse(cleanedText);

    // Validate feedback - only force 0 scores if ALL answers are empty
    const hasAnyAnswers = questionsForFeedback.some(q => q.userAnswer && q.userAnswer.trim() !== "");
    const answeredCount = questionsForFeedback.filter(q => q.userAnswer && q.userAnswer.trim() !== "").length;
    
    if (!hasAnyAnswers && feedbackResponse && feedbackResponse.skillsBreakdown) {
      // No answers provided - force all scores to 0
      feedbackResponse.skillsBreakdown = feedbackResponse.skillsBreakdown.map(skill => ({
        ...skill,
        score: 0
      }));
      feedbackResponse.strengths = [];
      feedbackResponse.areasForImprovement = ["No answers were provided", "Complete all questions to get meaningful feedback"];
      feedbackResponse.summary = "No answers were provided for this session. Please complete all questions to receive proper feedback.";
    } else if (hasAnyAnswers && feedbackResponse) {
      // Some answers provided - ensure feedback is constructive
      // Only override if AI returns the exact fallback response
      const exactFallback = feedbackResponse.summary === "No answers were provided for this session. Please complete all questions to receive proper feedback.";
      if (exactFallback) {
        feedbackResponse.summary = `You answered ${answeredCount} out of ${questionsForFeedback.length} questions. Continue practicing to improve your skills.`;
        feedbackResponse.strengths = ["You made an effort to answer questions", "Partial completion shows initiative"];
        feedbackResponse.areasForImprovement = ["Complete more questions for comprehensive feedback", "Practice answering all questions to improve"];
        if (feedbackResponse.skillsBreakdown && feedbackResponse.skillsBreakdown.every(skill => skill.score === 0)) {
          feedbackResponse.skillsBreakdown[0].score = 1;
        }
      } else {
        // AI provided legitimate feedback - only fill in missing fields
        if (!feedbackResponse.strengths || feedbackResponse.strengths.length === 0) {
          feedbackResponse.strengths = ["You made an effort to answer questions", "Partial completion shows initiative"];
        }
        if (!feedbackResponse.areasForImprovement || feedbackResponse.areasForImprovement.length === 0) {
          feedbackResponse.areasForImprovement = ["Complete more questions for comprehensive feedback", "Practice answering all questions to improve"];
        }
        // Only set skill score to 1 if ALL are 0 AND AI didn't provide legitimate feedback
        if (feedbackResponse.skillsBreakdown && feedbackResponse.skillsBreakdown.every(skill => skill.score === 0) && exactFallback) {
          feedbackResponse.skillsBreakdown[0].score = 1;
        }
      }
    }

    // Save feedback to session
    session.feedback = feedbackResponse;
    await session.save();

    res.status(200).json({ message: "Submitted successfully", score, feedback: feedbackResponse });
  } catch (error) {
    console.error("Final submit error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Save user feedback for a session
// @route   POST /api/sessions/:id/user-feedback
// @access  Private
exports.saveUserFeedback = async (req, res) => {
  try {
    const { userFeedback } = req.body;
    const session = await Session.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }
    if (session.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to update feedback for this session" });
    }
    session.userFeedback = userFeedback;
    await session.save();
    res.status(200).json({ message: "User feedback saved successfully", userFeedback });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Upload a PDF file for a session and save its info
// @route   POST /api/sessions/upload-pdf
// @access  Private
exports.uploadSessionPDF = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No PDF file uploaded' });
    }
    // Save PDF info to session if sessionId is provided
    const { sessionId } = req.body;
    let session = null;
    if (sessionId) {
      session = await Session.findById(sessionId);
      if (!session) {
        return res.status(404).json({ message: 'Session not found' });
      }
      session.pdf = {
        fileName: req.file.filename,
        fileUrl: `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`,
        originalName: req.file.originalname
      };
      await session.save();
    }
    res.status(200).json({
      fileName: req.file.filename,
      fileUrl: `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`,
      originalName: req.file.originalname
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to upload PDF', error: error.message });
  }
};