import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import logo from '../assets/logo.png'
import '../styles/Login.css'

function Login() {
  const [userType, setUserType] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { login } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!userType) {
      setError('Por favor, selecione se você é Paciente ou Psicólogo')
      return
    }

    if (!email || !password) {
      setError('Por favor, preencha todos os campos')
      return
    }

    try {
      await login(email, password, userType)
      navigate('/home')
    } catch (err) {
      setError(err.message || 'Email ou senha inválidos')
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <img src={logo} alt="OpenMind" className="login-logo" />
          <p>Conectando psicólogos estagiários e pacientes</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="user-type-selection">
            <h3>Eu sou:</h3>
            <div className="user-type-buttons">
              <button
                type="button"
                className={`type-btn ${userType === 'paciente' ? 'active' : ''}`}
                onClick={() => setUserType('paciente')}
              >
                <span className="icon">🙋‍♂️</span>
                Paciente
              </button>
              <button
                type="button"
                className={`type-btn ${userType === 'psicologo' ? 'active' : ''}`}
                onClick={() => setUserType('psicologo')}
              >
                <span className="icon">🧠</span>
                Psicólogo
              </button>
            </div>
          </div>

          <div className="form-group">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <input
              type="password"
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="login-btn">
            Entrar
          </button>
        </form>

        <div className="login-footer">
          <p>
            Não tem uma conta? <Link to="/register">Cadastre-se</Link>
          </p>
          <p className="back-home">
            <Link to="/">← Voltar para o início</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login