const express = require("express");
const router = express.Router();
const {
  storeFeedback,
  getFeedbackBySession,
  getUserFeedback,
  deleteFeedback
} = require("../controllers/feedbackController");
const { protect } = require("../middlewares/authMiddleware");

// All routes are protected
router.use(protect);

// Store feedback
router.post("/store", storeFeedback);

// Get feedback by session
router.get("/:sessionId/:sessionType", getFeedbackBySession);

// Get all feedback for user
router.get("/user", getUserFeedback);

// Delete feedback
router.delete("/:id", deleteFeedback);

module.exports = router; 