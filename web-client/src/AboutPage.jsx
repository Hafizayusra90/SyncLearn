import React from 'react';
import './AboutPage.css';

const teamMembers = [
  { name: 'Hafiza Yusra',  role: 'Full-Stack Lead & WebRTC Engineer', avatar: '👩‍💻', skills: ['WebRTC', 'React', 'Node.js'] },
  { name: 'Kashish',       role: 'Frontend & UI/UX Engineer',          avatar: '🧑‍🎨', skills: ['CSS', 'Animations', 'Figma'] },
  { name: 'Abdul Basit',   role: 'Backend & Database Engineer',         avatar: '👨‍💼', skills: ['MongoDB', 'Express', 'JWT'] },
];

const techStack = [
  { label: 'React 19',       icon: '⚛️',  desc: 'UI Framework' },
  { label: 'WebRTC',         icon: '📡',  desc: 'P2P Video' },
  { label: 'Socket.io',      icon: '🔌',  desc: 'Real-time Events' },
  { label: 'Node.js',        icon: '🟢',  desc: 'Backend Runtime' },
  { label: 'MongoDB',        icon: '🍃',  desc: 'Database' },
  { label: 'Web Speech API', icon: '🎙️', desc: 'Transcription' },
  { label: 'simple-peer',    icon: '🤝',  desc: 'WebRTC Wrapper' },
  { label: 'JWT + bcrypt',   icon: '🔑',  desc: 'Auth Security' },
];

function AboutPage({ onNavigate, theme, onToggleTheme }) {
  return (
    <div className="about-container">
      {/* Navbar */}
      <nav className="about-nav">
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

      <div className="about-content">
        {/* Hero */}
        <section className="about-hero">
          <div className="about-badge">🎓 Final Year Degree Project</div>
          <h1>Our <span className="gradient-text">Vision</span></h1>
          <p className="about-subtitle">
            SyncLearn was built to bridge the gap between remote learners and instructors —
            combining the power of WebRTC, real-time sockets, and AI to deliver a premium
            interactive classroom experience.
          </p>
        </section>

        {/* Tech Stack */}
        <section className="about-section">
          <h2>🛠️ Tech Stack</h2>
          <div className="tech-grid">
            {techStack.map((t, i) => (
              <div className="tech-pill" key={i}>
                <span className="tech-icon">{t.icon}</span>
                <div>
                  <div className="tech-name">{t.label}</div>
                  <div className="tech-desc">{t.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Team */}
        <section className="about-section">
          <h2>👥 The Team</h2>
          <div className="team-grid">
            {teamMembers.map((m, i) => (
              <div className="team-card" key={i}>
                <div className="team-avatar">{m.avatar}</div>
                <h3>{m.name}</h3>
                <p>{m.role}</p>
                <div className="skills-row">
                  {m.skills.map((s, j) => (
                    <span className="skill-badge" key={j}>{s}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="about-cta">
          <h2>Ready to join a session?</h2>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="large-primary-btn" onClick={() => onNavigate && onNavigate('auth')}>
              Sign In <span>→</span>
            </button>
            <button className="secondary-btn" onClick={() => onNavigate && onNavigate('features')}>
              View Features
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

export default AboutPage;