import React from 'react'
import '../styles/SuccessModal.css'

function SuccessModal({ show, onClose, title, message, icon = '✅' }) {
  if (!show) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-icon">{icon}</div>
        <h2 className="modal-title">{title}</h2>
        <p className="modal-message">{message}</p>
        <button onClick={onClose} className="modal-close-btn">
          Entendido
        </button>
      </div>
    </div>
  )
}

export default SuccessModal
