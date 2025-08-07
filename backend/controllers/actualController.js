const Actual = require("../models/Actual");
const Question = require("../models/Question");
const Feedback = require("../models/Feedback");
const fs = require("fs");
const path = require("path");
const { generateFeedback } = require("./aiController");
const { calculateRemainingTime } = require("../utils/timerUtils");
const { extractAvailableTopics } = require("../utils/extractTopics");

function pickDataset(role, topicsToFocus) {
  // Only use coding dataset for all coding tests
  return "dataset_coding.json";
}

function filterAndSampleQuestions(dataset, topics, count = 5) {
  console.log('Filtering questions with topics:', topics);
  
  // If only one topic, use simple filtering
  if (topics.length === 1) {
    const filteredQuestions = dataset.filter(question => {
      if (question.topics && Array.isArray(question.topics)) {
        return question.topics.some(questionTopic => 
          questionTopic.toLowerCase() === topics[0].toLowerCase()
        );
      }
      return false;
    });
    
    console.log(`Found ${filteredQuestions.length} questions for single topic: ${topics[0]}`);
    
    if (filteredQuestions.length < count) {
      console.log(`Not enough questions for topic. Using random selection from all questions.`);
      const shuffled = dataset.sort(() => 0.5 - Math.random());
      return shuffled.slice(0, count);
    }
    
    const shuffled = filteredQuestions.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }
  
  // For multiple topics, implement balanced distribution
  const questionsByTopic = {};
  const selectedQuestions = [];
  const usedQuestionIds = new Set();
  
  // Group questions by topic and prioritize single-topic questions
  topics.forEach(topic => {
    const topicQuestions = dataset.filter(question => {
      if (question.topics && Array.isArray(question.topics)) {
        return question.topics.some(questionTopic => 
          questionTopic.toLowerCase() === topic.toLowerCase()
        );
      }
      return false;
    });
    
    // Separate single-topic questions from multi-topic questions
    const singleTopicQuestions = topicQuestions.filter(q => 
      q.topics.length === 1 && q.topics[0].toLowerCase() === topic.toLowerCase()
    );
    const multiTopicQuestions = topicQuestions.filter(q => 
      q.topics.length > 1 && q.topics.some(t => t.toLowerCase() === topic.toLowerCase())
    );
    
    questionsByTopic[topic] = {
      single: singleTopicQuestions,
      multi: multiTopicQuestions,
      all: topicQuestions
    };
    
    console.log(`Found ${topicQuestions.length} questions for topic: ${topic} (${singleTopicQuestions.length} single-topic, ${multiTopicQuestions.length} multi-topic)`);
  });
  
  // Calculate balanced distribution
  const questionsPerTopic = Math.floor(count / topics.length);
  const remainingQuestions = count % topics.length;
  
  console.log(`Distributing ${questionsPerTopic} questions per topic, with ${remainingQuestions} extra questions`);
  
  // Distribute questions evenly across topics
  topics.forEach((topic, index) => {
    const topicData = questionsByTopic[topic];
    if (topicData.all.length === 0) {
      console.log(`No questions found for topic: ${topic}`);
      return;
    }
    
    // Calculate how many questions to take from this topic
    let questionsToTake = questionsPerTopic;
    if (index < remainingQuestions) {
      questionsToTake += 1; // Give extra questions to first few topics
    }
    
    // First try to use single-topic questions
    const availableSingle = topicData.single.filter(q => !usedQuestionIds.has(q.question));
    const availableMulti = topicData.multi.filter(q => !usedQuestionIds.has(q.question));
    
    let selected = [];
    
    // Use single-topic questions first
    if (availableSingle.length > 0) {
      const shuffledSingle = availableSingle.sort(() => 0.5 - Math.random());
      const singleToTake = Math.min(questionsToTake, availableSingle.length);
      selected.push(...shuffledSingle.slice(0, singleToTake));
    }
    
    // Fill remaining with multi-topic questions if needed
    const remainingNeeded = questionsToTake - selected.length;
    if (remainingNeeded > 0 && availableMulti.length > 0) {
      const shuffledMulti = availableMulti.sort(() => 0.5 - Math.random());
      selected.push(...shuffledMulti.slice(0, remainingNeeded));
    }
    
    // Mark selected questions as used
    selected.forEach(q => usedQuestionIds.add(q.question));
    selectedQuestions.push(...selected);
    
    console.log(`Selected ${selected.length} questions for topic: ${topic}`);
  });
  
  // If we don't have enough questions, fill with random questions
  if (selectedQuestions.length < count) {
    console.log(`Only found ${selectedQuestions.length} questions. Filling with random questions.`);
    const availableQuestions = dataset.filter(q => !usedQuestionIds.has(q.question));
    const shuffled = availableQuestions.sort(() => 0.5 - Math.random());
    const additionalQuestions = shuffled.slice(0, count - selectedQuestions.length);
    selectedQuestions.push(...additionalQuestions);
  }
  
  // Shuffle the final selection to mix topics
  const finalSelection = selectedQuestions.sort(() => 0.5 - Math.random());
  
  console.log(`Final selection: ${finalSelection.length} questions with balanced topic distribution`);
  return finalSelection.slice(0, count);
}

