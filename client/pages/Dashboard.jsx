import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../src/hooks/useAuth'
import { api } from '../utils/api'

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    totalMatches: 0,
    totalWins: 0,
    totalScore: 0,
    averageScore: 0,
    rank: 0
  })
  const [recentMatches, setRecentMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [serverError, setServerError] = useState(false)

  useEffect(() => {
    if (user) {
      fetchUserStats()
    }
  }, [user])

  const fetchUserStats = async () => {
    try {
      // First try to get from match history
      try {
        const matchResponse = await api.get(`/match-history/${user.id}`)
        const matches = matchResponse.data || []
        const totalScore = matches.reduce((sum, m) => sum + (m.score || 0), 0)
        const wins = matches.filter(m => {
          // A win is when score is greater than half of total questions
          return m.score > (m.totalQuestions / 2)
        }).length
        
        setStats({
          totalMatches: matches.length,
          totalWins: wins,
          totalScore: totalScore,
          averageScore: matches.length > 0 ? parseFloat((totalScore / matches.length).toFixed(1)) : 0,
          rank: 0
        })

        // Also set recent matches
        setRecentMatches(matches.slice(0, 5))
        setServerError(false)
        setLoading(false)
        return
      } catch (err) {
        // Check if it's a network error (server not running)
        if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') {
          setServerError(true)
          setLoading(false)
          return
        }
        // Other errors, continue to try leaderboard
      }

      // Fallback: try leaderboard
      try {
        const response = await api.get('/leaderboard')
        const leaderboard = response.data || []
        
        // Find current user's stats
        const userStats = leaderboard.find(entry => 
          entry.userId === user.id || 
          entry.user?._id === user.id ||
          entry._id === user.id
        )
        
        if (userStats) {
          setStats({
            totalMatches: userStats.totalMatches || 0,
            totalWins: userStats.wins || 0,
            totalScore: userStats.totalScore || 0,
            averageScore: parseFloat((userStats.averageScore || 0).toFixed(1)),
            rank: leaderboard.indexOf(userStats) + 1 || 0
          })
        }
        setServerError(false)
      } catch (error) {
        if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
          setServerError(true)
        }
      }
    } catch (error) {
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        setServerError(true)
      }
    } finally {
      setLoading(false)
    }
  }

  const fetchRecentMatches = async () => {
    try {
      const response = await api.get(`/match-history/${user.id}`)
      setRecentMatches(response.data?.slice(0, 5) || [])
    } catch (error) {
      console.error('Error fetching recent matches:', error)
      // If API doesn't exist, show empty state
      setRecentMatches([])
    }
  }

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="loader-container">
          <div className="loader"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h1>Welcome back, {user?.username || user?.name || 'Player'}!</h1>
        <p>Here's your quiz battle overview</p>
      </div>

      {serverError && (
        <div className="error-message" style={{marginBottom: '2rem'}}>
          <strong>⚠️ Server Connection Issue</strong>
          <p style={{marginTop: '0.5rem', marginBottom: 0}}>
            Unable to connect to the backend server. Please make sure the server is running on port 5000.
            The dashboard will update automatically once the server is available.
          </p>
        </div>
      )}

      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-icon">🎮</div>
          <div className="stat-content">
            <h3>{stats.totalMatches}</h3>
            <p>Total Matches</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🏆</div>
          <div className="stat-content">
            <h3>{stats.totalWins}</h3>
            <p>Wins</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">⭐</div>
          <div className="stat-content">
            <h3>{stats.totalScore}</h3>
            <p>Total Score</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <h3>{stats.averageScore}</h3>
            <p>Average Score</p>
          </div>
        </div>
      </div>

      <div className="dashboard-actions">
        <Link to="/create-room" className="action-card">
          <div className="action-icon">➕</div>
          <h3>Create Room</h3>
          <p>Start a new quiz battle room</p>
        </Link>

        <Link to="/join-room" className="action-card">
          <div className="action-icon">🚪</div>
          <h3>Join Room</h3>
          <p>Join an existing quiz room</p>
        </Link>

        <Link to="/leaderboard" className="action-card">
          <div className="action-icon">🏅</div>
          <h3>Leaderboard</h3>
          <p>View top players</p>
        </Link>
      </div>

      {recentMatches.length > 0 && (
        <div className="dashboard-recent">
          <h2>Recent Matches</h2>
          <div className="matches-list">
            {recentMatches.map((match, index) => (
              <div key={index} className="match-card">
                <div className="match-info">
                  <span className="match-date">
                    {new Date(match.createdAt || match.date).toLocaleDateString()}
                  </span>
                  <span className={`match-result ${match.won ? 'won' : 'lost'}`}>
                    {match.won ? '✅ Won' : '❌ Lost'}
                  </span>
                </div>
                <div className="match-score">
                  Score: <strong>{match.score || 0}</strong> / {match.totalQuestions || 10}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

