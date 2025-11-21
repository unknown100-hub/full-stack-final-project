import { useEffect, useState } from 'react'
import api from './lib/api'
import './App.css'
import Dashboard from './components/dashboard'
import MealLog from './components/mealLog'
import FitnessForm from './components/fitnessForm'
import MealsList from './components/mealsList'
import heroImage from './assets/fitness-hero.svg'

const HERO_IMAGE = heroImage

function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '')
  const [registerUsername, setRegisterUsername] = useState('')
  const [registerEmail, setRegisterEmail] = useState('')
  const [registerPassword, setRegisterPassword] = useState('')
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('')
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [view, setView] = useState('dashboard') // 'dashboard' | 'fitness' | 'meal' | 'meals'
  const [message, setMessage] = useState('')
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light')
  const [gmtTime, setGmtTime] = useState(() => new Date())

  useEffect(() => {
    if (token) localStorage.setItem('token', token)
  }, [token])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))

  useEffect(() => {
    const update = () => setGmtTime(new Date())
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [])

  const gmtDisplay = gmtTime.toLocaleTimeString('en-GB', {
    timeZone: 'UTC',
    hour: '2-digit',
    minute: '2-digit'
  })

  const register = async (e) => {
    e.preventDefault()
    setMessage('')
    if (registerPassword !== registerConfirmPassword) {
      setMessage('Passwords do not match')
      return
    }
    try {
      const res = await api.post('/users/register', {
        username: registerUsername,
        email: registerEmail,
        password: registerPassword
      })
      setToken(res.data.token)
      setMessage('Registered successfully')
      setRegisterPassword('')
      setRegisterConfirmPassword('')
    } catch (err) {
      setMessage(err?.response?.data?.msg || 'Register failed')
    }
  }

  const login = async (e) => {
    e.preventDefault()
    setMessage('')
    try {
      const res = await api.post('/users/login', { email: loginEmail, password: loginPassword })
      setToken(res.data.token)
      setMessage('Logged in')
      setLoginPassword('')
    } catch (err) {
      setMessage(err?.response?.data?.msg || 'Login failed')
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    setToken('')
  }

  const handleForgotPassword = () => {
    setMessage('Password reset instructions will be sent to your email soon.')
  }

  return (
    <div className="container">
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <h1 className="title" style={{ flex: 1 }}>Health & Fitness Tracker</h1>
        <button className="btn ghost" onClick={toggleTheme}>
          {theme === 'dark' ? 'Light mode' : 'Dark mode'}
        </button>
      </div>

      {!token ? (
        <div className="landing">
          <div className="hero-panel card">
            <div className="hero-visual">
              <img src={HERO_IMAGE} alt="Health fitness tracker watch" className="hero-image" loading="lazy" />
              <div className="gmt-chip">
                <span className="chip-label">GMT TIME</span>
                <strong>{gmtDisplay} GMT</strong>
              </div>
            </div>
            <div className="hero-copy">
              <p className="eyebrow">Your data, your energy</p>
              <h2>Stay on top of workouts, meals, and recovery.</h2>
              <p>Track calories, monitor progress, and plan the next session with a clean dashboard built for consistency.</p>
            </div>
          </div>
          <div className="auth-panel">
            <form onSubmit={register} className="card form auth-card">
              <strong>Create account</strong>
              <input className="input" value={registerUsername} onChange={(e) => setRegisterUsername(e.target.value)} placeholder="Username" required />
              <input className="input" type="email" value={registerEmail} onChange={(e) => setRegisterEmail(e.target.value)} placeholder="Email address" required />
              <input className="input" type="password" value={registerPassword} onChange={(e) => setRegisterPassword(e.target.value)} placeholder="Create password" required />
              <input className="input" type="password" value={registerConfirmPassword} onChange={(e) => setRegisterConfirmPassword(e.target.value)} placeholder="Rewrite password" required />
              <button className="btn primary" type="submit">Register</button>
            </form>
            <form onSubmit={login} className="card form auth-card">
              <strong>Member login</strong>
              <input className="input" type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} placeholder="Email address" required />
              <input className="input" type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} placeholder="Password" required />
              <div className="form-actions">
                <button className="link-btn" type="button" onClick={handleForgotPassword}>Forgot password?</button>
              </div>
              <button className="btn primary" type="submit">Login</button>
            </form>
            {message && <div className="message">{message}</div>}
          </div>
        </div>
      ) : (
        <>
          <div className="nav">
            <button className={`nav-btn ${view==='dashboard' ? 'active' : ''}`} onClick={() => setView('dashboard')}>Dashboard</button>
            <button className={`nav-btn ${view==='fitness' ? 'active' : ''}`} onClick={() => setView('fitness')}>Log Fitness</button>
            <button className={`nav-btn ${view==='meal' ? 'active' : ''}`} onClick={() => setView('meal')}>Log Meal</button>
            <button className={`nav-btn ${view==='meals' ? 'active' : ''}`} onClick={() => setView('meals')}>Meals</button>
            <span style={{ marginLeft: 'auto', display: 'inline-flex', gap: 8 }}>
              <button className="btn ghost" onClick={toggleTheme}>{theme === 'dark' ? 'Light' : 'Dark'}</button>
              <button className="btn ghost" onClick={logout}>Sign Out</button>
            </span>
          </div>
          <div className="section card">
            {view === 'dashboard' && <Dashboard />}
            {view === 'fitness' && <FitnessForm />}
            {view === 'meal' && <MealLog />}
            {view === 'meals' && <MealsList />}
          </div>
        </>
      )}
    </div>
  )
}

export default App
