import React, { createContext, useState, useEffect } from 'react'
import { getStoredUser, storeUser, clearStoredUser } from '../utils/storage'
import { api } from '../../utils/api'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => getStoredUser())

  useEffect(() => {
    if (user) storeUser(user)
    else clearStoredUser()
  }, [user])

  const login = async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials)
      // Backend returns: { _id, username, email, token }
      const { token, username, email, _id } = response.data
      const userWithToken = { id: _id, username, email, name: username, token }
      storeUser(userWithToken)
      setUser(userWithToken)
      return userWithToken
    } catch (error) {
      throw error
    }
  }

  const signup = async (userData) => {
    try {
      const response = await api.post('/auth/signup', userData)
      // Backend returns: { _id, username, email, token }
      const { token, username, email, _id } = response.data
      const userWithToken = { id: _id, username, email, name: username, token }
      storeUser(userWithToken)
      setUser(userWithToken)
      return userWithToken
    } catch (error) {
      throw error
    }
  }

  const logout = () => {
    clearStoredUser()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, setUser, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthContext