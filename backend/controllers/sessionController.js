const Session = require("../models/Session");
const Question = require("../models/Question");
const { generateFeedback } = require("./aiController");
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

    res.status(200).json({ success: true, session });
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

    if (!answers || typeof answers !== 'object' || Object.keys(answers).length === 0) {
      return res.status(400).json({ message: "No answers provided" });
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

    // Lock session
    session.isFinalSubmitted = true;
    await session.save();

    // AI-based scoring system
    let score = 0;
    const token = req.headers.authorization;
    await Promise.all(session.questions.map(async (q) => {
      const userAnswer = answers[q._id] || "";
      if (!userAnswer) return;
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

    // Prepare questions array for feedback
    const questionsForFeedback = session.questions.map(q => ({
      question: q.question,
      answer: q.answer,
      userAnswer: answers[q._id] || ""
    }));

    // Generate feedback using AI
    let feedback = null;
    try {
      // Use the same req/res pattern as other controllers
      const feedbackRes = await new Promise((resolve, reject) => {
        generateFeedback({
          body: {
            role: session.role,
            experience: session.experience,
            topicsToFocus: session.topicsToFocus,
            questions: questionsForFeedback
          }
        }, {
          status: (code) => ({
            json: (data) => code === 200 ? resolve(data) : reject(data)
          })
        });
      });
      feedback = feedbackRes;
    } catch (err) {
      feedback = { error: "Failed to generate feedback" };
    }

    // Save feedback to session
    session.feedback = feedback;
    await session.save();

    res.status(200).json({ message: "Submitted successfully", score, feedback });
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