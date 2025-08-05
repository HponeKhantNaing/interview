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
const generateFeedback = async (feedbackData) => {
  try {
    const { role, experience, topicsToFocus, performanceAnalysis, questions } = feedbackData;
    
    if (!role || !experience || !topicsToFocus || !performanceAnalysis || !questions || !Array.isArray(questions)) {
      throw new Error("Missing required fields for feedback generation");
    }

    // Create a comprehensive prompt for personalized feedback
    const prompt = `
You are an expert AI interview coach analyzing a candidate's performance. Generate personalized, detailed feedback based on the following comprehensive data:

CANDIDATE PROFILE:
- Role: ${role}
- Experience: ${experience} years
- Focus Topics: ${topicsToFocus}

PERFORMANCE METRICS:
- Total Questions: ${performanceAnalysis.totalQuestions}
- Questions Answered: ${performanceAnalysis.answeredQuestions}
- Correct Answers: ${performanceAnalysis.correctAnswers}
- Accuracy Rate: ${performanceAnalysis.percentageScore}%
- Answer Rate: ${performanceAnalysis.performanceMetrics.answerRate.toFixed(1)}%
- Average Answer Length: ${performanceAnalysis.performanceMetrics.averageAnswerLength.toFixed(0)} characters
- Coding Questions Answered: ${performanceAnalysis.performanceMetrics.codeQuestionsAnswered}/${performanceAnalysis.totalQuestions}
- Technical Questions Answered: ${performanceAnalysis.performanceMetrics.technicalQuestionsAnswered}/${performanceAnalysis.totalQuestions}
- Questions with Code Examples: ${performanceAnalysis.performanceMetrics.questionsWithCode}
- Time Efficiency: ${performanceAnalysis.performanceMetrics.timeEfficiency.toFixed(1)} questions per minute
${performanceAnalysis.submissionTime ? `- Total Time: ${Math.floor(performanceAnalysis.submissionTime / 60)} minutes ${performanceAnalysis.submissionTime % 60} seconds` : ''}

IDENTIFIED STRENGTHS:
${performanceAnalysis.strengths.length > 0 ? performanceAnalysis.strengths.map(s => `- ${s}`).join('\n') : '- None identified'}

IDENTIFIED WEAKNESSES:
${performanceAnalysis.weaknesses.length > 0 ? performanceAnalysis.weaknesses.map(w => `- ${w}`).join('\n') : '- None identified'}

DETAILED QUESTION ANALYSIS:
${questions.map((q, index) => `
Question ${index + 1} (${q.type}):
- Question: ${q.question.substring(0, 150)}${q.question.length > 150 ? '...' : ''}
- User Answer: ${q.userAnswer ? q.userAnswer.substring(0, 200) + (q.userAnswer.length > 200 ? '...' : '') : 'No answer provided'}
- Answer Length: ${q.answerLength} characters
- Has Code: ${q.hasCode ? 'Yes' : 'No'}
- Time Spent: ${q.timeSpent || 0} seconds
`).join('')}

TASK: Generate personalized feedback that:
1. Acknowledges the candidate's unique performance patterns
2. Provides specific, actionable feedback based on their actual responses
3. Considers their role and experience level
4. Offers concrete improvement suggestions
5. Maintains an encouraging tone while being honest about areas for growth
6. References specific examples from their answers when possible
7. Provides a comprehensive summary that reflects their actual performance

Return the result as a valid JSON object in this exact format:
{
  "skillsBreakdown": [
    { "skill": "Technical Knowledge", "score": 0, "total": ${performanceAnalysis.totalQuestions} },
    { "skill": "Problem Solving", "score": 0, "total": ${performanceAnalysis.totalQuestions} },
    { "skill": "Communication", "score": 0, "total": ${performanceAnalysis.totalQuestions} },
    { "skill": "Code Quality", "score": 0, "total": ${performanceAnalysis.totalQuestions} },
    { "skill": "System Design", "score": 0, "total": ${performanceAnalysis.totalQuestions} }
  ],
  "strengths": [],
  "areasForImprovement": [],
  "summary": ""
}

SCORING GUIDELINES:
- Score 0-5 for each skill based on actual performance
- Consider answer quality, completeness, and relevance
- Factor in the candidate's experience level
- Be realistic but encouraging
- If no answers provided, score 0 for all skills

IMPORTANT: Make the feedback highly personalized and specific to this candidate's performance. Avoid generic responses. Reference specific details from their answers and performance metrics.
`;

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
    return data;
  } catch (error) {
    console.error("Failed to generate personalized feedback:", error);
    throw new Error("Failed to generate personalized feedback");
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
    
    console.log('AI Check Request:', {
      question: question.substring(0, 100) + '...',
      userAnswer: userAnswer.substring(0, 100) + '...',
      correctAnswer: correctAnswer.substring(0, 100) + '...'
    });
    
    const prompt = checkAnswerPrompt(question, userAnswer, correctAnswer);
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-lite",
      contents: prompt,
    });
    
    let rawText = response.text;
    console.log('AI Raw Response:', rawText);
    
    const cleanedText = rawText
      .replace(/^```json\s*/, "")
      .replace(/```$/, "")
      .trim();
    
    let data;
    try {
      data = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      console.error('Raw text:', rawText);
      console.error('Cleaned text:', cleanedText);
      
      // Fallback: create a simple response based on text similarity
      const userAnswerLower = userAnswer.toLowerCase().trim();
      const correctAnswerLower = correctAnswer.toLowerCase().trim();
      
      // Simple similarity check
      const userWords = userAnswerLower.split(/\s+/);
      const correctWords = correctAnswerLower.split(/\s+/);
      const commonWords = userWords.filter(word => 
        word.length > 3 && correctWords.includes(word)
      );
      
      const similarity = commonWords.length / Math.max(userWords.length, correctWords.length);
      const isRelevant = similarity > 0.3;
      
      data = {
        isCorrect: isRelevant,
        feedback: isRelevant ? "Answer shows understanding of key concepts" : "Answer needs improvement",
        correctAnswer: correctAnswer
      };
    }
    
    console.log('AI Final Response:', data);
    res.status(200).json(data);
  } catch (error) {
    console.error('AI Check Error:', error);
    res.status(500).json({
      message: "Failed to check answer",
      error: error.message,
    });
  }
};

