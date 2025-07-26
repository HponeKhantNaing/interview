const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  role: { type: String, required: true },
  experience: { type: String, required: true },
  topicsToFocus: { type: String, required: true },
  description: String,
  questions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Question" }],
  isFinalSubmitted: { type: Boolean, default: false },
  feedback: { type: Object, default: null },
  userFeedback: { type: String, default: "" },
  timerStartTime: { type: Date, default: Date.now },
  timerDuration: { type: Number, default: 3600 }, // 1 hour in seconds
  submissionTime: { type: Number, default: null }, // Time taken to submit in seconds
  pdf: {
    fileName: String,
    fileUrl: String,
    originalName: String
  }
}, { timestamps: true });

module.exports = mongoose.model("Session", sessionSchema);
