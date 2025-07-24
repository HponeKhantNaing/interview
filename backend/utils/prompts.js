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

const feedbackPrompt = (role, experience, topicsToFocus, questions) => `
    You are an AI interview coach. Analyze the following interview session for a candidate:
    - Role: ${role}
    - Experience: ${experience} years
    - Focus Topics: ${topicsToFocus}
    - Questions and Answers: ${JSON.stringify(questions)}

    Task:
    1. Evaluate the candidate's answers for each question.
    2. Identify key strengths and areas for improvement based on their answers.
    3. Provide a breakdown of their skills (e.g., technical, problem-solving, communication) with a score (1-5) for each.
    4. Summarize the candidate's overall performance.
    5. Return the result as a valid JSON object in the following format:

    {
      "skillsBreakdown": [
        { "skill": "Skill Name", "score": 4 },
        ...
      ],
      "strengths": ["Strength 1", "Strength 2", ...],
      "areasForImprovement": ["Area 1", "Area 2", ...],
      "summary": "Short summary of performance"
    }

    Important: Only return valid JSON. Do NOT add any extra text outside the JSON format.
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

module.exports = { questionAnswerPrompt, conceptExplainPrompt, feedbackPrompt, checkAnswerPrompt };
