// Suppress pdfjs-dist DOMMatrix/Path2D polyfill warnings
const originalWarn = console.warn;
console.warn = function (...args) {
  if (
    typeof args[0] === 'string' &&
    (args[0].includes('Cannot polyfill `DOMMatrix`') || args[0].includes('Cannot polyfill `Path2D`'))
  ) {
    return; // Suppress these warnings
  }
  originalWarn.apply(console, args);
};

// Also patch process.stderr.write to suppress these warnings
const originalStderrWrite = process.stderr.write;
process.stderr.write = function (chunk, encoding, callback) {
  if (
    typeof chunk === 'string' &&
    (chunk.includes('Cannot polyfill `DOMMatrix`') || chunk.includes('Cannot polyfill `Path2D`'))
  ) {
    return true; // Suppress these warnings
  }
  return originalStderrWrite.apply(process.stderr, arguments);
};

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");

const authRoutes = require('./routes/authRoutes')
const sessionRoutes = require('./routes/sessionRoutes')
const questionRoutes = require('./routes/questionRoutes');
const actualRoutes = require('./routes/actualRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const { protect } = require("./middlewares/authMiddleware");
const { generateInterviewQuestions, generateConceptExplanation, generateFeedbackAPI, checkAnswerWithAI } = require("./controllers/aiController");
const { checkAndAutoSubmitExpiredSessions } = require("./utils/timerUtils");

const app = express();

// Middleware to handle CORS
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

connectDB()

// Middleware
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/actual', actualRoutes);
app.use('/api/feedback', feedbackRoutes);

app.post("/api/ai/generate-questions", protect, generateInterviewQuestions);
app.post("/api/ai/generate-explanation", protect, generateConceptExplanation);
app.post("/api/ai/generate-feedback", protect, generateFeedbackAPI);
app.post("/api/ai/check-answer", protect, checkAnswerWithAI);

// Serve uploads folder
app.use("/uploads", express.static(path.join(__dirname, "uploads"), {}));

// Start Server
const PORT = process.env.PORT || 5001;
const server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Check for expired sessions every 30 seconds
setInterval(checkAndAutoSubmitExpiredSessions, 30000);
