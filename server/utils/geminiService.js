// geminiService.js
require('dotenv').config();
const axios = require('axios');

/**
 * Generate quiz questions using Open Trivia Database API
 * @param {string} topic - The topic for the quiz (mapped to predefined categories)
 * @param {number} numQuestions - Number of questions to generate
 * @returns {Promise<Array>} Array of quiz questions
 */
async function generateQuizQuestions(topic, numQuestions = 10) {
  try {
    // Map topic to Open Trivia Database category ID
    const categoryMap = {
      'general knowledge': 9,
      'science': 17,
      'history': 23,
      'geography': 22,
      'sports': 21,
      'entertainment': 11,
      'art': 25,
      'politics': 24,
      'technology': 18,
      'animals': 27,
      'vehicles': 28,
      'mythology': 20,
      'celebrities': 26,
      'books': 10,
      'music': 12,
      'movies': 11,
      'tv': 14,
      'games': 15,
      'comics': 29,
      'gadgets': 30,
      'anime': 31,
      'cartoon': 32,
    };

    // Find category ID or default to General Knowledge (9)
    const categoryId = categoryMap[topic.toLowerCase()] || 9;

    // 🔹 Use Open Trivia Database API
    const response = await axios.get(
      `https://opentdb.com/api.php?amount=${numQuestions}&category=${categoryId}&difficulty=easy&type=multiple`
    );

    if (response.data.response_code !== 0) {
      throw new Error(`Open Trivia Database API error: ${response.data.response_code}`);
    }

    const questions = response.data.results.map((q) => {
      // Decode HTML entities using simple regex (for Node.js compatibility)
      const decodeHtml = (html) => {
        return html
          .replace(/"/g, '"')
          .replace(/&#039;/g, "'")
          .replace(/&amp;/g, '&')
          .replace(/</g, '<')
          .replace(/>/g, '>')
          .replace(/&hellip;/g, '…')
          .replace(/&ldquo;/g, '"')
          .replace(/&rdquo;/g, '"')
          .replace(/&lsquo;/g, "'")
          .replace(/&rsquo;/g, "'")
          .replace(/&mdash;/g, '—')
          .replace(/&ndash;/g, '–');
      };

      const question = decodeHtml(q.question);
      const correctAnswer = decodeHtml(q.correct_answer);
      const incorrectAnswers = q.incorrect_answers.map(decodeHtml);

      // Combine and shuffle options
      const options = [correctAnswer, ...incorrectAnswers];
      const shuffledOptions = options.sort(() => Math.random() - 0.5);

      // Find index of correct answer
      const correctAnswerIndex = shuffledOptions.indexOf(correctAnswer);

      return {
        question,
        options: shuffledOptions,
        correctAnswer: correctAnswerIndex,
      };
    });

    // validate
    if (!Array.isArray(questions)) throw new Error('Response is not an array');
    questions.forEach((q, i) => {
      if (
        !q.question ||
        !Array.isArray(q.options) ||
        q.options.length !== 4 ||
        typeof q.correctAnswer !== 'number'
      ) {
        throw new Error(`Question at index ${i} invalid format`);
      }
    });

    return questions;
  } catch (err) {
    console.error('❌ Error generating quiz questions via Open Trivia Database:', err.message);
    throw new Error('Failed to generate quiz questions using Open Trivia Database');
  }
}

module.exports = { generateQuizQuestions };
