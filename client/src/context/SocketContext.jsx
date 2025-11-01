import React, { createContext, useEffect, useState, useContext } from 'react'
import { io } from 'socket.io-client'
import { useAuth } from '../hooks/useAuth'

const SocketContext = createContext()

export const SocketProvider = ({ children }) => {
  const { user } = useAuth()
  const [socket, setSocket] = useState(null)
  const [socketError, setSocketError] = useState(null)

  useEffect(() => {
    // connect only when user is present
    if (!user) {
      setSocket(null)
      return
    }

    const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000'
    
    const s = io(socketUrl, {
      auth: { token: user?.token },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 5000,
    })

    // Handle connection errors gracefully
    let errorLogged = false
    s.on('connect_error', (error) => {
      // Only log once to reduce console spam
      if (!errorLogged) {
        console.warn('Socket connection error (server may not be running). Socket will auto-reconnect when server is available.')
        errorLogged = true
      }
      setSocketError(error.message)
    })

    s.on('connect', () => {
      console.log('Socket connected successfully')
      errorLogged = false
      setSocketError(null)
      setSocket(s)
    })

    s.on('disconnect', () => {
      setSocketError('Disconnected from server')
    })

    // Try to set socket even if connection is pending
    setSocket(s)

    return () => { 
      if (s) {
        s.disconnect()
      }
    }
  }, [user])

  return (
    <SocketContext.Provider value={{ socket, socketError }}>
      {children}
    </SocketContext.Provider>
  )
}

export default SocketContext