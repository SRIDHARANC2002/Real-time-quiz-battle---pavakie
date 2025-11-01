import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../src/hooks/useAuth'
import { api } from '../utils/api'
import Loader from '../Components/Loader'

export default function QuizSetup() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [mode, setMode] = useState('') // 'manual' or 'ai'
  const [topic, setTopic] = useState('')
  const [numQuestions, setNumQuestions] = useState(10)
  const [loading, setLoading] = useState(false)

  const handleModeSelect = (selectedMode) => {
    setMode(selectedMode)
  }

  const handleAIGenerate = async (e) => {
    e.preventDefault()
    if (!topic.trim()) {
      alert('Please enter a topic for the quiz!')
      return
    }

    setLoading(true)
    try {
      const response = await api.post('/quiz/generate', {
        topic: topic.trim(),
        numQuestions: numQuestions || 10
      })
      
      // Store generated questions in sessionStorage for preview
      sessionStorage.setItem('quizQuestions', JSON.stringify(response.data.questions))
      sessionStorage.setItem('quizMode', 'ai')
      sessionStorage.setItem('quizTopic', topic)
      
      navigate('/quiz-preview')
    } catch (error) {
      console.error('Error generating quiz:', error)
      alert(error?.response?.data?.message || 'Failed to generate quiz. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleManualMode = () => {
    // Initialize with empty questions array
    sessionStorage.setItem('quizQuestions', JSON.stringify([]))
    sessionStorage.setItem('quizMode', 'manual')
    navigate('/quiz-manual')
  }

  if (!mode) {
    return (
      <div className="create-room-page">
        <h2>Choose Quiz Creation Mode</h2>
        <p style={{color: 'var(--text-secondary)', marginBottom: '2rem'}}>
          How would you like to create your quiz questions?
        </p>
        <div style={{display: 'flex', gap: '2rem', justifyContent: 'center', flexWrap: 'wrap'}}>
          <button
            onClick={() => handleModeSelect('ai')}
            style={{minWidth: '200px', padding: '2rem', fontSize: '1.2rem'}}
          >
            🤖 AI Generated
          </button>
          <button
            onClick={() => handleModeSelect('manual')}
            style={{minWidth: '200px', padding: '2rem', fontSize: '1.2rem'}}
          >
            ✏️ Manual Entry
          </button>
        </div>
      </div>
    )
  }

  if (mode === 'ai') {
    return (
      <div className="create-room-page">
        <h2>AI Quiz Generator</h2>
        <p style={{color: 'var(--text-secondary)', marginBottom: '2rem'}}>
          Enter a topic and we'll generate quiz questions for you
        </p>
        
        {loading ? (
          <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem'}}>
            <Loader />
            <p>Generating your quiz questions...</p>
          </div>
        ) : (
          <form onSubmit={handleAIGenerate} style={{maxWidth: '500px', margin: '0 auto'}}>
            <div style={{marginBottom: '1.5rem'}}>
              <label htmlFor="topic" style={{display: 'block', marginBottom: '0.5rem', fontWeight: '600'}}>
                Quiz Topic *
              </label>
              <input
                id="topic"
                type="text"
                placeholder="e.g., General Knowledge, Science, History"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            
            <div style={{marginBottom: '1.5rem'}}>
              <label htmlFor="numQuestions" style={{display: 'block', marginBottom: '0.5rem', fontWeight: '600'}}>
                Number of Questions
              </label>
              <input
                id="numQuestions"
                type="number"
                min="5"
                max="20"
                value={numQuestions}
                onChange={(e) => setNumQuestions(parseInt(e.target.value) || 10)}
                disabled={loading}
              />
            </div>

            <div style={{display: 'flex', gap: '1rem', justifyContent: 'flex-end'}}>
              <button
                type="button"
                onClick={() => setMode('')}
                disabled={loading}
                style={{background: 'var(--bg-tertiary)'}}
              >
                Back
              </button>
              <button type="submit" disabled={loading}>
                Generate Quiz
              </button>
            </div>
          </form>
        )}
      </div>
    )
  }

  return null
}

