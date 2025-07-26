const questionAnswerPrompt = (
  role,
  experience,
  topicsToFocus,
  numberOfQuestions
) => `
    You are an AI trained to generate technical interview questions and answers.
    
    Task:
    - Role: ${role}
    - Candidate Experience: ${experience} years
    - Focus Topics: ${topicsToFocus}
    - Write ${numberOfQuestions} interview questions.
    - The questions must be balanced: 2/3 should be technical and knowledge questions (type: 'technical'), and 1/3 should be coding questions (type: 'coding').
    - Distribute the questions evenly and fairly across all the provided topics/skills (from both manual input and PDF). Do NOT focus only on one topic; ensure all topics are represented in the questions.
    - For each question, add a 'type' field: 'technical' for technical/knowledge questions, 'coding' for coding questions.
    - For each question, generate a detailed but beginner-friendly answer.
    - If the answer needs a code example, add a small code block inside (especially for coding questions).
    - For technical/knowledge questions, focus on concepts, definitions, and explanations (no code required, answer as text).
    - For coding questions, require a code solution in the answer.
    - Keep formatting very clean.
    - Return a pure JSON array like:
    [
      {
        "question": "Question here?",
        "answer": "Answer here.",
        "type": "technical" // or "coding"
      },
      ...
    ]
    Important: Do NOT add any extra text. Only return valid JSON.
    `;

const conceptExplainPrompt = (question) => `
    You are an AI trained to generate explanations for a given interview question.
    
    Task:
    
    - Explain the following interview question and its concept in depth as if you're teaching a beginner developer.
    - Question: "${question}"
    - After the explanation, provide a short and clear title that summarizes the concept for the article or page header.
    - If the explanation includes a code example, provide a small code block.
    - Keep the formatting very clean and clear.
    - Return the result as a valid JSON object in the following format:
    
    {
        "title": "Short title here?",
        "explanation": "Explanation here."
    }
    
    Important: Do NOT add any extra text outside the JSON format. Only return valid JSON.
    `;

const feedbackPrompt = (role, experience, topicsToFocus, questions, submissionTime = null) => `
    You are an AI interview coach. Analyze the following interview session for a candidate:
    - Role: ${role}
    - Experience: ${experience} years
    - Focus Topics: ${topicsToFocus}
    - Questions and Answers: ${JSON.stringify(questions)}
    ${submissionTime ? `- Submission Time: ${submissionTime} seconds (${Math.floor(submissionTime / 60)} minutes ${submissionTime % 60} seconds)` : ''}

    CRITICAL RULES:
    1. Check if ANY answers are provided. If all userAnswer fields are empty, null, or undefined, then ALL scores must be 0.
    2. If even one question has a non-empty answer, evaluate only that question and score others as 0.
    3. Empty answers, null answers, or answers with only whitespace should be treated as NO ANSWER.

    Task:
    1. First, count how many questions have actual answers (non-empty userAnswer).
    2. If count is 0 (no answers provided):
       - Set ALL skill scores to 0
       - Set strengths to empty array []
       - Set areasForImprovement to ["No answers were provided", "Complete all questions to get meaningful feedback"]
       - Set summary to "No answers were provided for this session. Please complete all questions to receive proper feedback."
    3. If count > 0, evaluate only the answered questions and score unanswered as 0.
    4. Provide a breakdown of their skills with appropriate scores (0-5).
    5. Include submission time information in the summary if provided.
    6. Return the result as a valid JSON object in the following format:

    {
      "skillsBreakdown": [
        { "skill": "Technical Knowledge", "score": 0 },
        { "skill": "Problem Solving", "score": 0 },
        { "skill": "Communication", "score": 0 }
      ],
      "strengths": [],
      "areasForImprovement": ["No answers were provided", "Complete all questions to get meaningful feedback"],
      "summary": "No answers were provided for this session. Please complete all questions to receive proper feedback."
    }

    IMPORTANT: 
    - If ALL userAnswer fields are empty/null/undefined, ALL scores must be 0.
    - Do NOT give high scores for empty answers.
    - If submission time is provided, mention it in the summary (e.g., "Session completed in X minutes Y seconds").
    - Only return valid JSON. Do NOT add any extra text outside the JSON format.
`;

