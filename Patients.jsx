import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { toast } from "react-toastify";
import SuccessModal from "../components/SuccessModal";
import "../styles/Patients.css";

function Patients() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [selectedPatientName, setSelectedPatientName] = useState("");

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      // Buscar apenas pacientes que receberam notificações do psicólogo logado
      const response = await api.get("/users/patients-contacted");
      setPatients(response.data.data);
    } catch (error) {
      console.error("Error fetching patients:", error);
      toast.error("Erro ao carregar pacientes");
    } finally {
      setLoading(false);
    }
  };

  const sendNotification = async (patientId, patientName) => {
    try {
      await api.post("/notifications", {
        recipient: patientId,
        type: "profile_view",
        title: "Psicólogo interessado no seu perfil",
        message: `${user.name} demonstrou interesse em atendê-lo. Entre em contato!`,
        actionUrl: `/psychologist/${user._id}`,
      });

      // Mostrar modal de sucesso ao invés de toast
      setSelectedPatientName(patientName);
      setShowSuccessModal(true);
    } catch (error) {
      console.error("Error sending notification:", error);
      toast.error("Erro ao enviar notificação");
    }
  };

  const filteredPatients = patients.filter((patient) =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="patients-container">
        <div className="loading">
          <div className="spinner"></div>
          <p>Carregando pacientes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="patients-page">
      <header className="patients-page-header">
        <div className="header-content">
          <button onClick={() => navigate('/home')} className="back-btn">
            ← Voltar
          </button>
          <h1>Meus Pacientes Contatados</h1>
        </div>
      </header>

      <div className="patients-container">
        <div className="patients-intro">
          <p>Pacientes que você já enviou convites de atendimento</p>
        </div>

      <div className="search-section">
        <div className="search-bar">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Buscar paciente por nome..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="results-count">
          {filteredPatients.length} paciente(s) encontrado(s)
        </div>
      </div>

      <div className="patients-grid">
        {filteredPatients.length > 0 ? (
          filteredPatients.map((patient) => (
            <div key={patient._id} className="patient-card">
              <div className="patient-avatar">
                {patient.avatar ? (
                  <img src={patient.avatar} alt={patient.name} />
                ) : (
                  <div className="avatar-placeholder">
                    {patient.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              <div className="patient-info">
                <h3>{patient.name}</h3>
                <div className="patient-detail">
                  <span className="detail-icon">📧</span>
                  <span>{patient.email}</span>
                </div>
                {patient.phone && (
                  <div className="patient-detail">
                    <span className="detail-icon">📱</span>
                    <span>{patient.phone}</span>
                  </div>
                )}
                <div className="patient-detail">
                  <span className="detail-icon">📅</span>
                  <span>
                    Cadastrado em{" "}
                    {new Date(patient.createdAt).toLocaleDateString("pt-BR")}
                  </span>
                </div>
              </div>

              <div className="patient-actions">
                <button
                  onClick={() => sendNotification(patient._id, patient.name)}
                  className="contact-btn"
                >
                  <span className="btn-icon">📩</span>
                  Enviar Convite
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="no-results">
            <div className="no-results-icon">🔍</div>
            <h3>Nenhum paciente contatado ainda</h3>
            <p>Volte para a Home e envie convites para pacientes que você deseja atender!</p>
          </div>
        )}
      </div>
      </div>

      <SuccessModal
        show={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Convite Enviado com Sucesso!"
        message={`Seu convite foi enviado para ${selectedPatientName}. O paciente receberá uma notificação e poderá entrar em contato em breve.`}
        icon="📩"
      />
    </div>
  );
}

export default Patients;
