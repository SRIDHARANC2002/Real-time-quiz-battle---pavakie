import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function QuizManual() {
  const navigate = useNavigate()
  const [questions, setQuestions] = useState([{
    question: '',
    options: ['', '', '', ''],
    correctAnswer: 0
  }])

  const addQuestion = () => {
    setQuestions([...questions, {
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0
    }])
  }

  const updateQuestion = (index, field, value) => {
    const updated = [...questions]
    updated[index][field] = value
    setQuestions(updated)
  }

  const updateOption = (qIndex, oIndex, value) => {
    const updated = [...questions]
    updated[qIndex].options[oIndex] = value
    setQuestions(updated)
  }

  const removeQuestion = (index) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, i) => i !== index))
    }
  }

  const handlePreview = () => {
    // Validate questions
    const isValid = questions.every((q, idx) => {
      if (!q.question.trim()) {
        alert(`Question ${idx + 1} is missing the question text`)
        return false
      }
      if (q.options.some(opt => !opt.trim())) {
        alert(`Question ${idx + 1} has empty options`)
        return false
      }
      return true
    })

    if (isValid) {
      sessionStorage.setItem('quizQuestions', JSON.stringify(questions))
      sessionStorage.setItem('quizMode', 'manual')
      navigate('/quiz-preview')
    }
  }

  return (
    <div className="create-room-page" style={{maxWidth: '800px', margin: '0 auto'}}>
      <h2>Create Quiz Questions Manually</h2>
      <p style={{color: 'var(--text-secondary)', marginBottom: '2rem'}}>
        Add your custom quiz questions below
      </p>

      {questions.map((q, qIndex) => (
        <div key={qIndex} className="card" style={{marginBottom: '2rem', padding: '1.5rem'}}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem'}}>
            <h3>Question {qIndex + 1}</h3>
            {questions.length > 1 && (
              <button
                onClick={() => removeQuestion(qIndex)}
                style={{background: 'var(--danger-color)'}}
              >
                Remove
              </button>
            )}
          </div>

          <div style={{marginBottom: '1rem'}}>
            <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: '600'}}>
              Question Text *
            </label>
            <textarea
              value={q.question}
              onChange={(e) => updateQuestion(qIndex, 'question', e.target.value)}
              placeholder="Enter your question here..."
              rows="2"
              required
              style={{width: '100%', padding: '0.75rem'}}
            />
          </div>

          <div style={{marginBottom: '1rem'}}>
            <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: '600'}}>
              Options *
            </label>
            {q.options.map((option, oIndex) => (
              <div key={oIndex} style={{display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem'}}>
                <input
                  type="radio"
                  name={`correct-${qIndex}`}
                  checked={q.correctAnswer === oIndex}
                  onChange={() => updateQuestion(qIndex, 'correctAnswer', oIndex)}
                  style={{width: '20px', height: '20px'}}
                />
                <input
                  type="text"
                  value={option}
                  onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                  placeholder={`Option ${String.fromCharCode(65 + oIndex)}`}
                  required
                  style={{flex: 1}}
                />
                {q.correctAnswer === oIndex && (
                  <span style={{color: 'var(--success-color)', fontWeight: 'bold'}}>✓ Correct</span>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      <div style={{display: 'flex', gap: '1rem', justifyContent: 'space-between'}}>
        <button
          onClick={addQuestion}
          style={{background: 'var(--bg-tertiary)'}}
        >
          + Add Question
        </button>
        <div style={{display: 'flex', gap: '1rem'}}>
          <button
            onClick={() => navigate('/create-room')}
            style={{background: 'var(--bg-tertiary)'}}
          >
            Cancel
          </button>
          <button onClick={handlePreview}>
            Preview Quiz
          </button>
        </div>
      </div>
    </div>
  )
}

