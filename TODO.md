# TODO: Change AI Service to Gemini

## Steps to Complete
- [x] Create server/.env file with GEMINI_API_KEY
- [x] Update server/controllers/quizController.js to import from geminiService instead of aiService
- [x] Test the updated generateQuizQuestions function by running the server and verifying quiz generation
- [x] Commit and push all changes to GitHub

## Details
- Switched from Wikipedia-based quiz generation to Google Gemini AI
- API key provided: AIzaSyBAV_h0d33FiYSHTGPzDEz1jTpCQ-THSk0
- Maintain output format: array of {question, options[4], correctAnswer}
- Handle errors for API key issues, quota limits, etc.
