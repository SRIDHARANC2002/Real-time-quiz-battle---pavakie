const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini AI with API key
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  console.error('⚠️  WARNING: GEMINI_API_KEY not found in environment variables!');
  console.error('AI question generation will not work. Please add your API key to server/.env');
}

const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;

/**
 * Generate quiz questions using Google Gemini AI
 * @param {string} topic - The topic for the quiz
 * @param {number} numQuestions - Number of questions to generate
 * @returns {Promise<Array>} Array of quiz questions
 */
async function generateQuizQuestions(topic, numQuestions = 10) {
  try {
    // Check if API key is configured
    if (!genAI) {
      throw new Error('Gemini API key not configured. Please add GEMINI_API_KEY to your .env file.');
    }

   const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
 

    const prompt = `Generate ${numQuestions} quiz questions about ${topic}. 
    
Each question should have:
- A clear question text
- Exactly 4 multiple choice options labeled A, B, C, D
- One correct answer marked with an asterisk (*)

Format each question as a JSON object with this exact structure:
{
  "question": "Question text here",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correctAnswer": 0
}

Where correctAnswer is the index (0-3) of the correct option.

Return ONLY a valid JSON array of question objects, no additional text or explanation.

Example:
[
  {
    "question": "What is the capital of France?",
    "options": ["London", "Berlin", "Paris", "Madrid"],
    "correctAnswer": 2
  }
]`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from the response (might have markdown code blocks)
    let jsonText = text.trim();
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace('```json', '').replace('```', '').trim();
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace('```', '').replace('```', '').trim();
    }

    const questions = JSON.parse(jsonText);
    
    // Validate structure
    if (!Array.isArray(questions)) {
      throw new Error('Response is not an array');
    }

    return questions;
  } catch (error) {
    console.error('Error generating quiz questions:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    
    // Check for API key errors - check multiple possible error formats
    const errorString = JSON.stringify(error).toLowerCase();
    const errorMessage = error.message?.toLowerCase() || '';
    
    if (error.status === 400 || 
        errorMessage.includes('api key') || 
        errorMessage.includes('api_key_invalid') ||
        errorString.includes('api_key_invalid') ||
        error.errorDetails?.some(detail => detail.reason === 'API_KEY_INVALID') ||
        errorString.includes('api key not valid')) {
      throw new Error('Invalid API key. Please check your Gemini API key in the server configuration.');
    }
    
    if (error.message?.includes('quota') || error.message?.includes('rate limit')) {
      throw new Error('API quota exceeded. Please try again later or upgrade your plan.');
    }
    
    throw new Error('Failed to generate quiz questions. Please try again.');
  }
}

module.exports = { generateQuizQuestions };

