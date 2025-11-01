import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../src/hooks/useAuth'

export default function Navbar(){
  const { user, logout } = useAuth()
  return (
    <nav>
      <Link to={user ? "/dashboard" : "/"}>QuizBattle</Link>
      <span>
        <Link to="/leaderboard">Leaderboard</Link>
        {user ? (
          <>
            <Link to="/dashboard">Dashboard</Link>
            <span style={{marginLeft: '1rem', color: 'var(--text-secondary)'}}>
              Hi, {user.name || user.username || 'User'}
            </span>
            <button onClick={logout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/signup">Sign up</Link>
          </>
        )}
      </span>
    </nav>
  )
}