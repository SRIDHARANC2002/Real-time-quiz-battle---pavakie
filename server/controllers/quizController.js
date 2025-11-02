const { generateQuizQuestions } = require('../utils/geminiService');

/**
 * Generate quiz questions using AI
 * POST /api/quiz/generate
 */
exports.generateQuiz = async (req, res) => {
  const { topic, numQuestions } = req.body;

  if (!topic) {
    return res.status(400).json({ message: 'Topic is required' });
  }

  try {
    const questions = await generateQuizQuestions(topic, numQuestions || 10);
    res.json({ questions });
  } catch (error) {
    console.error('Error generating quiz:', error);
    console.error('Error stack:', error.stack);
    // Send detailed error message to help with debugging
    const errorMessage = error.message || 'Failed to generate quiz questions';
    res.status(500).json({ 
      message: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

