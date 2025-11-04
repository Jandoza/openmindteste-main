import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import '../styles/Register.css'

function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    userType: '',
    crp: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { register } = useAuth()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Validações
    if (!formData.userType) {
      setError('Por favor, selecione se você é Paciente ou Psicólogo')
      return
    }

    if (!formData.name || !formData.email || !formData.password) {
      setError('Por favor, preencha todos os campos obrigatórios')
      return
    }

    if (formData.password.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem')
      return
    }

    if (formData.userType === 'psicologo' && !formData.crp) {
      setError('CRP é obrigatório para psicólogos')
      return
    }

    setLoading(true)

    try {
      const success = await register(formData)
      if (success) {
        navigate('/home')
      } else {
        setError('Erro ao criar conta. Tente novamente.')
      }
    } catch (err) {
      setError(err.message || 'Erro ao criar conta')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="register-container">
      <div className="register-card">
        <div className="register-header">
          <h1>Criar Conta</h1>
          <p>Junte-se à nossa comunidade</p>
        </div>

        <form onSubmit={handleSubmit} className="register-form">
          {/* Seleção de tipo de usuário */}
          <div className="user-type-selection">
            <h3>Eu sou:</h3>
            <div className="user-type-buttons">
              <button
                type="button"
                className={`type-btn ${formData.userType === 'paciente' ? 'active' : ''}`}
                onClick={() => setFormData({ ...formData, userType: 'paciente', crp: '' })}
              >
                <span className="icon">🙋‍♂️</span>
                Paciente
              </button>
              <button
                type="button"
                className={`type-btn ${formData.userType === 'psicologo' ? 'active' : ''}`}
                onClick={() => setFormData({ ...formData, userType: 'psicologo' })}
              >
                <span className="icon">🧠</span>
                Psicólogo
              </button>
            </div>
          </div>

          {/* Campos do formulário */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">Nome Completo *</label>
              <input
                type="text"
                id="name"
                name="name"
                placeholder="Seu nome completo"
                value={formData.name}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="email">Email *</label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="seu@email.com"
                value={formData.email}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="phone">Telefone</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                placeholder="(11) 98888-8888"
                value={formData.phone}
                onChange={handleChange}
                className="form-input"
              />
            </div>
          </div>

          {formData.userType === 'psicologo' && (
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="crp">CRP (Registro Profissional) *</label>
                <input
                  type="text"
                  id="crp"
                  name="crp"
                  placeholder="Ex: CRP 01/12345"
                  value={formData.crp}
                  onChange={handleChange}
                  className="form-input"
                  required={formData.userType === 'psicologo'}
                />
              </div>
            </div>
          )}

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="password">Senha *</label>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="Mínimo 6 caracteres"
                value={formData.password}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirmar Senha *</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                placeholder="Digite a senha novamente"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="register-btn" disabled={loading}>
            {loading ? 'Criando conta...' : 'Criar Conta'}
          </button>
        </form>

        <div className="register-footer">
          <p>
            Já tem uma conta? <Link to="/login">Entrar</Link>
          </p>
          <p className="back-home">
            <Link to="/">← Voltar para o início</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Register
