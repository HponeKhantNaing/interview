const express = require('express');
const { createActualSession, getMyActualSessions, getActualSessionById, saveActualAnswer, finalSubmitActualSession, saveActualUserFeedback, deleteActualSession } = require('../controllers/actualController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/create', protect, createActualSession);
router.get('/my-sessions', protect, getMyActualSessions);
router.get('/:id', protect, getActualSessionById);
router.post('/answer/:questionId', protect, saveActualAnswer);
router.post('/:id/submit', protect, finalSubmitActualSession);
router.post('/:id/user-feedback', protect, saveActualUserFeedback);
router.delete('/:id', protect, deleteActualSession);

module.exports = router; 