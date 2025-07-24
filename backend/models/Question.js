const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  session: { type: mongoose.Schema.Types.ObjectId, ref: "Session" },
  question: String,
  answer: String,
  note: String,
  isPinned: { type: Boolean, default: false },
  userAnswer: { type: String, default: "" }, // ✅ Added for user response
  type: { type: String, enum: ["technical", "coding"], required: true }, // New field for question type
  // In models/Session.js
}, { timestamps: true });

module.exports = mongoose.model("Question", questionSchema);