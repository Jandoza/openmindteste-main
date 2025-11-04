import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import { toast } from 'react-toastify'
import '../styles/Profile.css'

function Profile() {
  const { user, updateUser } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: user.name || '',
    email: user.email || '',
    phone: user.phone || '',
    // Campos específicos para psicólogos
    specialties: user.specialties || [],
    description: user.description || '',
    experience: user.experience || '',
    availability: user.availability || '',
    // Campos específicos para pacientes
    birthDate: user.birthDate ? new Date(user.birthDate).toISOString().split('T')[0] : '',
    emergencyContact: {
      name: user.emergencyContact?.name || '',
      phone: user.emergencyContact?.phone || ''
    }
  })
  const [newSpecialty, setNewSpecialty] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    if (name.startsWith('emergencyContact.')) {
      const field = name.split('.')[1]
      setFormData(prev => ({
        ...prev,
        emergencyContact: {
          ...prev.emergencyContact,
          [field]: value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  const handleAddSpecialty = () => {
    if (newSpecialty.trim() && !formData.specialties.includes(newSpecialty.trim())) {
      setFormData(prev => ({
        ...prev,
        specialties: [...prev.specialties, newSpecialty.trim()]
      }))
      setNewSpecialty('')
    }
  }

  const handleRemoveSpecialty = (specialty) => {
    setFormData(prev => ({
      ...prev,
      specialties: prev.specialties.filter(s => s !== specialty)
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const updateData = {
        name: formData.name,
        phone: formData.phone
      }

      if (user.userType === 'psicologo') {
        updateData.specialties = formData.specialties
        updateData.description = formData.description
        updateData.experience = formData.experience
        updateData.availability = formData.availability
      } else {
        updateData.birthDate = formData.birthDate
        updateData.emergencyContact = formData.emergencyContact
      }

      const response = await api.put('/users/profile', updateData)

      // Atualizar o contexto com os novos dados
      updateUser(response.data.data)

      toast.success('Perfil atualizado com sucesso!')
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error(error.response?.data?.message || 'Erro ao atualizar perfil')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="profile-page">
      <header className="profile-header">
        <div className="header-content">
          <button onClick={() => navigate('/home')} className="back-btn">
            ← Voltar
          </button>
          <h1>Meu Perfil</h1>
        </div>
      </header>

      <div className="profile-container">
        <div className="profile-card">
          <div className="profile-avatar">
            <div className="avatar-circle">
              {user.avatar || user.name?.charAt(0).toUpperCase() || '👤'}
            </div>
            <h2>{user.name}</h2>
            <span className="user-type-badge">
              {user.userType === 'paciente' ? 'Paciente' : 'Psicólogo'}
            </span>
          </div>

          <form onSubmit={handleSubmit} className="profile-form">
            <div className="form-section">
              <h3>Informações Básicas</h3>

              <div className="form-group">
                <label htmlFor="name">Nome Completo</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  disabled
                  className="disabled-input"
                />
                <small>O email não pode ser alterado</small>
              </div>

              <div className="form-group">
                <label htmlFor="phone">Telefone</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="(00) 00000-0000"
                />
              </div>
            </div>

            {user.userType === 'psicologo' ? (
              <>
                <div className="form-section">
                  <h3>Informações Profissionais</h3>

                  <div className="form-group">
                    <label>Especialidades</label>
                    <div className="specialty-input-group">
                      <input
                        type="text"
                        value={newSpecialty}
                        onChange={(e) => setNewSpecialty(e.target.value)}
                        placeholder="Digite uma especialidade"
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSpecialty())}
                      />
                      <button type="button" onClick={handleAddSpecialty} className="add-specialty-btn">
                        Adicionar
                      </button>
                    </div>
                    <div className="specialties-list">
                      {formData.specialties.map((specialty, index) => (
                        <span key={index} className="specialty-tag">
                          {specialty}
                          <button type="button" onClick={() => handleRemoveSpecialty(specialty)}>
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="description">Descrição Profissional</label>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows="4"
                      placeholder="Descreva sua abordagem terapêutica e experiência..."
                      maxLength="1000"
                    />
                    <small>{formData.description.length}/1000 caracteres</small>
                  </div>

                  <div className="form-group">
                    <label htmlFor="experience">Experiência</label>
                    <input
                      type="text"
                      id="experience"
                      name="experience"
                      value={formData.experience}
                      onChange={handleChange}
                      placeholder="Ex: 6 meses de estágio supervisionado"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="availability">Disponibilidade</label>
                    <input
                      type="text"
                      id="availability"
                      name="availability"
                      value={formData.availability}
                      onChange={handleChange}
                      placeholder="Ex: Segunda a Sexta, 14h às 18h"
                    />
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="form-section">
                  <h3>Informações Pessoais</h3>

                  <div className="form-group">
                    <label htmlFor="birthDate">Data de Nascimento</label>
                    <input
                      type="date"
                      id="birthDate"
                      name="birthDate"
                      value={formData.birthDate}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="emergencyContact.name">Contato de Emergência - Nome</label>
                    <input
                      type="text"
                      id="emergencyContact.name"
                      name="emergencyContact.name"
                      value={formData.emergencyContact.name}
                      onChange={handleChange}
                      placeholder="Nome do contato de emergência"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="emergencyContact.phone">Contato de Emergência - Telefone</label>
                    <input
                      type="tel"
                      id="emergencyContact.phone"
                      name="emergencyContact.phone"
                      value={formData.emergencyContact.phone}
                      onChange={handleChange}
                      placeholder="(00) 00000-0000"
                    />
                  </div>
                </div>
              </>
            )}

            <div className="form-actions">
              <button type="button" onClick={() => navigate('/home')} className="cancel-btn">
                Cancelar
              </button>
              <button type="submit" disabled={loading} className="save-btn">
                {loading ? 'Salvando...' : 'Salvar Alterações'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Profile
