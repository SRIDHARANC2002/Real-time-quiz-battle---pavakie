import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../src/hooks/useAuth'

export default function Home(){
  const { user } = useAuth()
  const navigate = useNavigate()

  // If user is logged in, redirect to dashboard
  React.useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true })
    }
  }, [user, navigate])

  if (user) {
    return null // Will redirect to dashboard
  }

  return (
    <div className="home-page">
      <h1>Welcome to Quiz Battle</h1>
      <p>Create or join a room to start a real-time quiz against another player.</p>
      <div style={{marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem'}}>
        <Link to="/login">Login</Link>
        <Link to="/signup" style={{background: 'var(--bg-tertiary)', color: 'var(--text-primary)'}}>Sign Up</Link>
      </div>
    </div>
  )
}