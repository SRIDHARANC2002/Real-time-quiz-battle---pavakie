import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../src/hooks/useAuth'

export default function Signup(){
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState(null)
  const navigate = useNavigate()
  const { signup } = useAuth()

  const submit = async (e) => {
    e.preventDefault()
    setErr(null)
    try {
      await signup({ username, email, password })
      navigate('/dashboard')
    } catch (e) { 
      setErr(e?.response?.data?.message || 'Signup failed') 
    }
  }

  return (
    <div className="signup-page">
      <h2>Sign up</h2>
      {err && <div className="error-message">{err}</div>}
      <form onSubmit={submit}>
        <div>
          <input placeholder="Username" value={username} onChange={e=>setUsername(e.target.value)} required />
        </div>
        <div>
          <input placeholder="Email" type="email" value={email} onChange={e=>setEmail(e.target.value)} required />
        </div>
        <div>
          <input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} required />
        </div>
        <button type="submit">Sign up</button>
      </form>
    </div>
  )
}