const Feedback = require("../models/Feedback");
const Session = require("../models/Session");
const Actual = require("../models/Actual");

// @desc    Store feedback in the feedback table
// @route   POST /api/feedback/store
// @access  Private
exports.storeFeedback = async (req, res) => {
  try {
    const {
      sessionId,
      sessionType,
      role,
      experience,
      topicsToFocus,
      skillsBreakdown,
      strengths,
      areasForImprovement,
      summary,
      percentageScore,
      totalQuestions,
      answeredQuestions,
      correctAnswers,
      submissionTime,
      performanceMetrics
    } = req.body;

    const userId = req.user._id;

    // Validate required fields
    if (!sessionId || !sessionType || !role || !experience || !topicsToFocus || !summary) {
      return res.status(400).json({ 
        success: false, 
        message: "Missing required fields" 
      });
    }

    // Check if feedback already exists for this session
    const existingFeedback = await Feedback.findOne({ 
      sessionId, 
      sessionType, 
      user: userId 
    });

    if (existingFeedback) {
      // Update existing feedback
      existingFeedback.role = role;
      existingFeedback.experience = experience;
      existingFeedback.topicsToFocus = topicsToFocus;
      existingFeedback.skillsBreakdown = skillsBreakdown;
      existingFeedback.strengths = strengths;
      existingFeedback.areasForImprovement = areasForImprovement;
      existingFeedback.summary = summary;
      existingFeedback.percentageScore = percentageScore;
      existingFeedback.totalQuestions = totalQuestions;
      existingFeedback.answeredQuestions = answeredQuestions;
      existingFeedback.correctAnswers = correctAnswers;
      existingFeedback.submissionTime = submissionTime;
      existingFeedback.performanceMetrics = performanceMetrics;

      await existingFeedback.save();

      return res.status(200).json({
        success: true,
        message: "Feedback updated successfully",
        feedback: existingFeedback
      });
    }

    // Create new feedback
    const feedback = new Feedback({
      user: userId,
      sessionId,
      sessionType,
      role,
      experience,
      topicsToFocus,
      skillsBreakdown,
      strengths,
      areasForImprovement,
      summary,
      percentageScore,
      totalQuestions,
      answeredQuestions,
      correctAnswers,
      submissionTime,
      performanceMetrics
    });

    await feedback.save();

    res.status(201).json({
      success: true,
      message: "Feedback stored successfully",
      feedback
    });

  } catch (error) {
    console.error("Error storing feedback:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error", 
      error: error.message 
    });
  }
};

// @desc    Get feedback by session ID and type
// @route   GET /api/feedback/:sessionId/:sessionType
// @access  Private
exports.getFeedbackBySession = async (req, res) => {
  try {
    const { sessionId, sessionType } = req.params;
    const userId = req.user._id;

    const feedback = await Feedback.findOne({
      sessionId,
      sessionType,
      user: userId
    });

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: "Feedback not found"
      });
    }

    res.status(200).json({
      success: true,
      feedback
    });

  } catch (error) {
    console.error("Error getting feedback:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};

// @desc    Get all feedback for a user
// @route   GET /api/feedback/user
// @access  Private
exports.getUserFeedback = async (req, res) => {
  try {
    const userId = req.user._id;
    const { sessionType } = req.query; // Optional filter by session type

    let query = { user: userId };
    if (sessionType) {
      query.sessionType = sessionType;
    }

    const feedback = await Feedback.find(query)
      .sort({ createdAt: -1 })
      .populate('user', 'name email');

    res.status(200).json({
      success: true,
      count: feedback.length,
      feedback
    });

  } catch (error) {
    console.error("Error getting user feedback:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};

// @desc    Delete feedback
// @route   DELETE /api/feedback/:id
// @access  Private
exports.deleteFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const feedback = await Feedback.findOne({ _id: id, user: userId });

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: "Feedback not found"
      });
    }

    await feedback.deleteOne();

    res.status(200).json({
      success: true,
      message: "Feedback deleted successfully"
    });

  } catch (error) {
    console.error("Error deleting feedback:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
}; 