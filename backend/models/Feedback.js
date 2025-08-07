const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  sessionId: { type: mongoose.Schema.Types.ObjectId, required: true }, // Reference to session/actual
  sessionType: { type: String, enum: ["session", "actual"], required: true }, // Distinguish between AI sessions and coding tests
  role: { type: String, required: true },
  experience: { type: String, required: true },
  topicsToFocus: { type: String, required: true },
  skillsBreakdown: [{
    skill: { type: String, required: true },
    score: { type: Number, required: true },
    total: { type: Number, required: true }
  }],
  strengths: [{ type: String }],
  areasForImprovement: [{ type: String }],
  summary: { type: String, required: true },
  percentageScore: { type: Number, required: true },
  totalQuestions: { type: Number, required: true },
  answeredQuestions: { type: Number, required: true },
  correctAnswers: { type: Number, required: true },
  submissionTime: { type: Number }, // Time taken to submit in seconds
  performanceMetrics: {
    answerRate: { type: Number },
    accuracyRate: { type: Number },
    averageAnswerLength: { type: Number },
    codeQuestionsAnswered: { type: Number },
    technicalQuestionsAnswered: { type: Number },
    questionsWithCode: { type: Number },
    timeEfficiency: { type: Number }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update the updatedAt field on save
feedbackSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model("Feedback", feedbackSchema); 