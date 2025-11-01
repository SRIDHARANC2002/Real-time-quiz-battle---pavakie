import React, { useState, useEffect } from 'react'
import { useAuth } from '../src/hooks/useAuth'
import { api } from '../utils/api'

export default function Leaderboard(){
  const { user } = useAuth()
  const [leaderboard, setLeaderboard] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchLeaderboard()
  }, [])

  const fetchLeaderboard = async () => {
    try {
      const response = await api.get('/leaderboard')
      setLeaderboard(response.data || [])
      setError(null)
    } catch (error) {
      console.error('Error fetching leaderboard:', error)
      setError('Failed to load leaderboard. Make sure the server is running.')
      // Show placeholder data if server is down
      setLeaderboard([
        { username: 'Alice', totalScore: 120, totalMatches: 5, averageScore: 24 },
        { username: 'Bob', totalScore: 90, totalMatches: 4, averageScore: 22.5 }
      ])
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="leaderboard-page">
        <h2>Leaderboard</h2>
        <div className="loader-container">
          <div className="loader"></div>
          <p>Loading leaderboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="leaderboard-page">
      <h2>🏆 Leaderboard</h2>
      {error && (
        <div className="error-message" style={{marginBottom: '2rem'}}>
          {error}
        </div>
      )}
      <div className="leaderboard-list">
        {leaderboard.length === 0 ? (
          <p style={{color: 'var(--text-secondary)', marginTop: '2rem'}}>
            No players yet. Be the first to play!
          </p>
        ) : (
          leaderboard.map((entry, index) => {
            const isCurrentUser = entry.userId === user?.id || 
                                 entry._id === user?.id ||
                                 entry.username === user?.username
            return (
              <div 
                key={entry._id || entry.userId || index} 
                className="leaderboard-item"
                style={{
                  backgroundColor: isCurrentUser ? 'var(--bg-tertiary)' : 'white',
                  border: isCurrentUser ? '2px solid var(--primary-color)' : 'none'
                }}
              >
                <div className="flex gap-2" style={{alignItems: 'center'}}>
                  <span className={`badge ${index === 0 ? 'success' : index === 1 ? 'primary' : index === 2 ? 'primary' : ''}`}>
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '#'}{index + 1}
                  </span>
                  <span style={{fontWeight: '600'}}>
                    {entry.username || entry.name || 'Player'} {isCurrentUser && '(You)'}
                  </span>
                </div>
                <div style={{display: 'flex', gap: '1rem', alignItems: 'center'}}>
                  <div style={{textAlign: 'right'}}>
                    <div style={{fontSize: '0.9rem', color: 'var(--text-secondary)'}}>
                      {entry.totalMatches || 0} matches
                    </div>
                    <div style={{fontSize: '0.85rem', color: 'var(--text-secondary)'}}>
                      Avg: {entry.averageScore ? parseFloat(entry.averageScore).toFixed(1) : 0}
                    </div>
                  </div>
                  <span className="badge success" style={{fontSize: '1.1rem'}}>
                    {entry.totalScore || 0} pts
                  </span>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}