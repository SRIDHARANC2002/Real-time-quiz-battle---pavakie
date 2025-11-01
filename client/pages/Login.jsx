import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../src/hooks/useAuth'

export default function Login(){
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState(null)
  const navigate = useNavigate()
  const { login } = useAuth()

  const submit = async (e) => {
    e.preventDefault()
    setErr(null)
    try {
      await login({ email, password })
      navigate('/dashboard')
    } catch (e) { 
      setErr(e?.response?.data?.message || 'Login failed') 
    }
  }

  return (
    <div className="login-page">
      <h2>Login</h2>
      {err && <div className="error-message">{err}</div>}
      <form onSubmit={submit}>
        <div>
          <input placeholder="Email" type="email" value={email} onChange={e=>setEmail(e.target.value)} required />
        </div>
        <div>
          <input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} required />
        </div>
        <button type="submit">Login</button>
      </form>
    </div>
  )
}