// Wrapper function for API endpoint compatibility
const generateFeedbackAPI = async (req, res) => {
  try {
    const { role, experience, topicsToFocus, questions, submissionTime } = req.body;
    if (!role || !experience || !topicsToFocus || !questions || !Array.isArray(questions)) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Create basic performance analysis for API calls
    const performanceAnalysis = {
      totalQuestions: questions.length,
      answeredQuestions: questions.filter(q => q.userAnswer && q.userAnswer.trim().length > 0).length,
      correctAnswers: 0, // Will be calculated by the calling function
      percentageScore: 0, // Will be calculated by the calling function
      submissionTime: submissionTime,
      role: role,
      experience: experience,
      topicsToFocus: topicsToFocus,
      questions: questions.map(q => ({
        question: q.question,
        userAnswer: q.userAnswer,
        correctAnswer: q.answer,
        type: q.type,
        isAnswered: q.userAnswer && q.userAnswer.trim().length > 0,
        answerLength: q.userAnswer ? q.userAnswer.length : 0,
        hasCode: q.userAnswer && q.userAnswer.includes('```'),
        timeSpent: q.timeSpent || 0
      })),
      performanceMetrics: {
        answerRate: 0,
        accuracyRate: 0,
        averageAnswerLength: 0,
        codeQuestionsAnswered: 0,
        technicalQuestionsAnswered: 0,
        questionsWithCode: 0,
        timeEfficiency: 0
      },
      strengths: [],
      weaknesses: [],
      improvementAreas: []
    };

    const feedbackData = {
      role,
      experience,
      topicsToFocus,
      performanceAnalysis,
      questions
    };

    const data = await generateFeedback(feedbackData);
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({
      message: "Failed to generate feedback",
      error: error.message,
    });
  }
};

module.exports = { 
  generateInterviewQuestions, 
  generateConceptExplanation, 
  generateFeedback, 
  generateFeedbackAPI,
  checkAnswerWithAI 
};
