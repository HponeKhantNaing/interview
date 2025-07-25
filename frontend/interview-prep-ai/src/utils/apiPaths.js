export const BASE_URL = "http://localhost:8000";

export const API_PATHS = {
  AUTH: {
    REGISTER: "/api/auth/register", // Signup
    LOGIN: "/api/auth/login", // Authenticate user & return JWT token
    GET_PROFILE: "/api/auth/profile", // Get logged-in user details
  },

  IMAGE: {
    UPLOAD_IMAGE: "/api/auth/upload-image", // Upload profile picture
  },

  AI: {
    GENERATE_QUESTIONS: "/api/ai/generate-questions", // Generate interview questions and answers using Gemini
    GENERATE_EXPLANATION: "/api/ai/generate-explanation", // Generate concept explanation using Gemini
  },

  SESSION: {
    CREATE: "/api/sessions/create", // Create a new interview session with questions
    GET_ALL: "/api/sessions/my-sessions", //  Get all user sessions
    GET_ONE: (id) => `/api/sessions/${id}`, // Get session details with questions
    DELETE: (id) => `/api/sessions/${id}`, // Delete a session
    // 🍊🍊🍊🍊🍊🍊🍊🍊🍊
    SUBMIT: (id) => `/api/sessions/${id}/submit`, // ✅ Final submit endpoint
    USER_FEEDBACK: (id) => `/api/sessions/${id}/user-feedback`, // Endpoint to save user feedback
    UPLOAD_PDF: "/api/sessions/upload-pdf", // New endpoint for PDF upload
  },
  
  QUESTION: {
    ADD_TO_SESSION: "/api/questions/add",
    PIN: (id) => `/api/questions/${id}/pin`,
    UPDATE_NOTE: (id) => `/api/questions/${id}/note`,
    ANSWER: (id) => `/api/questions/${id}/answer`, // ✅ Add this line
  },

  ACTUAL: {
    CREATE: "/api/actual/create",
    GET_ALL: "/api/actual/my-sessions",
    GET_ONE: (id) => `/api/actual/${id}`,
  },
};
