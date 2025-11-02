# TODO: Replace aiService.js with Wikipedia-based Quiz Generation

## Steps to Complete
- [x] Update server/utils/aiService.js to implement Wikipedia-based quiz question generation
- [x] Test the updated generateQuizQuestions function by running the server and verifying quiz generation
- [x] Fix API response parsing in CreateRoom.jsx to handle server response format
- [x] Commit and push all changes to GitHub

## Details
- Replace Hugging Face API with Wikipedia summary fetching
- Generate fill-in-the-blank questions by blanking words in sentences
- Use simple options: correct word + ["Example", "Unknown", "None"]
- Maintain output format: array of {question, options[4], correctAnswer}
- Handle errors for missing topics or insufficient content
- Fixed client-side parsing to extract questions from response object
