import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'

// Page imports using ../../
import Login from '../pages/Login'
import Signup from '../pages/Signup'
import Home from '../../pages/Home'
import Dashboard from '../../pages/Dashboard'
import CreateRoom from '../../pages/CreateRoom'
import JoinRoom from '../../pages/JoinRoom'
import QuizRoom from '../../pages/QuizRoom'
import Leaderboard from '../../pages/Leaderboard'
import MatchHistory from '../../pages/MatchHistory'
import NotFound from '../../pages/NotFound'

// Hook import
import { useAuth } from '../hooks/useAuth'

// Protected Route wrapper
const ProtectedRoute = ({ children }) => {
  const { user } = useAuth()
  return user ? children : <Navigate to="/login" replace />
}

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route
        path="/dashboard"
        element={<ProtectedRoute><Dashboard /></ProtectedRoute>}
      />

      <Route
        path="/create-room"
        element={<ProtectedRoute><CreateRoom /></ProtectedRoute>}
      />
      <Route
        path="/join-room"
        element={<ProtectedRoute><JoinRoom /></ProtectedRoute>}
      />
      <Route
        path="/room/:roomId"
        element={<ProtectedRoute><QuizRoom /></ProtectedRoute>}
      />

      <Route path="/leaderboard" element={<Leaderboard />} />
      <Route path="/history" element={<MatchHistory />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
