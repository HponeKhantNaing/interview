const express = require('express');
const { createActualSession, getMyActualSessions, getActualSessionById } = require('../controllers/actualController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/create', protect, createActualSession);
router.get('/my-sessions', protect, getMyActualSessions);
router.get('/:id', protect, getActualSessionById);

module.exports = router; 