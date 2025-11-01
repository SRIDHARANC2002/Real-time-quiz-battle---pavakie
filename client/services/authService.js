import { api } from '../utils/api'

export const login = async (email, password) => {
  const res = await api.post('/auth/login', { email, password })
  return res.data
}

export const signup = async (name, email, password) => {
  const res = await api.post('/auth/signup', { name, email, password })
  return res.data
}