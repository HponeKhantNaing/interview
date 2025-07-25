const Actual = require("../models/Actual");
const Question = require("../models/Question");
const fs = require("fs");
const path = require("path");

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
    res.status(200).json({ success: true, session });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
}; 