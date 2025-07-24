const { GoogleGenAI } = require("@google/genai");
const {
  conceptExplainPrompt,
  questionAnswerPrompt,
  feedbackPrompt,
  checkAnswerPrompt,
} = require("../utils/prompts");
const pdfParse = require("pdf-parse");
const { extractSkillsFromText, extractRoleFromText, extractDescriptionFromText, extractProjectsFromText } = require("../utils/prompts");
const pdfjsLib = require('pdfjs-dist/legacy/build/pdf.js');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// @desc    Generate interview questions and answers using Gemini
// @route   POST /api/ai/generate-questions
// @access  Private
const generateInterviewQuestions = async (req, res) => {
  try {
    let { role, experience, topicsToFocus, numberOfQuestions, pdf, description, projects } = req.body;
    const numQuestions = numberOfQuestions || 5;
    if (!role || !experience || !topicsToFocus || !numQuestions) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Extract data from PDF if provided
    let pdfSkills = [], pdfRole = null, pdfDescription = null, pdfProjects = [];
    let pdfText = "";
    if (pdf && pdf.fileName) {
      const fs = require("fs");
      const path = require("path");
      const pdfPath = path.join(__dirname, "../uploads", pdf.fileName);
      if (fs.existsSync(pdfPath)) {
        const dataBuffer = fs.readFileSync(pdfPath);
        try {
          // Use pdfjs-dist for robust extraction
          const loadingTask = pdfjsLib.getDocument({ data: dataBuffer });
          const pdfDoc = await loadingTask.promise;
          let textContent = [];
          for (let i = 1; i <= pdfDoc.numPages; i++) {
            const page = await pdfDoc.getPage(i);
            const content = await page.getTextContent();
            textContent.push(content.items.map(item => item.str).join(" "));
          }
          pdfText = textContent.join("\n");
        } catch (err) {
          // fallback to pdf-parse if pdfjs-dist fails
          try {
            const pdfData = await pdfParse(dataBuffer);
            pdfText = pdfData.text;
          } catch (err2) {
            pdfText = "";
          }
        }
        // Now extract info from pdfText
        pdfSkills = extractSkillsFromText(pdfText);
        pdfRole = extractRoleFromText(pdfText);
        pdfDescription = extractDescriptionFromText(pdfText);
        pdfProjects = extractProjectsFromText(pdfText);
      }
    }

    // Combine manual topics and PDF skills
    let allTopics = topicsToFocus.split(",").map(t => t.trim()).filter(Boolean);
    for (const skill of pdfSkills) {
      if (!allTopics.includes(skill)) allTopics.push(skill);
    }
    const combinedTopics = allTopics.join(", ");

    // Prefer form role/description, but fallback to PDF if missing
    const finalRole = role || pdfRole || "";
    const finalDescription = description || pdfDescription || "";
    const finalProjects = (projects && projects.length) ? projects : pdfProjects;

    // Compose prompt for balanced questions
    const prompt = questionAnswerPrompt(
      finalRole,
      experience,
      combinedTopics,
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
