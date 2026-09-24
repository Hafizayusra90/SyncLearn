import React from 'react';
import './FeaturesPage.css';

const featuresList = [
  {
    icon: '🎥',
    title: 'Real-Time Video Collaboration',
    description: 'Low-latency peer-to-peer WebRTC video and audio streaming for seamless live classroom sessions with multiple participants.'
  },
  {
    icon: '🎨',
    title: 'Interactive Multi-User Whiteboard',
    description: 'Synchronized digital canvas with pen, eraser, line, and rectangle tools — powered by Socket.io for instant multi-user drawing.'
  },
  {
    icon: '🎙️',
    title: 'AI Speech Transcripts & Notes',
    description: 'Automated live transcription using Web Speech API to convert class discussions into downloadable lecture notes in real-time.'
  },
  {
    icon: '🧊',
    title: '3D Interactive Model Viewer',
    description: 'Drag-to-rotate, scroll-to-zoom 3D model viewer — fully synced across all peers so instructors can guide students through models live.'
  },
  {
    icon: '💬',
    title: 'Contextual Live Chat',
    description: 'Integrated workspace messaging sidebar for instant Q&A, link sharing, and dynamic active learning participation.'
  },
  {
    icon: '📍',
    title: 'Timeline Video Annotation',
    description: 'Pin timestamped "doubt markers" directly onto the synchronized video timeline — synced for all participants in real time.'
  },
  {
    icon: '📊',
    title: 'Session Analytics & Telemetry',
    description: 'Live WebRTC latency telemetry, student attendance tracking, engagement scores, and canvas activity metrics per session.'
  },
  {
    icon: '🛡️',
    title: 'Secure Room Authorization',
    description: 'JWT-protected room access codes and bcrypt-secured accounts ensuring private, protected interactive learning environments.'
  }
];

function FeaturesPage({ onNavigate, theme, onToggleTheme }) {
  return (
    <div className="features-page-container">
      {/* Navbar */}
      <nav className="features-nav">
        <div className="logo-container">
          <img src="/logo.png" alt="SyncLearn" className="logo-img" style={{ width: '28px', height: '28px', objectFit: 'contain' }} />
          <span className="logo-text">SyncLearn</span>
        </div>
        <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
          <button className="back-btn" onClick={() => onNavigate && onNavigate('home')}>
            ← Back to Home
          </button>
          <button
            type="button"
            className="theme-icon-btn"
            onClick={onToggleTheme}
            title={theme === 'dark' ? 'Switch to Light Mode ☀️' : 'Switch to Dark Mode 🌙'}
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </div>
      </nav>

      {/* Header */}
      <header className="features-header">
        <h1>Core <span className="gradient-text">Features</span></h1>
        <p>Explore the powerful active learning and real-time collaboration tools built into SyncLearn.</p>
      </header>

      {/* Feature Cards */}
      <div className="features-grid">
        {featuresList.map((feature, index) => (
          <div className="feature-card" key={index}>
            <div className="feature-icon">{feature.icon}</div>
            <h3>{feature.title}</h3>
            <p>{feature.description}</p>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="cta-box">
        <h3>Ready to start learning?</h3>
        <button className="large-primary-btn" onClick={() => onNavigate && onNavigate('auth')}>
          Get Started <span>→</span>
        </button>
      </div>
    </div>
  );
}

export default FeaturesPage;