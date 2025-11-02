const axios = require('axios');

/**
 * Generate quiz questions using Google Gemini AI
 * @param {string} topic - The topic for the quiz
 * @param {number} numQuestions - Number of questions to generate
 * @returns {Promise<Array>} Array of quiz questions
 */
async function generateQuizQuestions(topic, numQuestions = 10) {
  try {
    const prompt = `Generate exactly ${numQuestions} quiz questions about "${topic}".

Each question must have:
- A clear question text
- Exactly 4 multiple choice options
- One correct answer

Format each question as a JSON object with this exact structure:
{
  "question": "Question text here",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correctAnswer": 0
}

Where correctAnswer is the index (0-3) of the correct option.

Return ONLY a valid JSON array of question objects, no additional text, no markdown, no code blocks. Just the JSON array.

Example:
[
  {
    "question": "What is the capital of France?",
    "options": ["London", "Berlin", "Paris", "Madrid"],
    "correctAnswer": 2
  }
]`;

    // Use Google Gemini AI instead of Puter
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const aiAnswer = response.text();

    if (!aiAnswer) {
      throw new Error('No response text from Gemini AI.');
    }

    // Extract JSON from the response (might have markdown code blocks)
    let jsonText = aiAnswer.trim();
    if (typeof jsonText !== 'string') {
      jsonText = String(jsonText);
    }

    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace('```json', '').replace('```', '').trim();
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace('```', '').replace('```', '').trim();
    }

    // Try to find JSON array in the response
    const jsonMatch = jsonText.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      jsonText = jsonMatch[0];
    }

    const questions = JSON.parse(jsonText);

    // Validate structure
    if (!Array.isArray(questions)) {
      throw new Error('Response is not an array');
    }

    // Validate each question has required fields
    questions.forEach((q, idx) => {
      if (!q.question || !Array.isArray(q.options) || q.options.length !== 4 || typeof q.correctAnswer !== 'number') {
        throw new Error(`Question ${idx + 1} is missing required fields`);
      }
      if (q.correctAnswer < 0 || q.correctAnswer > 3) {
        throw new Error(`Question ${idx + 1} has invalid correctAnswer index`);
      }
    });

    return questions;
  } catch (error) {
    console.error('Error generating quiz questions:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));

    const errorString = JSON.stringify(error).toLowerCase();
    const errorMessage = error.message?.toLowerCase() || '';

    // Check for authentication errors
    if (error.response?.status === 401 ||
        errorMessage.includes('api key') ||
        errorMessage.includes('api_key') ||
        errorMessage.includes('authentication') ||
        errorMessage.includes('unauthorized')) {
      throw new Error('Gemini API authentication failed. Please check the GOOGLE_AI_API_KEY configuration.');
    }

    // Check for quota/rate limit errors
    if (error.response?.status === 429 ||
        error.response?.status === 402 ||
        errorMessage.includes('quota') ||
        errorMessage.includes('rate limit') ||
        errorMessage.includes('billing') ||
        errorString.includes('insufficient_quota')) {
      throw new Error('Gemini API quota exceeded. Please try again later.');
    }

    if (error.message?.includes('JSON') || error.message?.includes('parse')) {
      throw new Error('Failed to parse AI response. Please try again.');
    }

    // Log Gemini-specific errors
    if (error.response) {
      console.error('Gemini API error response:', error.response.status, error.response.data);
    } else if (error.request) {
      console.error('Gemini API no response received:', error.request);
    } else {
      console.error('Error setting up Gemini API request:', error.message);
    }

    throw new Error('Failed to generate quiz questions using Gemini AI. Please check the server console for details.');
  }
}

module.exports = { generateQuizQuestions };
