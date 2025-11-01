import React, { useState, useEffect } from 'react'
import { useAuth } from '../src/hooks/useAuth'
import { api } from '../utils/api'

export default function MatchHistory(){
  const { user } = useAuth()
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchMatchHistory()
    }
  }, [user])

  const fetchMatchHistory = async () => {
    try {
      const response = await api.get(`/match-history/${user.id || user._id}`)
      setMatches(response.data || [])
    } catch (error) {
      console.error('Error fetching match history:', error)
      setMatches([])
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="match-history-page">
        <h2>Match History</h2>
        <div className="loader-container">
          <div className="loader"></div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="match-history-page">
      <h2>Match History</h2>
      {matches.length === 0 ? (
        <p style={{color: 'var(--text-secondary)', marginTop: '2rem'}}>
          No matches yet. Play some quizzes to see your history here!
        </p>
      ) : (
        <div className="matches-list">
          {matches.map((match, index) => {
            const score = match.score || 0
            const total = match.totalQuestions || 10
            const percentage = total > 0 ? ((score / total) * 100).toFixed(0) : 0
            
            return (
              <div key={match._id || index} className="match-item">
                <div>
                  <span style={{fontWeight: '600'}}>Match #{matches.length - index}</span>
                  <span style={{marginLeft: '1rem', color: 'var(--text-secondary)'}}>
                    {new Date(match.createdAt || match.date).toLocaleDateString()}
                  </span>
                  {match.room?.name && (
                    <span style={{marginLeft: '1rem', color: 'var(--text-secondary)', fontSize: '0.9rem'}}>
                      Room: {match.room.name}
                    </span>
                  )}
                </div>
                <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
                  <span style={{color: 'var(--text-secondary)'}}>
                    {score}/{total} ({percentage}%)
                  </span>
                  <span className={`badge ${percentage >= 70 ? 'success' : percentage >= 50 ? 'primary' : 'danger'}`}>
                    {score} pts
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}