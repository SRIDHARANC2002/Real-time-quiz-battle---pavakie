

const { generateQuizQuestions } = require('../utils/geminiService');

/**
 * Generate quiz questions using Puter AI
 * POST /api/quiz/generate
 */
exports.generateQuiz = async (req, res) => {
  const { topic, numQuestions } = req.body;

  if (!topic) {
    return res.status(400).json({ message: 'Topic is required' });
  }

  try {
    const questions = await generateQuizQuestions(topic, numQuestions || 5);
    res.json({
      message: 'Questions generated successfully',
      questions
    });
  } catch (error) {
    console.error('Error generating quiz:', error);
    res.status(500).json({
      message: 'Failed to generate quiz questions',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

