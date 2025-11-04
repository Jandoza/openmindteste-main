import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import PsychologistCard from '../components/PsychologistCard'
import NotificationCenter from '../components/NotificationCenter'
import { onNotification, offNotification } from '../services/socket'
import { toast } from 'react-toastify'
import api from '../services/api'
import '../styles/Home.css'

function Home() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSpecialty, setSelectedSpecialty] = useState('')
  const [showNotifications, setShowNotifications] = useState(false)
  const [hasNewNotification, setHasNewNotification] = useState(false)
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0)
  const [psychologists, setPsychologists] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Buscar dados baseado no tipo de usuário
    const fetchData = async () => {
      try {
        setLoading(true)

        if (user.userType === 'paciente') {
          // Paciente vê psicólogos
          const response = await api.get('/users/psychologists')
          const mappedPsychologists = response.data.data.map(psych => ({
            id: psych._id,
            _id: psych._id,
            name: psych.name,
            specialties: psych.specialties || [],
            description: psych.description || 'Psicólogo disponível para atendimento.',
            availability: psych.availability || 'Consulte disponibilidade',
            experience: psych.experience || 'Experiência não informada',
            contact: psych.email,
            image: psych.avatar || '👤',
            email: psych.email
          }))
          setPsychologists(mappedPsychologists)
        } else {
          // Psicólogo vê pacientes
          const response = await api.get('/users/patients')
          const mappedPatients = response.data.data.map(patient => ({
            id: patient._id,
            _id: patient._id,
            name: patient.name,
            specialties: [], // Pacientes não têm especialidades
            description: `Paciente cadastrado em ${new Date(patient.createdAt).toLocaleDateString('pt-BR')}`,
            availability: 'Aguardando contato',
            experience: '',
            contact: patient.email,
            image: patient.avatar || '👤',
            email: patient.email
          }))
          setPsychologists(mappedPatients) // Usando o mesmo estado para simplicidade
        }
      } catch (error) {
        console.error('Error fetching data:', error)
        toast.error(user.userType === 'paciente' ? 'Erro ao carregar psicólogos' : 'Erro ao carregar pacientes')
        setPsychologists([])
      } finally {
        setLoading(false)
      }
    }

    fetchData()

    // Escutar notificações em tempo real
    onNotification((notification) => {
      setHasNewNotification(true)
      setUnreadNotificationCount(prev => prev + 1)
      toast.info(`📬 ${notification.title}`, {
        position: 'top-right',
        autoClose: 5000
      })
    })

    return () => {
      offNotification()
    }
  }, [])

  // Buscar especialidades únicas apenas se for paciente
  const allSpecialties = user.userType === 'paciente'
    ? [...new Set(psychologists.flatMap(p => p.specialties || []))]
    : []

  const filteredPsychologists = psychologists.filter(psych => {
    const matchesSearch = psych.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (psych.description || '').toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSpecialty = !selectedSpecialty || (psych.specialties && psych.specialties.includes(selectedSpecialty))
    return matchesSearch && matchesSpecialty
  })

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="home-container">
      <header className="home-header">
        <div className="header-content">
          <div className="logo-section">
            <h1>OpenMind</h1>
            <span className="tagline">Cuidado psicológico acessível para todos</span>
          </div>
          <div className="user-section">
            <span className="welcome-msg">
              Olá, {user.name} ({user.userType === 'paciente' ? 'Paciente' : 'Psicólogo'})
            </span>
            {user.userType === 'psicologo' && (
              <button onClick={() => navigate('/patients')} className="patients-btn">
                👥 Pacientes
              </button>
            )}
            <button onClick={() => navigate('/profile')} className="profile-btn">
              👤 Perfil
            </button>
            <button
              onClick={() => {
                setShowNotifications(true)
                setHasNewNotification(false)
              }}
              className="notification-btn"
            >
              🔔
              {unreadNotificationCount > 0 && (
                <span className="notification-badge">{unreadNotificationCount}</span>
              )}
            </button>
            <button onClick={handleLogout} className="logout-btn">
              Sair
            </button>
          </div>
        </div>
      </header>

      <main className="home-main">
        {loading ? (
          <div className="loading-section">
            <div className="spinner"></div>
            <p>Carregando...</p>
          </div>
        ) : (
          <>
            <section className="hero-section">
              <h2>
                {user.userType === 'paciente'
                  ? 'Encontre Apoio Psicológico Gratuito'
                  : 'Pacientes Disponíveis'}
              </h2>
              <p>
                {user.userType === 'paciente'
                  ? 'Conectamos você com psicólogos estagiários dedicados que oferecem atendimento gratuito e de qualidade'
                  : 'Veja pacientes cadastrados na plataforma e envie convites de atendimento'}
              </p>
            </section>

            <section className="filters-section">
              <div className="search-bar">
                <input
                  type="text"
                  placeholder={user.userType === 'paciente' ? 'Buscar psicólogo por nome...' : 'Buscar paciente por nome...'}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>
              {user.userType === 'paciente' && (
                <div className="specialty-filter">
                  <select
                    value={selectedSpecialty}
                    onChange={(e) => setSelectedSpecialty(e.target.value)}
                    className="specialty-select"
                  >
                    <option value="">Todas as especialidades</option>
                    {allSpecialties.map(specialty => (
                      <option key={specialty} value={specialty}>
                        {specialty}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </section>
          </>
        )}

        <section className="psychologists-grid">
          {filteredPsychologists.length > 0 ? (
            filteredPsychologists.map(psychologist => (
              <PsychologistCard
                key={psychologist.id}
                psychologist={psychologist}
                isPatient={user.userType === 'paciente'}
                currentUser={user}
              />
            ))
          ) : (
            <div className="no-results">
              <p>
                {user.userType === 'paciente'
                  ? 'Nenhum psicólogo encontrado com os critérios selecionados.'
                  : 'Nenhum paciente encontrado.'}
              </p>
            </div>
          )}
        </section>
      </main>

      <footer className="home-footer">
        <p>OpenMind © 2024 - Conectando pessoas ao cuidado psicológico</p>
        <p className="disclaimer">
          Os atendimentos são realizados por estagiários de psicologia sob supervisão profissional
        </p>
      </footer>

      <NotificationCenter
        show={showNotifications}
        onClose={() => setShowNotifications(false)}
        onUnreadCountChange={(count) => setUnreadNotificationCount(count)}
      />
    </div>
  )
}

export default Home