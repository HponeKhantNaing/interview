# Feedback Storage Implementation

## Overview
This document outlines the implementation of a dedicated feedback table to store feedback from both interview types (AI sessions and coding tests) with corresponding user IDs.

## Database Schema

### Feedback Model (`backend/models/Feedback.js`)
```javascript
{
  user: ObjectId, // Reference to User
  sessionId: ObjectId, // Reference to session/actual
  sessionType: String, // "session" or "actual"
  role: String,
  experience: String,
  topicsToFocus: String,
  skillsBreakdown: [{
    skill: String,
    score: Number,
    total: Number
  }],
  strengths: [String],
  areasForImprovement: [String],
  summary: String,
  percentageScore: Number,
  totalQuestions: Number,
  answeredQuestions: Number,
  correctAnswers: Number,
  submissionTime: Number,
  performanceMetrics: {
    answerRate: Number,
    accuracyRate: Number,
    averageAnswerLength: Number,
    codeQuestionsAnswered: Number,
    technicalQuestionsAnswered: Number,
    questionsWithCode: Number,
    timeEfficiency: Number
  },
  createdAt: Date,
  updatedAt: Date
}
```

## API Endpoints

### Feedback Controller (`backend/controllers/feedbackController.js`)

1. **POST /api/feedback/store** - Store feedback in dedicated table
2. **GET /api/feedback/:sessionId/:sessionType** - Get feedback by session
3. **GET /api/feedback/user** - Get all feedback for user
4. **DELETE /api/feedback/:id** - Delete feedback

## Implementation Details

### 1. Feedback Storage Process

#### For AI Sessions (Session Model)
- **Location**: `backend/controllers/sessionController.js`
- **Trigger**: When session is submitted (`finalSubmitSession`)
- **Data Stored**: 
  - Session type: "session"
  - All feedback data with performance metrics
  - User ID and session reference

#### For Coding Tests (Actual Model)
- **Location**: `backend/controllers/actualController.js`
- **Trigger**: When coding test is submitted (`finalSubmitSession`)
- **Data Stored**:
  - Session type: "actual"
  - All feedback data with performance metrics
  - User ID and session reference

#### For Auto-Submitted Sessions
- **Location**: `backend/utils/timerUtils.js`
- **Trigger**: When timer expires and session is auto-submitted
- **Data Stored**: Same as manual submission but with auto-submission context

### 2. Data Flow

1. **Session Submission** → Generate AI feedback → Store in session model → Store in feedback table
2. **Auto-Submission** → Generate fallback feedback → Store in session model → Store in feedback table
3. **Feedback Retrieval** → Query feedback table by session ID and type

### 3. Error Handling

- **Graceful Degradation**: If feedback table storage fails, the session submission continues
- **Duplicate Prevention**: Checks for existing feedback before creating new entries
- **Update Logic**: Updates existing feedback if session is resubmitted

### 4. Performance Metrics Stored

For each feedback entry, the following metrics are calculated and stored:

- **Answer Rate**: Percentage of questions answered
- **Accuracy Rate**: Percentage of correct answers
- **Average Answer Length**: Average characters per answer
- **Code Questions Answered**: Number of coding questions with answers
- **Technical Questions Answered**: Number of technical questions with answers
- **Questions with Code**: Number of answers containing code blocks
- **Time Efficiency**: Questions answered per minute

## Frontend Integration

### API Paths (`frontend/interview-prep-ai/src/utils/apiPaths.js`)
```javascript
FEEDBACK: {
  STORE: "/api/feedback/store",
  GET_BY_SESSION: (sessionId, sessionType) => `/api/feedback/${sessionId}/${sessionType}`,
  GET_USER_FEEDBACK: "/api/feedback/user",
  DELETE: (id) => `/api/feedback/${id}`,
}
```

## Benefits

### 1. **Centralized Feedback Storage**
- All feedback data in one dedicated table
- Easy to query and analyze feedback patterns
- Consistent data structure across session types

### 2. **User-Centric Design**
- Each feedback entry linked to specific user
- Can track user progress over time
- Enables user-specific feedback analytics

### 3. **Session Type Distinction**
- Clear separation between AI sessions and coding tests
- Different feedback analysis for different session types
- Maintains data integrity and context

### 4. **Comprehensive Metrics**
- Detailed performance tracking
- Rich analytics data for improvement insights
- Historical performance comparison capabilities

### 5. **Scalability**
- Dedicated table reduces load on session tables
- Optimized queries for feedback-specific operations
- Easy to extend with additional feedback features

## Usage Examples

### Store Feedback
```javascript
// When session is submitted
const feedbackData = {
  sessionId: session._id,
  sessionType: "session", // or "actual"
  role: session.role,
  experience: session.experience,
  // ... other feedback data
};

await axiosInstance.post(API_PATHS.FEEDBACK.STORE, feedbackData);
```

### Retrieve Feedback
```javascript
// Get feedback for specific session
const feedback = await axiosInstance.get(
  API_PATHS.FEEDBACK.GET_BY_SESSION(sessionId, sessionType)
);

// Get all user feedback
const userFeedback = await axiosInstance.get(API_PATHS.FEEDBACK.GET_USER_FEEDBACK);
```

## Future Enhancements

1. **Feedback Analytics Dashboard**: Visualize user progress over time
2. **Performance Trends**: Track improvement patterns
3. **Comparative Analysis**: Compare performance across different session types
4. **Export Functionality**: Allow users to export their feedback history
5. **Feedback Sharing**: Enable sharing feedback with mentors or coaches

## Database Indexes (Recommended)

```javascript
// For optimal query performance
feedbackSchema.index({ user: 1, createdAt: -1 });
feedbackSchema.index({ sessionId: 1, sessionType: 1 });
feedbackSchema.index({ user: 1, sessionType: 1 });
```

This implementation provides a robust, scalable solution for storing and managing feedback data with full user association and comprehensive performance tracking. 