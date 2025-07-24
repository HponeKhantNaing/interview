const { GoogleGenAI } = require("@google/genai");
const {
  conceptExplainPrompt,
  questionAnswerPrompt,
  feedbackPrompt,
  checkAnswerPrompt,
} = require("../utils/prompts");

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// @desc    Generate interview questions and answers using Gemini
// @route   POST /api/ai/generate-questions
// @access  Private
const generateInterviewQuestions = async (req, res) => {
  try {
    const { role, experience, topicsToFocus, numberOfQuestions } = req.body;
    // Default to 5 for testing, but allow override from frontend
    const numQuestions = numberOfQuestions || 5;
    if (!role || !experience || !topicsToFocus || !numQuestions) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Compose prompt for balanced questions
    const prompt = questionAnswerPrompt(
      role,
      experience,
      topicsToFocus,
      numQuestions
    );

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-lite",
      contents: prompt,
    });

    let rawText = response.text;
    const cleanedText = rawText
      .replace(/^```json\s*/, "")
      .replace(/```$/, "")
      .trim();
    let data = JSON.parse(cleanedText);

    // Fallback: If type is missing, classify in code (simple heuristic)
    data = data.map(q => {
      if (!q.type) {
        // If answer contains code block, treat as coding, else technical
        if (/```/.test(q.answer)) {
          q.type = "coding";
        } else {
          q.type = "technical";
        }
      }
      return q;
    });

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({
      message: "Failed to generate questions",
      error: error.message,
    });
  }
};

// @desc    Generate explains a interview question
// @route   POST /api/ai/generate-explanation
// @access  Private
const generateConceptExplanation = async (req, res) => {
  try {
    const { question } = req.body;

    if (!question) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const prompt = conceptExplainPrompt(question);

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-lite",
      contents: prompt,
    });

    let rawText = response.text;

    // Clean it: Remove ```json and ``` from beginning and end
    const cleanedText = rawText
      .replace(/^```json\s*/, "") // remove starting ```json
      .replace(/```$/, "") // remove ending ```
      .trim(); // remove extra spaces

    // Now safe to parse
    const data = JSON.parse(cleanedText);

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({
      message: "Failed to generate questions",
      error: error.message,
    });
  }
};

// @desc    Generate feedback for a session's answers
// @route   POST /api/ai/generate-feedback
// @access  Private
const generateFeedback = async (req, res) => {
  try {
    const { role, experience, topicsToFocus, questions } = req.body;
    if (!role || !experience || !topicsToFocus || !questions || !Array.isArray(questions)) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const prompt = feedbackPrompt(role, experience, topicsToFocus, questions);
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-lite",
      contents: prompt,
    });

    let rawText = response.text;
    const cleanedText = rawText
      .replace(/^```json\s*/, "")
      .replace(/```$/, "")
      .trim();
    const data = JSON.parse(cleanedText);
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({
      message: "Failed to generate feedback",
      error: error.message,
    });
  }
};

// @desc    Check if user's answer is relevant to the question using GenAI
// @route   POST /api/ai/check-answer
// @access  Private
const checkAnswerWithAI = async (req, res) => {
  try {
    const { question, userAnswer, correctAnswer } = req.body;
    if (!question || !userAnswer || !correctAnswer) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    const prompt = checkAnswerPrompt(question, userAnswer, correctAnswer);
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-lite",
      contents: prompt,
    });
    let rawText = response.text;
    const cleanedText = rawText
      .replace(/^```json\s*/, "")
      .replace(/```$/, "")
      .trim();
    const data = JSON.parse(cleanedText);
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({
      message: "Failed to check answer",
      error: error.message,
    });
  }
};

module.exports = { generateInterviewQuestions, generateConceptExplanation, generateFeedback, checkAnswerWithAI };
