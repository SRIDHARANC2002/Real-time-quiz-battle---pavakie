const express = require('express');
const { generateQuiz } = require('../controllers/quizController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware);

router.post('/generate', generateQuiz);

module.exports = router;

