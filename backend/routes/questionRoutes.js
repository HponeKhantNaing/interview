const express = require('express');
const {
  togglePinQuestion,
  updateQuestionNote,
  addQuestionsToSession,
  updateUserAnswer 
} = require('../controllers/questionController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/add', protect, addQuestionsToSession);
router.post('/:id/pin', protect, togglePinQuestion);
router.post('/:id/note', protect, updateQuestionNote);
router.post('/:id/answer', protect, updateUserAnswer); // ✅ Save user's answer

module.exports = router;