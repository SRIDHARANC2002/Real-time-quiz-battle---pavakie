import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSocket } from '../src/hooks/useSocket'
import { useAuth } from '../src/hooks/useAuth'
import { api } from '../utils/api'

export default function JoinRoom(){
  const [roomId, setRoomId] = useState('')
  const { socket } = useSocket()
  const { user } = useAuth()
  const navigate = useNavigate()

  const join = async () => {
    if (!socket || !socket.connected) {
      alert('Socket not connected. Please make sure the backend server is running on port 5000.')
      return
    }

    if (!user) {
      alert('Please login first!')
      navigate('/login')
      return
    }

    if (!roomId.trim()) {
      alert('Please enter a room ID!')
      return
    }

    try {
      // Join room via API first
      await api.post(`/rooms/${roomId}/join`)
      // Then navigate to room (socket join happens in useQuizLogic)
      navigate(`/room/${roomId}`)
    } catch (error) {
      alert(error?.response?.data?.message || 'Failed to join room')
    }
  }

  return (
    <div className="join-room-page">
      <h2>Join Room</h2>
      <form onSubmit={(e) => { e.preventDefault(); join(); }}>
        <input placeholder="Room ID" value={roomId} onChange={e=>setRoomId(e.target.value)} required />
        <button type="submit">Join Room</button>
      </form>
    </div>
  )
}