// @desc    Create a new Actual interview test session
// @route   POST /api/actual/create
// @access  Private
exports.createActualSession = async (req, res) => {
  try {
    const { role, experience, topicsToFocus, description } = req.body;
    const userId = req.user._id;
    
    console.log('Creating actual session with:', { role, experience, topicsToFocus, description });
    
    // Pick dataset file based on role and topics
    const datasetFile = pickDataset(role, topicsToFocus);
    console.log('Selected dataset file:', datasetFile);
    
    const datasetPath = path.join(__dirname, "../utils", datasetFile);
    console.log('Dataset path:', datasetPath);
    
    // Check if dataset file exists
    if (!fs.existsSync(datasetPath)) {
      console.error(`Dataset file not found: ${datasetPath}`);
      return res.status(500).json({ 
        success: false, 
        message: `Dataset file ${datasetFile} not found. Please check the server configuration.` 
      });
    }
    
    const dataset = JSON.parse(fs.readFileSync(datasetPath, "utf-8"));
    console.log(`Loaded ${dataset.length} questions from ${datasetFile}`);
    
    // Use user-provided topics or fall back to default coding topics
    const userTopics = topicsToFocus ? topicsToFocus.split(",").map(t => t.trim()).filter(Boolean) : [];
    const defaultTopics = ["programming", "coding", "algorithms", "data structures", "software development"];
    const topics = userTopics.length > 0 ? userTopics : defaultTopics;
    console.log('Using topics:', topics);
    
    const selectedQuestions = filterAndSampleQuestions(dataset, topics, 5);
    console.log(`Selected ${selectedQuestions.length} questions`);
    
    // Store questions in DB
    const questionDocs = await Promise.all(
      selectedQuestions.map(async (q) => {
        const question = await Question.create({
          question: q.question,
          answer: q.answer,
          type: "coding", // All questions are coding questions
        });
        return question._id;
      })
    );
    
    const actual = await Actual.create({
      user: userId,
      role,
      experience,
      topicsToFocus: topicsToFocus || defaultTopics.join(", "), // Use user input or default topics
      description,
      questions: questionDocs,
    });
    
    console.log('Successfully created actual session:', actual._id);
    res.status(201).json({ success: true, actual });
  } catch (error) {
    console.error("Error creating actual session:", error);
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
    // Calculate remaining time
    const remainingTime = calculateRemainingTime(session.timerStartTime, session.timerDuration);
    
    res.status(200).json({ 
      success: true, 
      session: {
        ...session.toObject(),
        remainingTime
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Save user answer for a question in an Actual session
exports.saveActualAnswer = async (req, res) => {
  try {
    const { questionId } = req.params;
    const { answer } = req.body;
    
    console.log('Saving actual answer for question:', questionId, 'Answer:', answer);
    
    const question = await Question.findById(questionId);
    if (!question) {
      console.log('Actual question not found:', questionId);
      return res.status(404).json({ message: "Question not found" });
    }
    
    question.userAnswer = answer;
    await question.save();
    
    console.log('Actual answer saved successfully for question:', questionId);
    res.status(200).json({ success: true, question });
  } catch (error) {
    console.error("Save actual answer error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Final submit for an Actual session
exports.finalSubmitActualSession = async (req, res) => {
  try {
    const { id } = req.params;
    const { answers } = req.body;
    
    console.log('=== DEBUG: Actual Session Request body answers ===');
    console.log('Answers from request body:', answers);
    console.log('Number of answers in request:', Object.keys(answers || {}).length);
    console.log('=== END DEBUG ===');
    
    const session = await Actual.findById(id).populate("questions");
    if (!session) return res.status(404).json({ message: "Session not found" });
    if (session.isFinalSubmitted) return res.status(400).json({ message: "Session already submitted" });
    
    console.log('=== DEBUG: Actual Session Database questions ===');
    session.questions.forEach((q, index) => {
      console.log(`DB Actual Question ${index + 1}:`, {
        questionId: q._id,
        hasUserAnswer: !!q.userAnswer,
        userAnswerLength: q.userAnswer ? q.userAnswer.length : 0,
        userAnswerPreview: q.userAnswer ? q.userAnswer.substring(0, 50) + '...' : 'EMPTY'
      });
    });
    console.log('=== END DEBUG ===');
    // Save answers
    const updates = [];
    for (const question of session.questions) {
      const userAnswer = answers[question._id];
      if (userAnswer) {
        updates.push(
          Question.findByIdAndUpdate(
            question._id,
            { userAnswer },
            { new: true }
          )
        );
      }
    }
    await Promise.all(updates);
    
    // Calculate scoring based on correct answers
    let correctAnswers = 0;
    let totalQuestions = session.questions.length;
    let answeredQuestions = 0;
    
    const token = req.headers.authorization;
    await Promise.all(session.questions.map(async (q) => {
      // Get the user answer from the database (updated question) or from request body
      const userAnswer = q.userAnswer || answers[q._id] || "";
      if (!userAnswer || userAnswer.trim() === "") return; // Skip empty answers
      
      answeredQuestions++;
      console.log(`Checking actual answer for question ${q._id}:`, {
        question: q.question.substring(0, 50) + '...',
        userAnswer: userAnswer.substring(0, 50) + '...',
        correctAnswer: q.answer.substring(0, 50) + '...'
      });
      
      try {
        const aiRes = await axios.post(
          `${API_BASE}/api/ai/check-answer`,
          {
            question: q.question,
            userAnswer,
            correctAnswer: q.answer
          },
          {
            headers: { Authorization: token }
          }
        );
        
        console.log(`AI response for actual question ${q._id}:`, aiRes.data);
        
        if (aiRes.data && aiRes.data.isCorrect) {
          correctAnswers++;
          console.log(`✅ Actual question ${q._id} marked as correct`);
        } else {
          console.log(`❌ Actual question ${q._id} marked as incorrect`);
        }
      } catch (err) {
        console.error(`AI check failed for actual question ${q._id}:`, err.message);
        // If AI fails, use a more flexible assessment as fallback
        const userAnswerLower = userAnswer.toLowerCase().trim();
        
        // Extract key technical terms and concepts that indicate understanding
        const technicalTerms = ['javascript', 'java', 'python', 'react', 'node', 'express', 'mongodb', 'sql', 'api', 'http', 'json', 'html', 'css', 'git', 'docker', 'kubernetes', 'aws', 'azure', 'database', 'server', 'client', 'frontend', 'backend', 'fullstack', 'microservices', 'rest', 'graphql', 'authentication', 'authorization', 'encryption', 'security', 'testing', 'deployment', 'ci/cd', 'agile', 'scrum', 'oop', 'functional', 'async', 'promise', 'callback', 'closure', 'hoisting', 'prototype', 'inheritance', 'polymorphism', 'encapsulation', 'abstraction', 'interface', 'abstract', 'static', 'final', 'volatile', 'synchronized', 'thread', 'process', 'memory', 'garbage', 'collection', 'algorithm', 'data structure', 'array', 'linked list', 'stack', 'queue', 'tree', 'graph', 'hash', 'map', 'set', 'sort', 'search', 'binary', 'linear', 'recursion', 'iteration', 'complexity', 'big o', 'time', 'space'];
        
        const userWords = userAnswerLower.split(/\s+/);
        
        // Check for technical term presence (indicates understanding)
        const userTechnicalTerms = userWords.filter(word => 
          technicalTerms.includes(word.toLowerCase())
        );
        
        // Check for meaningful answer length and content
        const meaningfulWords = userWords.filter(word => word.length > 3);
        const hasSubstantialContent = meaningfulWords.length >= 3;
        const hasTechnicalKnowledge = userTechnicalTerms.length >= 1;
        
        // More lenient assessment - if user shows technical knowledge or substantial content
        if (hasTechnicalKnowledge || hasSubstantialContent) {
          correctAnswers++;
          console.log(`✅ Actual question ${q._id} marked as correct (fallback: technical terms: ${userTechnicalTerms.length}, content words: ${meaningfulWords.length})`);
        } else {
          console.log(`❌ Actual question ${q._id} marked as incorrect (fallback: insufficient content or technical terms)`);
        }
      }
    }));
    
    // Calculate percentage score
    const percentageScore = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
    
    // Calculate submission time
    const submissionTime = Math.floor((new Date() - new Date(session.timerStartTime)) / 1000);
    
    session.isFinalSubmitted = true;
    session.submissionTime = submissionTime;
    await session.save();
    // Generate AI feedback with detailed context
    let feedbackResponse;
    try {
      // Prepare detailed performance analysis for AI
      const performanceAnalysis = {
        totalQuestions: totalQuestions,
        answeredQuestions: answeredQuestions,
        correctAnswers: correctAnswers,
        percentageScore: percentageScore,
        submissionTime: submissionTime,
        role: session.role,
        experience: session.experience,
        topicsToFocus: session.topicsToFocus,
        questions: session.questions.map(q => ({
          question: q.question,
          userAnswer: q.userAnswer || answers[q._id] || "",
          correctAnswer: q.answer,
          type: q.type,
          isAnswered: (q.userAnswer || answers[q._id] || "").trim().length > 0,
          answerLength: (q.userAnswer || answers[q._id] || "").length,
          hasCode: (q.userAnswer || answers[q._id] || "").includes('```'),
          timeSpent: q.timeSpent || 0
        })),
        performanceMetrics: {
          answerRate: (answeredQuestions / totalQuestions) * 100,
          accuracyRate: percentageScore,
          averageAnswerLength: session.questions.reduce((sum, q) => sum + ((q.userAnswer || answers[q._id] || "").length), 0) / answeredQuestions || 0,
          codeQuestionsAnswered: session.questions.filter(q => q.type === 'coding' && (q.userAnswer || answers[q._id] || "").trim().length > 0).length,
          technicalQuestionsAnswered: session.questions.filter(q => q.type === 'technical' && (q.userAnswer || answers[q._id] || "").trim().length > 0).length,
          questionsWithCode: session.questions.filter(q => (q.userAnswer || answers[q._id] || "").includes('```')).length,
          timeEfficiency: submissionTime ? (answeredQuestions / submissionTime) * 60 : 0
        },
        strengths: [],
        weaknesses: [],
        improvementAreas: []
      };

      // Analyze patterns for strengths and weaknesses
      const codingQuestions = session.questions.filter(q => q.type === 'coding');
      const technicalQuestions = session.questions.filter(q => q.type === 'technical');
      
      const answeredCoding = codingQuestions.filter(q => (q.userAnswer || answers[q._id] || "").trim().length > 0);
      const answeredTechnical = technicalQuestions.filter(q => (q.userAnswer || answers[q._id] || "").trim().length > 0);
      
      if (answeredCoding.length > 0) {
        performanceAnalysis.strengths.push('Demonstrated coding skills');
      }
      if (answeredTechnical.length > 0) {
        performanceAnalysis.strengths.push('Showed theoretical knowledge');
      }
      if (performanceAnalysis.performanceMetrics.averageAnswerLength > 100) {
        performanceAnalysis.strengths.push('Provided detailed explanations');
      }
      if (performanceAnalysis.performanceMetrics.questionsWithCode > 0) {
        performanceAnalysis.strengths.push('Used code examples in responses');
      }
      
      if (answeredCoding.length === 0 && codingQuestions.length > 0) {
        performanceAnalysis.weaknesses.push('Avoided coding questions');
      }
      if (answeredTechnical.length === 0 && technicalQuestions.length > 0) {
        performanceAnalysis.weaknesses.push('Struggled with theoretical questions');
      }
      if (performanceAnalysis.performanceMetrics.answerRate < 50) {
        performanceAnalysis.weaknesses.push('Low completion rate');
      }
      if (performanceAnalysis.performanceMetrics.averageAnswerLength < 50) {
        performanceAnalysis.weaknesses.push('Brief responses');
      }

      // Generate personalized feedback using AI
      const feedbackData = {
        role: session.role,
        experience: session.experience,
        topicsToFocus: session.topicsToFocus,
        performanceAnalysis: performanceAnalysis,
        questions: session.questions.map(q => ({
          question: q.question,
          userAnswer: q.userAnswer || answers[q._id] || "",
          correctAnswer: q.answer,
          type: q.type,
          isAnswered: (q.userAnswer || answers[q._id] || "").trim().length > 0,
          answerLength: (q.userAnswer || answers[q._id] || "").length,
          hasCode: (q.userAnswer || answers[q._id] || "").includes('```'),
          timeSpent: q.timeSpent || 0
        }))
      };

      feedbackResponse = await generateFeedback(feedbackData);
      
      // Clean and parse the AI response
      let rawText = feedbackResponse;
      if (typeof rawText === 'string') {
        const cleanedText = rawText
          .replace(/^```json\s*/, "")
          .replace(/```$/, "")
          .trim();
        feedbackResponse = JSON.parse(cleanedText);
      }
    } catch (aiError) {
      console.error("AI feedback generation failed:", aiError);
      // Create fallback feedback
      feedbackResponse = {
        skillsBreakdown: [
          { skill: "Technical Knowledge", score: 0 },
          { skill: "Problem Solving", score: 0 },
          { skill: "Communication", score: 0 },
          { skill: "Code Quality", score: 0 },
          { skill: "System Design", score: 0 }
        ],
        strengths: ["Session completed successfully"],
        areasForImprovement: ["AI feedback generation failed", "Please try again later"],
        summary: "Session completed. AI feedback generation encountered an error."
      };
    }
    
    session.feedback = feedbackResponse;
    await session.save();
    
    // Store feedback in dedicated feedback table
    try {
      const feedbackData = {
        user: session.user,
        sessionId: session._id,
        sessionType: "actual",
        role: session.role,
        experience: session.experience,
        topicsToFocus: session.topicsToFocus,
        skillsBreakdown: feedbackResponse.skillsBreakdown,
        strengths: feedbackResponse.strengths,
        areasForImprovement: feedbackResponse.areasForImprovement,
        summary: feedbackResponse.summary,
        percentageScore: percentageScore,
        totalQuestions: totalQuestions,
        answeredQuestions: answeredQuestions,
        correctAnswers: correctAnswers,
        submissionTime: session.submissionTime,
        performanceMetrics: {
          answerRate: (answeredQuestions / totalQuestions) * 100,
          accuracyRate: percentageScore,
          averageAnswerLength: session.questions.reduce((sum, q) => sum + (q.userAnswer ? q.userAnswer.length : 0), 0) / answeredQuestions || 0,
          codeQuestionsAnswered: session.questions.filter(q => q.type === 'coding' && q.userAnswer && q.userAnswer.trim().length > 0).length,
          technicalQuestionsAnswered: session.questions.filter(q => q.type === 'technical' && q.userAnswer && q.userAnswer.trim().length > 0).length,
          questionsWithCode: session.questions.filter(q => q.userAnswer && q.userAnswer.includes('```')).length,
          timeEfficiency: session.submissionTime ? (answeredQuestions / session.submissionTime) * 60 : 0
        }
      };

      // Check if feedback already exists for this session
      const existingFeedback = await Feedback.findOne({
        sessionId: session._id,
        sessionType: "actual",
        user: session.user
      });

      if (existingFeedback) {
        // Update existing feedback
        Object.assign(existingFeedback, feedbackData);
        await existingFeedback.save();
        console.log("Feedback updated in feedback table:", existingFeedback._id);
      } else {
        // Create new feedback
        const newFeedback = new Feedback(feedbackData);
        await newFeedback.save();
        console.log("Feedback stored in feedback table:", newFeedback._id);
      }
    } catch (feedbackError) {
      console.error("Error storing feedback in feedback table:", feedbackError);
      // Continue with the response even if feedback table storage fails
    }
    
    res.status(200).json({ message: "Submitted successfully", score: percentageScore, feedback: feedbackResponse });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Save user feedback for an Actual session
exports.saveActualUserFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const { userFeedback } = req.body;
    const session = await Actual.findById(id);
    if (!session) return res.status(404).json({ message: "Session not found" });
    session.userFeedback = userFeedback;
    await session.save();
    res.status(200).json({ message: "User feedback saved successfully", userFeedback });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Delete an Actual session and its questions
// @route   DELETE /api/actual/:id
// @access  Private
exports.deleteActualSession = async (req, res) => {
  try {
    const session = await Actual.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }
    // Check if the logged-in user owns this session
    if (session.user.toString() !== req.user.id) {
      return res.status(401).json({ message: "Not authorized to delete this session" });
    }
    // Delete all questions linked to this session
    await Question.deleteMany({ _id: { $in: session.questions } });
    // Delete the session
    await session.deleteOne();
    res.status(200).json({ message: "Session deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// @desc    Get available topics from the coding dataset
// @route   GET /api/actual/available-topics
// @access  Public
exports.getAvailableTopics = async (req, res) => {
  try {
    const availableTopics = extractAvailableTopics();
    
    if (availableTopics.length === 0) {
      return res.status(500).json({ 
        success: false, 
        message: "Failed to load available topics from dataset" 
      });
    }
    
    res.status(200).json({ 
      success: true, 
      topics: availableTopics,
      count: availableTopics.length
    });
  } catch (error) {
    console.error("Error getting available topics:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server Error",
      error: error.message 
    });
  }
}; 