const checkAnswerPrompt = (question, userAnswer, correctAnswer) => `
  You are an AI assistant for interview preparation.
  Task:
  1. Given the following question and a user's answer, determine if the user's answer is semantically relevant and correct for the question, even if the wording, punctuation, or case is different, or if synonyms are used.
  2. Ignore minor differences in phrasing, synonyms, punctuation, and case. Focus on the meaning and correctness of the answer.
  3. If the answer is relevant and correct, reply with isRelevant: true and a short feedback message.
  4. If the answer is not relevant or incorrect, reply with isRelevant: false, a short feedback message, and provide the correct answer.
  5. Use the provided correct answer for reference.
  6. Return the result as a valid JSON object in the following format:
  {
    "isRelevant": true/false,
    "feedback": "Short feedback message",
    "correctAnswer": "The correct answer here"
  }
  Question: "${question}"
  UserAnswer: "${userAnswer}"
  CorrectAnswer: "${correctAnswer}"
  Important: Only return valid JSON. Do NOT add any extra text outside the JSON format.
`;

// Utility: Extract skills from text using a keyword list or regex
const SKILL_KEYWORDS = [
  'javascript', 'java', 'python', 'c++', 'c#', 'php', 'ruby', 'go', 'typescript', 'swift', 'kotlin', 'scala', 'rust', 'sql', 'laravel', 'react', 'angular', 'vue', 'node', 'express', 'django', 'spring', 'flask', 'html', 'css', 'sass', 'less', 'docker', 'kubernetes', 'aws', 'azure', 'gcp', 'firebase', 'mongodb', 'mysql', 'postgresql', 'redis', 'graphql', 'rest', 'git', 'linux', 'bash', 'shell', 'matlab', 'r', 'perl', 'objective-c', 'assembly', 'dart', 'flutter', 'react native', 'next.js', 'nuxt', 'nestjs', 'tailwind', 'bootstrap', 'jquery', 'pandas', 'numpy', 'scikit', 'tensorflow', 'pytorch', 'machine learning', 'deep learning', 'nlp', 'opencv', 'blockchain', 'solidity', 'web3', 'unity', 'unreal', 'game development', 'android', 'ios', 'xcode', 'visual studio', 'jira', 'trello', 'figma', 'adobe', 'photoshop', 'illustrator', 'xd', 'seo', 'wordpress', 'shopify', 'magento', 'woocommerce', 'salesforce', 'sap', 'tableau', 'power bi', 'excel', 'vba', 'sas', 'spss', 'hadoop', 'spark', 'bigquery', 'airflow', 'ci/cd', 'devops', 'agile', 'scrum', 'kanban', 'testing', 'jest', 'mocha', 'chai', 'cypress', 'selenium', 'junit', 'pytest', 'robot framework', 'appium', 'puppeteer', 'playwright', 'jira', 'confluence', 'notion', 'asana', 'monday', 'slack', 'zoom', 'teams', 'jira', 'confluence', 'notion', 'asana', 'monday', 'slack', 'zoom', 'teams'
];

function extractSkillsFromText(text) {
  const found = new Set();
  const lowerText = text.toLowerCase();
  for (const skill of SKILL_KEYWORDS) {
    // Match as a word boundary
    const regex = new RegExp(`\\b${skill.replace(/[.+*?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    if (regex.test(lowerText)) {
      found.add(skill);
    }
  }
  return Array.from(found);
}

// Utility: Extract role from text
function extractRoleFromText(text) {
  // Look for lines like 'Role: ...' or 'Position: ...'
  const match = text.match(/(?:Role|Position)\s*[:\-]\s*(.+)/i);
  if (match) return match[1].trim();
  // Fallback: look for common job titles in the text
  const titles = ['developer', 'engineer', 'manager', 'designer', 'analyst', 'consultant', 'lead', 'architect', 'administrator', 'specialist', 'scientist'];
  for (const title of titles) {
    const regex = new RegExp(`\\b${title}\\b`, 'i');
    if (regex.test(text)) return title;
  }
  return null;
}

// Utility: Extract description from text
function extractDescriptionFromText(text) {
  // Look for a section labeled 'Summary', 'Profile', or 'Description'
  const match = text.match(/(?:Summary|Profile|Description)\s*[:\-]?\s*([\s\S]{0,500})/i);
  if (match) return match[1].split(/\n|\r/)[0].trim();
  return null;
}

// Utility: Extract projects from text
function extractProjectsFromText(text) {
  // Look for a section labeled 'Projects' and grab the next few lines
  const match = text.match(/Projects?\s*[:\-]?([\s\S]{0,1000})/i);
  if (match) {
    // Split by lines, filter out empty, take up to 5 lines
    return match[1].split(/\n|\r/).map(l => l.trim()).filter(Boolean).slice(0, 5);
  }
  return [];
}

module.exports = { questionAnswerPrompt, conceptExplainPrompt, feedbackPrompt, checkAnswerPrompt };
module.exports.extractSkillsFromText = extractSkillsFromText;
module.exports.extractRoleFromText = extractRoleFromText;
module.exports.extractDescriptionFromText = extractDescriptionFromText;
module.exports.extractProjectsFromText = extractProjectsFromText;
