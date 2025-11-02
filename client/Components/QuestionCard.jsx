import React, { useState, useEffect } from 'react'

export default function QuestionCard({ question, onAnswer, answerResult, disabled }){
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [focusedIndex, setFocusedIndex] = useState(0)

  if (!question) {
    return (
      <div className="card">
        <p style={{textAlign: 'center', color: 'var(--text-secondary)'}}>Waiting for quiz to start...</p>
      </div>
    )
  }

  const handleAnswer = (answerId) => {
    if (disabled || selectedAnswer !== null) return
    setSelectedAnswer(answerId)
    onAnswer(answerId)
  }

  const handleKeyDown = (e) => {
    if (disabled || selectedAnswer !== null) return

    if (e.key >= '1' && e.key <= '4') {
      const index = parseInt(e.key) - 1
      if (question.options[index]) {
        handleAnswer(question.options[index].id)
      }
    }
  }

  useEffect(() => {
    setSelectedAnswer(null) // Reset selection for new question
  }, [question])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [question, disabled, selectedAnswer])

  return (
    <div className="card">
      <div style={{marginBottom: '1rem'}}>
        <span className="badge primary">
          Question {question.questionNumber} of {question.totalQuestions}
        </span>
      </div>
      <h3 style={{marginBottom: '1.5rem', color: 'var(--text-primary)'}}>{question.text}</h3>
      <p style={{marginBottom: '1rem', color: 'var(--text-secondary)', fontSize: '0.9rem'}}>
        Press 1-4 on your keyboard to select an answer
      </p>
      <div style={{display: 'flex', flexDirection: 'column', gap: '0.75rem'}}>
        {question.options.map((opt, index) => {
          const isSelected = selectedAnswer === opt.id
          const isCorrect = answerResult && opt.id === question.correctAnswer
          const isWrong = answerResult === false && isSelected && opt.id !== question.correctAnswer

          return (
            <button
              key={opt.id}
              onClick={() => handleAnswer(opt.id)}
              disabled={disabled || selectedAnswer !== null}
              className={isCorrect ? 'success' : isWrong ? 'danger' : ''}
              style={{
                textAlign: 'left',
                padding: '1rem',
                fontSize: '1rem',
                color: 'var(--text-primary)',
                backgroundColor: isCorrect ? '#d1fae5' : isWrong ? '#fee2e2' : 'white',
                border: isSelected ? '2px solid var(--primary-color)' : '2px solid var(--border-color)',
                cursor: disabled || selectedAnswer !== null ? 'not-allowed' : 'pointer'
              }}
            >
              <span style={{fontWeight: 'bold', marginRight: '0.5rem'}}>{index + 1}.</span>
              {opt.text}
              {isCorrect && ' ✅'}
              {isWrong && ' ❌'}
            </button>
          )
        })}
      </div>
      {answerResult !== null && (
        <div style={{
          marginTop: '1rem',
          padding: '1rem',
          borderRadius: 'var(--radius)',
          backgroundColor: answerResult ? '#d1fae5' : '#fee2e2',
          color: answerResult ? '#065f46' : '#991b1b'
        }}>
          {answerResult ? '✅ Correct!' : '❌ Wrong answer'}
          <p style={{marginTop: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)'}}>
            Waiting for timer to expire or host to skip to next question...
          </p>
        </div>
      )}
    </div>
  )
}