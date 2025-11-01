import React from 'react'
import { useAuth } from '../src/hooks/useAuth'

export default function Scoreboard({ players }){
  const { user } = useAuth()
  
  if (!players || players.length === 0) {
    return (
      <div className="card">
        <h4 style={{marginBottom: '1rem'}}>Scoreboard</h4>
        <p style={{color: 'var(--text-secondary)'}}>Waiting for players...</p>
      </div>
    )
  }

  // Sort players by score (descending)
  const sortedPlayers = [...players].sort((a, b) => (b.score || 0) - (a.score || 0))

  return (
    <div className="card">
      <h4 style={{marginBottom: '1.5rem'}}>🏆 Live Scores</h4>
      <div className="matches-list">
        {sortedPlayers.map((p, index) => {
          const isCurrentUser = p.userId === user?.id || p.userId === user?._id
          return (
            <div 
              key={p.userId || p.id} 
              className="match-card"
              style={{
                backgroundColor: isCurrentUser ? 'var(--bg-tertiary)' : 'white',
                border: isCurrentUser ? '2px solid var(--primary-color)' : 'none'
              }}
            >
              <div className="match-info">
                <span style={{fontWeight: '600'}}>
                  {index === 0 && '🥇 '}
                  {index === 1 && '🥈 '}
                  {index === 2 && '🥉 '}
                  {p.name || 'Player'} {isCurrentUser && '(You)'}
                </span>
              </div>
              <div className="match-score">
                <strong style={{fontSize: '1.2rem', color: 'var(--primary-color)'}}>
                  {p.score || 0}
                </strong>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}