const express = require('express');
const {
  createSession,
  getSessionById,
  getMySessions,
  deleteSession,
  finalSubmitSession,
  saveUserFeedback
} = require('../controllers/sessionController');
const { protect } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

const router = express.Router();

router.post('/create', protect, createSession);
router.get('/my-sessions', protect, getMySessions);
router.get('/:id', protect, getSessionById);
router.delete('/:id', protect, deleteSession);
router.post('/:id/submit', protect, finalSubmitSession); // ✅ Now this works
router.post('/:id/user-feedback', protect, saveUserFeedback);
router.post('/upload-pdf', protect, upload.single('pdf'), require('../controllers/sessionController').uploadSessionPDF);

module.exports = router;