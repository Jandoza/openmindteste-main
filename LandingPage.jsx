import React from 'react'
import { useNavigate } from 'react-router-dom'
import logo from '../assets/logo.png'
import '../styles/LandingPage.css'

function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className="landing-page">
      {/* Header/Navbar */}
      <nav className="landing-nav">
        <div className="nav-container">
          <div className="logo">
            <img src={logo} alt="OpenMind" className="logo-image" />
          </div>
          <div className="nav-buttons">
            <button onClick={() => navigate('/login')} className="nav-btn login-nav-btn">
              Entrar
            </button>
            <button onClick={() => navigate('/register')} className="nav-btn register-nav-btn">
              Cadastrar
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">
              Conectando você ao <span className="highlight">cuidado psicológico</span> acessível
            </h1>
            <p className="hero-description">
              Psicólogos estagiários dedicados oferecendo atendimento gratuito e de qualidade.
              Encontre o apoio emocional que você precisa, quando você precisa.
            </p>
            <div className="hero-buttons">
              <button onClick={() => navigate('/register')} className="cta-primary">
                Começar Agora
              </button>
              <button onClick={() => navigate('/login')} className="cta-secondary">
                Já tenho conta
              </button>
            </div>
            <div className="hero-stats">
              <div className="stat">
                <span className="stat-number">500+</span>
                <span className="stat-label">Pacientes</span>
              </div>
              <div className="stat">
                <span className="stat-number">100+</span>
                <span className="stat-label">Psicólogos</span>
              </div>
              <div className="stat">
                <span className="stat-number">1000+</span>
                <span className="stat-label">Atendimentos</span>
              </div>
            </div>
          </div>
          <div className="hero-image">
            <div className="floating-card card-1">
              <span className="card-emoji">💙</span>
              <span className="card-text">Ansiedade</span>
            </div>
            <div className="floating-card card-2">
              <span className="card-emoji">🌟</span>
              <span className="card-text">Autoestima</span>
            </div>
            <div className="floating-card card-3">
              <span className="card-emoji">💭</span>
              <span className="card-text">Depressão</span>
            </div>
            <div className="hero-illustration">
              <div className="illustration-circle"></div>
              <span className="illustration-emoji">🧠</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="features-container">
          <h2 className="section-title">Por que escolher o OpenMind?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">💰</div>
              <h3>100% Gratuito</h3>
              <p>Atendimento psicológico gratuito com profissionais qualificados em formação</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🌐</div>
              <h3>Online e Flexível</h3>
              <p>Atendimento remoto com horários flexíveis que se adaptam à sua rotina</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔒</div>
              <h3>Seguro e Confidencial</h3>
              <p>Suas informações e conversas são totalmente privadas e protegidas</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">👥</div>
              <h3>Supervisão Profissional</h3>
              <p>Todos os estagiários são supervisionados por psicólogos experientes</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🎯</div>
              <h3>Especialidades Diversas</h3>
              <p>Encontre profissionais especializados em várias áreas da psicologia</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3>Resposta Rápida</h3>
              <p>Conecte-se rapidamente com psicólogos disponíveis para atendê-lo</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works">
        <div className="how-container">
          <h2 className="section-title">Como funciona?</h2>
          <div className="steps">
            <div className="step">
              <div className="step-number">1</div>
              <div className="step-content">
                <h3>Cadastre-se</h3>
                <p>Crie sua conta gratuitamente em menos de 2 minutos</p>
              </div>
            </div>
            <div className="step-arrow">→</div>
            <div className="step">
              <div className="step-number">2</div>
              <div className="step-content">
                <h3>Encontre um Psicólogo</h3>
                <p>Browse pelos perfis e escolha o profissional ideal para você</p>
              </div>
            </div>
            <div className="step-arrow">→</div>
            <div className="step">
              <div className="step-number">3</div>
              <div className="step-content">
                <h3>Agende sua Consulta</h3>
                <p>Marque seu atendimento no horário que funciona para você</p>
              </div>
            </div>
            <div className="step-arrow">→</div>
            <div className="step">
              <div className="step-number">4</div>
              <div className="step-content">
                <h3>Comece o Tratamento</h3>
                <p>Inicie sua jornada de cuidado com a saúde mental</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-container">
          <h2>Pronto para cuidar da sua saúde mental?</h2>
          <p>Junte-se a milhares de pessoas que encontraram apoio através do OpenMind</p>
          <button onClick={() => navigate('/register')} className="cta-button">
            Criar Conta Gratuita
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-section">
            <h4>OpenMind</h4>
            <p>Conectando pessoas ao cuidado psicológico acessível e de qualidade</p>
          </div>
          <div className="footer-section">
            <h4>Links</h4>
            <ul>
              <li><a href="#" onClick={() => navigate('/login')}>Entrar</a></li>
              <li><a href="#" onClick={() => navigate('/register')}>Cadastrar</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Contato</h4>
            <p>contato@openmind.com</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2024 OpenMind. Todos os direitos reservados.</p>
          <p className="footer-disclaimer">
            Os atendimentos são realizados por estagiários de psicologia sob supervisão profissional
          </p>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
