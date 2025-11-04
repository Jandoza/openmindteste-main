import React, { useState } from 'react'
import api from '../services/api'
import { toast } from 'react-toastify'
import SuccessModal from './SuccessModal'
import '../styles/PsychologistCard.css'

function PsychologistCard({ psychologist, isPatient, currentUser }) {
  const [showContact, setShowContact] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)

  const handleContact = () => {
    setShowContact(!showContact)
  }

  const handleRequestConsultation = async () => {
    if (!currentUser) {
      toast.error('Você precisa estar logado para solicitar consulta')
      return
    }

    setLoading(true)
    try {
      await api.post('/notifications', {
        recipient: psychologist.id || psychologist._id,
        type: 'appointment_request',
        title: 'Nova Solicitação de Consulta',
        message: `${currentUser.name} está interessado em agendar uma consulta com você!`,
        actionUrl: `/patient/${currentUser._id}`
      })

      // Mostrar modal de sucesso ao invés de toast
      setShowSuccessModal(true)
    } catch (error) {
      console.error('Error sending notification:', error)
      toast.error('❌ Erro ao enviar solicitação. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="psychologist-card">
      <div className="card-header">
        <div className="avatar">{psychologist.image}</div>
        <div className="header-info">
          <h3>{psychologist.name}</h3>
          <span className="experience">{psychologist.experience}</span>
        </div>
      </div>

      <div className="card-body">
        <div className="specialties">
          {psychologist.specialties.map((specialty, index) => (
            <span key={index} className="specialty-tag">
              {specialty}
            </span>
          ))}
        </div>

        <p className="description">{psychologist.description}</p>

        <div className="availability">
          <span className="availability-label">📅 Disponibilidade:</span>
          <span className="availability-time">{psychologist.availability}</span>
        </div>
      </div>

      <div className="card-footer">
        {isPatient ? (
          <>
            <button
              onClick={handleRequestConsultation}
              className="request-btn"
              disabled={loading}
            >
              {loading ? '⏳ Enviando...' : '📩 Solicitar Consulta'}
            </button>
            <button
              onClick={handleContact}
              className="contact-btn-secondary"
            >
              {showContact ? 'Ocultar Contato' : '👁️ Ver Contato'}
            </button>
            {showContact && (
              <div className="contact-info">
                <p>📧 Email: {psychologist.contact}</p>
                <p className="contact-note">
                  Entre em contato mencionando que você encontrou o profissional através do OpenMind
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="psychologist-view">
            <p className="view-note">Visualização de perfil profissional</p>
          </div>
        )}
      </div>

      <SuccessModal
        show={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Solicitação Enviada com Sucesso!"
        message={`Sua solicitação de consulta foi enviada para ${psychologist.name}. O psicólogo será notificado e entrará em contato em breve.`}
        icon="✅"
      />
    </div>
  )
}

export default PsychologistCard