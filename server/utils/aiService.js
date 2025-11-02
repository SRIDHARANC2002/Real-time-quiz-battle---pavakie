const axios = require('axios');

/**
 * Generate quiz questions using Puter AI
 * Puter.js provides AI chat functionality that can be accessed via their API
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

    // Puter AI API - trying different possible endpoints
    // Puter.js uses puter.ai.chat() client-side, server-side we need to find the API endpoint
    let puterResponse;
    let aiAnswer = '';

    // Try Puter API endpoint (may need to be adjusted based on actual API structure)
    try {
      puterResponse = await axios.post(
        'https://api.puter.com/v2/ai/chat',
        {
          message: prompt,
          model: 'gpt-4o-mini' // Using a reliable model
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'User-Agent': 'QuizBattle-Server/1.0'
          },
        }
      );

      console.log('Puter API full response:', JSON.stringify(puterResponse.data, null, 2));

      // Try different possible response formats
      aiAnswer = puterResponse.data?.response ||
                 puterResponse.data?.text ||
                 puterResponse.data?.answer ||
                 puterResponse.data?.message ||
                 puterResponse.data?.data ||
                 (typeof puterResponse.data === 'string' ? puterResponse.data : '');
    } catch (apiError) {
      // If the endpoint doesn't work, try alternative approach
      console.log('First endpoint failed, trying alternative...', apiError.message);
      
      // Alternative: Try using Puter's public API if available
      // Since Puter.js works client-side, we might need to proxy through our own endpoint
      // For now, throw the original error
      throw apiError;
    }
    
    if (!aiAnswer) {
      console.error('Puter API response structure:', JSON.stringify(puterResponse?.data, null, 2));
      throw new Error('No response text from Puter API. Check server console for response structure. You may need to check Puter API documentation for the correct endpoint.');
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
      throw new Error('Puter API authentication failed. Please check the API configuration.');
    }
    
    // Check for model/endpoint errors
    if (error.response?.status === 404) {
      throw new Error('Puter API endpoint not found. The API endpoint may need to be updated. Check https://docs.puter.com/ for the correct endpoint.');
    }
    
    // Check for quota/rate limit errors
    if (error.response?.status === 429 || 
        error.response?.status === 402 ||
        errorMessage.includes('quota') || 
        errorMessage.includes('rate limit') ||
        errorMessage.includes('billing') ||
        errorString.includes('insufficient_quota')) {
      throw new Error('Puter API quota exceeded. Please try again later.');
    }

    if (error.message?.includes('JSON') || error.message?.includes('parse')) {
      throw new Error('Failed to parse AI response. Please try again.');
    }

    // Log Puter-specific errors
    if (error.response) {
      console.error('Puter API error response:', error.response.status, error.response.data);
    } else if (error.request) {
      console.error('Puter API no response received:', error.request);
    } else {
      console.error('Error setting up Puter API request:', error.message);
    }
    
    throw new Error('Failed to generate quiz questions using Puter API. Please check the server console for details. The endpoint may need to be updated based on Puter\'s actual API structure.');
  }
}

module.exports = { generateQuizQuestions };