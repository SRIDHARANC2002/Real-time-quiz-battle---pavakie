import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../src/hooks/useSocket";
import { useAuth } from "../src/hooks/useAuth";
import { api } from "../utils/api";

const CreateRoom = () => {
  const [step, setStep] = useState(1); // 1: Setup, 2: Questions, 3: Preview
  const [roomName, setRoomName] = useState("");
  const [roomType, setRoomType] = useState("multiplayer"); // "multiplayer" only
  const [questionType, setQuestionType] = useState("manual"); // "manual" only
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
              <div style={{
                padding: '1rem',
                backgroundColor: 'var(--bg-secondary)',
                borderRadius: 'var(--radius)',
                border: '2px solid var(--primary-color)'
              }}>
                <div style={{fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--primary-color)', marginBottom: '0.5rem'}}>
                  ⚔️ Head-to-head battle
                </div>
                <div style={{fontSize: '0.9rem', color: 'var(--text-secondary)'}}>
                  Room Type: Multiplayer quiz battle
                </div>
              </div>
            </div>

            <div style={{marginBottom: '1.5rem'}}>
              <div style={{
                padding: '1rem',
                backgroundColor: 'var(--bg-tertiary)',
                borderRadius: 'var(--radius)',
                border: '2px solid var(--primary-color)'
              }}>
                <div style={{fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--primary-color)', marginBottom: '0.5rem'}}>
                  ✍️ Manual
                </div>
                <div style={{fontSize: '0.9rem', color: 'var(--text-secondary)'}}>
                  Question Type: Add questions yourself
                </div>
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
                marginBottom: '1rem',
                color: 'black'
              }}>
                <strong>Room Type:</strong> Head-to-head battle
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



export default CreateRoom;
