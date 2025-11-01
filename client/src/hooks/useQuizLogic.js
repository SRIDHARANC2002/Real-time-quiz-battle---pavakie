import { useState, useEffect } from 'react'
import { useAuth } from './useAuth'

export default function useQuizLogic(socket, roomId) {
  const { user } = useAuth()
  const [question, setQuestion] = useState(null)
  const [players, setPlayers] = useState([])
  const [status, setStatus] = useState('waiting')
  const [room, setRoom] = useState(null)
  const [answerResult, setAnswerResult] = useState(null)
  const [quizFinished, setQuizFinished] = useState(false)

  useEffect(() => {
    if (!socket || !roomId || !user) return

    // Join room
    socket.emit('join-room', { 
      roomId, 
      userId: user.id || user._id, 
      username: user.username || user.name 
    })

    // Listen for room joined
    const handleRoomJoined = (data) => {
      setRoom(data.room)
      setPlayers(data.players || [])
      setStatus(data.room?.quiz?.isActive ? 'active' : 'waiting')
    }

    // Quiz started
    const handleQuizStarted = (q) => {
      setQuestion(q)
      setStatus('active')
      setAnswerResult(null)
      setQuizFinished(false)
    }

    // New question
    const handleNewQuestion = (q) => {
      setQuestion(q)
      setAnswerResult(null)
    }

    // Score updates
    const handleScoreUpdate = (p) => {
      setPlayers(p)
    }

    // Room status
    const handleRoomStatus = (s) => {
      setStatus(s)
    }

    // Answer result
    const handleAnswerResult = (result) => {
      setAnswerResult(result.isCorrect)
    }

    // Quiz ended
    const handleQuizEnded = (data) => {
      setPlayers(data.players || [])
      setStatus('finished')
      setQuizFinished(true)
    }

    socket.on('room-joined', handleRoomJoined)
    socket.on('quiz-started', handleQuizStarted)
    socket.on('new-question', handleNewQuestion)
    socket.on('scoreUpdate', handleScoreUpdate)
    socket.on('roomStatus', handleRoomStatus)
    socket.on('answer-result', handleAnswerResult)
    socket.on('quiz-ended', handleQuizEnded)

    return () => {
      socket.off('room-joined', handleRoomJoined)
      socket.off('quiz-started', handleQuizStarted)
      socket.off('new-question', handleNewQuestion)
      socket.off('scoreUpdate', handleScoreUpdate)
      socket.off('roomStatus', handleRoomStatus)
      socket.off('answer-result', handleAnswerResult)
      socket.off('quiz-ended', handleQuizEnded)
    }
  }, [socket, roomId, user])

  const answerQuestion = (answerId) => {
    if (!socket || !user) return
    socket.emit('submit-answer', { 
      roomId, 
      answer: answerId, 
      userId: user.id || user._id
    })
  }

  const startQuiz = () => {
    if (!socket) return
    socket.emit('start-quiz', roomId)
  }

  const nextQuestion = () => {
    if (!socket) return
    socket.emit('next-question', roomId)
  }

  return { 
    question, 
    players, 
    status, 
    room,
    answerResult,
    quizFinished,
    answerQuestion, 
    startQuiz,
    nextQuestion
  }
}
