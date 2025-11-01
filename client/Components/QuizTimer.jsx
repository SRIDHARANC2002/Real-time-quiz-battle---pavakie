import React, { useEffect, useState, useRef } from 'react'

export default function QuizTimer({ duration = 30, onExpire, questionKey }){
  const [timeLeft, setTimeLeft] = useState(duration)
  const onExpireRef = useRef(onExpire)
  const hasExpiredRef = useRef(false)
  const intervalRef = useRef(null)

  // Update ref when onExpire changes
  useEffect(() => {
    onExpireRef.current = onExpire
  }, [onExpire])

  // Reset timer completely when questionKey changes (new question) or duration changes
  useEffect(() => {
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    
    // Reset state
    setTimeLeft(duration)
    hasExpiredRef.current = false

    // Start new timer
    intervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        const newValue = Math.max(0, prev - 1)
        if (newValue === 0 && !hasExpiredRef.current) {
          hasExpiredRef.current = true
          // Call onExpire callback when timer reaches 0
          onExpireRef.current?.()
        }
        return newValue
      })
    }, 1000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [duration, questionKey])

  const percentage = (timeLeft / duration) * 100
  const isLow = timeLeft <= 10

  return (
    <div style={{
      marginTop: '1rem',
      padding: '1rem',
      borderRadius: 'var(--radius)',
      backgroundColor: 'var(--bg-secondary)',
      border: `2px solid ${isLow ? 'var(--danger-color)' : 'var(--border-color)'}`
    }}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem'}}>
        <span style={{fontWeight: '600', color: isLow ? 'var(--danger-color)' : 'var(--text-primary)'}}>
          ⏱️ Time Remaining
        </span>
        <span style={{
          fontSize: '1.5rem',
          fontWeight: '700',
          color: isLow ? 'var(--danger-color)' : 'var(--primary-color)'
        }}>
          {timeLeft}s
        </span>
      </div>
      <div style={{
        width: '100%',
        height: '8px',
        backgroundColor: 'var(--border-color)',
        borderRadius: '4px',
        overflow: 'hidden'
      }}>
        <div style={{
          width: `${percentage}%`,
          height: '100%',
          backgroundColor: isLow ? 'var(--danger-color)' : 'var(--primary-color)',
          transition: 'width 1s linear, background-color 0.3s'
        }} />
      </div>
    </div>
  )
}