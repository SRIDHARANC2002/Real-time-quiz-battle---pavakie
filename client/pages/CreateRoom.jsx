import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../src/hooks/useSocket";
import { useAuth } from "../src/hooks/useAuth";
import { api } from "../utils/api";

const CreateRoom = () => {
  const [step, setStep] = useState(1); // 1: Setup, 2: Questions, 3: Preview
  const [roomName, setRoomName] = useState("");
  const [roomType, setRoomType] = useState(""); // "1v1" or "multiplayer"
  const [questionType, setQuestionType] = useState(""); // "manual" or "ai"
  const [questions, setQuestions] = useState([]);

  const { socket } = useSocket();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleNext = () => {
    if (step === 1) {
      if (!roomName.trim()) {
        alert("Please enter a room name!");
        return;
      }
      if (!roomType) {
        alert("Please select a room type!");
        return;
      }
      if (!questionType) {
        alert("Please select a question type!");
        return;
      }
      setStep(2);
    } else if (step === 2) {
      // Step 2 validation is handled in the QuestionInput component
      setStep(3);
    }
    // Step 3 is the final preview - handled by confirm button
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleConfirmAndCreate = () => {
    if (!socket || !socket.connected) {
      alert("Socket not connected. Please make sure the backend server is running on port 5000.");
      return;
    }

    if (!user) {
      alert("Please login first!");
      navigate('/login');
      return;
    }

    if (questions.length === 0) {
      alert("Please add at least one question!");
      return;
    }

    // Create room via socket with custom questions
    socket.emit("createRoom", {
      roomName,
      roomType,
      userId: user.id || user._id,
      quiz: {
        questions: questions.map((q, idx) => ({
          question: q.question,
          options: q.options,
          correctAnswer: q.correctAnswer
        })),
        currentQuestion: 0,
        isActive: false
      }
    });

    // Handle room created
    socket.once("roomCreated", (data) => {
      navigate(`/room/${data.roomId}`);
    });

    socket.once("error", (data) => {
      alert(data.message || "Failed to create room");
    });
  };

  return (
    <div className="create-room-page">
      <div style={{maxWidth: '800px', margin: '0 auto'}}>
        {/* Progress Indicator */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '2rem',
          padding: '0 2rem'
        }}>
          {[1, 2, 3].map((num) => (
            <div key={num} style={{
              flex: 1,
              textAlign: 'center',
              position: 'relative'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: step >= num ? 'var(--primary-color)' : 'var(--bg-secondary)',
                color: step >= num ? 'white' : 'var(--text-secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto',
                fontWeight: 'bold',
                border: step >= num ? 'none' : '2px solid var(--border-color)'
              }}>
                {step > num ? '✓' : num}
              </div>
              <div style={{
                marginTop: '0.5rem',
                fontSize: '0.9rem',
                color: step >= num ? 'var(--text-primary)' : 'var(--text-secondary)'
              }}>
                {num === 1 ? 'Setup' : num === 2 ? 'Questions' : 'Preview'}
              </div>
              {num < 3 && (
                <div style={{
                  position: 'absolute',
                  top: '20px',
                  left: '60%',
                  width: '80%',
                  height: '2px',
                  backgroundColor: step > num ? 'var(--primary-color)' : 'var(--border-color)',
                  zIndex: -1
                }} />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Room Setup */}
        {step === 1 && (
          <div className="card">
            <h2>Create a New Quiz Room</h2>
            <p style={{color: 'var(--text-secondary)', marginBottom: '2rem'}}>
              Set up your quiz room and choose how to add questions
            </p>
            
            <div style={{marginBottom: '1.5rem'}}>
              <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: '600'}}>
                Room Name *
              </label>
      <input
        type="text"
                placeholder="e.g., JavaScript Basics Quiz"
        value={roomName}
        onChange={(e) => setRoomName(e.target.value)}
                required
                style={{width: '100%'}}
              />
            </div>

            <div style={{marginBottom: '1.5rem'}}>
              <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: '600'}}>
                Room Type *
              </label>
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'}}>
                <button
                  type="button"
                  onClick={() => setRoomType("1v1")}
                  style={{
                    padding: '2rem',
                    border: roomType === "1v1" ? '3px solid var(--primary-color)' : '2px solid var(--border-color)',
                    borderRadius: 'var(--radius)',
                    backgroundColor: roomType === "1v1" ? 'var(--bg-tertiary)' : 'white',
                    cursor: 'pointer',
                    transition: 'all 0.3s'
                  }}
                >
                  <div style={{fontSize: '2rem', marginBottom: '0.5rem'}}>⚔️</div>
                  <div style={{fontWeight: 'bold', marginBottom: '0.25rem'}}>1 vs 1</div>
                  <div style={{fontSize: '0.9rem', color: 'var(--text-secondary)'}}>
                    Head-to-head battle
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setRoomType("multiplayer")}
                  style={{
                    padding: '2rem',
                    border: roomType === "multiplayer" ? '3px solid var(--primary-color)' : '2px solid var(--border-color)',
                    borderRadius: 'var(--radius)',
                    backgroundColor: roomType === "multiplayer" ? 'var(--bg-tertiary)' : 'white',
                    cursor: 'pointer',
                    transition: 'all 0.3s'
                  }}
                >
                  <div style={{fontSize: '2rem', marginBottom: '0.5rem'}}>👥</div>
                  <div style={{fontWeight: 'bold', marginBottom: '0.25rem'}}>Multiplayer</div>
                  <div style={{fontSize: '0.9rem', color: 'var(--text-secondary)'}}>
                    Multiple players
                  </div>
                </button>
              </div>
            </div>

            <div style={{marginBottom: '1.5rem'}}>
              <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: '600'}}>
                Question Type *
              </label>
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'}}>
                <button
                  type="button"
                  onClick={() => setQuestionType("manual")}
                  style={{
                    padding: '2rem',
                    border: questionType === "manual" ? '3px solid var(--primary-color)' : '2px solid var(--border-color)',
                    borderRadius: 'var(--radius)',
                    backgroundColor: questionType === "manual" ? 'var(--bg-tertiary)' : 'white',
                    cursor: 'pointer',
                    transition: 'all 0.3s'
                  }}
                >
                  <div style={{fontSize: '2rem', marginBottom: '0.5rem'}}>✍️</div>
                  <div style={{fontWeight: 'bold', marginBottom: '0.25rem'}}>Manual</div>
                  <div style={{fontSize: '0.9rem', color: 'var(--text-secondary)'}}>
                    Add questions yourself
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setQuestionType("ai")}
                  style={{
                    padding: '2rem',
                    border: questionType === "ai" ? '3px solid var(--primary-color)' : '2px solid var(--border-color)',
                    borderRadius: 'var(--radius)',
                    backgroundColor: questionType === "ai" ? 'var(--bg-tertiary)' : 'white',
                    cursor: 'pointer',
                    transition: 'all 0.3s'
                  }}
                >
                  <div style={{fontSize: '2rem', marginBottom: '0.5rem'}}>🤖</div>
                  <div style={{fontWeight: 'bold', marginBottom: '0.25rem'}}>AI Generated</div>
                  <div style={{fontSize: '0.9rem', color: 'var(--text-secondary)'}}>
                    Let AI create questions
                  </div>
                </button>
              </div>
            </div>

            <div style={{display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem'}}>
              <button type="button" onClick={() => navigate('/dashboard')} className="secondary">
                Cancel
              </button>
              <button type="button" onClick={handleNext}>
                Next →
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Questions Input */}
        {step === 2 && questionType === "manual" && (
          <QuestionInput questions={questions} setQuestions={setQuestions} onNext={handleNext} onBack={handleBack} />
        )}

        {step === 2 && questionType === "ai" && (
          <AIQuestionInput questions={questions} setQuestions={setQuestions} onNext={handleNext} onBack={handleBack} />
        )}

        {/* Step 3: Preview */}
        {step === 3 && (
          <div className="card">
            <h2>Preview Your Quiz</h2>
            <p style={{color: 'var(--text-secondary)', marginBottom: '1rem'}}>
              Review your {questions.length} question{questions.length !== 1 ? 's' : ''} before creating the room
            </p>

            <div style={{marginBottom: '2rem'}}>
              <div style={{
                padding: '1rem',
                backgroundColor: 'var(--bg-secondary)',
                borderRadius: 'var(--radius)',
                marginBottom: '1rem'
              }}>
                <strong>Room Name:</strong> {roomName}
              </div>
              <div style={{
                padding: '1rem',
                backgroundColor: 'var(--bg-secondary)',
                borderRadius: 'var(--radius)',
                marginBottom: '1rem'
              }}>
                <strong>Room Type:</strong> {roomType === '1v1' ? '1 vs 1' : 'Multiplayer'}
              </div>
              
              <div style={{maxHeight: '400px', overflowY: 'auto'}}>
                {questions.map((q, index) => (
                  <div key={index} style={{
                    padding: '1rem',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius)',
                    marginBottom: '1rem',
                    backgroundColor: 'white'
                  }}>
                    <div style={{fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--primary-color)'}}>
                      Question {index + 1}
                    </div>
                    <div style={{marginBottom: '0.75rem', fontSize: '1.05rem'}}>{q.question}</div>
                    <div>
                      {q.options.map((opt, idx) => (
                        <div key={idx} style={{
                          padding: '0.5rem',
                          marginBottom: '0.25rem',
                          borderRadius: 'var(--radius)',
                          backgroundColor: idx === q.correctAnswer ? '#d1fae5' : 'var(--bg-secondary)',
                          border: idx === q.correctAnswer ? '2px solid var(--primary-color)' : 'none'
                        }}>
                          {String.fromCharCode(65 + idx)}. {opt}
                          {idx === q.correctAnswer && ' ✅'}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{display: 'flex', justifyContent: 'space-between', gap: '1rem'}}>
              <button type="button" onClick={handleBack} className="secondary">
                ← Back
              </button>
              <button type="button" onClick={handleConfirmAndCreate} className="success">
                ✓ Create Room
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Manual Question Input Component
const QuestionInput = ({ questions, setQuestions, onNext, onBack }) => {
  const [currentQuestion, setCurrentQuestion] = useState({
    question: "",
    options: ["", "", "", ""],
    correctAnswer: 0
  });

  const handleAddQuestion = () => {
    if (!currentQuestion.question.trim()) {
      alert("Please enter a question!");
      return;
    }
    if (currentQuestion.options.some(opt => !opt.trim())) {
      alert("Please fill all 4 options!");
      return;
    }
    
    setQuestions([...questions, { ...currentQuestion }]);
    setCurrentQuestion({
      question: "",
      options: ["", "", "", ""],
      correctAnswer: 0
    });
  };

  return (
    <div className="card">
      <h2>Add Questions Manually</h2>
      <p style={{color: 'var(--text-secondary)', marginBottom: '2rem'}}>
        Create your quiz questions one by one
      </p>

      <div style={{marginBottom: '1.5rem'}}>
        <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: '600'}}>
          Question
        </label>
        <textarea
          placeholder="Enter your question here..."
          value={currentQuestion.question}
          onChange={(e) => setCurrentQuestion({ ...currentQuestion, question: e.target.value })}
          required
          style={{width: '100%', minHeight: '80px', resize: 'vertical'}}
        />
      </div>

      <div style={{marginBottom: '1.5rem'}}>
        <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: '600'}}>
          Options
        </label>
        {currentQuestion.options.map((opt, idx) => (
          <div key={idx} style={{marginBottom: '0.75rem', display: 'flex', gap: '0.5rem', alignItems: 'center'}}>
            <button
              type="button"
              onClick={() => setCurrentQuestion({ ...currentQuestion, correctAnswer: idx })}
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                border: '2px solid var(--border-color)',
                backgroundColor: currentQuestion.correctAnswer === idx ? 'var(--primary-color)' : 'white',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: currentQuestion.correctAnswer === idx ? 'white' : 'transparent'
              }}
            >
              ✓
            </button>
            <input
              type="text"
              placeholder={`Option ${String.fromCharCode(65 + idx)}`}
              value={opt}
              onChange={(e) => {
                const newOptions = [...currentQuestion.options];
                newOptions[idx] = e.target.value;
                setCurrentQuestion({ ...currentQuestion, options: newOptions });
              }}
              required
              style={{flex: 1}}
            />
            {idx === currentQuestion.correctAnswer && (
              <span style={{color: 'var(--primary-color)', fontWeight: 'bold'}}>Correct</span>
            )}
          </div>
        ))}
      </div>

      <button type="button" onClick={handleAddQuestion} className="secondary" style={{width: '100%', marginBottom: '1rem'}}>
        + Add This Question ({questions.length} added)
      </button>

      <div style={{display: 'flex', justifyContent: 'space-between', gap: '1rem', marginTop: '2rem'}}>
        <button type="button" onClick={onBack} className="secondary">
          ← Back
        </button>
        <button type="button" onClick={onNext} disabled={questions.length === 0}>
          Next → ({questions.length} questions)
        </button>
      </div>
    </div>
  );
};

// AI Question Input Component
const AIQuestionInput = ({ questions, setQuestions, onNext, onBack }) => {
  const [topic, setTopic] = useState("");
  const [numQuestions, setNumQuestions] = useState(10);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!topic.trim()) {
      alert("Please enter a topic!");
      return;
    }

    // Check if Puter.js is loaded
    if (typeof window === 'undefined' || !window.puter || !window.puter.ai) {
      alert("⚠️ Puter.js not loaded\n\nPlease make sure Puter.js is properly loaded. Refresh the page if the issue persists.");
      return;
    }

    // Wait a bit for Puter to fully initialize (if needed)
    // Puter.js might need time to authenticate/initialize
    await new Promise(resolve => setTimeout(resolve, 500));

    setLoading(true);
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

      // Call Puter.js AI chat directly from frontend
      const response = await window.puter.ai.chat(prompt, { model: "gpt-4o-mini" });
      
      // Log the response to debug
      console.log('Puter AI response:', response);
      console.log('Response type:', typeof response);
      
      // Extract text from response - Puter returns object with message.content
      let jsonText;
      if (typeof response === 'string') {
        jsonText = response;
      } else if (response && typeof response === 'object' && response.message && response.message.content) {
        // Puter AI response structure: { message: { content: "JSON string" } }
        jsonText = response.message.content;
      } else {
        jsonText = String(response);
      }

      // Convert to string and trim
      if (typeof jsonText !== 'string') {
        jsonText = String(jsonText);
      }
      jsonText = jsonText.trim();

      // Remove markdown code blocks if present
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

      setQuestions(questions);
      alert(`✅ Generated ${questions.length} questions successfully!`);
    } catch (error) {
      console.error('Error generating questions:', error);
      const errorMessage = error?.message || "Failed to generate questions.";
      
      if (errorMessage.includes('JSON') || errorMessage.includes('parse')) {
        alert("⚠️ Failed to parse AI response\n\nThe AI generated invalid JSON. Please try again.\n\n💡 Tip: You can still create quizzes manually by selecting 'Manual' question type.");
      } else if (errorMessage.includes('not an array')) {
        alert("⚠️ Invalid response format\n\nThe AI didn't return questions in the expected format. Please try again.\n\n💡 Tip: You can still create quizzes manually by selecting 'Manual' question type.");
      } else {
        alert(`❌ ${errorMessage}\n\n💡 You can still create quizzes manually by selecting 'Manual' question type.`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEditQuestion = (index) => {
    const newQuestions = [...questions];
    newQuestions[index] = { ...questions[index] };
    setQuestions(newQuestions);
  };

  const handleDeleteQuestion = (index) => {
    if (confirm("Are you sure you want to delete this question?")) {
      setQuestions(questions.filter((_, i) => i !== index));
    }
  };

  return (
    <div className="card">
      <h2>Generate Questions with AI</h2>
      <p style={{color: 'var(--text-secondary)', marginBottom: '2rem'}}>
        Use AI to automatically generate quiz questions on any topic
      </p>

      <div style={{marginBottom: '1.5rem'}}>
        <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: '600'}}>
          Quiz Topic
        </label>
        <input
          type="text"
          placeholder="e.g., World War II, JavaScript Basics, Biology"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          required
          style={{width: '100%'}}
        />
      </div>

      <div style={{marginBottom: '1.5rem'}}>
        <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: '600'}}>
          Number of Questions
        </label>
        <input
          type="number"
          min="1"
          max="20"
          value={numQuestions}
          onChange={(e) => setNumQuestions(parseInt(e.target.value) || 1)}
          style={{width: '100%'}}
        />
      </div>

      <button 
        type="button" 
        onClick={handleGenerate} 
        disabled={loading}
        style={{width: '100%', marginBottom: '2rem'}}
      >
        {loading ? '⏳ Generating...' : '🤖 Generate Questions'}
      </button>

      {questions.length > 0 && (
        <div style={{marginBottom: '2rem'}}>
          <div style={{fontWeight: 'bold', marginBottom: '1rem'}}>
            Generated Questions ({questions.length})
          </div>
          <div style={{maxHeight: '300px', overflowY: 'auto'}}>
            {questions.map((q, index) => (
              <div key={index} style={{
                padding: '0.75rem',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius)',
                marginBottom: '0.5rem',
                backgroundColor: 'var(--bg-secondary)'
              }}>
                <div style={{fontWeight: 'bold', marginBottom: '0.25rem'}}>
                  Q{index + 1}: {q.question}
                </div>
                <div style={{fontSize: '0.9rem', color: 'var(--text-secondary)'}}>
                  Answer: {q.options[q.correctAnswer]} (Option {String.fromCharCode(65 + q.correctAnswer)})
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{display: 'flex', justifyContent: 'space-between', gap: '1rem', marginTop: '2rem'}}>
        <button type="button" onClick={onBack} className="secondary">
          ← Back
        </button>
        <button type="button" onClick={onNext} disabled={questions.length === 0}>
          Next → ({questions.length} questions)
        </button>
      </div>
    </div>
  );
};

export default CreateRoom;
