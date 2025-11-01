import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSocket } from '../src/hooks/useSocket'
import useQuizLogic from '../src/hooks/useQuizLogic'
import { useAuth } from '../src/hooks/useAuth'
import QuestionCard from '../Components/QuestionCard'
import Scoreboard from '../Components/Scoreboard'
import QuizTimer from '../Components/QuizTimer'

export default function QuizRoom(){
  const { roomId } = useParams()
  const { socket } = useSocket()
  const { user } = useAuth()
  const navigate = useNavigate()
  const { 
    question, 
    players, 
    status, 
    room,
    answerResult,
    quizFinished,
    answerQuestion, 
    startQuiz,
    nextQuestion
  } = useQuizLogic(socket, roomId)

  const isHost = room && (room.host?.toString() === user?.id || room.host?._id?.toString() === user?.id || room.host === user?.id)

  return (
    <div className="quiz-room">
      <div className="card">
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem'}}>
          <div>
            <h2 style={{marginBottom: '0.5rem'}}>Room: {room?.name || roomId}</h2>
            <div className="flex gap-2" style={{alignItems: 'center'}}>
              <span className={`badge ${status === 'active' ? 'success' : status === 'finished' ? 'primary' : 'danger'}`}>
                {status === 'active' ? '🟢 Quiz Active' : status === 'finished' ? '✅ Quiz Finished' : '⏳ Waiting'}
              </span>
              {question && (
                <span className="badge">Question {question.questionNumber}/{question.totalQuestions}</span>
              )}
            </div>
          </div>
          {isHost && status === 'waiting' && (
            <button onClick={startQuiz} disabled={!socket?.connected}>
              Start Quiz
            </button>
          )}
          {isHost && status === 'active' && question && (
            <button onClick={nextQuestion} title="Or wait for timer to expire (30s)">
              Next Question (Skip Timer)
            </button>
          )}
          {status === 'finished' && (
            <button onClick={() => navigate('/dashboard')}>
              Back to Dashboard
            </button>
          )}
        </div>
      </div>

      {status === 'waiting' && (
        <div className="card">
          <h3>Waiting Room</h3>
          <p style={{color: 'var(--text-secondary)', marginTop: '1rem'}}>
            {isHost ? 'Click "Start Quiz" when all players have joined.' : 'Waiting for host to start the quiz...'}
          </p>
          <Scoreboard players={players} />
        </div>
      )}

      {status === 'active' && (
        <div style={{display:'flex', gap:'2rem', flexWrap: 'wrap'}}>
          <div style={{flex:'2 1 400px'}}>
            <QuestionCard 
              question={question} 
              onAnswer={answerQuestion}
              answerResult={answerResult}
              disabled={quizFinished}
            />
            {question && (
              <QuizTimer 
                duration={30} 
                questionKey={question.questionNumber}
                onExpire={() => {
                  // Auto-advance to next question when timer expires (only host can trigger)
                  if (isHost && status === 'active') {
                    nextQuestion()
                  }
                }}
              />
            )}
          </div>
          <div style={{flex:'1 1 300px'}}>
            <Scoreboard players={players} />
          </div>
        </div>
      )}

      {status === 'finished' && (
        <div className="card">
          <h2>🏆 Quiz Finished!</h2>
          <p style={{marginBottom: '2rem', color: 'var(--text-secondary)'}}>Final Results:</p>
          <Scoreboard players={players} />
          <div style={{marginTop: '2rem'}}>
            <button onClick={() => navigate('/dashboard')}>Go to Dashboard</button>
          </div>
        </div>
      )}
    </div>
  )
}