const Actual = require("../models/Actual");
const Question = require("../models/Question");
const fs = require("fs");
const path = require("path");
const { generateFeedback } = require("./aiController");
const { calculateRemainingTime } = require("../utils/timerUtils");

function pickDataset(role) {
  const r = role.toLowerCase();
  if (r.includes("fullstack")) return "dataset_fullstack.json";
  if (r.includes("front")) return "dataset_frontend.json";
  if (r.includes("back")) return "dataset_backend.json";
  return "dataset_fullstack.json";
}

function filterAndSampleQuestions(dataset, topics, count = 5) {
  // Filter questions by topics, then randomly sample up to count
  const topicSet = new Set(topics.map(t => t.trim().toLowerCase()));
  const filtered = dataset.filter(q =>
    q.topics.some(topic => topicSet.has(topic.toLowerCase()))
  );
  // If not enough, fallback to random
  const pool = filtered.length >= count ? filtered : dataset;
  const shuffled = pool.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

// @desc    Create a new Actual interview test session
// @route   POST /api/actual/create
// @access  Private
exports.createActualSession = async (req, res) => {
  try {
    const { role, experience, topicsToFocus, description } = req.body;
    const userId = req.user._id;
    // Pick dataset file
    const datasetFile = pickDataset(role);
    const datasetPath = path.join(__dirname, "../utils", datasetFile);
    const dataset = JSON.parse(fs.readFileSync(datasetPath, "utf-8"));
    // Pick questions
    const topics = topicsToFocus.split(",").map(t => t.trim()).filter(Boolean);
    const selectedQuestions = filterAndSampleQuestions(dataset, topics, 5);
    // Store questions in DB
    const questionDocs = await Promise.all(
      selectedQuestions.map(async (q) => {
        const question = await Question.create({
          question: q.question,
          answer: q.answer,
          type: q.type || "technical", // Fix: provide required type
        });
        return question._id;
      })
    );
    const actual = await Actual.create({
      user: userId,
      role,
      experience,
      topicsToFocus,
      description,
      questions: questionDocs,
    });
    res.status(201).json({ success: true, actual });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// @desc    Get all Actual interview test sessions for the user
// @route   GET /api/actual/my-sessions
// @access  Private
exports.getMyActualSessions = async (req, res) => {
  try {
    const actuals = await Actual.find({ user: req.user.id }).sort({ createdAt: -1 }).populate("questions");
    res.status(200).json(actuals);
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// @desc    Get an Actual interview test session by ID
// @route   GET /api/actual/:id
// @access  Private
exports.getActualSessionById = async (req, res) => {
  try {
    const session = await Actual.findById(req.params.id).populate("questions");
    if (!session) {
      return res.status(404).json({ success: false, message: "Session not found" });
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

// Save user answer for a question in an Actual session
exports.saveActualAnswer = async (req, res) => {
  try {
    const { questionId } = req.params;
    const { answer } = req.body;
    const question = await Question.findById(questionId);
    if (!question) return res.status(404).json({ message: "Question not found" });
    question.userAnswer = answer;
    await question.save();
    res.status(200).json({ success: true, question });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Final submit for an Actual session
exports.finalSubmitActualSession = async (req, res) => {
  try {
    const { id } = req.params;
    const { answers } = req.body;
    const session = await Actual.findById(id).populate("questions");
    if (!session) return res.status(404).json({ message: "Session not found" });
    if (session.isFinalSubmitted) return res.status(400).json({ message: "Session already submitted" });
    // Save answers
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
    
    session.isFinalSubmitted = true;
    session.submissionTime = submissionTime;
    await session.save();
    // Generate feedback (reuse AI feedback logic, but pass questions)
    let feedback = null;
    try {
      const questionsForFeedback = session.questions.map(q => ({
        question: q.question,
        answer: q.answer,
        userAnswer: answers[q._id] || ""
      }));
      // Generate feedback using AI
      const feedbackPrompt = require('../utils/prompts').feedbackPrompt;
      const prompt = feedbackPrompt(session.role, session.experience, session.topicsToFocus, questionsForFeedback, submissionTime);
      
      // Debug log to see what data is being sent
      console.log('=== DEBUG: Questions for feedback (Actual) ===');
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
      feedback = feedbackResponse;
    } catch (err) {
      feedback = { error: "Failed to generate feedback" };
    }
    session.feedback = feedback;
    await session.save();
    res.status(200).json({ message: "Submitted successfully", feedback });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Save user feedback for an Actual session
exports.saveActualUserFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const { userFeedback } = req.body;
    const session = await Actual.findById(id);
    if (!session) return res.status(404).json({ message: "Session not found" });
    session.userFeedback = userFeedback;
    await session.save();
    res.status(200).json({ message: "User feedback saved successfully", userFeedback });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Delete an Actual session and its questions
// @route   DELETE /api/actual/:id
// @access  Private
exports.deleteActualSession = async (req, res) => {
  try {
    const session = await Actual.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }
    // Check if the logged-in user owns this session
    if (session.user.toString() !== req.user.id) {
      return res.status(401).json({ message: "Not authorized to delete this session" });
    }
    // Delete all questions linked to this session
    await Question.deleteMany({ _id: { $in: session.questions } });
    // Delete the session
    await session.deleteOne();
    res.status(200).json({ message: "Session deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
}; 