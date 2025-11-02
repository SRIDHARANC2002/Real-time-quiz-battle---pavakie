const axios = require('axios');

/**
 * Generate quiz questions using Wikipedia summaries (free, no API key required)
 * Creates fill-in-the-blank questions by blanking out words in sentences
 * @param {string} topic - The topic for the quiz
 * @param {number} numQuestions - Number of questions to generate
 * @returns {Promise<Array>} Array of quiz questions
 */
async function generateQuizQuestions(topic, numQuestions = 10) {
  try {
    // Fetch Wikipedia summary
    const wikiUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(topic)}`;
    const res = await axios.get(wikiUrl);
    if (res.status !== 200) throw new Error("Topic not found on Wikipedia.");
    const data = res.data;

    const summary = data.extract || "";
    if (!summary) throw new Error("No content available for that topic.");

    // Split summary into sentences
    const sentences = summary.split(/[.?!]/).filter(s => s.trim().length > 10);
    const questions = [];

    for (let i = 0; i < Math.min(numQuestions, sentences.length); i++) {
      const s = sentences[i].trim();
      const words = s.split(" ");
      if (words.length < 6) continue;
      const blankIndex = Math.floor(words.length / 3);
      const answer = words[blankIndex];
      words[blankIndex] = "_____";

      const questionText = words.join(" ") + "?";
      const options = [answer, "Example", "Unknown", "None"].sort(() => Math.random() - 0.5);
      const correctAnswer = options.indexOf(answer);

      questions.push({ question: questionText, options, correctAnswer });
    }

    if (questions.length === 0) {
      throw new Error('Could not generate enough questions. Try a broader topic.');
    }

    return questions;
  } catch (error) {
    console.error('Error generating quiz questions:', error);

    if (error.response) {
      console.error('Wikipedia API error response:', error.response.status, error.response.data);
      if (error.response.status === 404) {
        throw new Error("Topic not found on Wikipedia.");
      }
    } else if (error.request) {
      console.error('Wikipedia API no response received:', error.request);
      throw new Error("Unable to connect to Wikipedia API. Please check your internet connection.");
    } else {
      console.error('Error setting up Wikipedia API request:', error.message);
    }

    throw new Error('Failed to generate quiz questions using Wikipedia. Please check the server console for details.');
  }
}

module.exports = { generateQuizQuestions };