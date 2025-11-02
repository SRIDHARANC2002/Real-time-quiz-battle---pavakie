const axios = require('axios');

async function testWithAuth() {
  try {
    // First, log in to get a token
    const loginResponse = await axios.post(
      'https://real-time-quiz-battle-pavakie.onrender.com/api/users/login',
      {
        email: 'test@example.com',  // Replace with a valid test user
        password: 'password123'     // Replace with the correct password
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    const { token } = loginResponse.data;
    console.log('Successfully logged in. Token:', token);

    // Now test the quiz generation with the token
    const quizResponse = await axios.post(
      'https://real-time-quiz-battle-pavakie.onrender.com/api/quiz/generate',
      {
        topic: 'science',
        numQuestions: 3
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    console.log('\nQuiz generation successful! Response:');
    console.log(JSON.stringify(quizResponse.data, null, 2));
  } catch (error) {
    console.error('Error:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error:', error.message);
    }
  }
}

testWithAuth();
